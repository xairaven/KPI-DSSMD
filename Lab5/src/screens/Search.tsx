import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import type { Applicant } from "../types";

// Demonstrates Button, TextView, EditText, and ListView on one screen
// (Lab 4 assignment). Lab 5 adds fuse.js here (via the pnpm/npm registry)
// for typo-tolerant fuzzy matching on last names — the other new library
// this lab adds, the `csv` crate on the Students screen, is pulled in via
// a git dependency instead, to compare the two installation methods.
export function Search() {
  const [query, setQuery] = useState("");
  const [all, setAll] = useState<Applicant[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    invoke<Applicant[]>("list_applicants").then(setAll);
  }, []);

  const fuse = useMemo(
    () => new Fuse(all ?? [], { keys: ["last_name"], threshold: 0.4 }),
    [all],
  );

  const rows = useMemo(() => {
    if (!all) {
      return null;
    }
    if (query.trim() === "") {
      return all;
    }
    return fuse.search(query).map((result) => result.item);
  }, [all, query, fuse]);

  function clear() {
    setQuery("");
    setSelectedId(null);
  }

  const selected = rows?.find((a) => a.id === selectedId) ?? null;

  return (
    <main className="container">
      <Link className="back" to="/">
        ← На головну
      </Link>
      <h1>Пошук абітурієнтів</h1>
      <p className="subtitle">
        EditText + Button + ListView + TextView, нечіткий пошук через fuse.js
      </p>

      {/* EditText + Button */}
      <form className="controls" onSubmit={(e) => e.preventDefault()}>
        <label>
          Прізвище (допускає помилки)
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </label>
        <button type="button" onClick={clear}>
          Очистити
        </button>
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
