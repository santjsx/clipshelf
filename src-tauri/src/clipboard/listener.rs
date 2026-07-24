use crate::db::{clips::Clip, get_db_path};
use crate::sensitive_filter;
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use rusqlite::Connection;
use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

use windows_sys::Win32::Foundation::{CloseHandle, HANDLE, HWND};
use windows_sys::Win32::System::DataExchange::{
    AddClipboardFormatListener, CloseClipboard, GetClipboardData, IsClipboardFormatAvailable,
    OpenClipboard, RegisterClipboardFormatW,
};
use windows_sys::Win32::System::Memory::{GlobalLock, GlobalSize, GlobalUnlock};
use windows_sys::Win32::System::Threading::{
    OpenProcess, QueryFullProcessImageNameW, PROCESS_QUERY_LIMITED_INFORMATION,
};
use windows_sys::Win32::UI::Shell::DragQueryFileW;
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CreateWindowExW, DefWindowProcW, DispatchMessageW, GetForegroundWindow, GetMessageW,
    GetWindowThreadProcessId, RegisterClassW, MSG, WM_CLIPBOARDUPDATE, WNDCLASSW,
};

const HWND_MESSAGE: HWND = -3isize as HWND;
const CF_DIB: u32 = 8;
const CF_UNICODETEXT: u32 = 13;
const CF_HDROP: u32 = 15;

pub fn start_clipboard_listener(app_handle: AppHandle) {
    std::thread::spawn(move || {
        let instance = unsafe { windows_sys::Win32::System::LibraryLoader::GetModuleHandleW(std::ptr::null()) };
        let class_name = "ClipShelf_Clipboard_Class\0".encode_utf16().collect::<Vec<u16>>();

        let wnd_class = WNDCLASSW {
            style: 0,
            lpfnWndProc: Some(wnd_proc),
            cbClsExtra: 0,
            cbWndExtra: 0,
            hInstance: instance as _,
            hIcon: std::ptr::null_mut(),
            hCursor: std::ptr::null_mut(),
            hbrBackground: std::ptr::null_mut(),
            lpszMenuName: std::ptr::null(),
            lpszClassName: class_name.as_ptr(),
        };

        unsafe {
            RegisterClassW(&wnd_class);
            let hwnd = CreateWindowExW(
                0,
                class_name.as_ptr(),
                class_name.as_ptr(),
                0,
                0,
                0,
                0,
                0,
                HWND_MESSAGE,
                std::ptr::null_mut(),
                instance as _,
                std::ptr::null_mut(),
            );

            if hwnd.is_null() {
                log::error!("Failed to create message-only window for clipboard listener");
                return;
            }

            if AddClipboardFormatListener(hwnd) == 0 {
                log::error!("Failed to register clipboard format listener");
                return;
            }

            log::info!("ClipShelf clipboard listener window registered successfully.");

            CLIPBOARD_APP_HANDLE = Some(app_handle);

            let mut msg: MSG = std::mem::zeroed();
            while GetMessageW(&mut msg, hwnd, 0, 0) > 0 {
                DispatchMessageW(&msg);
            }
        }
    });
}

static mut CLIPBOARD_APP_HANDLE: Option<AppHandle> = None;

unsafe extern "system" fn wnd_proc(
    hwnd: HWND,
    msg: u32,
    wparam: usize,
    lparam: isize,
) -> isize {
    if msg == WM_CLIPBOARDUPDATE {
        on_clipboard_updated();
        0
    } else {
        DefWindowProcW(hwnd, msg, wparam, lparam)
    }
}

