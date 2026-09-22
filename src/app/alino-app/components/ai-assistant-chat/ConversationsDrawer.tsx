"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Cross,
  PlusBoxIcon,
  DeleteIcon,
  LoadingIcon,
  ListIcon,
} from "@/components/ui/icons/icons";
import { customToast } from "@/lib/toasts";
import styles from "./AIAssistantChat.module.css";

interface ConversationItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export const ConversationsDrawer = ({
  isOpen,
  onClose,
  currentConversationId,
  onSelectConversation,
  onNewChat,
}: Props) => {
  const { t } = useTranslation(["assistant"]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(
    async (pageToLoad: number, append = false) => {
      if (pageToLoad === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await fetch(
          `/api/ai/chat?type=conversations&page=${pageToLoad}&limit=15`
        );
        if (!res.ok) return;

        const data = await res.json();
        const items = (data.conversations || []) as ConversationItem[];

        if (append) {
          setConversations((prev) => [...prev, ...items]);
        } else {
          setConversations(items);
        }

        setHasMore(Boolean(data.hasMore));
        setPage(pageToLoad);
      } catch (err: unknown) {
        console.warn("[ConversationsDrawer] Error fetching conversations:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      fetchConversations(0, false);
    }
  }, [isOpen, fetchConversations]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + clientHeight) < 40 && hasMore && !loadingMore && !loading) {
      fetchConversations(page + 1, true);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId) return;

    setDeletingId(id);
    try {
      const res = await fetch(
        `/api/ai/chat?conversationId=${encodeURIComponent(id)}&deleteConversation=true`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Error deleting conversation");

      setConversations((prev) => prev.filter((c) => c.id !== id));
      customToast.success(t("chatDeleted"));

      if (id === currentConversationId) {
        onNewChat();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      customToast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.drawerOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.drawerContent}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitleWrapper}>
                <ListIcon style={{ width: 16, height: 16 }} />
                <span className={styles.drawerTitle}>{t("conversationsTitle")}</span>
              </div>
              <button
                className={styles.drawerCloseBtn}
                onClick={onClose}
                type="button"
                aria-label={t("close")}
              >
                <Cross style={{ width: 13, height: 13 }} />
              </button>
            </div>

            <div className={styles.drawerActionWrapper}>
              <button
                className={styles.newChatBtn}
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                type="button"
              >
                <PlusBoxIcon style={{ width: 16, height: 16 }} />
                <span>{t("newChat")}</span>
              </button>
            </div>

            <div
              className={styles.drawerList}
              ref={containerRef}
              onScroll={handleScroll}
            >
              {loading ? (
                <div className={styles.drawerLoading}>
                  <LoadingIcon
                    style={{ width: 18, height: 18 }}
                    className={styles.spinAnimation}
                  />
                </div>
              ) : conversations.length === 0 ? (
                <div className={styles.drawerEmpty}>
                  <p>{t("noHistory")}</p>
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = c.id === currentConversationId;
                  const isDeleting = deletingId === c.id;

                  return (
                    <div
                      key={c.id}
                      className={`${styles.drawerItem} ${isActive ? styles.drawerItemActive : ""}`}
                      onClick={() => {
                        onSelectConversation(c.id);
                        onClose();
                      }}
                    >
                      <div className={styles.drawerItemText}>
                        <span className={styles.drawerItemTitle}>
                          {c.title || t("newChat")}
                        </span>
                        <span className={styles.drawerItemDate}>
                          {formatDate(c.updated_at || c.created_at)}
                        </span>
                      </div>
                      <button
                        className={styles.drawerItemDelete}
                        onClick={(e) => handleDeleteConversation(e, c.id)}
                        disabled={isDeleting}
                        type="button"
                        aria-label="Eliminar conversación"
                      >
                        {isDeleting ? (
                          <LoadingIcon
                            style={{ width: 12, height: 12 }}
                            className={styles.spinAnimation}
                          />
                        ) : (
                          <DeleteIcon style={{ width: 13, height: 13 }} />
                        )}
                      </button>
                    </div>
                  );
                })
              )}

              {loadingMore && (
                <div className={styles.drawerLoadingMore}>
                  <LoadingIcon
                    style={{ width: 14, height: 14 }}
                    className={styles.spinAnimation}
                  />
                  <span>{t("loadMore")}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
