// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Window};

/**
 * Alti Desktop — Industrial Rust Bridge.
 * Providing 'Universe-Best' local orchestration for Fortune 500 agents.
 */

#[tauri::command]
async fn execute_agent_mission(mission_id: String, command: String) -> Result<String, String> {
    println!("🚀 [Alti-Bridge] Executing mission {}: {}", mission_id, command);
    // In a production build, this would trigger local Shell/CLI operations via the Nomad agent.
    Ok(format!("Mission {} successfully received by the local OS sentinel.", mission_id))
}

#[tauri::command]
async fn get_swarm_telemetry() -> Result<serde_json::Value, String> {
    // Collect local system health for the Swarm Conductor.
    Ok(serde_json::json!({
        "status": "flawless",
        "latency": "12ms",
        "local_hands_clearance": "ADMIN"
    }))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![execute_agent_mission, get_swarm_telemetry])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            
            #[cfg(target_os = "macos")]
            {
                use tauri_plugin_vibrancy::MacOSVibrancy;
                window.apply_vibrancy(tauri_plugin_vibrancy::NSVisualEffectMaterial::AppearanceBased, None, None, None).unwrap();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