fn on_clipboard_updated() {
    let app_handle = unsafe { CLIPBOARD_APP_HANDLE.clone() };
    if let Some(app) = app_handle {
        let source_app = get_foreground_process_info();

        // 1. Check self-copy and process denylist
        if let Some(ref app_name) = source_app.0 {
            let lower = app_name.to_lowercase();

            // Ignore copies originating from ClipShelf itself
            if lower.contains("clipshelf") {
                log::info!("Ignored self-copy originating from ClipShelf application window");
                return;
            }

            if sensitive_filter::is_blocked_process(app_name) {
                log::info!("Ignored clipboard copy from password manager process: {}", app_name);
                return;
            }
        }

        // 2. Read clipboard payload
        if let Some((content_type, text_content, asset_path)) = read_clipboard_payload() {
            // Check text secret filter
            if let Some(ref text) = text_content {
                if !text.starts_with("data:image/") && sensitive_filter::contains_sensitive_data(text) {
                    log::info!("Ignored sensitive text clipboard capture (Credit Card / API key / Secret)");
                    return;
                }
            }

            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64;

            let clip = Clip {
                id: None,
                uuid: Uuid::new_v4().to_string(),
                content_type: content_type.clone(),
                text_content: text_content.clone(),
                asset_path: asset_path.clone(),
                ocr_text: None,
                source_app_name: source_app.0,
                source_app_display: source_app.1,
                is_pinned: false,
                is_bulk_bundle: false,
                created_at: now,
                last_used_at: None,
                category_ids: None,
            };

            // 4. Save to SQLite database with deduplication check
            let db_path = get_db_path();
            if let Ok(conn) = Connection::open(&db_path) {
                // Deduplication check: if top clip has identical text or asset_path, skip duplicate insert
                if let Ok(recent_clips) = crate::db::clips::get_clips(&conn, 1, 0, None) {
                    if let Some(recent) = recent_clips.first() {
                        let text_match = text_content.is_some()
                            && recent.text_content.is_some()
                            && text_content == recent.text_content;
                        let asset_match = asset_path.is_some()
                            && recent.asset_path.is_some()
                            && asset_path == recent.asset_path;

                        if text_match || asset_match {
                            log::info!("Ignored duplicate clip matching top clipboard item");
                            return;
                        }
                    }
                }

                if let Ok(clip_id) = crate::db::clips::insert_clip(&conn, &clip) {
                    let mut saved_clip = clip;
                    saved_clip.id = Some(clip_id);

                    log::info!("Captured and saved clip #{} [{}]", clip_id, content_type);

                    // 5. Emit live event to frontend windows
                    let _ = app.emit("clip-captured", saved_clip);
                }
            }
        }
    }
}

