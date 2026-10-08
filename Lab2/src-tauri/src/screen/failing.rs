//! Завдання (a): абітурієнти, які мають незадовільні оцінки.

// State<T> must be taken by value in every command here — that's Tauri's
// calling convention, not a real ownership need.
#![allow(clippy::needless_pass_by_value)]

use crate::applicant::ApplicantView;
use crate::repository::Repository;
use std::sync::{Mutex, PoisonError};
use tauri::State;

#[tauri::command]
pub fn get_failing(state: State<'_, Mutex<Repository>>) -> Vec<ApplicantView> {
    let repo = state.lock().unwrap_or_else(PoisonError::into_inner);
    repo.list()
        .iter()
        .filter(|a| a.has_failing_grade())
        .map(ApplicantView::from)
        .collect()
}
