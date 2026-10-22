//! Persisting applicants to a SQLite database in the app's data directory.
//!
//! Loaded once on startup (seeding the Lab 2 sample data if the database is
//! brand new) and saved as a full snapshot on suspend/exit, same as the
//! JSON file this replaces — only the storage backend changed.

use crate::applicant::Applicant;
use crate::sample;
use rusqlite::{Connection, params};
use std::path::Path;

fn ensure_table(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS applicants (
            id INTEGER PRIMARY KEY,
            last_name TEXT NOT NULL,
            first_name TEXT NOT NULL,
            patronymic TEXT NOT NULL,
            address TEXT NOT NULL,
            phone TEXT NOT NULL,
            grades TEXT NOT NULL
        )",
        [],
    )?;

    Ok(())
}

fn grades_to_text(grades: &[u8]) -> String {
    grades
        .iter()
        .map(ToString::to_string)
        .collect::<Vec<_>>()
        .join(",")
}

fn grades_from_text(text: &str) -> Result<Vec<u8>, String> {
    if text.is_empty() {
        return Ok(Vec::new());
    }

    text.split(',')
        .map(|token| {
            token
                .parse::<u8>()
                .map_err(|err| format!("Invalid grade {token:?}: {err}"))
        })
        .collect()
}

fn read_all(conn: &Connection) -> Result<Vec<Applicant>, String> {
    let mut statement = conn
        .prepare(
            "SELECT id, last_name, first_name, patronymic, address, phone, grades
             FROM applicants ORDER BY id",
        )
        .map_err(|err| err.to_string())?;

    let rows = statement
        .query_map([], |row| {
            Ok((
                row.get::<_, u32>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?,
            ))
        })
        .map_err(|err| err.to_string())?;

    rows.map(|row| {
        let (id, last_name, first_name, patronymic, address, phone, grades) =
            row.map_err(|err| err.to_string())?;

        Ok(Applicant {
            id,
            last_name,
            first_name,
            patronymic,
            address,
            phone,
            grades: grades_from_text(&grades)?,
        })
    })
    .collect()
}

fn write_all(conn: &Connection, applicants: &[Applicant]) -> Result<(), String> {
    conn.execute("DELETE FROM applicants", [])
        .map_err(|err| err.to_string())?;

    for applicant in applicants {
        conn.execute(
            "INSERT INTO applicants
                (id, last_name, first_name, patronymic, address, phone, grades)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                applicant.id,
                applicant.last_name,
                applicant.first_name,
                applicant.patronymic,
                applicant.address,
                applicant.phone,
                grades_to_text(&applicant.grades),
            ],
        )
        .map_err(|err| err.to_string())?;
    }

    Ok(())
}

pub fn load(path: &Path) -> Vec<Applicant> {
    let is_new = !path.exists();

    let result = Connection::open(path)
        .map_err(|err| err.to_string())
        .and_then(|conn| {
            ensure_table(&conn).map_err(|err| err.to_string())?;

            if is_new {
                Ok(sample::get_applicants())
            } else {
                read_all(&conn)
            }
        });

    match result {
        Ok(applicants) => applicants,
        Err(err) => {
            log::warn!(
                "Failed to load {path}: {err}. Using initial data.",
                path = path.display(),
            );
            sample::get_applicants()
        },
    }
}

pub fn save(path: &Path, applicants: &[Applicant]) -> Result<(), String> {
    let conn = Connection::open(path)
        .map_err(|err| format!("Failed to open {}: {err}", path.display()))?;

    ensure_table(&conn).map_err(|err| err.to_string())?;
    write_all(&conn, applicants)
}
