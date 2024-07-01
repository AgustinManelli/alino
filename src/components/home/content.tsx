import styles from "./content.module.css";
import Tiles from "./tiles";
import img1 from "../../../public/tile-resource.webp";

export default function Content() {
  return (
    <div className={styles.contentContainer}>
      <div className={styles.maxWidthContainer}>
        <section className={styles.leftGrid}>
          <Tiles
            title="Guardado en la nube"
            subtitle="Tu información se encuentra guardada y protegida en la nube"
            resource={img1}
            tileType={true}
          />
          <Tiles
            title="Multiplataforma"
            subtitle="Diseño amigable con todo tipo de dispositivos"
            resource={img1}
            tileType={true}
          />
        </section>
        <Tiles
          title="Diseño minimalista e intuitivo"
          subtitle="Una experiencia agradable para todos los usuarios"
          resource={img1}
        />
      </div>
    </div>
  );
}
