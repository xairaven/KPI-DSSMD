import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Applicant, Report } from "./types";
import "./App.css";

function ApplicantTable({ title, rows }: { title: string; rows: Applicant[] }) {
  return (
    <section className="panel">
      <h2>
        {title} <span className="count">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <p className="empty">— немає —</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ПІБ</th>
              <th>Оцінки</th>
              <th>Сер. бал</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>
                  {a.last_name} {a.first_name} {a.patronymic}
                </td>
                <td>{a.grades.join(", ")}</td>
                <td>{a.average}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function StudentsPage({ rows }: { rows: Applicant[] }) {
  return (
    <section className="panel">
      <h2>
        Абітурієнти <span className="count">({rows.length})</span>
      </h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>ПІБ</th>
            <th>Адреса</th>
            <th>Телефон</th>
            <th>Оцінки</th>
            <th>Сер. бал</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>
                {a.last_name} {a.first_name} {a.patronymic}
              </td>
              <td>{a.address}</td>
              <td>{a.phone}</td>
              <td>{a.grades.join(", ")}</td>
              <td>{a.average}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ReportPage({ report }: { report: Report | null }) {
  // Kept as plain strings (not numbers) so the input always shows exactly
  // what was typed.
  const [thresholdInput, setThresholdInput] = useState("7");
  const [topCountInput, setTopCountInput] = useState("3");
  const [computed, setComputed] = useState<Report | null>(null);

  async function compute() {
    const threshold = Number(thresholdInput) || 0;
    const topCount = Number(topCountInput) || 0;
    setComputed(await invoke<Report>("build_report", { threshold, topCount }));
  }

  useEffect(() => {
    if (report) setComputed(report);
  }, [report]);

  return (
    <>
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
        <label>
          N (топ)
          <input
            type="number"
            min={1}
            value={topCountInput}
            onChange={(e) => setTopCountInput(e.currentTarget.value)}
          />
        </label>
        <button type="submit">Обчислити</button>
      </form>

      {computed && (
        <>
          <ApplicantTable title="Незадовільні оцінки" rows={computed.failing} />
          <ApplicantTable
            title={`Середній бал вище ${thresholdInput}`}
            rows={computed.above_threshold}
          />
          <ApplicantTable
            title={`Топ-${topCountInput} за середнім балом`}
            rows={computed.top_n}
          />
          <ApplicantTable title="Напівпрохідний бал" rows={computed.borderline} />
        </>
      )}
    </>
  );
}

function App() {
  const [page, setPage] = useState<"report" | "students">("report");
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    invoke<Report>("build_report", { threshold: 7, topCount: 3 }).then(setReport);
  }, []);

  return (
    <main className="container">
      <h1>Лаб. 1 — Абітурієнт</h1>

      <nav className="nav">
        <button
          className={page === "report" ? "active" : ""}
          onClick={() => setPage("report")}
        >
          Звіт
        </button>
        <button
          className={page === "students" ? "active" : ""}
          onClick={() => setPage("students")}
        >
          Абітурієнти
        </button>
      </nav>

      {page === "report" ? (
        <ReportPage report={report} />
      ) : (
        <StudentsPage rows={report?.all ?? []} />
      )}
    </main>
  );
}

export default App;
