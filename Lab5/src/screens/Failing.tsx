import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link } from "react-router-dom";
import { ApplicantTable } from "../components/ApplicantTable";
import type { Applicant } from "../types";

export function Failing() {
  const [rows, setRows] = useState<Applicant[] | null>(null);

  useEffect(() => {
    invoke<Applicant[]>("get_failing").then(setRows);
  }, []);

  return (
    <main className="container">
      <Link className="back" to="/">
        ← На головну
      </Link>
      <h1>(a) Незадовільні оцінки</h1>
      <section className="panel">{rows && <ApplicantTable rows={rows} />}</section>
    </main>
  );
}