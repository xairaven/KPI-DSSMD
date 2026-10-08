//! Shared mutable store behind `tauri::State<Mutex<Repository>>`.
//!
//! Lab 1 could rebuild a fresh sample array on every query since it was
//! read-only. Lab 2 needs edits to persist across screens, so this plays
//! the role a singleton repository (or a real database) would play behind
//! several Activities in a native Android MVC app.

use crate::applicant::{Applicant, ApplicantInput};
use crate::sample;

pub struct Repository {
    applicants: Vec<Applicant>,
    next_id: u32,
}

impl Repository {
    pub fn new() -> Self {
        let applicants = sample::get_applicants();
        let next_id = applicants.iter().map(|a| a.id).max().unwrap_or(0) + 1;
        Self {
            applicants,
            next_id,
        }
    }

    pub fn list(&self) -> &[Applicant] {
        &self.applicants
    }

    pub fn add(&mut self, input: ApplicantInput) -> Applicant {
        let applicant = Applicant {
            id: self.next_id,
            last_name: input.last_name,
            first_name: input.first_name,
            patronymic: input.patronymic,
            address: input.address,
            phone: input.phone,
            grades: input.grades,
        };
        self.next_id += 1;
        self.applicants.push(applicant.clone());
        applicant
    }

    pub fn update(
        &mut self, id: u32, input: ApplicantInput,
    ) -> Result<Applicant, String> {
        let applicant = self
            .applicants
            .iter_mut()
            .find(|a| a.id == id)
            .ok_or_else(|| format!("Абітурієнта з ID {id} не знайдено"))?;

        applicant.update_by_input(input);

        Ok(applicant.clone())
    }
}

impl Default for Repository {
    fn default() -> Self {
        Self::new()
    }
}
