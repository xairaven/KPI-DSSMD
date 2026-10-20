mod applicant;
mod repository;
mod sample;
mod screen;
mod storage;

use repository::Repository;
use std::sync::{Mutex, PoisonError};
use tauri::{AppHandle, Manager, RunEvent, WindowEvent};

const DATA_FILE_NAME: &str = "applicants.json";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;

            let applicants = storage::load(&data_dir.join(DATA_FILE_NAME));
            app.manage(Mutex::new(Repository::from_applicants(applicants)));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            screen::failing::get_failing,
            screen::threshold::get_above_threshold,
            screen::top::get_top_n,
            screen::search::search_applicants,
            screen::students::list_applicants,
            screen::students::add_applicant,
            screen::students::update_applicant,
            screen::students::delete_applicant,
        ])
        .build(tauri::generate_context!());

    let app = match app {
        Ok(app) => app,
        Err(err) => {
            eprintln!("Error occurred while building Tauri application: {err}");
            std::process::exit(1);
        },
    };

    app.run(|app_handle, event| match event {
        RunEvent::Exit => {
            log::info!("Activity lifecycle: onDestroy (Exit) — saving applicants");
            persist(app_handle);
        },
        // WindowEvent::Suspended/Resumed are the real Activity lifecycle —
        // Tauri dispatches them straight from onPause()/onResume() on
        // Android, unlike Lab 2's HashRouter, which only simulates one.
        #[cfg(mobile)]
        RunEvent::WindowEvent {
            event: WindowEvent::Resumed,
            ..
        } => {
            log::info!("Activity lifecycle: onResume (Resumed)");
        },
        #[cfg(mobile)]
        RunEvent::WindowEvent {
            event: WindowEvent::Suspended,
            ..
        } => {
            log::info!("Activity lifecycle: onPause (Suspended) — saving applicants");
            persist(app_handle);
        },
        RunEvent::WindowEvent {
            event: WindowEvent::Focused(focused),
            ..
        } => {
            log::info!("Activity lifecycle: window focus changed to {focused}");
        },
        RunEvent::WindowEvent {
            event: WindowEvent::CloseRequested { .. },
            ..
        } => {
            log::info!("Activity lifecycle: CloseRequested — saving applicants");
            persist(app_handle);
        },
        _ => {},
    });
}

fn persist(app_handle: &AppHandle) {
    let Some(state) = app_handle.try_state::<Mutex<Repository>>() else {
        log::error!("Failed to save: repository state is not found");
        return;
    };

    let Ok(data_dir) = app_handle.path().app_data_dir() else {
        log::error!("Failed to save: app data directory not found");
        return;
    };

    let applicants = state
        .lock()
        .unwrap_or_else(PoisonError::into_inner)
        .list()
        .to_vec();

    if let Err(err) = storage::save(&data_dir.join(DATA_FILE_NAME), &applicants) {
        log::error!("{err}");
    }
}
