"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  IAStars,
  Crown,
  Clock,
} from "@/components/ui/icons/icons";
import styles from "./AIAssistantChat.module.css";

interface Props {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

interface SuggestionItem {
  icon: React.ReactNode;
  labelKey: string;
  promptKey: string;
}

const SUGGESTIONS: SuggestionItem[] = [
  {
    icon: <Calendar style={{ width: 13, height: 13 }} />,
    labelKey: "suggestions.todayTasks",
    promptKey: "suggestions.todayTasksPrompt",
  },
  {
    icon: <IAStars style={{ width: 13, height: 13 }} />,
    labelKey: "suggestions.productivity",
    promptKey: "suggestions.productivityPrompt",
  },
  {
    icon: <Crown style={{ width: 13, height: 13 }} />,
    labelKey: "suggestions.myCoins",
    promptKey: "suggestions.myCoinsPrompt",
  },
  {
    icon: <Crown style={{ width: 13, height: 13 }} />,
    labelKey: "suggestions.nextAchievement",
    promptKey: "suggestions.nextAchievementPrompt",
  },
  {
    icon: <Clock style={{ width: 13, height: 13 }} />,
    labelKey: "suggestions.dueSoon",
    promptKey: "suggestions.dueSoonPrompt",
  },
];

export const QuickSuggestions = ({ onSelect, disabled }: Props) => {
  const { t } = useTranslation(["assistant"]);

  return (
    <div className={styles.suggestionsContainer}>
      {SUGGESTIONS.map((s, idx) => (
        <button
          key={idx}
          className={styles.suggestionChip}
          onClick={() => onSelect(t(s.promptKey))}
          disabled={disabled}
          type="button"
        >
          {s.icon}
          <span>{t(s.labelKey)}</span>
        </button>
      ))}
    </div>
  );
};
