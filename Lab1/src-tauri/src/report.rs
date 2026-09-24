use crate::applicant::ApplicantView;
use crate::sample;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub all: Vec<ApplicantView>,
    pub failing: Vec<ApplicantView>,
    pub above_threshold: Vec<ApplicantView>,
    pub top_n: Vec<ApplicantView>,
    pub borderline: Vec<ApplicantView>,
}

#[tauri::command]
pub fn build_report(threshold: f64, top_count: usize) -> Report {
    let mut applicants = sample::get_applicants();

    applicants.sort_by(|a, b| {
        let a = a.average_grade();
        let b = b.average_grade();
        b.total_cmp(&a)
    });

    Report {
        all: applicants.iter().map(ApplicantView::from).collect(),
        failing: applicants
            .iter()
            .filter(|a| a.has_failing_grade())
            .map(ApplicantView::from)
            .collect(),
        above_threshold: applicants
            .iter()
            .filter(|a| a.is_above_average(threshold))
            .map(ApplicantView::from)
            .collect(),
        top_n: applicants
            .iter()
            .take(top_count)
            .map(ApplicantView::from)
            .collect(),
        borderline: applicants
            .iter()
            .filter(|a| a.is_borderline())
            .map(ApplicantView::from)
            .collect(),
    }
}
