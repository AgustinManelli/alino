"use client";

import Accordion from "../accordion";
import styles from "./faq.module.css";
export default function Faq() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h3 className={styles.title}>faq</h3>
        <Accordion
          items={[
            {
              title: "¿Es completamente gratis?",
              content:
                "Si, alino es completamente gratis, aunque, aún está en fase de desarrollo.",
            },
            {
              title: "¿De que se trata alino?",
              content:
                "Alino, como proyecto, es una aplicación donde podrás guardar tareas, estas distribuídas en distintas listas generales de tareas, la idea principal es organizar trabajos, tareas y calendarios, es decir, es una aplicación orientada a organizar tareas del tipo TO-DO app. Aún se encuentra en una fase muy temprana de su desarrollo.",
            },
            {
              title: "¿Aún se encuentra en fase de desarrollo?",
              content:
                "Sí, si bien, puede probar la aplicación, aún se encuentra en una fase muy temprana de su desarrollo. Estamos convencidos que es un buen proyecto y esperamos dejarlo completamente funcional lo antes posible.",
            },
            {
              title: "¿Puedo enviad feedback sobre bugs o cambios?",
              content:
                "Estaríamos muy agradecidos si nos enviaras feedback sobre nuestra app, no solo nos ayudaría en cuanto a su funcionamiento si no también a conocer las necesidades de los usuarios. <br />Puedes dejarnos un mensaje en <u>alino.cba@gmail.com</u>",
            },
          ]}
        />
      </div>
    </section>
  );
}
