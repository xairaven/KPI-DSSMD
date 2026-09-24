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

export interface Report {
  all: Applicant[];
  failing: Applicant[];
  above_threshold: Applicant[];
  top_n: Applicant[];
  borderline: Applicant[];
}
