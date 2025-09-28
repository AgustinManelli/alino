import { toast } from 'sonner';
import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface ModeConfig {
  time: number;
  label: string;
  color: string;
}

interface ModeConfigs {
  work: ModeConfig;
  shortBreak: ModeConfig;
  longBreak: ModeConfig;
}

interface PomodoroSettings {
  workTime: number; // en minutos
  shortBreakTime: number; // en minutos
  longBreakTime: number; // en minutos
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number; // cada cuántos ciclos
  alarmSound: string;
  volume: number; // 0-100
  notifications: boolean;
}

interface PomodoroState {
  // Estado
  timeLeft: number;
  isRunning: boolean;
  mode: PomodoroMode;
  cycles: number;
  
  // Configuraciones persistentes
  settings: PomodoroSettings;
  
  // Configuraciones calculadas
  modes: ModeConfigs;
  
  // Control interno del timer
  _intervalId: NodeJS.Timeout | null;
  
  // Acciones
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: PomodoroMode) => void;
  _tick: () => void;
  _completeTimer: () => void;
  _startInterval: () => void;
  _stopInterval: () => void;
  
  // Configuración
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  resetSettings: () => void;
  
  // Utilidades
  formatTime: (seconds: number) => string;
  getProgress: () => number;
  isActive: () => boolean;
}

const defaultSettings: PomodoroSettings = {
  workTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
  alarmSound: 'bell-notification-1',
  volume: 80,
  notifications: false
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Estado inicial
      timeLeft: defaultSettings.workTime * 60,
      isRunning: false,
      mode: 'work',
      cycles: 0,
      _intervalId: null,
      
      // Configuraciones persistentes
      settings: defaultSettings,
      
      // Configuraciones calculadas (se actualizan con settings)
      modes: {
        work: { time: defaultSettings.workTime * 60, label: 'Pomodoro', color: '#e74c3c' },
        shortBreak: { time: defaultSettings.shortBreakTime * 60, label: 'Descanso', color: '#27ae60' },
        longBreak: { time: defaultSettings.longBreakTime * 60, label: 'Descanso Largo', color: '#3498db' }
      },
      
      // Acciones
      toggleTimer: () => {
        const { isRunning } = get();
        if (isRunning) {
          get()._stopInterval();
          set({ isRunning: false });
        } else {
          get()._startInterval();
          set({ isRunning: true });
        }
      },
      
      resetTimer: () => {
        const { mode, modes } = get();
        get()._stopInterval();
        set({
          isRunning: false,
          timeLeft: modes[mode].time
        });
      },
      
      switchMode: (newMode: PomodoroMode) => {
        const { modes } = get();
        get()._stopInterval();
        set({
          isRunning: false,
          mode: newMode,
          timeLeft: modes[newMode].time
        });
      },
      
      // Métodos internos del timer
      _tick: () => {
        const { timeLeft } = get();
        if (timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        } else {
          get()._completeTimer();
        }
      },
      
      _completeTimer: () => {
        const { mode, cycles, modes, settings, toggleTimer } = get();
        get()._stopInterval();
        
        playAlarmSound(settings.alarmSound, 1);
        
        // Notificación del navegador
        if (settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`¡${modes[mode].label} completado!`, {
            body: 'Es hora de cambiar de actividad',
            icon: '/favicon.ico'
          });
        }
        
        if (mode === 'work') {
          const newCycles = cycles + 1;
          
          if (newCycles % settings.longBreakInterval === 0) {
            set({
              isRunning: false,
              mode: 'longBreak',
              timeLeft: modes.longBreak.time,
              cycles: newCycles
            });
            toast('Pomodoro terminado, ¿Vamos por el break de ' + settings.longBreakTime + ' minutos?', {
              action: {
                label: 'Alla vamos',
                onClick: () => toggleTimer()
              },
            });
            
            // Auto iniciar si está activado
            if (settings.autoStartBreaks) {
              setTimeout(() => toggleTimer(), 1000);
            }
          } else {
            set({
              isRunning: false,
              mode: 'shortBreak',
              timeLeft: modes.shortBreak.time,
              cycles: newCycles
            });
            toast('Pomodoro terminado, ¿Vamos por el break de ' + settings.shortBreakTime + ' minutos?', {
              action: {
                label: 'Iniciar',
                onClick: () => toggleTimer()
              },
            });
            
            // Auto iniciar si está activado
            if (settings.autoStartBreaks) {
              setTimeout(() => toggleTimer(), 1000);
            }
          }
        } else {
          set({
            isRunning: false,
            mode: 'work',
            timeLeft: modes.work.time
          });
          toast('El break terminó, ¿Volvemos al pomodoro de ' + settings.workTime + ' minutos?', {
            action: {
              label: 'Iniciar',
              onClick: () => toggleTimer()
            },
          });
          
          // Auto iniciar si está activado
          if (settings.autoStartPomodoros) {
            setTimeout(() => toggleTimer(), 1000);
          }
        }
      },
      
      _startInterval: () => {
        const { _intervalId } = get();
        if (_intervalId) {
          clearInterval(_intervalId);
        }
        
        const intervalId = setInterval(() => {
          get()._tick();
        }, 1000);
        
        set({ _intervalId: intervalId });
      },
      
      _stopInterval: () => {
        const { _intervalId } = get();
        if (_intervalId) {
          clearInterval(_intervalId);
          set({ _intervalId: null });
        }
      },
      
      // Configuración
      updateSettings: (newSettings: Partial<PomodoroSettings>) => {
        const currentSettings = get().settings;
        const updatedSettings = { ...currentSettings, ...newSettings };

        if (currentAlarmAudio) {
          currentAlarmAudio.volume = updatedSettings.volume / 100;
        }
        
        // Actualizar modes con los nuevos tiempos
        const newModes = {
          work: { time: updatedSettings.workTime * 60, label: 'Trabajo', color: '#e74c3c' },
          shortBreak: { time: updatedSettings.shortBreakTime * 60, label: 'Descanso', color: '#27ae60' },
          longBreak: { time: updatedSettings.longBreakTime * 60, label: 'Descanso Largo', color: '#3498db' }
        };
        
        // Si el timer no está corriendo, actualizar timeLeft del modo actual
        const { isRunning, mode } = get();
        const newTimeLeft = isRunning ? get().timeLeft : newModes[mode].time;
        
        set({
          settings: updatedSettings,
          modes: newModes,
          timeLeft: newTimeLeft
        });
      },
      
      resetSettings: () => {
        get().updateSettings(defaultSettings);
        set({
          cycles: 0,
          mode: 'work',
          isRunning: false
        });
        get()._stopInterval();
      },
      
      // Utilidades
      formatTime: (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      },
      
      getProgress: (): number => {
        const { mode, modes, timeLeft } = get();
        return ((modes[mode].time - timeLeft) / modes[mode].time) * 100;
      },

      isActive: (): boolean => {
        const { mode, cycles, isRunning, settings } = get();
        const defaultTimeLeft = settings.workTime * 60;
        const { timeLeft } = get();
        
        if (isRunning || cycles > 0 || mode !== 'work' || timeLeft < defaultTimeLeft) {
          return true;
        } else {
          return false;
        }
      }
    })),
    {
      name: 'pomodoro-settings',
      partialize: (state) => ({ 
        settings: state.settings,
        cycles: state.cycles 
      })
    }
  )
);

