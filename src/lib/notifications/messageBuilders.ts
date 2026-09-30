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

export function buildTaskDueMessage(
  count: number,
  firstTaskTitle: string,
  minRemaining: number
): { title: string; body: string } {
  const cleanTitle = stripHtml(firstTaskTitle) || "Tarea pendiente";
  const minText = `${minRemaining} ${minRemaining === 1 ? "minuto" : "minutos"}`;

  if (count === 1) {
    return {
      title: "⏰ Tarea por vencer",
      body: `"${cleanTitle}" vence en ${minText}. ¡No lo olvides!`,
    };
  }

  if (count === 2) {
    return {
      title: "⏰ 2 tareas están a punto de vencer",
      body: `"${cleanTitle}" y 1 tarea más vencen en los próximos minutos. ¡Revisa tu lista!`,
    };
  }

  return {
    title: `⏰ ${count} tareas están a punto de vencer`,
    body: `"${cleanTitle}" y ${count - 1} tareas más vencen en los próximos minutos. ¡Revisa tu lista!`,
  };
}

export function buildDailyDigestMessage(
  dueTodayCount: number,
  overdueCount: number,
  totalPending: number
): { title: string; body: string } {
  if (dueTodayCount > 0) {
    const todayText = dueTodayCount === 1 ? "tarea para hoy" : "tareas para hoy";
    const plannedText = dueTodayCount === 1 ? "tarea prevista" : "tareas previstas";
    const body =
      overdueCount > 0
        ? `Tienes ${dueTodayCount} ${todayText} y ${overdueCount} atrasadas. ¡A por ellas!`
        : `Tienes ${dueTodayCount} ${plannedText} para hoy. ¡Haz que tu día rinda!`;
    return {
      title: "☀️ Resumen de hoy",
      body,
    };
  }

  if (overdueCount > 0) {
    const overdueText = overdueCount === 1 ? "tarea pendiente" : "tareas pendientes";
    return {
      title: "☀️ Tareas pendientes",
      body: `Tienes ${overdueCount} ${overdueText} esperando tu atención. ¡Buen momento para avanzar!`,
    };
  }

  if (totalPending > 0) {
    return {
      title: "☀️ Resumen de hoy",
      body: `Tienes ${totalPending} tareas organizadas. ¡Dedica unos minutos a planificar tu jornada!`,
    };
  }

  return {
    title: "☀️ ¡Todo al día!",
    body: "No tienes tareas pendientes para hoy. ¡Aprovecha para descansar o definir nuevos objetivos!",
  };
}

export function buildStreakDangerMessage(
  currentStreak: number,
  hoursUntilMidnight: number,
  totalProtectors: number
): { title: string; body: string } {
  const hoursCeil = Math.max(1, Math.ceil(hoursUntilMidnight));
  const daysText = currentStreak === 1 ? "día" : "días";

  if (totalProtectors > 0) {
    const protText = `${totalProtectors} disponible${totalProtectors > 1 ? "s" : ""}`;
    return {
      title: "🛡️ Tu racha usará un protector esta noche",
      body: `Faltan ~${hoursCeil} horas para medianoche. Completa una tarea hoy para no gastar tus protectores (${protText}).`,
    };
  }

  return {
    title: `🔥 ¡Tu racha de ${currentStreak} ${daysText} está por perderse!`,
    body: "No te quedan protectores disponibles. Completa al menos una tarea antes de medianoche para salvar tu racha.",
  };
}

export function buildNudgeRewardMessage(
  count: number,
  firstTitle: string
): { title: string; body: string } {
  return {
    title: "🎁 ¡Tienes recompensas listas para reclamar!",
    body:
      count === 1
        ? `Completaste el logro "${firstTitle}". ¡Entra a Alino y reclama tus Alino Coins y XP!`
        : `Tienes ${count} recompensas de logros esperando por ti. ¡Entra a recogerlas!`,
  };
}

export function buildNudgeNearAchievementMessage(
  title: string,
  percentage: number
): { title: string; body: string } {
  return {
    title: "🎯 ¡Estás muy cerca de un logro!",
    body: `Estás al ${percentage}% de "${title}". ¡Completa un paso más y desbloquéalo hoy!`,
  };
}

export function buildNudgeOrganizeMessage(): { title: string; body: string } {
  return {
    title: "✨ Organiza tu día en Alino",
    body: "Tus pendientes te esperan. Tómate 2 minutos para despejar tu mente y avanzar en tus metas.",
  };
}
