use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct Applicant {
    pub id: u32,
    pub last_name: String,
    pub first_name: String,
    pub patronymic: String,
    pub address: String,
    pub phone: String,
    pub grades: Vec<u8>,
}

pub const PASSING_GRADE: u8 = 4;
pub const BORDERLINE_RANGE: std::ops::Range<f64> = 4.0..6.0;

impl Applicant {
    pub fn average_grade(&self) -> f64 {
        if self.grades.is_empty() {
            return 0.0;
        }
        let sum = f64::from(self.grades.iter().sum::<u8>());
        #[allow(clippy::cast_precision_loss)]
        let avg = sum / self.grades.len() as f64;

        (avg * 100.0).round() / 100.0
    }

    pub fn has_failing_grade(&self) -> bool {
        self.grades.iter().any(|&g| g < PASSING_GRADE)
    }

    pub fn is_above_average(&self, threshold: f64) -> bool {
        self.average_grade() > threshold
    }

    pub fn is_borderline(&self) -> bool {
        BORDERLINE_RANGE.contains(&self.average_grade())
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct ApplicantView {
    #[serde(flatten)]
    pub applicant: Applicant,
    pub average: f64,
}

impl From<&Applicant> for ApplicantView {
    fn from(a: &Applicant) -> Self {
        Self {
            applicant: a.clone(),
            average: a.average_grade(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Applicant;
    use super::BORDERLINE_RANGE;
    use crate::sample;

    fn applicant(grades: Vec<u8>) -> Applicant {
        Applicant {
            id: 0,
            last_name: "Kovalov".into(),
            first_name: "Alex".into(),
            patronymic: "Oleksiyovuch".into(),
            address: "Somewhere".into(),
            phone: "Idk?".into(),
            grades,
        }
    }

    #[test]
    fn average_grade_rounds_to_two_decimals() {
        assert_eq!(applicant(vec![7, 8, 9]).average_grade(), 8.0);
        assert_eq!(applicant(vec![5, 6]).average_grade(), 5.5);
    }

    #[test]
    fn detects_failing_grades() {
        assert!(applicant(vec![3, 10, 10]).has_failing_grade());
        assert!(!applicant(vec![4, 10, 10]).has_failing_grade());
    }

    #[test]
    fn filters_above_threshold() {
        let applicants = sample::get_applicants();
        let threshold = 9.0;

        let result: Vec<Applicant> = applicants
            .into_iter()
            .filter(|a| a.is_above_average(threshold))
            .collect();

        assert!(result.iter().all(|a| a.average_grade() > 9.0));
    }

    #[test]
    fn top_n_is_sorted_descending_and_limited() {
        let mut applicants = sample::get_applicants();
        let top_n = 3;

        applicants.sort_by(|a, b| {
            let a = a.average_grade();
            let b = b.average_grade();
            b.total_cmp(&a)
        });
        let result: Vec<Applicant> = applicants.into_iter().take(top_n).collect();

        assert_eq!(result.len(), top_n);
        assert!(result[0].average_grade() >= result[1].average_grade());
        assert!(result[1].average_grade() >= result[2].average_grade());
    }

    #[test]
    fn borderline_stays_within_range() {
        let applicants = sample::get_applicants();

        let result: Vec<Applicant> = applicants
            .into_iter()
            .filter(|a| a.is_borderline())
            .collect();

        assert!(
            result
                .iter()
                .all(|a| BORDERLINE_RANGE.contains(&a.average_grade()))
        );
    }
}
