import { SupportedLanguage } from "@/lib/i18n/types";

export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripEmojis(input: string | null | undefined): string {
  if (!input) return "";
  const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
  return input
    .replace(emojiRegex, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3).trim()}...`;
}

export function buildTaskDueMessage(
  count: number,
  minRemaining: number,
  lang: SupportedLanguage = "es"
): { title: string; body: string } {
  if (lang === "en") {
    const minText = `${minRemaining} ${minRemaining === 1 ? "minute" : "minutes"}`;
    if (count <= 1) {
      return {
        title: "Upcoming task due",
        body: `You have 1 task due in ${minText}.`,
      };
    }
    return {
      title: "Upcoming tasks due",
      body: `You have ${count} tasks due in the next few minutes.`,
    };
  }

  const minText = `${minRemaining} ${minRemaining === 1 ? "minuto" : "minutos"}`;
  if (count <= 1) {
    return {
      title: "Tarea por vencer",
      body: `Tienes 1 tarea que vence en ${minText}.`,
    };
  }

  return {
    title: "Tareas por vencer",
    body: `Tienes ${count} tareas programadas para los próximos minutos.`,
  };
}

export function buildDailyDigestMessage(
  dueTodayCount: number,
  overdueCount: number,
  totalPending: number,
  lang: SupportedLanguage = "es"
): { title: string; body: string } {
  if (lang === "en") {
    if (dueTodayCount > 0) {
      const todayText = dueTodayCount === 1 ? "task for today" : "tasks for today";
      const body =
        overdueCount > 0
          ? `You have ${dueTodayCount} ${todayText} and ${overdueCount} overdue.`
          : `You have ${dueTodayCount} ${todayText} scheduled.`;
      return {
        title: "Daily digest",
        body,
      };
    }

    if (overdueCount > 0) {
      const overdueText = overdueCount === 1 ? "overdue task" : "overdue tasks";
      return {
        title: "Pending tasks",
        body: `You have ${overdueCount} ${overdueText} awaiting your attention.`,
      };
    }

    if (totalPending > 0) {
      return {
        title: "Daily digest",
        body: `You have ${totalPending} organized tasks. Great time to make progress.`,
      };
    }

    return {
      title: "All caught up",
      body: "You have no pending tasks for today.",
    };
  }

  if (dueTodayCount > 0) {
    const todayText = dueTodayCount === 1 ? "tarea para hoy" : "tareas para hoy";
    const body =
      overdueCount > 0
        ? `Tienes ${dueTodayCount} ${todayText} y ${overdueCount} atrasadas.`
        : `Tienes ${dueTodayCount} ${todayText} previstas.`;
    return {
      title: "Resumen diario",
      body,
    };
  }

  if (overdueCount > 0) {
    const overdueText = overdueCount === 1 ? "tarea atrasada" : "tareas atrasadas";
    return {
      title: "Tareas pendientes",
      body: `Tienes ${overdueCount} ${overdueText} esperando tu atención.`,
    };
  }

  if (totalPending > 0) {
    return {
      title: "Resumen diario",
      body: `Tienes ${totalPending} tareas organizadas. Buen momento para avanzar.`,
    };
  }

  return {
    title: "Todo al día",
    body: "No tienes tareas pendientes para hoy.",
  };
}

export function buildStreakDangerMessage(
  currentStreak: number,
  hoursUntilMidnight: number,
  totalProtectors: number,
  lang: SupportedLanguage = "es"
): { title: string; body: string } {
  if (lang === "en") {
    if (totalProtectors > 0) {
      return {
        title: "Streak protector active",
        body: "Your streak will use a protector tonight if no tasks are completed.",
      };
    }

    return {
      title: "Streak at risk",
      body: `Complete a task before midnight to save your ${currentStreak}-day streak.`,
    };
  }

  const daysText = currentStreak === 1 ? "día" : "días";

  if (totalProtectors > 0) {
    return {
      title: "Protector de racha activo",
      body: "Tu racha usará un protector esta noche si no completas una tarea.",
    };
  }

  return {
    title: "Racha en riesgo",
    body: `Completa una tarea antes de medianoche para salvar tu racha de ${currentStreak} ${daysText}.`,
  };
}

export function buildNudgeRewardMessage(
  count: number,
  lang: SupportedLanguage = "es"
): { title: string; body: string } {
  if (lang === "en") {
    return {
      title: "Rewards available",
      body:
        count <= 1
          ? "You completed an achievement. Check Alino to claim your reward."
          : `You have ${count} achievement rewards ready to claim.`,
    };
  }

  return {
    title: "Recompensas disponibles",
    body:
      count <= 1
        ? "Completaste un logro. Entra a Alino y reclama tu recompensa."
        : `Tienes ${count} recompensas de logros listas para reclamar.`,
  };
}

export function buildNudgeNearAchievementMessage(
  percentage: number,
  lang: SupportedLanguage = "es"
): { title: string; body: string } {
  if (lang === "en") {
    return {
      title: "Achievement close",
      body: `You are at ${percentage}% of unlocking a new achievement.`,
    };
  }

  return {
    title: "Logro cercano",
    body: `Estás al ${percentage}% de alcanzar un nuevo logro.`,
  };
}

export function buildNudgeOrganizeMessage(
  lang: SupportedLanguage = "es"
): { title: string; body: string } {
  if (lang === "en") {
    return {
      title: "Plan your day",
      body: "Your tasks are waiting. Take a moment to plan your goals.",
    };
  }

  return {
    title: "Organiza tu jornada",
    body: "Tus tareas te esperan. Tómate un momento para planificar tus metas.",
  };
}

export interface ListInvitationMessageParams {
  inviterName?: string | null;
  listName?: string | null;
  lang?: SupportedLanguage;
}

export function buildListInvitationMessage({
  inviterName,
  listName,
  lang = "es",
}: ListInvitationMessageParams): { title: string; body: string } {
  const fallbackInviter = lang === "en" ? "Someone" : "Alguien";
  const fallbackList = lang === "en" ? "a shared list" : "una lista compartida";

  const rawInviter = inviterName ? stripEmojis(stripHtml(inviterName)) : fallbackInviter;
  const rawList = listName ? stripEmojis(stripHtml(listName)) : fallbackList;

  const cleanInviter = rawInviter.trim() || fallbackInviter;
  const cleanList = truncateString(rawList.trim() || fallbackList, 35);

  if (lang === "en") {
    return {
      title: "List invitation",
      body: `${cleanInviter} invited you to join "${cleanList}".`,
    };
  }

  return {
    title: "Invitación a lista",
    body: `${cleanInviter} te invitó a unirte a "${cleanList}".`,
  };
}

export function buildTestNotificationMessage(
  lang: SupportedLanguage = "es"
): { title: string; body: string } {
  if (lang === "en") {
    return {
      title: "Notifications enabled",
      body: "Your notification setup is working properly.",
    };
  }

  return {
    title: "Notificaciones activadas",
    body: "Tu configuración de notificaciones funciona correctamente.",
  };
}
