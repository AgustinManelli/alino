"use client";

import { useEffect, useRef, useState } from "react";

import { useCreateListInvitation } from "@/hooks/todo/members/useCreateListInvitation";
import { useSearchUsers } from "@/hooks/todo/members/useSearchUsers";
import { useSearchUserStore } from "@/store/useSearchUserStore";

import { UserSearchResult } from "@/lib/schemas/user.types";

import {
  Check,
  ChevronDown,
  Cross,
  LoadingIcon,
  SendIcon,
} from "@/components/ui/icons/icons";
import styles from "./InviteUserInput.module.css";

interface Props {
  list_id: string;
  onInviteSuccess?: () => void;
}

type InviteStatus = "idle" | "loading" | "success" | "error";

export function InviteUserInput({ list_id, onInviteSuccess }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("idle");
  const [failedNames, setFailedNames] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { createListInvitation } = useCreateListInvitation();
  const { searchUsers, clearSearchResults } = useSearchUsers();

  const searchResults = useSearchUserStore((s) => s.searchResults);
  const loadingSearch = useSearchUserStore((s) => s.loadingSearch);

  const filteredResults = searchResults.filter(
    (u) => !selectedUsers.some((s) => s.user_id === u.user_id),
  );

  const showDropdown =
    isFocused && (loadingSearch || filteredResults.length > 0);
  const canInvite = selectedUsers.length > 0 && inviteStatus === "idle";
  const count = selectedUsers.length;
  const isLoading = inviteStatus === "loading";
  const isSuccess = inviteStatus === "success";
  const isError = inviteStatus === "error";

  useEffect(() => {
    setActiveIndex(-1);
  }, [inputValue, filteredResults.length]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(inputValue), 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => {
    searchUsers(debouncedValue);
  }, [debouncedValue, searchUsers]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectUser = (user: UserSearchResult) => {
    if (selectedUsers.some((u) => u.user_id === user.user_id)) return;

    setSelectedUsers((prev) => [...prev, user]);
    setInputValue("");
    setDebouncedValue("");
    clearSearchResults();
    setIsFocused(false);
    setActiveIndex(-1);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      setIsFocused(true);
    });
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user_id !== userId));
    inputRef.current?.focus();
  };

  const handleInviteAll = async () => {
    if (!canInvite) return;
    setInviteStatus("loading");
    setFailedNames([]);

    const results = await Promise.allSettled(
      selectedUsers.map((user) => createListInvitation(list_id, user.username)),
    );

    const failed: string[] = [];
    results.forEach((r, i) => {
      if (
        r.status === "rejected" ||
        (r.status === "fulfilled" && r.value?.error)
      ) {
        failed.push(selectedUsers[i].display_name);
      }
    });

    if (failed.length === 0) {
      setInviteStatus("success");
      setSelectedUsers([]);
      setInputValue("");
      onInviteSuccess?.();
      setTimeout(() => setInviteStatus("idle"), 2000);
    } else {
      setFailedNames(failed);
      setInviteStatus("error");
      setSelectedUsers((prev) =>
        prev.filter((u) => failed.includes(u.display_name)),
      );
      setTimeout(() => setInviteStatus("idle"), 3500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && showDropdown) {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
      return;
    }

    if (e.key === "ArrowUp" && showDropdown) {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (showDropdown && activeIndex >= 0 && filteredResults[activeIndex]) {
        handleSelectUser(filteredResults[activeIndex]);
      } else if (inputValue === "" && count > 0) {
        handleInviteAll();
      }
      return;
    }

    if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "Backspace" && inputValue === "" && count > 0) {
      setSelectedUsers((prev) => prev.slice(0, -1));
      return;
    }
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div
        className={[
          styles.inputContainer,
          isFocused && styles.focused,
          count > 0 && styles.hasChips,
          isError && styles.hasError,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.inputRow}>
          {selectedUsers.map((user) => (
            <div key={user.user_id} className={styles.chip}>
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt={user.display_name}
                className={styles.chipAvatar}
              />
              <span className={styles.chipName}>{user.display_name}</span>
              <button
                className={styles.chipRemove}
                onClick={() => handleRemoveUser(user.user_id)}
                type="button"
                title="Quitar"
                disabled={isLoading}
              >
                <Cross
                  style={{ width: "12px", height: "auto", strokeWidth: "2.5" }}
                />
              </button>
            </div>
          ))}

          <div className={styles.inputWrap}>
            {count === 0 && <span className={styles.atSign}>@</span>}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              placeholder={
                count === 0 ? "Buscar por usuario..." : "Agregar más..."
              }
              className={styles.input}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          className={[
            styles.sendBtn,
            canInvite && styles.sendBtnActive,
            isSuccess && styles.sendBtnSuccess,
            isError && styles.sendBtnError,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={handleInviteAll}
          disabled={!canInvite || isLoading}
          type="button"
          title={
            count === 0
              ? "Seleccioná un usuario primero"
              : count === 1
                ? "Enviar invitación"
                : `Enviar ${count} invitaciones`
          }
        >
          {isLoading ? (
            <LoadingIcon
              style={{ width: "17px", height: "auto", strokeWidth: "2" }}
            />
          ) : isSuccess ? (
            <Check
              style={{ width: "17px", height: "auto", strokeWidth: "2" }}
            />
          ) : isError ? (
            <Cross
              style={{ width: "17px", height: "auto", strokeWidth: "2" }}
            />
          ) : (
            <span className={styles.sendInner}>
              <SendIcon
                style={{ width: "17px", height: "auto", strokeWidth: "2" }}
              />
            </span>
          )}
        </button>
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {loadingSearch ? (
            <div className={styles.skeletonWrap}>
              {[0, 1].map((i) => (
                <div key={i} className={styles.skeletonRow}>
                  <div className={styles.skeletonCircle} />
                  <div className={styles.skeletonLines}>
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonWide}`}
                    />
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonNarrow}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className={styles.resultList}>
              {filteredResults.map((user, i) => {
                const isActive = i === activeIndex;
                return (
                  <li
                    key={user.user_id}
                    className={[
                      styles.resultItem,
                      isActive && styles.activeItem,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      animationDelay: `${i * 35}ms`,
                      backgroundColor: isActive
                        ? "var(--background-over-container-hover)"
                        : "",
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectUser(user);
                    }}
                  >
                    <div className={styles.resultAvatarWrap}>
                      <img
                        src={user.avatar_url || "/default-avatar.png"}
                        alt={user.display_name}
                        className={styles.resultAvatar}
                      />
                    </div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>
                        {user.display_name}
                      </span>
                      <span className={styles.resultUsername}>
                        @{user.username}
                      </span>
                    </div>
                    <div className={styles.resultChevron}>
                      <ChevronDown
                        style={{
                          width: "16px",
                          height: "auto",
                          strokeWidth: "2",
                          transform: "rotate(-90deg)",
                          opacity: isActive ? 1 : undefined,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {isError && failedNames.length > 0 && (
        <p className={styles.errorMsg}>
          No se pudo invitar a: <strong>{failedNames.join(", ")}</strong>
        </p>
      )}
    </div>
  );
}
