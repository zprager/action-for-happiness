"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HappinessStreak from "../components/HappinessStreak";
import styles from "./log.module.css";

type Answer = { key: string; value: string };
type Checkin = {
  _id: string;
  checkinId: string;
  version: number;
  answers: Answer[];
  completedAt: string;
  createdAt: string;
};

type TokenPayload = { sub: string; email: string; exp: number };

function decodeToken(token: string): TokenPayload | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const ANSWER_LABELS: Record<string, string> = {
  reflect: "How I was feeling",
  gratitude: "Grateful for",
  intention: "My intention",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export default function LogPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const payload = token ? decodeToken(token) : null;
    const valid = payload && payload.exp * 1000 > Date.now();
    if (!valid) {
      if (token) localStorage.removeItem("token");
      router.replace("/login");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user-checkins", {
          headers: { authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Couldn't load your check-ins.");
          setStatus("error");
          return;
        }
        setCheckins(data.checkins ?? []);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setError("Network error — please try again.");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <div className={styles.inner}>
          <section className={styles.intro}>
            <div className={styles.eyebrow}>Your journal</div>
            <h1 className={styles.title}>A look back at your check-ins</h1>
            <p className={styles.subtitle}>
              Small reflections add up. Here are the moments you've already noticed.
            </p>
          </section>

          <HappinessStreak />

          {status === "loading" && (
            <div className={styles.state}>
              <p className={styles.stateBody}>Loading your check-ins…</p>
            </div>
          )}

          {status === "error" && (
            <div className={styles.error}>{error ?? "Something went wrong."}</div>
          )}

          {status === "ready" && checkins.length === 0 && (
            <div className={styles.state}>
              <h2 className={styles.stateTitle}>No check-ins yet</h2>
              <p className={styles.stateBody}>
                Tomorrow's a good place to start — or take two minutes for today's right now.
              </p>
              <Link href="/daily-checkin" className={styles.stateCta}>
                Start today's check-in <span aria-hidden>→</span>
              </Link>
            </div>
          )}

          {status === "ready" && checkins.length > 0 && (
            <>
              <div className={styles.count}>
                {checkins.length} {checkins.length === 1 ? "entry" : "entries"}
              </div>
              <div className={styles.timeline}>
                {checkins.map((c) => {
                  const date = new Date(c.completedAt);
                  return (
                    <article key={c._id} className={styles.card}>
                      <header className={styles.cardHead}>
                        <div className={styles.cardDate}>{dateFmt.format(date)}</div>
                        <div className={styles.cardTime}>{timeFmt.format(date)}</div>
                      </header>
                      <div className={styles.answers}>
                        {c.answers.map((a) => (
                          <div key={a.key} className={styles.answer}>
                            <span className={styles.answerLabel}>
                              {ANSWER_LABELS[a.key] ?? a.key}
                            </span>
                            <span className={styles.answerValue}>{a.value}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Action for Happiness · Small actions, happier days.
      </footer>
    </div>
  );
}
