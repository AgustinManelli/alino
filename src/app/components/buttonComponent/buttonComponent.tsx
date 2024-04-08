import Link from "next/link";
import Styles from "./buttonComponent.module.css";

export default function ButtonComponent({
  name,
  back,
  letterColor,
}: {
  name: string;
  back: string;
  letterColor: string;
}) {
  return (
    <Link
      href={`login`}
      className={Styles.buttonContainer}
      style={{ backgroundColor: `${back}`, color: `${letterColor}` }}
    >
      {name}
    </Link>
  );
}
