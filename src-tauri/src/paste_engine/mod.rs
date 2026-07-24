use crate::db::{clips, get_db_path};
use rusqlite::Connection;
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use windows_sys::Win32::Foundation::HANDLE;
use windows_sys::Win32::System::DataExchange::{
    CloseClipboard, EmptyClipboard, GetClipboardData, OpenClipboard, SetClipboardData,
};
const CF_UNICODETEXT: u32 = 13;
use windows_sys::Win32::System::Memory::{
    GlobalAlloc, GlobalLock, GlobalUnlock, GMEM_MOVEABLE,
};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    SendInput, INPUT, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP, VK_CONTROL, VK_V,
};

pub fn paste_clip(clip_id: i64) -> Result<(), String> {
    let db_path = get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    if let Some(clip) = clips::get_clip_by_id(&conn, clip_id).map_err(|e| e.to_string())? {
        execute_paste_for_clip(&clip);
    }

    Ok(())
}

pub fn paste_clip_by_index(index: usize) -> Result<(), String> {
    let db_path = get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    if let Some(clip) = clips::get_clip_by_index(&conn, index).map_err(|e| e.to_string())? {
        execute_paste_for_clip(&clip);
    }

    Ok(())
}

fn execute_paste_for_clip(clip: &clips::Clip) {
    if let Some(ref text) = clip.text_content {
        let text_to_paste = text.clone();

        // Spawn background task for clipboard backup -> write -> SendInput -> restore
        std::thread::spawn(move || {
            let previous_text = read_current_clipboard_text();

            // 1. Write target clip to clipboard
            if write_text_to_clipboard(&text_to_paste) {
                // 2. Send synthetic Ctrl+V
                send_ctrl_v();

                // 3. Wait 400ms and restore original clipboard text so user's copy is preserved
                std::thread::sleep(std::time::Duration::from_millis(400));
                if let Some(prev) = previous_text {
                    let _ = write_text_to_clipboard(&prev);
                }
            }
        });
    }
}

fn read_current_clipboard_text() -> Option<String> {
    unsafe {
        if OpenClipboard(std::ptr::null_mut()) == 0 {
            return None;
        }

        let mut result = None;
        let h_data = GetClipboardData(CF_UNICODETEXT as u32);
        if !h_data.is_null() {
            let ptr = GlobalLock(h_data) as *const u16;
            if !ptr.is_null() {
                let mut len = 0;
                while *ptr.add(len) != 0 {
                    len += 1;
                }
                let slice = std::slice::from_raw_parts(ptr, len);
                result = Some(String::from_utf16_lossy(slice));
                GlobalUnlock(h_data);
            }
        }

        CloseClipboard();
        result
    }
}

fn write_text_to_clipboard(text: &str) -> bool {
    let wide: Vec<u16> = OsStr::new(text).encode_wide().chain(std::iter::once(0)).collect();
    let size = wide.len() * std::mem::size_of::<u16>();

    unsafe {
        if OpenClipboard(std::ptr::null_mut()) == 0 {
            return false;
        }

        EmptyClipboard();

        let h_mem = GlobalAlloc(GMEM_MOVEABLE, size);
        if h_mem.is_null() {
            CloseClipboard();
            return false;
        }

        let ptr = GlobalLock(h_mem) as *mut u16;
        if !ptr.is_null() {
            std::ptr::copy_nonoverlapping(wide.as_ptr(), ptr, wide.len());
            GlobalUnlock(h_mem);
            SetClipboardData(CF_UNICODETEXT as u32, h_mem as HANDLE);
        }

        CloseClipboard();
        true
    }
}

fn send_ctrl_v() {
    unsafe {
        let mut inputs: [INPUT; 4] = std::mem::zeroed();

        // 1. Ctrl Down
        inputs[0].r#type = INPUT_KEYBOARD;
        inputs[0].Anonymous.ki = KEYBDINPUT {
            wVk: VK_CONTROL,
            wScan: 0,
            dwFlags: 0,
            time: 0,
            dwExtraInfo: 0,
        };

        // 2. V Down
        inputs[1].r#type = INPUT_KEYBOARD;
        inputs[1].Anonymous.ki = KEYBDINPUT {
            wVk: VK_V,
            wScan: 0,
            dwFlags: 0,
            time: 0,
            dwExtraInfo: 0,
        };

        // 3. V Up
        inputs[2].r#type = INPUT_KEYBOARD;
        inputs[2].Anonymous.ki = KEYBDINPUT {
            wVk: VK_V,
            wScan: 0,
            dwFlags: KEYEVENTF_KEYUP,
            time: 0,
            dwExtraInfo: 0,
        };

        // 4. Ctrl Up
        inputs[3].r#type = INPUT_KEYBOARD;
        inputs[3].Anonymous.ki = KEYBDINPUT {
            wVk: VK_CONTROL,
            wScan: 0,
            dwFlags: KEYEVENTF_KEYUP,
            time: 0,
            dwExtraInfo: 0,
        };

        SendInput(4, inputs.as_ptr(), std::mem::size_of::<INPUT>() as i32);
    }
}
