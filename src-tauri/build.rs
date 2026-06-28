fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .plugin(
                "insocode",
                tauri_build::InlinedPlugin::new().commands(&["selectdir"]),
            )
    )
    .expect("failed to run tauri-build");
}
