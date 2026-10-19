import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link } from "react-router-dom";
import { ApplicantTable } from "../components/ApplicantTable";
import type { Applicant } from "../types";

export function Threshold() {
  // Kept as a string (not a number) so the input always shows exactly
  // what was typed — a controlled number-input round-trip otherwise
  // produces a "05"-style leading-zero glitch.
  const [thresholdInput, setThresholdInput] = useState("7");
  const [rows, setRows] = useState<Applicant[] | null>(null);

  async function compute() {
    const threshold = Number(thresholdInput) || 0;
    setRows(await invoke<Applicant[]>("get_above_threshold", { threshold }));
  }

  useEffect(() => {
    compute();
  }, []);

  return (
    <main className="container">
      <Link className="back" to="/">
        ← На головну
      </Link>
      <h1>(б) Поріг середнього балу</h1>

      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault();
          compute();
        }}
      >
        <label>
          Поріг серед. балу
          <input
            type="number"
            step="0.1"
            value={thresholdInput}
            onChange={(e) => setThresholdInput(e.currentTarget.value)}
          />
        </label>
        <button type="submit">Обчислити</button>
      </form>

      <section className="panel">{rows && <ApplicantTable rows={rows} />}</section>
    </main>
  );
}