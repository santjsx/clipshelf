pub const SCHEMA_SQL: &str = r#"
-- Clips core table
CREATE TABLE IF NOT EXISTS clips (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid            TEXT NOT NULL UNIQUE,
    content_type    TEXT NOT NULL CHECK (content_type IN
                        ('text','link','image','screenshot','code','color','file','bundle')),
    text_content    TEXT,              -- raw text for text/link/code/color clips
    asset_path      TEXT,              -- relative path under /assets for image/screenshot/file
    ocr_text        TEXT,              -- extracted text for image/screenshot clips
    source_app_name TEXT,              -- e.g. "Code.exe", "chrome.exe"
    source_app_display TEXT,           -- friendly name shown in UI
    is_pinned       INTEGER NOT NULL DEFAULT 0,
    is_bulk_bundle  INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL,  -- unix epoch seconds
    last_used_at    INTEGER
);

CREATE INDEX IF NOT EXISTS idx_clips_content_type   ON clips(content_type);
CREATE INDEX IF NOT EXISTS idx_clips_source_app     ON clips(source_app_name);
CREATE INDEX IF NOT EXISTS idx_clips_created_at     ON clips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clips_pinned         ON clips(is_pinned);

-- Full text search across text content + OCR text
CREATE VIRTUAL TABLE IF NOT EXISTS clips_fts USING fts5(
    text_content,
    ocr_text,
    content='clips',
    content_rowid='id'
);

-- Triggers for FTS sync
DROP TRIGGER IF EXISTS clips_ai;
CREATE TRIGGER clips_ai AFTER INSERT ON clips BEGIN
    INSERT INTO clips_fts(rowid, text_content, ocr_text)
    VALUES (new.id, new.text_content, new.ocr_text);
END;

DROP TRIGGER IF EXISTS clips_ad;
CREATE TRIGGER clips_ad AFTER DELETE ON clips BEGIN
    INSERT INTO clips_fts(clips_fts, rowid, text_content, ocr_text)
    VALUES ('delete', old.id, old.text_content, old.ocr_text);
END;

DROP TRIGGER IF EXISTS clips_au;
CREATE TRIGGER clips_au AFTER UPDATE ON clips BEGIN
    INSERT INTO clips_fts(clips_fts, rowid, text_content, ocr_text)
    VALUES ('delete', old.id, old.text_content, old.ocr_text);
    INSERT INTO clips_fts(rowid, text_content, ocr_text)
    VALUES (new.id, new.text_content, new.ocr_text);
END;

-- Bundle items
CREATE TABLE IF NOT EXISTS bundle_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    bundle_clip_id INTEGER NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
    position    INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    text_content TEXT,
    asset_path  TEXT
);

CREATE INDEX IF NOT EXISTS idx_bundle_items_parent ON bundle_items(bundle_clip_id);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    color       TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS clip_categories (
    clip_id     INTEGER NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (clip_id, category_id)
);

-- Shortcuts
CREATE TABLE IF NOT EXISTS shortcuts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger     TEXT NOT NULL UNIQUE,
    expansion   TEXT NOT NULL,
    created_at  INTEGER NOT NULL,
    last_used_at INTEGER
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    clip_id     INTEGER NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL CHECK (kind IN ('time','app_return')),
    fire_at     INTEGER,
    target_app_name TEXT,
    fired       INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_fire_at ON reminders(fire_at) WHERE fired = 0;
CREATE INDEX IF NOT EXISTS idx_reminders_app     ON reminders(target_app_name) WHERE fired = 0;

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);
"#;
