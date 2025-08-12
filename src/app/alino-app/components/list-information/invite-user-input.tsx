import { useState } from "react";
import styles from "./InviteUserInput.module.css";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { toast } from "sonner";
import { NormalToaster } from "@/components/ui/toaster/normal-toaster";
import { AlinoLogo, SendIcon } from "@/components/ui/icons/icons";

interface props {
  list_id: string;
}

export default function InviteUserInput({ list_id }: props) {
  const [inputValue, setInputValue] = useState("");
  const createListInvitation = useTodoDataStore(
    (state) => state.createListInvitation
  );

  const handleInvite = async () => {
    console.log("estoy en la funcion");
    if (!inputValue.trim()) return;
    const res = await createListInvitation(list_id, inputValue);
    if (res.success) {
      toast.success(`Invitaccion a @${inputValue} enviada correctamente`);
    } else {
      toast.error(`Error: ${res.message}`);
    }

    // toast.promise(Promise.resolve(res), {
    //   loading: "Enviando invitación...",
    //   success: (data) => {
    //     if (data.success) {
    //       return "Invitacion enviada correctamente";
    //     } else {
    //       return `Error: ${data.message}`;
    //     }
    //   },
    // });
    setInputValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleInvite();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <p className={styles.deco}>@</p>
      <input
        type="email"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nombre de usuario"
        className={styles.input}
      />
      <button
        onClick={handleInvite}
        className={styles.button}
        disabled={!inputValue.trim()}
      >
        <SendIcon
          style={{
            stroke: "var(--icon-color)",
            strokeWidth: "1.5",
            width: "20px",
          }}
        />
      </button>
    </div>
  );
}
