"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./home.module.css";

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

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const payload = token ? decodeToken(token) : null;
    const stillValid = payload && payload.exp * 1000 > Date.now();
    if (stillValid) {
      setEmail(payload.email);
    } else if (token) {
      localStorage.removeItem("token");
    }
    setReady(true);
  }, []);

  const loggedIn = Boolean(email);

  return (
    <div className={styles.shell}>
      <div className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            {loggedIn && (
              <div className={styles.welcome}>
                <span className={styles.welcomePill}>Signed in</span>
                {email}
              </div>
            )}
            <div className={styles.eyebrow}>Small actions, happier days</div>
            <h1 className={styles.heroTitle}>
              {loggedIn
                ? "Welcome back. Your next check-in is on its way."
                : "Happiness, one small action at a time."}
            </h1>
            <p className={styles.heroSubtitle}>
              {loggedIn
                ? "Look out for your Daily Check-In in your inbox each morning. One tap and you'll be guided through a short, calming reflection — no app needed."
                : "Join a worldwide community learning the small, science-backed habits that build a kinder, happier life — starting with a two-minute Daily Check-In delivered to your inbox."}
            </p>
            <div className={styles.ctaRow}>
              {!loggedIn && ready && (
                <>
                  <Link href="/register" className={styles.ctaPrimary}>Start your Daily Check-In</Link>
                  <Link href="/login" className={styles.ctaSecondary}>I already have an account</Link>
                </>
              )}
              {loggedIn && (
                <>
                  <Link href="/daily-checkin" className={styles.ctaPrimary}>Start today&apos;s check-in</Link>
                  <Link href="#how-it-works" className={styles.ctaSecondary}>How it works</Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section id="how-it-works" className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>How the Daily Check-In works</h2>
            <p className={styles.sectionLede}>
              A gentle rhythm for your wellbeing — designed to take less than two minutes a day.
            </p>
          </div>

          <div className={styles.grid}>
            <article className={styles.card}>
              <span className={styles.stepBadge}>1</span>
              <h3 className={styles.cardTitle}>A little nudge in your inbox</h3>
              <p className={styles.cardBody}>
                Each morning you'll receive a <strong>Daily Check-In</strong> email — a warm hello and a single link to today's reflection.
              </p>
            </article>

            <article className={styles.card}>
              <span className={styles.stepBadge}>2</span>
              <h3 className={styles.cardTitle}>One tap, one calm moment</h3>
              <p className={styles.cardBody}>
                The link opens an interactive web experience that walks you through the check-in step by step — nothing to install, just open and begin.
              </p>
            </article>

            <article className={styles.card}>
              <span className={styles.stepBadge}>3</span>
              <h3 className={styles.cardTitle}>Notice, reflect, act</h3>
              <p className={styles.cardBody}>
                Answer a few gentle prompts, notice how you're feeling, and set one tiny action to make today a little brighter — for you and the people around you.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.callout}>
          <div>
            <h2 className={styles.calloutTitle}>
              {loggedIn ? "Check your inbox tomorrow morning" : "Ready to try tomorrow's check-in?"}
            </h2>
            <p className={styles.calloutBody}>
              {loggedIn
                ? "We'll email your first Daily Check-In soon. Open it, tap the link, and let us guide you through."
                : "Create an account and your first Daily Check-In lands in your inbox tomorrow morning."}
            </p>
          </div>
          {!loggedIn && ready && (
            <Link href="/register" className={styles.calloutCta}>Create my account</Link>
          )}
          {loggedIn && (
            <Link href="/daily-checkin" className={styles.calloutCta}>Start today&apos;s check-in</Link>
          )}
        </section>
      </div>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Action for Happiness · Small actions, happier days.
      </footer>
    </div>
  );
}
