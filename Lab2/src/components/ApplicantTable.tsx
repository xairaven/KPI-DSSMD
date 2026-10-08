import type { Applicant } from "../types";

export function ApplicantTable({ rows }: { rows: Applicant[] }) {
  if (rows.length === 0) {
    return <p className="empty">— немає —</p>;
  }

  return (
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
  );
}