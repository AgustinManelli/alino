"use client";

import { Accordion } from "@/components";
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
              title: "¿De qué se trata Alino?",
              content:
                "Alino es una aplicación que te permite guardar tareas organizadas en distintas listas. Está diseñada para ayudarte a gestionar tu trabajo en formato to-do. Aún está en una fase temprana de desarrollo.",
            },
            {
              title: "¿Aún se encuentra en fase de desarrollo?",
              content:
                "Sí, aunque puedes probar la aplicación, todavía está en una fase temprana de desarrollo. Creemos en nuestro proyecto y trabajamos para hacerlo completamente funcional lo antes posible.",
            },
            {
              title: "¿Puedo enviar feedback sobre bugs o cambios?",
              content:
                "Agradeceríamos mucho que nos enviaras feedback sobre la aplicación. Tu opinión no solo nos ayudará a mejorar el funcionamiento, sino también a entender mejor las necesidades de los usuarios. <br />Puedes dejarnos un mensaje en <u>alino.cba@gmail.com</u>.",
            },
            {
              title: "¿Cómo notificar un bug o error?",
              content:
                'Para notificar un bug o error, por favor, especifica el tipo de error, su ubicación y cómo replicarlo, es decir, las acciones necesarias para reproducir el error. Envía esta información a <u>alino.cba@gmail.com</u> con el asunto <b>"Alino bug incident report</b>"',
            },
          ]}
        />
      </div>
    </section>
  );
}
