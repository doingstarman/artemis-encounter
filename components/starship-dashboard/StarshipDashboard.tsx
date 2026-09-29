"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./StarshipDashboard.module.css";

const stages = [
  { name: "Liftoff", time: "T+ 00:00:00", detail: "Starbase, Texas" },
  { name: "Booster separation", time: "T+ 00:02:51", detail: "Super Heavy" },
  { name: "Hot-stage separation", time: "T+ 00:03:12", detail: "Nominal" },
  { name: "Engine cutoff", time: "T+ 00:08:24", detail: "Ascent complete" },
  { name: "Coast phase", time: "T+ 00:08:41", detail: "On target" },
  { name: "Orbit insertion", time: "T+ 01:37:00", detail: "Planned" },
  { name: "Deorbit burn", time: "T+ 02:28:00", detail: "Planned" },
  { name: "Reentry", time: "T+ 02:59:00", detail: "Planned" },
  { name: "Splashdown", time: "T+ 03:08:00", detail: "Planned" },
];

const telemetry = [
  ["Altitude", "201", "km"],
  ["Orbital velocity", "7.66", "km/s"],
  ["Apogee", "201", "km"],
  ["Perigee", "198", "km"],
  ["Inclination", "28.5", "deg"],
];

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs].map((value) => String(value).padStart(2, "0")).join(":");
}

function EarthView({ mode }: { mode: "3d" | "2d" }) {
  if (mode === "2d") {
    return (
      <div className={styles.flatMap} role="img" aria-label="Two dimensional orbital ground track map">
        <svg viewBox="0 0 1000 540" aria-hidden="true">
          <defs>
            <pattern id="grid" width="62.5" height="54" patternUnits="userSpaceOnUse">
              <path d="M62.5 0H0V54" fill="none" stroke="rgba(255,255,255,.08)" />
            </pattern>
          </defs>
          <rect width="1000" height="540" fill="url(#grid)" />
          <g className={styles.continents}>
            <path d="M85 155l90-70 112 30 57 67-44 45-67-11-33 64-73-31z" />
            <path d="M294 285l65 32 22 95-48 94-43-78z" />
            <path d="M502 143l80-42 97 25 45-22 116 47-18 52-93 24-52 78-92-28-26-64z" />
            <path d="M574 294l92 9 32 91-52 96-66-63z" />
            <path d="M814 367l77-27 55 39-40 50-76-9z" />
          </g>
          <path className={styles.groundTrack} d="M-20 286 C180 108 315 118 505 294 S810 466 1020 260" />
          <circle className={styles.mapMarkerPulse} cx="467" cy="258" r="17" />
          <circle className={styles.mapMarker} cx="467" cy="258" r="7" />
        </svg>
        <div className={styles.mapReadout}><span>28.5° N</span><span>67.1° W</span><span>Ground track</span></div>
      </div>
    );
  }

  return (
    <div className={styles.orbitScene} role="img" aria-label="Three dimensional Earth with Starship orbital trajectory">
      <div className={styles.earth}>
        <div className={styles.earthTexture} />
        <div className={styles.earthShade} />
      </div>
      <div className={styles.orbitRing} />
      <div className={styles.shipMarker}>
        <span className={styles.shipBody} />
        <span className={styles.shipLabel}>STARSHIP<b>ALT 201 km · VEL 7.66 km/s</b></span>
      </div>
      <div className={styles.earthCaption}>EARTH — REAL-TIME POSITION<br /><b>LAT 12.4° N · LON 67.1° W</b></div>
    </div>
  );
}

export function StarshipDashboard() {
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [activeStage, setActiveStage] = useState(4);
  const [elapsed, setElapsed] = useState(6138);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.backLink}>← All missions</Link>
          <h1>Starship orbital flight</h1>
          <p>Test mission interface · simulated telemetry</p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.breadcrumb}>EARTH <i /> ORBIT <i /> BEYOND</span>
          <span className={styles.live}><i /> LIVE DEMO</span>
          <span className={styles.timer}>T+ {formatElapsed(elapsed)}<small>MISSION ELAPSED</small></span>
        </div>
      </header>

      <section className={styles.workspace}>
        <aside className={`${styles.panel} ${styles.events}`}>
          <div className={styles.panelTitle}><h2>Mission events</h2><span>05 / 09</span></div>
          <ol className={styles.eventList}>
            {stages.map((stage, index) => (
              <li key={stage.name} className={index === activeStage ? styles.current : index < activeStage ? styles.complete : ""}>
                <button type="button" onClick={() => setActiveStage(index)} aria-current={index === activeStage ? "step" : undefined}>
                  <span className={styles.eventDot} />
                  <span className={styles.eventTime}>{stage.time}</span>
                  <strong>{stage.name}</strong>
                  <small>{stage.detail}</small>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className={`${styles.panel} ${styles.visual}`}>
          <div className={styles.viewToggle} aria-label="Map view">
            {(["3d", "2d"] as const).map((mode) => (
              <button key={mode} type="button" className={viewMode === mode ? styles.activeView : ""} onClick={() => setViewMode(mode)}>{mode.toUpperCase()}</button>
            ))}
          </div>
          <EarthView mode={viewMode} />
        </section>

        <aside className={styles.rightRail}>
          <section className={`${styles.panel} ${styles.telemetry}`}>
            <div className={styles.panelTitle}><h2>Telemetry</h2><span>All systems nominal</span></div>
            <dl>
              {telemetry.map(([label, value, unit]) => (
                <div key={label}><dt>{label}</dt><dd>{value} <small>{unit}</small></dd></div>
              ))}
            </dl>
            <div className={styles.fuel}>
              <span>Propellant (total)<b>82%</b></span><i><em /></i>
              <span>CH4 (methane)<b>84%</b></span><i><em style={{ width: "84%" }} /></i>
              <span>LOX (oxygen)<b>80%</b></span><i><em style={{ width: "80%" }} /></i>
            </div>
            <div className={styles.systemRow}><span>Engine state<small>Chamber pressure 279 bar</small></span><strong>3 / 3 <i>● ● ●</i></strong></div>
            <div className={styles.systemRow}><span>Communications<small>Round trip delay 46 ms</small></span><strong className={styles.locked}>LOCKED</strong></div>
          </section>

          <section className={`${styles.panel} ${styles.miniMap}`}>
            <div className={styles.panelTitle}><h2>Ground track</h2><span className={styles.redText}>LIVE</span></div>
            <svg viewBox="0 0 360 150" role="img" aria-label="World map orbital ground track">
              <path className={styles.miniLand} d="M12 53l47-29 48 15 13 24-32 8-9 25-34-13zm100 51l24 11 8 31-19 3-14-22zm76-58l31-17 41 12 28-6 55 26-19 23-39-3-25 19-32-17-24-6zm40 53l36 7 8 36-28 4-17-20zm85 28l29-10 14 18-27 11z" />
              <path className={styles.miniTrack} d="M-8 90C61 22 114 39 180 92s119 61 188-10" />
              <circle className={styles.mapMarker} cx="166" cy="81" r="5" />
            </svg>
          </section>
        </aside>
      </section>

      <section className={`${styles.panel} ${styles.timeline}`}>
        <div className={styles.panelTitle}><h2>Mission timeline</h2><span>Next: Orbit insertion · in 00:54:42</span></div>
        <div className={styles.timelineTrack}>
          {stages.map((stage, index) => (
            <button key={stage.name} type="button" onClick={() => setActiveStage(index)} className={index === activeStage ? styles.current : index < activeStage ? styles.complete : ""}>
              <span>{stage.name}</span><i /><small>{stage.time}</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
