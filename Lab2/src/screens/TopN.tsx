import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link } from "react-router-dom";
import { ApplicantTable } from "../components/ApplicantTable";
import type { TopNResult } from "../types";

export function TopN() {
  const [nInput, setNInput] = useState("3");
  const [result, setResult] = useState<TopNResult | null>(null);

  async function compute() {
    const n = Number(nInput) || 0;
    setResult(await invoke<TopNResult>("get_top_n", { n }));
  }

  useEffect(() => {
    compute();
  }, []);

  return (
    <main className="container">
      <Link className="back" to="/">
        ← На головну
      </Link>
      <h1>(в) Топ-N та напівпрохідний бал</h1>

      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault();
          compute();
        }}
      >
        <label>
          N
          <input
            type="number"
            min={1}
            value={nInput}
            onChange={(e) => setNInput(e.currentTarget.value)}
          />
        </label>
        <button type="submit">Обчислити</button>
      </form>

      {result && (
        <>
          <section className="panel">
            <h2>Топ-{nInput} за середнім балом</h2>
            <ApplicantTable rows={result.top} />
          </section>
          <section className="panel">
            <h2>Напівпрохідний бал (повний список)</h2>
            <ApplicantTable rows={result.borderline} />
          </section>
        </>
      )}
    </main>
  );
}