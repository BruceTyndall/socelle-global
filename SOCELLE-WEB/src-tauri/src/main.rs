// SOCELLE Desktop — Tauri shell entry point
//
// RULE: No Rust business logic lives here.
// This is a THIN SHELL that wraps the React+Vite web application.
// All intelligence, data fetching, and UI logic resides in the frontend.
//
// What this layer provides:
//   - Native window chrome (title bar, resize, min/max)
//   - OS-level push notifications via tauri-plugin-notification
//   - Shell commands (open browser links) via tauri-plugin-shell
//
// DO NOT add business logic, database queries, or data processing here.

// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    socelle_desktop_lib::run();
}
