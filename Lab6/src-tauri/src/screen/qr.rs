//! Lab 5: Generating a QR code containing applicant data using the `qrcode` crate,
//! integrated via a Git dependency (rather than crates.io) — a demonstration of an alternative
//! method for adding third-party code to a project.

// State<T> must be taken by value in every command here — that's Tauri's
// calling convention, not a real ownership need.
#![allow(clippy::needless_pass_by_value, reason = "Tauri's convention")]

use crate::repository::Repository;
use qrcode::QrCode;
use qrcode::render::svg;
use std::sync::{Mutex, PoisonError};
use tauri::State;

#[tauri::command]
pub fn generate_qr(
    state: State<'_, Mutex<Repository>>, id: u32,
) -> Result<String, String> {
    let (last_name, first_name, patronymic, address, phone) = state
        .lock()
        .unwrap_or_else(PoisonError::into_inner)
        .list()
        .iter()
        .find(|a| a.id == id)
        .map(|a| {
            (
                a.last_name.clone(),
                a.first_name.clone(),
                a.patronymic.clone(),
                a.address.clone(),
                a.phone.clone(),
            )
        })
        .ok_or_else(|| format!("Абітурієнта з ID {id} не знайдено"))?;

    let payload = format!(
        "ID: {id}\nПІБ: {last_name} {first_name} {patronymic}\nАдреса: {address}\nТелефон: {phone}",
    );

    let code = QrCode::new(payload.as_bytes()).map_err(|err| err.to_string())?;

    Ok(code.render::<svg::Color>().build())
}
