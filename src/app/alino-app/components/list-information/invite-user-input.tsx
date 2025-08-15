import { useEffect, useState } from "react";
import styles from "./InviteUserInput.module.css";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { SendIcon } from "@/components/ui/icons/icons";
import { useSearchUserStore } from "@/store/useSearchUserStore";

interface props {
  list_id: string;
}

type UserSearchResult = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
};

export default function InviteUserInput({ list_id }: props) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState(inputValue);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const createListInvitation = useTodoDataStore(
    (state) => state.createListInvitation
  );

  const searchUsers = useSearchUserStore((state) => state.searchUsers);
  const searchResults = useSearchUserStore((state) => state.searchResults);
  const clearSearchResults = useSearchUserStore(
    (state) => state.clearSearchResults
  );
  const loadingSearch = useSearchUserStore((state) => state.loadingSearch);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    if (!isUserSelected) {
      searchUsers(debouncedInputValue);
    }
  }, [debouncedInputValue, searchUsers, isUserSelected]);

  const handleSelectUser = async (username: string) => {
    setInputValue(username);
    setIsUserSelected(true);
    clearSearchResults();
  };

  const handleInvite = async () => {
    if (!inputValue.trim()) return;
    await createListInvitation(list_id, inputValue);
    setInputValue("");
    setIsUserSelected(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsUserSelected(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleInvite();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.inputContainer}>
        <p className={styles.deco}>@</p>
        <input
          type="email"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Nombre de usuario"
          className={styles.input}
        />
        <button
          onClick={handleInvite}
          className={styles.button}
          disabled={!inputValue.trim() || !isUserSelected}
        >
          <SendIcon
            style={{
              stroke: "var(--icon-color)",
              strokeWidth: "1.5",
              width: "20px",
            }}
          />
        </button>
        {(loadingSearch || (searchResults.length > 0 && !isUserSelected)) && (
          <ul className={styles.resultsList}>
            {loadingSearch && (
              <li className={styles.statusItem}>Buscando...</li>
            )}
            {!loadingSearch &&
              searchResults.map((user) => (
                <li
                  key={user.user_id}
                  className={styles.resultItem}
                  onClick={() => handleSelectUser(user.username)}
                >
                  <img
                    src={user.avatar_url || "/default-avatar.png"}
                    alt={user.display_name}
                    className={styles.avatar}
                  />
                  <div className={styles.userInfo}>
                    <span className={styles.displayName}>
                      {user.display_name}
                    </span>
                    <span className={styles.username}>@{user.username}</span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
