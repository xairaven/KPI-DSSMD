import { Link } from "react-router-dom";

export function Home() {
  return (
    <main className="container">
      <h1>Лаб. 2 — Абітурієнт</h1>
      <p className="subtitle">MVC: кожен пункт — окремий екран і своя модель.</p>

      <nav className="menu">
        <Link className="menu-item" to="/students">
          Абітурієнти
          <span>Перегляд, додавання, редагування</span>
        </Link>
        <Link className="menu-item" to="/failing">
          (a) Незадовільні оцінки
        </Link>
        <Link className="menu-item" to="/threshold">
          (б) Поріг середнього балу
        </Link>
        <Link className="menu-item" to="/top-n">
          (в) Топ-N та напівпрохідний бал
        </Link>
      </nav>
    </main>
  );
}