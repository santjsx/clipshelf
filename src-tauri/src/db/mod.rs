pub mod schema;
pub mod clips;

use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;

pub fn get_app_dir() -> PathBuf {
    let local_data_dir = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    let app_dir = local_data_dir.join("ClipShelf");
    let assets_dir = app_dir.join("assets");
    let _ = fs::create_dir_all(&assets_dir);
    app_dir
}

pub fn get_db_path() -> PathBuf {
    get_app_dir().join("clipshelf.db")
}

pub fn init_db() -> Result<Connection> {
    let db_path = get_db_path();
    log::info!("Initializing ClipShelf SQLite DB at {:?}", db_path);

    let conn = Connection::open(&db_path)?;

    // Enable WAL mode & Foreign Keys
    let _ = conn.pragma_update(None, "journal_mode", "WAL");
    let _ = conn.pragma_update(None, "foreign_keys", "ON");

    // Execute schema statements
    if let Err(e) = conn.execute_batch(schema::SCHEMA_SQL) {
        log::warn!("Schema execution note: {}", e);
    }

    log::info!("ClipShelf database schema initialized successfully.");
    Ok(conn)
}