fn read_clipboard_payload() -> Option<(String, Option<String>, Option<String>)> {
    unsafe {
        if OpenClipboard(std::ptr::null_mut()) == 0 {
            return None;
        }

        let mut result = None;

        // Custom PNG format registered by Chrome / Snipping Tool / Edge / Firefox
        let png_name = "PNG\0".encode_utf16().collect::<Vec<u16>>();
        let cf_png = RegisterClipboardFormatW(png_name.as_ptr());
        let img_png_name = "image/png\0".encode_utf16().collect::<Vec<u16>>();
        let cf_image_png = RegisterClipboardFormatW(img_png_name.as_ptr());

        // 1. Check PNG / image/png formats (Chrome, Edge, Firefox, Snipping Tool)
        let h_png = if cf_png != 0 && IsClipboardFormatAvailable(cf_png) != 0 {
            GetClipboardData(cf_png)
        } else if cf_image_png != 0 && IsClipboardFormatAvailable(cf_image_png) != 0 {
            GetClipboardData(cf_image_png)
        } else {
            std::ptr::null_mut()
        };

        if !h_png.is_null() {
            if let Some((data_url, asset_path)) = save_raw_png_to_asset_file(h_png) {
                result = Some(("image".to_string(), Some(data_url), Some(asset_path)));
            }
        }
        // 2. Check CF_DIB / Images (Screenshots & System Bitmaps)
        else if IsClipboardFormatAvailable(CF_DIB) != 0 {
            let h_dib = GetClipboardData(CF_DIB);
            if !h_dib.is_null() {
                if let Some((data_url, asset_path)) = save_dib_to_asset_file(h_dib) {
                    result = Some(("image".to_string(), Some(data_url), Some(asset_path)));
                }
            }
        }
        // 3. Check CF_HDROP (Files & Image Files)
        else if IsClipboardFormatAvailable(CF_HDROP) != 0 {
            let h_drop = GetClipboardData(CF_HDROP);
            if !h_drop.is_null() {
                let count = DragQueryFileW(h_drop as _, 0xFFFFFFFF, std::ptr::null_mut(), 0);
                if count > 0 {
                    let mut files = Vec::new();
                    for i in 0..count {
                        let len = DragQueryFileW(h_drop as _, i, std::ptr::null_mut(), 0);
                        let mut buf = vec![0u16; (len + 1) as usize];
                        DragQueryFileW(h_drop as _, i, buf.as_mut_ptr(), buf.len() as u32);
                        let file_path = OsString::from_wide(&buf[..len as usize]).to_string_lossy().to_string();
                        files.push(file_path);
                    }
                    let joined_files = files.join("\n");

                    // Check if dropped single file is an image
                    if files.len() == 1 {
                        let lower = files[0].to_lowercase();
                        if lower.ends_with(".png")
                            || lower.ends_with(".jpg")
                            || lower.ends_with(".jpeg")
                            || lower.ends_with(".webp")
                            || lower.ends_with(".gif")
                        {
                            if let Ok(bytes) = std::fs::read(&files[0]) {
                                let mime = if lower.ends_with(".png") {
                                    "png"
                                } else if lower.ends_with(".webp") {
                                    "webp"
                                } else {
                                    "jpeg"
                                };
                                let data_url = format!("data:image/{};base64,{}", mime, BASE64.encode(&bytes));
                                result = Some(("image".to_string(), Some(data_url), Some(files[0].clone())));
                            }
                        }
                    }

                    if result.is_none() {
                        result = Some(("file".to_string(), Some(joined_files), None));
                    }
                }
            }
        }
        // 4. Check CF_UNICODETEXT (Text / Links / Code / Color)
        else if IsClipboardFormatAvailable(CF_UNICODETEXT) != 0 {
            let h_data = GetClipboardData(CF_UNICODETEXT);
            if !h_data.is_null() {
                let ptr = GlobalLock(h_data) as *const u16;
                if !ptr.is_null() {
                    let mut len = 0;
                    while *ptr.add(len) != 0 {
                        len += 1;
                    }
                    let slice = std::slice::from_raw_parts(ptr, len);
                    let text = String::from_utf16_lossy(slice);
                    GlobalUnlock(h_data);

                    let content_type = classify_text_content(&text);
                    result = Some((content_type, Some(text), None));
                }
            }
        }

        CloseClipboard();
        result
    }
}

fn save_raw_png_to_asset_file(h_mem: HANDLE) -> Option<(String, String)> {
    unsafe {
        let ptr = GlobalLock(h_mem) as *const u8;
        let size = GlobalSize(h_mem);
        if ptr.is_null() || size == 0 {
            if !ptr.is_null() {
                GlobalUnlock(h_mem);
            }
            return None;
        }

        let slice = std::slice::from_raw_parts(ptr, size);
        let data_url = format!("data:image/png;base64,{}", BASE64.encode(slice));

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        let filename = format!("img_{}.png", timestamp);
        let app_dir = crate::db::get_app_dir().join("assets");
        let _ = std::fs::create_dir_all(&app_dir);
        let file_path = app_dir.join(&filename);

        let _ = std::fs::write(&file_path, slice);
        GlobalUnlock(h_mem);

        Some((data_url, file_path.to_string_lossy().to_string()))
    }
}

