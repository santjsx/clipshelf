fn main() {
    tauri_build::build();

    // Auto copy WebView2Loader.dll to workspace root if present in target directory
    if let Ok(manifest_dir) = std::env::var("CARGO_MANIFEST_DIR") {
        let manifest_path = std::path::Path::new(&manifest_dir);
        let root_dir = manifest_path.parent().unwrap_or(manifest_path);

        let debug_dll = manifest_path.join("target").join("debug").join("WebView2Loader.dll");
        let release_dll = manifest_path.join("target").join("release").join("WebView2Loader.dll");

        if debug_dll.exists() {
            let _ = std::fs::copy(&debug_dll, root_dir.join("WebView2Loader.dll"));
            let _ = std::fs::copy(&debug_dll, manifest_path.join("WebView2Loader.dll"));
        } else if release_dll.exists() {
            let _ = std::fs::copy(&release_dll, root_dir.join("WebView2Loader.dll"));
            let _ = std::fs::copy(&release_dll, manifest_path.join("WebView2Loader.dll"));
        }
    }
}
