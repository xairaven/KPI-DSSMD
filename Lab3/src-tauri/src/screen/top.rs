//! Завдання (в): N абітурієнтів з найвищим середнім балом,
//! а також повний список тих, хто має напівпрохідний бал.

// State<T> must be taken by value in every command here — that's Tauri's
// calling convention, not a real ownership need.
#![allow(clippy::needless_pass_by_value)]

use crate::applicant::ApplicantView;
use crate::repository::Repository;
use serde::Serialize;
use std::sync::{Mutex, PoisonError};
use tauri::State;

#[derive(Debug, Clone, Serialize)]
pub struct TopNResult {
    pub top: Vec<ApplicantView>,
    pub borderline: Vec<ApplicantView>,
}

#[tauri::command]
pub fn get_top_n(state: State<'_, Mutex<Repository>>, n: usize) -> TopNResult {
    // Clone out of the guard immediately so the lock isn't held while we
    // sort/filter below.
    let mut applicants = state
        .lock()
        .unwrap_or_else(PoisonError::into_inner)
        .list()
        .to_vec();
    applicants.sort_by(|a, b| b.average_grade().total_cmp(&a.average_grade()));

    let top = applicants.iter().take(n).map(ApplicantView::from).collect();
    let borderline = applicants
        .iter()
        .filter(|a| a.is_borderline())
        .map(ApplicantView::from)
        .collect();

    TopNResult { top, borderline }
}
