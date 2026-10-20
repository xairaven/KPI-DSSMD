//! Lab 4: a separate screen that explicitly
//! demonstrates `Button`, `TextView`, `EditText`, and `ListView`.

// State<T> must be taken by value in every command here — that's Tauri's
// calling convention, not a real ownership need.
#![allow(clippy::needless_pass_by_value, reason = "Tauri's convention")]

use crate::applicant::ApplicantView;
use crate::repository::Repository;
use std::sync::{Mutex, PoisonError};
use tauri::State;

#[tauri::command]
pub fn search_applicants(
    state: State<'_, Mutex<Repository>>, query: String,
) -> Vec<ApplicantView> {
    let repo = state.lock().unwrap_or_else(PoisonError::into_inner);
    let needle = query.trim().to_lowercase();

    repo.list()
        .iter()
        .filter(|a| needle.is_empty() || a.last_name.to_lowercase().contains(&needle))
        .map(ApplicantView::from)
        .collect()
}
