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
              content: "Si, Alino es completamente gratis.",
            },
            {
              title: "¿De que se trata alino?",
              content:
                "Alino, como proyecto, es una aplicación donde podrás guardar tareas, estas distribuídas en distintas listas, es decir, es una aplicación orientada a organizar tu trabajo del tipo TO-DO app. Aún se encuentra en una fase muy temprana de su desarrollo.",
            },
            {
              title: "¿Aún se encuentra en fase de desarrollo?",
              content:
                "Sí, si bien puedes probar la aplicación, aún se encuentra en una fase muy temprana de su desarrollo. Estamos convencidos que es un buen proyecto y esperamos dejarlo completamente funcional lo antes posible.",
            },
            {
              title: "¿Puedo enviar feedback sobre bugs o cambios?",
              content:
                "Estaríamos muy agradecidos si nos envías feedback sobre nuestra app, no solo nos ayudaría en cuanto a su funcionamiento si no también a conocer las necesidades de los usuarios. <br />Puedes dejarnos un mensaje en <u>alino.cba@gmail.com</u>",
            },
          ]}
        />
      </div>
    </section>
  );
}
