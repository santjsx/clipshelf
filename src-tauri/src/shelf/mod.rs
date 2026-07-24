use tauri::{AppHandle, Manager};
use windows_sys::Win32::Foundation::POINT;
use windows_sys::Win32::UI::WindowsAndMessaging::{GetCursorPos, GetSystemMetrics, SM_CXSCREEN};

pub fn start_shelf_monitor(app_handle: AppHandle) {
    std::thread::spawn(move || {
        let mut is_expanded = false;
        let mut hover_start_time: Option<std::time::Instant> = None;
        let mut leave_start_time: Option<std::time::Instant> = None;

        loop {
            std::thread::sleep(std::time::Duration::from_millis(50));

            unsafe {
                let mut pt: POINT = std::mem::zeroed();
                if GetCursorPos(&mut pt) != 0 {
                    let screen_width = GetSystemMetrics(SM_CXSCREEN);
                    let center_x = screen_width / 2;
                    let hover_left = center_x - 220;
                    let hover_right = center_x + 220;

                    let in_top_edge_zone = pt.y <= 15 && pt.x >= hover_left && pt.x <= hover_right;
                    let in_expanded_zone = pt.y <= 80 && pt.x >= hover_left && pt.x <= hover_right;

                    if in_top_edge_zone || (is_expanded && in_expanded_zone) {
                        leave_start_time = None;
                        if !is_expanded {
                            if let Some(start) = hover_start_time {
                                if start.elapsed().as_millis() >= 150 {
                                    is_expanded = true;
                                    set_shelf_expanded(&app_handle, true);
                                }
                            } else {
                                hover_start_time = Some(std::time::Instant::now());
                            }
                        }
                    } else {
                        hover_start_time = None;
                        if is_expanded {
                            if let Some(start) = leave_start_time {
                                if start.elapsed().as_millis() >= 300 {
                                    is_expanded = false;
                                    set_shelf_expanded(&app_handle, false);
                                    leave_start_time = None;
                                }
                            } else {
                                leave_start_time = Some(std::time::Instant::now());
                            }
                        }
                    }
                }
            }
        }
    });
}

fn set_shelf_expanded(app_handle: &AppHandle, expanded: bool) {
    if let Some(window) = app_handle.get_webview_window("shelf") {
        let (width, height) = if expanded { (400.0, 54.0) } else { (130.0, 26.0) };
        let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
            width,
            height,
        }));
    }
}
