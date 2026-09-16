export type SoundUsage = "task-completion" | "pomodoro" | "notification";

export interface SoundItem {
  id: string;
  name: string;
  file: string;
  path: string;
  usages: SoundUsage[];
  description?: string;
}

export const APP_SOUNDS: SoundItem[] = [
  {
    id: "check-1",
    name: "Check Clásico",
    file: "check-1.mp3",
    path: "/sounds/check-1.mp3",
    usages: ["task-completion"],
    description: "Sonido de completado satisfactorio y breve",
  },
  {
    id: "marimba-notification",
    name: "Marimba",
    file: "marimba-notification.mp3",
    path: "/sounds/marimba-notification.mp3",
    usages: ["task-completion", "pomodoro", "notification"],
    description: "Notas melódicas suaves de marimba",
  },
  {
    id: "bell-notification-1",
    name: "Campana 1",
    file: "bell-notification-1.mp3",
    path: "/sounds/bell-notification-1.mp3",
    usages: ["task-completion", "pomodoro", "notification"],
    description: "Campanada suave y resonante",
  },
  {
    id: "bell-notification-2",
    name: "Campana 2",
    file: "bell-notification-2.mp3",
    path: "/sounds/bell-notification-2.mp3",
    usages: ["pomodoro", "notification"],
    description: "Doble campanada de alerta",
  },
  {
    id: "relax-notification",
    name: "Relax",
    file: "relax-notification.mp3",
    path: "/sounds/relax-notification.mp3",
    usages: ["pomodoro", "notification"],
    description: "Tono meditativo y envolvente",
  },
  {
    id: "timer-terminer",
    name: "Temporizador",
    file: "timer-terminer.mp3",
    path: "/sounds/timer-terminer.mp3",
    usages: ["pomodoro"],
    description: "Aviso de finalización de tiempo",
  },
  {
    id: "system-notification",
    name: "Sistema",
    file: "system-notification.mp3",
    path: "/sounds/system-notification.mp3",
    usages: ["notification"],
    description: "Aviso electrónico sutil de sistema",
  },
];

export const DEFAULT_TASK_SOUND_ID = "check-1";
export const DEFAULT_POMODORO_SOUND_ID = "bell-notification-1";

export function getSoundsByUsage(usage: SoundUsage): SoundItem[] {
  return APP_SOUNDS.filter((sound) => sound.usages.includes(usage));
}

export function getSoundById(id: string): SoundItem | undefined {
  return APP_SOUNDS.find((sound) => sound.id === id);
}

let previewAudio: HTMLAudioElement | null = null;

export function playSound(pathOrId: string, volume: number = 0.6) {
  if (typeof window === "undefined") return;

  try {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }

    const sound = getSoundById(pathOrId);
    const resolvedPath = sound
      ? sound.path
      : pathOrId.startsWith("/")
        ? pathOrId
        : `/sounds/${pathOrId}.mp3`;

    previewAudio = new Audio(resolvedPath);
    previewAudio.volume = Math.max(0, Math.min(1, volume));
    previewAudio.play().catch(() => {});
  } catch {}
}
