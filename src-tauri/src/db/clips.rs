use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clip {
    pub id: Option<i64>,
    pub uuid: String,
    pub content_type: String,
    pub text_content: Option<String>,
    pub asset_path: Option<String>,
    pub ocr_text: Option<String>,
    pub source_app_name: Option<String>,
    pub source_app_display: Option<String>,
    pub is_pinned: bool,
    pub is_bulk_bundle: bool,
    pub created_at: i64,
    pub last_used_at: Option<i64>,
    pub category_ids: Option<Vec<i64>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub color: Option<String>,
    pub sort_order: i64,
    pub created_at: i64,
}

fn ensure_clip_image_data(mut clip: Clip) -> Clip {
    if (clip.content_type == "image" || clip.content_type == "screenshot")
        && (clip.text_content.is_none() || !clip.text_content.as_ref().unwrap().starts_with("data:image/"))
    {
        if let Some(ref path_str) = clip.asset_path {
            if let Ok(bytes) = std::fs::read(path_str) {
                let data_url = format!("data:image/bmp;base64,{}", BASE64.encode(&bytes));
                clip.text_content = Some(data_url);
            }
        }
    }
    clip
}

pub fn insert_clip(conn: &Connection, clip: &Clip) -> Result<i64> {
    conn.execute(
        "INSERT INTO clips (
            uuid, content_type, text_content, asset_path, ocr_text,
            source_app_name, source_app_display, is_pinned, is_bulk_bundle,
            created_at, last_used_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            clip.uuid,
            clip.content_type,
            clip.text_content,
            clip.asset_path,
            clip.ocr_text,
            clip.source_app_name,
            clip.source_app_display,
            if clip.is_pinned { 1 } else { 0 },
            if clip.is_bulk_bundle { 1 } else { 0 },
            clip.created_at,
            clip.last_used_at,
        ],
    )?;

    Ok(conn.last_insert_rowid())
}

pub fn get_clip_by_id(conn: &Connection, clip_id: i64) -> Result<Option<Clip>> {
    let sql = "SELECT id, uuid, content_type, text_content, asset_path, ocr_text,
                      source_app_name, source_app_display, is_pinned, is_bulk_bundle,
                      created_at, last_used_at
               FROM clips WHERE id = ?1";

    let mut stmt = conn.prepare(sql)?;
    let mut iter = stmt.query_map(params![clip_id], |row| {
        let categories = get_clip_categories_internal(conn, clip_id).unwrap_or_default();
        Ok(Clip {
            id: Some(row.get(0)?),
            uuid: row.get(1)?,
            content_type: row.get(2)?,
            text_content: row.get(3)?,
            asset_path: row.get(4)?,
            ocr_text: row.get(5)?,
            source_app_name: row.get(6)?,
            source_app_display: row.get(7)?,
            is_pinned: row.get::<_, i32>(8)? != 0,
            is_bulk_bundle: row.get::<_, i32>(9)? != 0,
            created_at: row.get(10)?,
            last_used_at: row.get(11)?,
            category_ids: Some(categories),
        })
    })?;

    if let Some(clip) = iter.next() {
        Ok(Some(ensure_clip_image_data(clip?)))
    } else {
        Ok(None)
    }
}

pub fn get_clip_by_index(conn: &Connection, index: usize) -> Result<Option<Clip>> {
    let clips = get_clips(conn, 1, index, None)?;
    Ok(clips.into_iter().next())
}

pub fn get_clips(
    conn: &Connection,
    limit: usize,
    offset: usize,
    content_type_filter: Option<&str>,
) -> Result<Vec<Clip>> {
    let mut sql = String::from(
        "SELECT id, uuid, content_type, text_content, asset_path, ocr_text,
                source_app_name, source_app_display, is_pinned, is_bulk_bundle,
                created_at, last_used_at
         FROM clips ",
    );

    if let Some(filter) = content_type_filter {
        if !filter.is_empty() && filter != "all" {
            sql.push_str(&format!("WHERE content_type = '{}' ", filter.replace('\'', "''")));
        }
    }

    sql.push_str("ORDER BY is_pinned DESC, created_at DESC LIMIT ?1 OFFSET ?2");

    let mut stmt = conn.prepare(&sql)?;
    let clip_iter = stmt.query_map(params![limit as i64, offset as i64], |row| {
        let clip_id: i64 = row.get(0)?;
        let categories = get_clip_categories_internal(conn, clip_id).unwrap_or_default();

        Ok(Clip {
            id: Some(clip_id),
            uuid: row.get(1)?,
            content_type: row.get(2)?,
            text_content: row.get(3)?,
            asset_path: row.get(4)?,
            ocr_text: row.get(5)?,
            source_app_name: row.get(6)?,
            source_app_display: row.get(7)?,
            is_pinned: row.get::<_, i32>(8)? != 0,
            is_bulk_bundle: row.get::<_, i32>(9)? != 0,
            created_at: row.get(10)?,
            last_used_at: row.get(11)?,
            category_ids: Some(categories),
        })
    })?;

    let mut result = Vec::new();
    for clip in clip_iter {
        result.push(ensure_clip_image_data(clip?));
    }
    Ok(result)
}

