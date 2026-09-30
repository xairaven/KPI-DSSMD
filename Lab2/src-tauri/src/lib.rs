#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(err) = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![crate::report::build_report])
        .run(tauri::generate_context!())
    {
        eprintln!("Error occurred while running Tauri application: {err}");
        std::process::exit(1);
    }
}

mod applicant;
mod report;
mod sample;
