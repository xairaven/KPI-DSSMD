import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  checkPermissions,
  requestPermissions,
  getCurrentPosition,
} from "@tauri-apps/plugin-geolocation";
import { Link } from "react-router-dom";
import type { NearestUniversity } from "../types";

export function Nearest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NearestUniversity | null>(null);

  async function locate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let permissions = await checkPermissions();
      if (
        permissions.location === "prompt" ||
        permissions.location === "prompt-with-rationale"
      ) {
        permissions = await requestPermissions(["location"]);
      }
      if (permissions.location !== "granted") {
        throw new Error("Доступ до розташування не надано");
      }

      // Balanced-accuracy requests prefer a network-based fix, which
      // emulators don't have — only the GPS-style fix Extended Controls
      // injects. High accuracy reads that directly.
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
      const nearest = await invoke<NearestUniversity>(
        "find_nearest_university",
        { lat: position.coords.latitude, lon: position.coords.longitude },
      );
      setResult(nearest);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <Link className="back" to="/">
        ← На головну
      </Link>
      <h1>Найближча приймальна комісія</h1>
      <p className="subtitle">
        Визначає найближчий університет за поточним розташуванням пристрою.
      </p>

      <div className="controls">
        <button type="button" onClick={locate} disabled={loading}>
          {loading ? "Визначення..." : "Визначити розташування"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className="panel">
          <h2>{result.name}</h2>
          <p className="text-view">{result.address}</p>
          <p className="text-view">
            Відстань: <strong>{result.distance_km} км</strong>
          </p>
        </section>
      )}
    </main>
  );
}
