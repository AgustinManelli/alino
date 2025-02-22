"use client";

import { Accordion } from "@/components/ui/accordion";
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
              title: "¿Puedo enviar feedback sobre bugs o cambios?",
              content:
                "Agradeceríamos mucho que nos enviaras feedback sobre la aplicación. Tu opinión no solo nos ayudará a mejorar el funcionamiento, sino también a entender mejor las necesidades de los usuarios. <br />Puedes dejarnos un mensaje en <u>ayuda@alino.online</u>.",
            },
            {
              title: "¿Cómo notificar un bug o error?",
              content:
                'Para notificar un bug o error, por favor, especifica el tipo de error, su ubicación y cómo replicarlo, es decir, las acciones necesarias para reproducir el error. Envía esta información a <u>ayuda@alino.online</u> con el asunto <b>"Alino bug incident report</b>"',
            },
            {
              title: "¿Alino usa cookies?",
              content:
                "Sí, utilizamos cookies esenciales para el funcionamiento de la aplicación, como el inicio de sesión y la gestión de sesiones de usuario. Estas cookies son necesarias para garantizar una experiencia fluida y segura. No recopilamos información personal ni compartimos datos con terceros a través de estas cookies. Si deseas obtener más detalles, puedes contactarnos enviando un mensaje a <u>ayuda@alino.online</u>.",
            },
          ]}
        />
      </div>
    </section>
  );
}
