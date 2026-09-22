"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import {
  SendIcon,
  LoadingIcon,
  Cross,
  DeleteIcon,
  IAStars,
  MenuIcon,
} from "@/components/ui/icons/icons";
import { QuickSuggestions } from "./QuickSuggestions";
import { ChatConfirmationCard } from "./ChatConfirmationCard";
import { ConversationsDrawer } from "./ConversationsDrawer";
import { ProactiveBubble } from "./ProactiveBubble";
import { syncFrontendAfterAIOperation } from "@/lib/ai/agent/syncFrontend";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { hasAIFeatureAccess } from "@/lib/ai/permissions";
import { customToast } from "@/lib/toasts";
import styles from "./AIAssistantChat.module.css";

interface ToolExecutionInfo {
  toolName: string;
  params: Record<string, unknown>;
  result: unknown;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolExecutionInfo[];
  timestamp: string;
  rawCreatedAt?: string;
}

interface PendingConfirmation {
  id: string;
  toolName: string;
  params: Record<string, unknown>;
  description: string;
}

interface ApiMessageItem {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  tool_calls?: ToolExecutionInfo[] | null;
  created_at?: string;
}

export const AIAssistantChat = () => {
  const { t } = useTranslation(["assistant"]);
  const router = useRouter();

  const user = useUserDataStore((state) => state.user);
  const canAccess = hasAIFeatureAccess(user?.tier, "assistant_chat");

  const isPomodoroRunning = usePomodoroStore((state) => state.isRunning);
  const pomodoroMode = usePomodoroStore((state) => state.mode);
  const pomodoroTimeLeft = usePomodoroStore((state) => state.timeLeft);
  const pomodoroWorkTime = usePomodoroStore(
    (state) => state.settings.workTime
  );

  const isPomodoroActive =
    isPomodoroRunning ||
    pomodoroMode !== "work" ||
    pomodoroTimeLeft < pomodoroWorkTime * 60;

  const [isPomodoroVisible, setIsPomodoroVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPomodoroActive) {
      setIsPomodoroVisible(true);
    } else {
      timer = setTimeout(() => {
        setIsPomodoroVisible(false);
      }, 10400);
    }
    return () => clearTimeout(timer);
  }, [isPomodoroActive]);

  const triggerBottom = isPomodoroVisible ? 94 : 24;
  const chatBottom = isPomodoroVisible ? 160 : 90;

  const [isOpen, setIsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  const isPrependingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isPrependingRef.current) return;
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
        } else {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDrawerOpen]);

  const handleSelectConversation = async (id: string) => {
    if (id === conversationId) return;
    setConversationId(id);
    setLoading(true);
    setPendingConfirmation(null);

    try {
      const res = await fetch(
        `/api/ai/chat?conversationId=${encodeURIComponent(id)}&limit=20`
      );
      if (!res.ok) return;

      const data = await res.json();
      if (Array.isArray(data.messages)) {
        const loaded: ChatMessage[] = (data.messages as ApiMessageItem[]).map((m) => ({
          id: m.id || Math.random().toString(),
          role: m.role,
          content: m.content || "",
          toolCalls: m.tool_calls || undefined,
          timestamp: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "",
          rawCreatedAt: m.created_at,
        }));
        setMessages(loaded);
        setHasMoreMessages(Boolean(data.hasMore));
        setTimeout(() => scrollToBottom(false), 80);
      }
    } catch (err: unknown) {
      console.warn("[AIAssistantChat] Error loading conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setPendingConfirmation(null);
    setHasMoreMessages(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const loadOlderMessages = async () => {
    if (!conversationId || loadingOlder || !hasMoreMessages || messages.length === 0) return;
    const earliest = messages[0]?.rawCreatedAt;
    if (!earliest) return;

    setLoadingOlder(true);
    isPrependingRef.current = true;
    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;
    const previousScrollTop = container?.scrollTop || 0;

    try {
      const res = await fetch(
        `/api/ai/chat?conversationId=${encodeURIComponent(conversationId)}&before=${encodeURIComponent(earliest)}&limit=20`
      );
      if (!res.ok) return;

      const data = await res.json();
      const olderItems = (data.messages || []) as ApiMessageItem[];
      if (olderItems.length > 0) {
        const mappedOlder: ChatMessage[] = olderItems.map((m) => ({
          id: m.id || Math.random().toString(),
          role: m.role,
          content: m.content || "",
          toolCalls: m.tool_calls || undefined,
          timestamp: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "",
          rawCreatedAt: m.created_at,
        }));

        setMessages((prev) => [...mappedOlder, ...prev]);
        setHasMoreMessages(Boolean(data.hasMore));

        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);
          }
          isPrependingRef.current = false;
        });
      } else {
        setHasMoreMessages(false);
        isPrependingRef.current = false;
      }
    } catch (err: unknown) {
      console.warn("[AIAssistantChat] Error loading older messages:", err);
      isPrependingRef.current = false;
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop < 30 && hasMoreMessages && !loadingOlder && !loading) {
      loadOlderMessages();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || loading) return;

    const now = new Date();
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawCreatedAt: now.toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId,
          userTimezone: timezone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("sendError"));
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.requiresConfirmation) {
        setPendingConfirmation(data.requiresConfirmation);
      } else {
        setPendingConfirmation(null);
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.message || "",
        toolCalls: data.toolCallsExecuted?.length > 0 ? data.toolCallsExecuted : undefined,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawCreatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.toolCallsExecuted && data.toolCallsExecuted.length > 0) {
        await syncFrontendAfterAIOperation(data.toolCallsExecuted);
        window.dispatchEvent(
          new CustomEvent("alino-assistant-mutated", {
            detail: data.toolCallsExecuted,
          })
        );
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("sendError");
      customToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirmation || loading) return;

    setLoading(true);
    const actionToConfirm = pendingConfirmation;
    setPendingConfirmation(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedAction: {
            toolName: actionToConfirm.toolName,
            params: actionToConfirm.params,
          },
          conversationId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("actionError"));
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.message || t("actionSuccess"),
        toolCalls: data.toolCallsExecuted,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawCreatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      const executed =
        data.toolCallsExecuted && data.toolCallsExecuted.length > 0
          ? data.toolCallsExecuted
          : [{ toolName: actionToConfirm.toolName, params: actionToConfirm.params }];
      await syncFrontendAfterAIOperation(executed);
      window.dispatchEvent(
        new CustomEvent("alino-assistant-mutated", {
          detail: executed,
        })
      );
      router.refresh();
      customToast.success(t("actionSuccess"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("actionError");
      customToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAction = () => {
    setPendingConfirmation(null);
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        role: "assistant",
        content: t("actionCancelled"),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleClearHistory = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      await fetch("/api/ai/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      setMessages([]);
      setPendingConfirmation(null);
      setHasMoreMessages(false);
      customToast.success(t("historyCleared"));
    } catch {
      setMessages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!canAccess) {
    return null;
  }

  return (
    <>
      <ProactiveBubble
        onOpenChat={() => setIsOpen(true)}
        isChatOpen={isOpen}
        bottomOffset={triggerBottom}
      />

      <motion.button
        className={styles.floatingTrigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t("triggerLabel")}
        title={t("triggerLabel")}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, scale: 0.8, bottom: triggerBottom }}
        animate={{ opacity: 1, scale: 1, bottom: triggerBottom }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        <UserAvatar
          avatarUrl="blobatar:alinito"
          username="alino-assistant"
          size={46}
          animate="always"
        />
        <span className={styles.betaBadge}>
          {t("beta", { defaultValue: "BETA" })}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, scale: 0.92, y: 20, bottom: chatBottom }}
            animate={{ opacity: 1, scale: 1, y: 0, bottom: chatBottom }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <ConversationsDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              currentConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
            />

            <div className={styles.chatHeader}>
              <div className={styles.headerLeft}>
                <button
                  className={styles.headerBtn}
                  onClick={() => setIsDrawerOpen(true)}
                  title={t("conversationsTitle")}
                  type="button"
                >
                  <MenuIcon
                    style={{
                      width: 17,
                      height: 17,
                      stroke: "currentColor",
                      strokeWidth: 2,
                    }}
                  />
                </button>
                <UserAvatar
                  avatarUrl="blobatar:alinito"
                  username="alino-assistant"
                  size={34}
                  animate="always"
                />
                <div className={styles.headerTitleWrapper}>
                  <span className={styles.headerTitle}>{t("title")}</span>
                  <span className={styles.headerSubtitle}>{t("subtitle")}</span>
                </div>
              </div>

              <div className={styles.headerActions}>
                {messages.length > 0 && (
                  <button
                    className={styles.headerBtn}
                    onClick={handleClearHistory}
                    title={t("clearHistory")}
                    type="button"
                  >
                    <DeleteIcon style={{ width: 15, height: 15 }} />
                  </button>
                )}
                <button
                  className={styles.headerBtn}
                  onClick={() => setIsOpen(false)}
                  title={t("close")}
                  type="button"
                >
                  <Cross style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            <div
              className={styles.messagesContainer}
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
            >
              {hasMoreMessages && (
                <button
                  className={styles.loadOlderBtn}
                  onClick={loadOlderMessages}
                  disabled={loadingOlder}
                  type="button"
                >
                  {loadingOlder ? (
                    <LoadingIcon
                      style={{ width: 12, height: 12 }}
                      className={styles.spinAnimation}
                    />
                  ) : null}
                  <span>{t("loadOlderMessages")}</span>
                </button>
              )}

              {messages.length === 0 ? (
                <div className={styles.welcomeCard}>
                  <div className={styles.welcomeIconWrapper}>
                    <IAStars style={{ width: 28, height: 28 }} />
                  </div>
                  <h3 className={styles.welcomeTitle}>
                    {t("welcomeTitle")}
                  </h3>
                  <p className={styles.welcomeDesc}>
                    {t("welcomeDesc")}
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.messageRow} ${m.role === "user"
                      ? styles.messageRowUser
                      : styles.messageRowAssistant
                      }`}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? styles.bubbleUser
                          : styles.bubbleAssistant
                      }
                    >
                      {m.role === "assistant" ? (
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      ) : (
                        <span>{m.content}</span>
                      )}
                    </div>
                    {m.timestamp && (
                      <span className={styles.messageTimestamp}>
                        {m.timestamp}
                      </span>
                    )}
                  </div>
                ))
              )}

              {pendingConfirmation && (
                <ChatConfirmationCard
                  actionDescription={pendingConfirmation.description}
                  onConfirm={handleConfirmAction}
                  onCancel={handleCancelAction}
                />
              )}

              {loading && (
                <div
                  className={`${styles.messageRow} ${styles.messageRowAssistant}`}
                >
                  <div className={styles.loadingBubble}>
                    <LoadingIcon
                      style={{ width: 16, height: 16 }}
                      className={styles.spinAnimation}
                    />
                    <span>{t("thinking")}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <QuickSuggestions
              onSelect={(prompt) => handleSendMessage(prompt)}
              disabled={loading}
            />

            <div className={styles.chatFooter}>
              <div className={styles.inputWrapper}>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("inputPlaceholder")}
                  className={styles.chatInput}
                  rows={1}
                  disabled={loading}
                />
                <button
                  className={styles.sendButton}
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputValue.trim()}
                  type="button"
                  aria-label={t("send")}
                  title={t("send")}
                >
                  <SendIcon style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
