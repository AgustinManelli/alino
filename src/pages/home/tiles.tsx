import Image from "next/image";
import Styles from "./tiles.module.css";

export default function Tiles({
  title,
  subtitle,
  resource,
  tileType = false,
}: {
  title: string;
  subtitle: string;
  resource?: { src: string };
  tileType?: boolean;
}) {
  return (
    <div className={Styles.tilesBox}>
      <div
        className={tileType ? Styles.tilesContainerLeft : Styles.tilesContainer}
      >
        <section
          className={tileType ? Styles.textSectionLeft : Styles.textSection}
        >
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </section>
        {resource && (
          <Image
            src={resource.src}
            alt={`Tile image - ${title}`}
            className={tileType ? Styles.tilesImgLeft : Styles.tilesImg}
            priority
            width={500}
            height={500}
          />
        )}
      </div>
    </div>
  );
}
