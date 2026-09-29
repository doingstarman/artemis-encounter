import Link from "next/link";
import styles from "@/components/MissionSelector.module.css";

export function MissionSelector() {
  return (
    <section className={styles.wrap}>
      <div className={styles.headline}>
        <p className={styles.eyebrow}>Artemis Encounter</p>
        <h1>Мониторинг космических миссий</h1>
        <p>
          MVP сфокусирован на Artemis II: трек полета, этапы миссии, медиа NASA и свежие новости в одном дашборде.
        </p>
      </div>

      <article className={styles.card}>
        <div>
          <p className={styles.tag}>Миссия доступна</p>
          <h2>Artemis II</h2>
          <p>Пилотируемый облет Луны на корабле Orion в рамках программы NASA Artemis.</p>
        </div>

        <Link className={styles.button} href="/missions/artemis-2">
          Открыть дашборд
        </Link>
      </article>

      <article className={styles.card}>
        <div>
          <p className={styles.liveTag}>Тестовый live-мокап</p>
          <h2>Starship orbital flight</h2>
          <p>Интерактивный центр управления: 3D-орбита, телеметрия, ground track и таймлайн полёта.</p>
        </div>

        <Link className={styles.button} href="/missions/starship">
          Открыть live-мокап
        </Link>
      </article>
    </section>
  );
}
