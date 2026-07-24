pub mod clipboard;
pub mod db;
pub mod hotkeys;
pub mod image_ops;
pub mod ocr;
pub mod paste_engine;
pub mod sensitive_filter;
pub mod shelf;

use db::clips::{Category, Clip};
use rusqlite::Connection;
use tauri::Manager;

#[tauri::command]
fn get_clips(
    limit: Option<usize>,
    offset: Option<usize>,
    filter: Option<String>,
) -> Result<Vec<Clip>, String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);
    let filter_str = filter.as_deref();

    db::clips::get_clips(&conn, limit, offset, filter_str).map_err(|e| e.to_string())
}

#[tauri::command]
fn search_clips(query: String) -> Result<Vec<Clip>, String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    db::clips::search_clips(&conn, &query).map_err(|e| e.to_string())
}

#[tauri::command]
fn pin_clip(id: i64, is_pinned: bool) -> Result<(), String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    db::clips::pin_clip(&conn, id, is_pinned).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_clip(id: i64) -> Result<(), String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    db::clips::delete_clip(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn paste_clip(id: i64, app_handle: tauri::AppHandle) -> Result<(), String> {
    paste_engine::paste_clip(id)?;
    if let Some(window) = app_handle.get_webview_window("quick-paste") {
        let _ = window.hide();
    }
    Ok(())
}

#[tauri::command]
fn hide_quick_paste(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("quick-paste") {
        let _ = window.hide();
    }
    Ok(())
}

#[tauri::command]
fn sample_color_at_cursor() -> Result<String, String> {
    image_ops::sample_color_at_cursor()
}

#[tauri::command]
fn run_ocr_for_clip(clip_id: i64) -> Result<Option<String>, String> {
    ocr::run_ocr_for_clip(clip_id)
}

#[tauri::command]
fn get_categories() -> Result<Vec<Category>, String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    db::clips::get_categories(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_category(name: String, color: Option<String>) -> Result<Category, String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    let color_str = color.as_deref().unwrap_or("#3b82f6");
    let new_id = db::clips::create_category(&conn, &name, Some(color_str)).map_err(|e| e.to_string())?;

    Ok(Category {
        id: new_id,
        name,
        color: Some(color_str.to_string()),
        sort_order: 0,
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64,
    })
}

#[tauri::command]
fn assign_category(clip_id: i64, category_id: i64) -> Result<(), String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    db::clips::assign_clip_category(&conn, clip_id, category_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_category(id: i64) -> Result<(), String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    db::clips::delete_category(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn clear_all_clips() -> Result<(), String> {
    let db_path = db::get_db_path();
    let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

    db::clips::clear_all_clips(&conn).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    log::info!("Starting ClipShelf Rust Core...");

    // Initialize database
    if let Err(e) = db::init_db() {
        log::error!("Failed to initialize database: {:?}", e);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Start Win32 clipboard listener thread
            clipboard::listener::start_clipboard_listener(app.handle().clone());
            // Start Win32 global hotkeys manager
            hotkeys::start_hotkey_manager(app.handle().clone());
            // Start Edge Shelf hover monitor (disabled per user request)
            // shelf::start_shelf_monitor(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_clips,
            search_clips,
            pin_clip,
            delete_clip,
            clear_all_clips,
            paste_clip,
            hide_quick_paste,
            sample_color_at_cursor,
            run_ocr_for_clip,
            get_categories,
            create_category,
            delete_category,
            assign_category
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
