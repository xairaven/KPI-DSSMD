// Mirrors src-tauri/src/applicant.rs and the per-screen result shapes —
// kept in sync by hand.

export interface Applicant {
  id: number;
  last_name: string;
  first_name: string;
  patronymic: string;
  address: string;
  phone: string;
  grades: number[];
  average: number;
}

// Form payload for add/edit — no id/average, those are server-assigned.
export interface ApplicantInput {
  last_name: string;
  first_name: string;
  patronymic: string;
  address: string;
  phone: string;
  grades: number[];
}

export interface TopNResult {
  top: Applicant[];
  borderline: Applicant[];
}