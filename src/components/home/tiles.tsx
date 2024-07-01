import Styles from "./tiles.module.css";

export default function Tiles({
  title,
  subtitle,
  resource,
  tileType,
}: {
  title: string;
  subtitle: string;
  resource?: any;
  tileType?: boolean;
}) {
  return (
    <div className={Styles.tilesBox}>
      {tileType && tileType === true ? (
        <div className={Styles.tilesContainerLeft}>
          <section className={Styles.textSectionLeft}>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </section>
          {resource && (
            <img className={Styles.tilesImgLeft} src={resource.src} />
          )}
        </div>
      ) : (
        <div className={Styles.tilesContainer}>
          <section className={Styles.textSection}>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </section>
          {resource && <img className={Styles.tilesImg} src={resource.src} />}
        </div>
      )}
    </div>
  );
}
