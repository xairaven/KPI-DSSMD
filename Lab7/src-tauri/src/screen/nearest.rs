//! Lab 7: finding the nearest university to the
//! device's current location. Candidate universities are loaded from a
//! bundled JSON resource file, not hardcoded like `sample.rs`.

// AppHandle must be taken by value — that's Tauri's calling convention,
// not a real ownership need.
#![allow(clippy::needless_pass_by_value, reason = "Tauri's convention")]

use crate::geo::haversine_km;
use serde::{Deserialize, Serialize};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tauri_plugin_fs::FsExt;

const INSTITUTIONS_FILE: &str = "resources/institutions.json";

#[derive(Debug, Clone, Deserialize)]
struct University {
    name: String,
    address: String,
    lat: f64,
    lon: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct NearestUniversity {
    name: String,
    address: String,
    distance_km: f64,
}

fn load_universities(app: &AppHandle) -> Result<Vec<University>, String> {
    let path = app
        .path()
        .resolve(INSTITUTIONS_FILE, BaseDirectory::Resource)
        .map_err(|err| err.to_string())?;

    // Bundled resources live inside the APK on Android, not on a real
    // filesystem — the fs plugin routes `asset://` paths through
    // Android's AssetManager, and falls back to plain file I/O elsewhere.
    let contents = app
        .fs()
        .read_to_string(path.clone())
        .map_err(|err| format!("Failed to read {}: {err}", path.display()))?;

    serde_json::from_str(&contents).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn find_nearest_university(
    app: AppHandle, lat: f64, lon: f64,
) -> Result<NearestUniversity, String> {
    load_universities(&app)?
        .into_iter()
        .map(|u| {
            let distance_km = haversine_km(lat, lon, u.lat, u.lon);
            NearestUniversity {
                name: u.name,
                address: u.address,
                distance_km: (distance_km * 100.0).round() / 100.0,
            }
        })
        .min_by(|a, b| a.distance_km.total_cmp(&b.distance_km))
        .ok_or_else(|| "Список навчальних закладів порожній".to_string())
}
