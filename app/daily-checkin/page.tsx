"use client";

import Link from "next/link";
import { KeyboardEvent, useMemo, useState } from "react";
import checkinDoc from "@/lib/dailyCheckin.json";
import styles from "./daily-checkin.module.css";

type Step = (typeof checkinDoc.steps)[number];

export default function DailyCheckinPage() {
  const steps = checkinDoc.steps as Step[];
  const totalSteps = steps.length;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "skipped" | "error">("idle");

  const step = steps[index];
  const progress = done ? 100 : ((index + (answers[step.key] ? 0.5 : 0)) / totalSteps) * 100;

  const canContinue = useMemo(() => {
    if (step.kind === "breathe") return true;
    const value = answers[step.key]?.trim() ?? "";
    return value.length >= (step.minLength ?? 1);
  }, [step, answers]);

  async function saveCheckin() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setSaveState("skipped");
      return;
    }

    setSaveState("saving");
    try {
      const res = await fetch("/api/user-checkins", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          checkinId: checkinDoc.slug,
          version: checkinDoc.version,
          answers: steps
            .filter((s) => s.kind === "textarea" && answers[s.key]?.trim())
            .map((s) => ({ key: s.key, value: answers[s.key].trim() })),
        }),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  function goNext() {
    if (!canContinue) return;
    if (index === totalSteps - 1) {
      setDone(true);
      void saveCheckin();
      return;
    }
    setDirection("forward");
    setIndex((i) => i + 1);
  }

  function goBack() {
    if (index === 0) return;
    setDirection("back");
    setIndex((i) => i - 1);
  }

  function onTextareaKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      goNext();
    }
  }

  const enterClass = direction === "forward" ? styles.stepEnter : styles.stepEnterBack;

  return (
    <div className={styles.shell}>
      <div className={styles.progressTrack} aria-hidden>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <main className={styles.main}>
        <div className={styles.stage}>
          {done ? (
            <div key="done" className={`${styles.step} ${styles.stepEnter} ${styles.completion}`}>
              <div className={styles.eyebrow}>{checkinDoc.completion.eyebrow}</div>
              <h1 className={styles.title}>{checkinDoc.completion.title}</h1>
              <p className={styles.prompt}>{checkinDoc.completion.body}</p>

              <p className={styles.saveStatus} aria-live="polite">
                {saveState === "saving" && "Saving your check-in…"}
                {saveState === "saved" && "Saved to your journal ✓"}
                {saveState === "skipped" && "Sign in to save this check-in to your journal."}
                {saveState === "error" && "We couldn't save this one — your reflection is still yours."}
              </p>

              <div className={styles.summary}>
                {steps
                  .filter((s) => s.kind === "textarea" && answers[s.key])
                  .map((s) => (
                    <div key={s._id} className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>{s.key}</span>
                      <span className={styles.summaryValue}>{answers[s.key]}</span>
                    </div>
                  ))}
              </div>

              <div className={styles.completionActions}>
                <Link href="/" className={styles.homeLink}>
                  Back to home <span aria-hidden>→</span>
                </Link>
                {saveState === "saved" && (
                  <Link href="/log" className={styles.journalLink}>
                    View journal
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div key={step.key} className={`${styles.step} ${enterClass}`}>
              <div className={styles.eyebrow}>{step.eyebrow}</div>
              <h1 className={styles.title}>{step.title}</h1>
              <p className={styles.prompt}>{step.prompt}</p>

              {step.kind === "breathe" && (
                <div className={styles.breatheWrap}>
                  <div className={styles.breatheCircle} aria-hidden>
                    <span className={styles.breatheLabel}>breathe</span>
                  </div>
                </div>
              )}

              {step.kind === "textarea" && (
                <textarea
                  className={styles.textarea}
                  placeholder={step.placeholder}
                  value={answers[step.key] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [step.key]: e.target.value }))}
                  onKeyDown={onTextareaKeyDown}
                  autoFocus
                />
              )}

              <div className={styles.controls}>
                {index > 0 && (
                  <button type="button" className={styles.back} onClick={goBack}>
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  className={styles.button}
                  onClick={goNext}
                  disabled={!canContinue}
                >
                  {step.cta} <span aria-hidden className={styles.buttonArrow}>→</span>
                </button>
                {step.kind === "textarea" && (
                  <span className={styles.hint}>
                    Press <kbd>⌘</kbd> + <kbd>Enter</kbd> to continue
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
