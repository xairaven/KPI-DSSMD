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

function App() {
  const [threshold, setThreshold] = useState(7);
  const [topCount, setTopCount] = useState(3);
  const [report, setReport] = useState<Report | null>(null);

  async function compute() {
    setReport(await invoke<Report>("build_report", { threshold, topCount }));
  }

  useEffect(() => {
    compute();
  }, []);

  return (
    <main className="container">
      <h1>Лаб. 1 — Абітурієнт</h1>

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
            value={threshold}
            onChange={(e) => setThreshold(Number(e.currentTarget.value))}
          />
        </label>
        <label>
          N (топ)
          <input
            type="number"
            min={1}
            value={topCount}
            onChange={(e) => setTopCount(Number(e.currentTarget.value))}
          />
        </label>
        <button type="submit">Обчислити</button>
      </form>

      {report && (
        <>
          <ApplicantTable title="Усі абітурієнти" rows={report.all} />
          <ApplicantTable title="Незадовільні оцінки" rows={report.failing} />
          <ApplicantTable
            title={`Середній бал вище ${threshold}`}
            rows={report.above_threshold}
          />
          <ApplicantTable title={`Топ-${topCount} за середнім балом`} rows={report.top_n} />
          <ApplicantTable title="Напівпрохідний бал" rows={report.borderline} />
        </>
      )}
    </main>
  );
}

export default App;