// Inicializar el store y solicitar permisos de notificación
const initializePomodoroStore = () => {
  // Limpiar intervalos al cerrar la ventana
  const cleanup = () => {
    const store = usePomodoroStore.getState();
    store._stopInterval();
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('unload', cleanup);
  }
};

// Auto-inicializar si estamos en el navegador
if (typeof window !== 'undefined') {
  initializePomodoroStore();
}

let currentAlarmAudio: HTMLAudioElement | null = null;
let onEndedListener: (() => void) | null = null;

export const stopAlarmSound = () => {
  if (currentAlarmAudio) {
    if (onEndedListener) {
      currentAlarmAudio.removeEventListener('ended', onEndedListener);
      onEndedListener = null;
    }
    currentAlarmAudio.pause();
    currentAlarmAudio.currentTime = 0;
    currentAlarmAudio = null;
  }
};

export const playAlarmSound = (soundName: string, repeat: number) => {
  try {
    stopAlarmSound();

    const volume = usePomodoroStore.getState().settings.volume;
    
    currentAlarmAudio = new Audio(`/sounds/${soundName}.mp3`);
    currentAlarmAudio.volume = volume / 100;

    if (repeat === 0) {
      currentAlarmAudio.loop = true;
    } else if (repeat > 0) {
      currentAlarmAudio.loop = false;
      let playCount = 1;

      onEndedListener = () => {
        if (playCount < repeat) {
          playCount++;
          if (currentAlarmAudio) {
            currentAlarmAudio.currentTime = 0;
            currentAlarmAudio.play().catch(error => console.error('Error al repetir el sonido:', error));
          }
        } else {
          stopAlarmSound();
        }
      };

      currentAlarmAudio.addEventListener('ended', onEndedListener);
    }

    currentAlarmAudio.play().catch(error => {
   console.error('Error al iniciar la reproducción del sonido:', error);
  });

  } catch (error) {
    console.error('Error al crear el objeto Audio:', error);
  }
};