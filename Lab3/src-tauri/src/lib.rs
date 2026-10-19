mod applicant;
mod repository;
mod sample;
mod screen;

use repository::Repository;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(err) = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(Repository::new()))
        .invoke_handler(tauri::generate_handler![
            screen::failing::get_failing,
            screen::threshold::get_above_threshold,
            screen::top::get_top_n,
            screen::students::list_applicants,
            screen::students::add_applicant,
            screen::students::update_applicant,
        ])
        .run(tauri::generate_context!())
    {
        eprintln!("Error occurred while running Tauri application: {err}");
        std::process::exit(1);
    }
}
