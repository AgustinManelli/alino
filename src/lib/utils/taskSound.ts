import { getSoundById, DEFAULT_TASK_SOUND_ID } from "@/lib/sounds/soundCatalog";

export function playTaskCompletionSound(explicitSoundId?: string) {
  if (typeof window === "undefined") return;

  try {
    const stored = JSON.parse(localStorage.getItem("user-preferences") || "{}");
    // Por defecto los efectos de sonido están desactivados (false)
    if (stored.soundEffects !== true) return;

    const soundId =
      explicitSoundId || stored.taskCompletionSound || DEFAULT_TASK_SOUND_ID;

    const soundItem = getSoundById(soundId);
    const audioPath = soundItem ? soundItem.path : `/sounds/${soundId}.mp3`;

    const audio = new Audio(audioPath);
    audio.volume = 0.65;
    audio.play().catch(() => { });
  } catch {
    // Si la reproducción de audio no está permitida por el navegador, continuar
  }
}
