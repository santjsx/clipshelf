use crate::paste_engine;
use tauri::{AppHandle, Manager};
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    RegisterHotKey, MOD_ALT, MOD_CONTROL, MOD_SHIFT, VK_V,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    GetMessageW, MSG, WM_HOTKEY,
};

const HOTKEY_QUICK_PASTE_ID: i32 = 100;
const HOTKEY_RECALL_BASE_ID: i32 = 200;

pub fn start_hotkey_manager(app_handle: AppHandle) {
    std::thread::spawn(move || {
        unsafe {
            // 1. Register Ctrl+Shift+V for Quick Paste palette
            let status_qp = RegisterHotKey(
                std::ptr::null_mut(),
                HOTKEY_QUICK_PASTE_ID,
                (MOD_CONTROL | MOD_SHIFT) as u32,
                VK_V as u32,
            );
            if status_qp != 0 {
                log::info!("Registered global hotkey: Ctrl+Shift+V (Quick Paste Palette)");
            } else {
                log::warn!("Failed to register global hotkey Ctrl+Shift+V");
            }

            // 2. Register Ctrl+Alt+0..9 for keystroke retrieval (last 10 clips)
            for i in 0..10 {
                let vk_digit = 0x30 + i; // VK_0 is 0x30
                let status_digit = RegisterHotKey(
                    std::ptr::null_mut(),
                    HOTKEY_RECALL_BASE_ID + i,
                    (MOD_CONTROL | MOD_ALT) as u32,
                    vk_digit as u32,
                );
                if status_digit != 0 {
                    log::info!("Registered global hotkey: Ctrl+Alt+{} (Retrieve Clip #{})", i, i);
                }
            }

            // Hotkey Message Loop
            let mut msg: MSG = std::mem::zeroed();
            while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
                if msg.message == WM_HOTKEY {
                    let hotkey_id = msg.wParam as i32;
                    if hotkey_id == HOTKEY_QUICK_PASTE_ID {
                        toggle_quick_paste_window(&app_handle);
                    } else if (HOTKEY_RECALL_BASE_ID..HOTKEY_RECALL_BASE_ID + 10).contains(&hotkey_id) {
                        let index = (hotkey_id - HOTKEY_RECALL_BASE_ID) as usize;
                        let _ = paste_engine::paste_clip_by_index(index);
                    }
                }
            }
        }
    });
}

pub fn toggle_quick_paste_window(app_handle: &AppHandle) {
    if let Some(window) = app_handle.get_webview_window("quick-paste") {
        if let Ok(is_visible) = window.is_visible() {
            if is_visible {
                let _ = window.hide();
            } else {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    }
}