pub fn search_clips(conn: &Connection, query: &str) -> Result<Vec<Clip>> {
    if query.trim().is_empty() {
        return get_clips(conn, 50, 0, None);
    }

    let sql = "SELECT c.id, c.uuid, c.content_type, c.text_content, c.asset_path, c.ocr_text,
                      c.source_app_name, c.source_app_display, c.is_pinned, c.is_bulk_bundle,
                      c.created_at, c.last_used_at
               FROM clips c
               JOIN clips_fts fts ON c.id = fts.rowid
               WHERE clips_fts MATCH ?1
               ORDER BY c.is_pinned DESC, c.created_at DESC
               LIMIT 50";

    let mut stmt = conn.prepare(sql)?;
    let fts_query = format!("{}*", query.replace('"', "\"\""));

    let clip_iter = stmt.query_map(params![fts_query], |row| {
        let clip_id: i64 = row.get(0)?;
        let categories = get_clip_categories_internal(conn, clip_id).unwrap_or_default();

        Ok(Clip {
            id: Some(clip_id),
            uuid: row.get(1)?,
            content_type: row.get(2)?,
            text_content: row.get(3)?,
            asset_path: row.get(4)?,
            ocr_text: row.get(5)?,
            source_app_name: row.get(6)?,
            source_app_display: row.get(7)?,
            is_pinned: row.get::<_, i32>(8)? != 0,
            is_bulk_bundle: row.get::<_, i32>(9)? != 0,
            created_at: row.get(10)?,
            last_used_at: row.get(11)?,
            category_ids: Some(categories),
        })
    })?;

    let mut result = Vec::new();
    for clip in clip_iter {
        result.push(ensure_clip_image_data(clip?));
    }

    if result.is_empty() {
        let like_sql = "SELECT id, uuid, content_type, text_content, asset_path, ocr_text,
                               source_app_name, source_app_display, is_pinned, is_bulk_bundle,
                               created_at, last_used_at
                        FROM clips
                        WHERE text_content LIKE ?1 OR ocr_text LIKE ?1 OR source_app_display LIKE ?1
                        ORDER BY is_pinned DESC, created_at DESC
                        LIMIT 50";
        let mut like_stmt = conn.prepare(like_sql)?;
        let like_query = format!("%{}%", query);
        let like_iter = like_stmt.query_map(params![like_query], |row| {
            let clip_id: i64 = row.get(0)?;
            let categories = get_clip_categories_internal(conn, clip_id).unwrap_or_default();

            Ok(Clip {
                id: Some(clip_id),
                uuid: row.get(1)?,
                content_type: row.get(2)?,
                text_content: row.get(3)?,
                asset_path: row.get(4)?,
                ocr_text: row.get(5)?,
                source_app_name: row.get(6)?,
                source_app_display: row.get(7)?,
                is_pinned: row.get::<_, i32>(8)? != 0,
                is_bulk_bundle: row.get::<_, i32>(9)? != 0,
                created_at: row.get(10)?,
                last_used_at: row.get(11)?,
                category_ids: Some(categories),
            })
        })?;
        for clip in like_iter {
            result.push(ensure_clip_image_data(clip?));
        }
    }

    Ok(result)
}

pub fn pin_clip(conn: &Connection, clip_id: i64, is_pinned: bool) -> Result<()> {
    conn.execute(
        "UPDATE clips SET is_pinned = ?1 WHERE id = ?2",
        params![if is_pinned { 1 } else { 0 }, clip_id],
    )?;
    Ok(())
}

pub fn delete_clip(conn: &Connection, clip_id: i64) -> Result<()> {
    conn.execute("DELETE FROM clips WHERE id = ?1", params![clip_id])?;
    Ok(())
}

pub fn create_category(conn: &Connection, name: &str, color: Option<&str>) -> Result<i64> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    conn.execute(
        "INSERT INTO categories (name, color, sort_order, created_at) VALUES (?1, ?2, 0, ?3)",
        params![name, color.unwrap_or("#3b82f6"), now],
    )?;

    Ok(conn.last_insert_rowid())
}

pub fn get_categories(conn: &Connection) -> Result<Vec<Category>> {
    let mut stmt = conn.prepare("SELECT id, name, color, sort_order, created_at FROM categories ORDER BY sort_order ASC, name ASC")?;
    let cat_iter = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            sort_order: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?;

    let mut result = Vec::new();
    for cat in cat_iter {
        result.push(cat?);
    }
    Ok(result)
}

pub fn assign_clip_category(conn: &Connection, clip_id: i64, category_id: i64) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO clip_categories (clip_id, category_id) VALUES (?1, ?2)",
        params![clip_id, category_id],
    )?;
    Ok(())
}

pub fn remove_clip_category(conn: &Connection, clip_id: i64, category_id: i64) -> Result<()> {
    conn.execute(
        "DELETE FROM clip_categories WHERE clip_id = ?1 AND category_id = ?2",
        params![clip_id, category_id],
    )?;
    Ok(())
}

pub fn clear_all_clips(conn: &Connection) -> Result<()> {
    conn.execute("DELETE FROM clips", [])?;
    Ok(())
}

fn get_clip_categories_internal(conn: &Connection, clip_id: i64) -> Result<Vec<i64>> {
    let mut stmt = conn.prepare("SELECT category_id FROM clip_categories WHERE clip_id = ?1")?;
    let iter = stmt.query_map(params![clip_id], |row| row.get(0))?;
    let mut result = Vec::new();
    for id in iter {
        result.push(id?);
    }
    Ok(result)
}
