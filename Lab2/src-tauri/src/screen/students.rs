//! Введення, виведення та редагування даних: список абітурієнтів + форма
//! додавання/редагування.

// State<T> must be taken by value in every command here — that's Tauri's
// calling convention, not a real ownership need.
#![allow(clippy::needless_pass_by_value)]

use crate::applicant::{ApplicantInput, ApplicantView};
use crate::repository::Repository;
use std::sync::{Mutex, PoisonError};
use tauri::State;

#[tauri::command]
pub fn list_applicants(state: State<'_, Mutex<Repository>>) -> Vec<ApplicantView> {
    let repo = state.lock().unwrap_or_else(PoisonError::into_inner);
    repo.list().iter().map(ApplicantView::from).collect()
}

#[tauri::command]
pub fn add_applicant(
    state: State<'_, Mutex<Repository>>, input: ApplicantInput,
) -> ApplicantView {
    let mut repo = state.lock().unwrap_or_else(PoisonError::into_inner);
    ApplicantView::from(&repo.add(input))
}

#[tauri::command]
pub fn update_applicant(
    state: State<'_, Mutex<Repository>>, id: u32, input: ApplicantInput,
) -> Result<ApplicantView, String> {
    let mut repo = state.lock().unwrap_or_else(PoisonError::into_inner);
    repo.update(id, input).map(|a| ApplicantView::from(&a))
}
