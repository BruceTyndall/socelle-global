// SOCELLE Desktop — Tauri app library
//
// Thin shell only. No business logic.
// All app logic is in the React+Vite frontend (src/).

use tauri_plugin_notification::NotificationExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|_app| {
            // No setup logic needed — the frontend handles everything.
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("SOCELLE Desktop failed to start");
}
