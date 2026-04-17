"use client";

import { useEffect, useState } from "react";
import styles from "./HappinessStreak.module.css";

type Status = "loading" | "ready" | "error";

export default function HappinessStreak() {
  const [status, setStatus] = useState<Status>("loading");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/streak", {
          headers: { authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = await res.json();
        setStreak(typeof data.streak === "number" ? data.streak : 0);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className={styles.card} aria-busy="true">
        <div className={styles.flame} aria-hidden>
          <FlameIcon />
        </div>
        <div className={styles.body}>
          <span className={styles.label}>Happiness streak</span>
          <span className={styles.skeleton}>Counting your days…</span>
        </div>
      </div>
    );
  }

  if (status === "error") return null;

  const zero = streak === 0;
  const caption = zero
    ? "Start a streak with today's check-in."
    : streak === 1
    ? "One day in — keep the spark going."
    : `${streak} days in a row. Keep it glowing.`;

  return (
    <div
      className={`${styles.card} ${zero ? styles.zero : ""}`.trim()}
      role="status"
      aria-label={`Happiness streak: ${streak} ${streak === 1 ? "day" : "days"}`}
    >
      <div className={styles.flame} aria-hidden>
        <FlameIcon />
      </div>
      <div className={styles.body}>
        <span className={styles.label}>Happiness streak</span>
        <span className={styles.number}>
          {streak} <span style={{ fontSize: "0.5em", fontWeight: 700, opacity: 0.7 }}>
            {streak === 1 ? "day" : "days"}
          </span>
        </span>
        <span className={styles.caption}>{caption}</span>
      </div>
    </div>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2s1.5 2.6 1.5 4.8c0 1.3-.7 2.2-1.5 3-.9.9-2 1.9-2 3.6 0 .8.3 1.5.8 2 .3.3.7.5 1.1.6-.4-.5-.6-1.1-.6-1.7 0-1.3 1-2 2-2.8.9-.8 1.7-1.7 1.7-3.2 0-.4-.1-.8-.2-1.2C16.9 8.7 19 11.2 19 14.4c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.8 2.9-6.8 4.5-8.4C11 4.6 12 2 12 2Z"/>
    </svg>
  );
}
