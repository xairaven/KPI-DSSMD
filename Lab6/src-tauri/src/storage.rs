//! Persisting applicants to a JSON file in the app's data directory.
//!
//! Loaded once on startup (falling back to the Lab 2 sample seed if the
//! file is missing or unreadable) and saved once on suspend/exit

use crate::applicant::Applicant;
use crate::sample;
use std::path::Path;

pub fn load(path: &Path) -> Vec<Applicant> {
    let result = std::fs::read_to_string(path)
        .map_err(|err| err.to_string())
        .and_then(|contents| {
            serde_json::from_str(&contents).map_err(|err| err.to_string())
        });

    match result {
        Ok(applicants) => applicants,
        Err(err) => {
            log::warn!(
                "Failed to load {path}: {err}. Using initial data.",
                path = path.display(),
            );
            sample::get_applicants()
        },
    }
}

pub fn save(path: &Path, applicants: &[Applicant]) -> Result<(), String> {
    let json = serde_json::to_string_pretty(applicants)
        .map_err(|err| format!("Failed to serialize applicants: {err}"))?;

    std::fs::write(path, json)
        .map_err(|err| format!("Failed to write {}: {err}", path.display()))
}
