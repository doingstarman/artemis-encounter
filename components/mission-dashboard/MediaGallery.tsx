import Image from "next/image";
import type { MissionMediaItem } from "@/lib/types";
import styles from "@/components/mission-dashboard/MediaGallery.module.css";

type Props = {
  items: MissionMediaItem[];
  updatedAt: string;
};

export function MediaGallery({ items, updatedAt }: Props) {
  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <h2>Фотографии NASA</h2>
        <p>Обновлено: {new Date(updatedAt).toLocaleString("ru-RU")}</p>
      </div>

      <div className={styles.grid}>
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image src={item.imageUrl} alt={item.title} fill sizes="(min-width: 960px) 220px, 100vw" />
              </div>
              <div>
                <h3>{item.title}</h3>
                <a href={item.nasaUrl} target="_blank" rel="noreferrer">
                  Открыть в NASA
                </a>
              </div>
            </article>
          ))
        ) : (
          <p className={styles.empty}>Изображения временно недоступны.</p>
        )}
      </div>
    </section>
  );
}
