import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link } from "react-router-dom";
import type { Applicant } from "../types";

// Demonstrates a Button, TextView, EditText, and ListView on a single screen (Lab 4 assignment).
// An EditText (search field) and a Button ("Search") filter the ListView (the list below);
// clicking an item in the list populates
// the TextView (a read-only details section) — all four elements are visible simultaneously.
export function Search() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Applicant[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function search() {
    const result = await invoke<Applicant[]>("search_applicants", { query });
    setRows(result);
    if (!result.some((a) => a.id === selectedId)) {
      setSelectedId(null);
    }
  }

  useEffect(() => {
    search();
  }, []);

  const selected = rows?.find((a) => a.id === selectedId) ?? null;

  return (
    <main className="container">
      <Link className="back" to="/">
        ← На головну
      </Link>
      <h1>Пошук абітурієнтів</h1>
      <p className="subtitle">
        EditText + Button + ListView + TextView в одному екрані
      </p>

      {/* EditText + Button */}
      <form
        className="controls"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <label>
          Прізвище містить
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </label>
        <button type="submit">Пошук</button>
      </form>

      {/* ListView */}
      <section className="panel">
        <h2>
          Результати <span className="count">({rows?.length ?? 0})</span>
        </h2>
        {rows && rows.length > 0 ? (
          <ul className="list-view">
            {rows.map((a) => (
              <li
                key={a.id}
                className={a.id === selectedId ? "selected" : undefined}
                onClick={() => setSelectedId(a.id)}
              >
                {a.last_name} {a.first_name} {a.patronymic} — сер. бал{" "}
                {a.average}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">— немає —</p>
        )}
      </section>

      {/* TextView */}
      <section className="panel">
        <h2>Деталі</h2>
        {selected ? (
          <p className="text-view">
            ID: {selected.id}
            <br />
            ПІБ: {selected.last_name} {selected.first_name}{" "}
            {selected.patronymic}
            <br />
            Адреса: {selected.address}
            <br />
            Телефон: {selected.phone}
            <br />
            Оцінки: {selected.grades.join(", ")}
            <br />
            Середній бал: {selected.average}
          </p>
        ) : (
          <p className="empty">Виберіть абітурієнта зі списку</p>
        )}
      </section>
    </main>
  );
}