"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";

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

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const payload = token ? decodeToken(token) : null;
    const stillValid = payload && payload.exp * 1000 > Date.now();
    if (stillValid) {
      setLoggedIn(true);
    } else {
      if (token) localStorage.removeItem("token");
      setLoggedIn(false);
    }
    setReady(true);

    function onStorage(e: StorageEvent) {
      if (e.key === "token") {
        const t = e.newValue;
        const p = t ? decodeToken(t) : null;
        setLoggedIn(Boolean(p && p.exp * 1000 > Date.now()));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname]);

  function signOut() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    router.push("/login");
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Action for Happiness">
        <Image
          src="/logo.svg"
          alt="Action for Happiness"
          width={531}
          height={100}
          priority
          className={styles.brandLogo}
        />
      </Link>
      <nav className={styles.nav}>
        {ready && !loggedIn && (
          <>
            <Link href="/login" className={styles.navLink}>Sign in</Link>
            <Link href="/register" className={styles.navButton}>Get started</Link>
          </>
        )}
        {ready && loggedIn && (
          <>
            <Link href="/log" className={styles.navLink}>Journal</Link>
            <button type="button" onClick={signOut} className={styles.navLink}>
              Sign out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