fn save_dib_to_asset_file(h_dib: HANDLE) -> Option<(String, String)> {
    unsafe {
        let dib_ptr = GlobalLock(h_dib) as *const u8;
        let dib_size = GlobalSize(h_dib);
        if dib_ptr.is_null() || dib_size < 40 {
            if !dib_ptr.is_null() {
                GlobalUnlock(h_dib);
            }
            return None;
        }

        let slice = std::slice::from_raw_parts(dib_ptr, dib_size);

        let header_size = u32::from_le_bytes([slice[0], slice[1], slice[2], slice[3]]) as usize;
        let bi_bit_count = u16::from_le_bytes([slice[14], slice[15]]);
        let bi_compression = u32::from_le_bytes([slice[16], slice[17], slice[18], slice[19]]);

        let palette_size = if bi_bit_count <= 8 {
            let colors = u32::from_le_bytes([slice[32], slice[33], slice[34], slice[35]]);
            let num_colors = if colors == 0 { 1usize << bi_bit_count } else { colors as usize };
            num_colors * 4
        } else if bi_compression == 3 {
            12
        } else {
            0
        };

        let off_bits = (14 + header_size + palette_size) as u32;
        let file_size = (14 + dib_size) as u32;

        let mut bmp_bytes = Vec::with_capacity(14 + dib_size);
        // BITMAPFILEHEADER
        bmp_bytes.extend_from_slice(&0x4D42u16.to_le_bytes()); // "BM" magic
        bmp_bytes.extend_from_slice(&file_size.to_le_bytes());  // bfSize
        bmp_bytes.extend_from_slice(&0u16.to_le_bytes());       // bfReserved1
        bmp_bytes.extend_from_slice(&0u16.to_le_bytes());       // bfReserved2
        bmp_bytes.extend_from_slice(&off_bits.to_le_bytes());    // bfOffBits
        bmp_bytes.extend_from_slice(slice);                      // DIB payload

        GlobalUnlock(h_dib);

        let data_url = format!("data:image/bmp;base64,{}", BASE64.encode(&bmp_bytes));

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        let filename = format!("img_{}.bmp", timestamp);
        let app_dir = crate::db::get_app_dir().join("assets");
        let _ = std::fs::create_dir_all(&app_dir);
        let file_path = app_dir.join(&filename);

        if std::fs::write(&file_path, &bmp_bytes).is_ok() {
            return Some((data_url, file_path.to_string_lossy().to_string()));
        }

        Some((data_url, String::new()))
    }
}

fn classify_text_content(text: &str) -> String {
    let trimmed = text.trim();
    if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        "link".to_string()
    } else if (trimmed.starts_with('#') && (trimmed.len() == 4 || trimmed.len() == 7))
        && trimmed.chars().skip(1).all(|c| c.is_ascii_hexdigit())
    {
        "color".to_string()
    } else if trimmed.contains("const ")
        || trimmed.contains("function ")
        || trimmed.contains("import ")
        || trimmed.contains("class ")
        || trimmed.contains("pub fn ")
        || trimmed.contains("<div")
    {
        "code".to_string()
    } else {
        "text".to_string()
    }
}

fn get_foreground_process_info() -> (Option<String>, Option<String>) {
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return (None, None);
        }

        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid == 0 {
            return (None, None);
        }

        let h_process = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
        if h_process.is_null() {
            return (None, None);
        }

        let mut buf = vec![0u16; 1024];
        let mut size = buf.len() as u32;
        let mut app_name = None;
        let mut display_name = None;

        if QueryFullProcessImageNameW(h_process, 0, buf.as_mut_ptr(), &mut size) != 0 {
            let full_path = OsString::from_wide(&buf[..size as usize]).to_string_lossy().to_string();
            let path = PathBuf::from(&full_path);
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                app_name = Some(name.to_string());
                display_name = Some(friendly_app_name(name));
            }
        }

        CloseHandle(h_process);
        (app_name, display_name)
    }
}

fn friendly_app_name(exe_name: &str) -> String {
    match exe_name.to_lowercase().as_str() {
        "code.exe" => "VS Code".to_string(),
        "chrome.exe" => "Google Chrome".to_string(),
        "msedge.exe" => "Microsoft Edge".to_string(),
        "firefox.exe" => "Firefox".to_string(),
        "notepad.exe" => "Notepad".to_string(),
        "explorer.exe font" | "explorer.exe" => "File Explorer".to_string(),
        "powershell.exe" | "cmd.exe" | "windows terminal.exe" => "Terminal".to_string(),
        "slack.exe" => "Slack".to_string(),
        "discord.exe" => "Discord".to_string(),
        _ => exe_name.to_string(),
    }
}
