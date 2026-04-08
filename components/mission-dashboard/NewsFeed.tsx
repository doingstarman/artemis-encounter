import type { MissionNewsItem } from "@/lib/types";
import styles from "@/components/mission-dashboard/NewsFeed.module.css";

type Props = {
  items: MissionNewsItem[];
  updatedAt: string;
};

export function NewsFeed({ items, updatedAt }: Props) {
  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <h2>Новости NASA</h2>
        <p>Обновлено: {new Date(updatedAt).toLocaleString("ru-RU")}</p>
      </div>

      <div className={styles.list}>
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className={styles.item}>
              <h3>{item.title}</h3>
              <p>{item.summary || "Краткое описание отсутствует."}</p>
              <div className={styles.meta}>
                <span>{new Date(item.publishedAt).toLocaleString("ru-RU")}</span>
                <a href={item.link} target="_blank" rel="noreferrer">
                  Читать
                </a>
              </div>
            </article>
          ))
        ) : (
          <p className={styles.empty}>Новости временно недоступны.</p>
        )}
      </div>
    </section>
  );
}
