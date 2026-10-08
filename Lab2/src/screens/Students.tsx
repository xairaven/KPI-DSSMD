import { useEffect, useState, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link } from "react-router-dom";
import type { Applicant, ApplicantInput } from "../types";

const emptyForm = {
  last_name: "",
  first_name: "",
  patronymic: "",
  address: "",
  phone: "",
  gradesText: "",
};

function parseGrades(text: string): number[] {
  return text
    .split(/[,\s]+/)
    .map((token) => Number(token))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

export function Students() {
  const [rows, setRows] = useState<Applicant[] | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<Applicant[]>("list_applicants").then(setRows);
  }, []);

  function startEdit(a: Applicant) {
    setEditingId(a.id);
    setForm({
      last_name: a.last_name,
      first_name: a.first_name,
      patronymic: a.patronymic,
      address: a.address,
      phone: a.phone,
      gradesText: a.grades.join(", "),
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const input: ApplicantInput = {
      last_name: form.last_name,
      first_name: form.first_name,
      patronymic: form.patronymic,
      address: form.address,
      phone: form.phone,
      grades: parseGrades(form.gradesText),
    };

    try {
      if (editingId === null) {
        const created = await invoke<Applicant>("add_applicant", { input });
        setRows((prev) => (prev ? [...prev, created] : [created]));
      } else {
        const updated = await invoke<Applicant>("update_applicant", {
          id: editingId,
          input,
        });
        setRows((prev) =>
          prev ? prev.map((a) => (a.id === editingId ? updated : a)) : prev,
        );
      }
      cancelEdit();
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <main className="container">
      <Link className="back" to="/">
        ← На головну
      </Link>
      <h1>Абітурієнти</h1>

      <form className="form" onSubmit={submit}>
        <h2>{editingId === null ? "Додати абітурієнта" : `Редагувати ID ${editingId}`}</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Прізвище
          <input
            required
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.currentTarget.value })}
          />
        </label>
        <label>
          Ім'я
          <input
            required
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.currentTarget.value })}
          />
        </label>
        <label>
          По-батькові
          <input
            value={form.patronymic}
            onChange={(e) => setForm({ ...form, patronymic: e.currentTarget.value })}
          />
        </label>
        <label>
          Адреса
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.currentTarget.value })}
          />
        </label>
        <label>
          Телефон
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.currentTarget.value })}
          />
        </label>
        <label>
          Оцінки (через кому)
          <input
            placeholder="10, 11, 9, 12"
            value={form.gradesText}
            onChange={(e) => setForm({ ...form, gradesText: e.currentTarget.value })}
          />
        </label>
        <div className="form-actions">
          <button type="submit">{editingId === null ? "Додати" : "Зберегти"}</button>
          {editingId !== null && (
            <button type="button" onClick={cancelEdit}>
              Скасувати
            </button>
          )}
        </div>
      </form>

      <section className="panel">
        <h2>
          Список <span className="count">({rows?.length ?? 0})</span>
        </h2>
        {rows && rows.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>ПІБ</th>
                <th>Адреса</th>
                <th>Телефон</th>
                <th>Оцінки</th>
                <th>Сер. бал</th>
                <th></th>
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
                  <td>
                    <button type="button" onClick={() => startEdit(a)}>
                      Редагувати
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">— немає —</p>
        )}
      </section>
    </main>
  );
}