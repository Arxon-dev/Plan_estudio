import React, { useState, useEffect, useRef } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import toast from 'react-hot-toast';

// Tipos de estado del temporizador
export type TimerPhase = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED';

interface PomodoroSettings {
    workDuration: number; // minutos
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
    autoStart: boolean;
}

interface PomodoroState {
    phase: TimerPhase;
    timeLeft: number; // segundos
    status: TimerStatus;
    pomodorosCompleted: number;
    interruptions: number;
    totalWorkSeconds: number; // tiempo real trabajado en esta sesión
}

interface PomodoroTimerProps {
    sessionId: number;
    initialSettings?: Partial<PomodoroSettings>;
    onPomodoroComplete: (stats: { actualDuration: number; interruptions: number; pomodorosCompleted: number }) => void;
    onSessionComplete: (stats: { actualDuration: number; interruptions: number; pomodorosCompleted: number }) => void;
    onUpdateHeartbeat: (stats: { actualDuration: number; interruptions: number; pomodorosCompleted: number; status: string }) => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
    workDuration: 45,
    shortBreak: 10,
    longBreak: 20,
    longBreakInterval: 3,
    autoStart: false,
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
    sessionId,
    initialSettings,
    onPomodoroComplete,
    onUpdateHeartbeat
}) => {
    // Configuración
    const [settings] = useState<PomodoroSettings>({ ...DEFAULT_SETTINGS, ...initialSettings });

    // Estado del temporizador
    const [state, setState] = useState<PomodoroState>({
        phase: 'WORK',
        timeLeft: settings.workDuration * 60,
        status: 'IDLE',
        pomodorosCompleted: 0,
        interruptions: 0,
        totalWorkSeconds: 0,
    });

    const timerRef = useRef<number | null>(null);
    const heartbeatRef = useRef<number | null>(null);

    // Cargar estado persistente al montar
    useEffect(() => {
        const savedState = localStorage.getItem(`pomodoro_v1_${sessionId}`);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                const savedTime = new Date(parsed.timestamp).getTime();
                const now = new Date().getTime();

                // Si la sesión guardada es reciente (< 2 horas), restaurar
                if (now - savedTime < 2 * 60 * 60 * 1000) {
                    setState(prev => ({
                        ...prev,
                        ...parsed.state,
                        status: 'PAUSED' // Restaurar siempre en pausa para evitar sorpresas
                    }));
                    toast.success('Sesión anterior restaurada');
                }
            } catch (e) {
                console.error('Error al restaurar sesión:', e);
            }
        }
    }, [sessionId]);

    // Persistir estado cada vez que cambia (con debounce implícito por el intervalo del timer)
    useEffect(() => {
        if (state.status !== 'IDLE') {
            localStorage.setItem(`pomodoro_v1_${sessionId}`, JSON.stringify({
                state,
                timestamp: new Date().toISOString()
            }));
        }
    }, [state, sessionId]);

    // Timer Logic
    useEffect(() => {
        if (state.status === 'RUNNING') {
            timerRef.current = setInterval(() => {
                setState((prev) => {
                    const newTimeLeft = prev.timeLeft - 1;
                    const newTotalWork = prev.phase === 'WORK' ? prev.totalWorkSeconds + 1 : prev.totalWorkSeconds;

                    if (newTimeLeft <= 0) {
                        handlePhaseComplete(prev);
                        return { ...prev, timeLeft: 0, totalWorkSeconds: newTotalWork }; // Temporary state until phase switch
                    }

                    return {
                        ...prev,
                        timeLeft: newTimeLeft,
                        totalWorkSeconds: newTotalWork
                    };
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.status, state.phase]);

    // Heartbeat Logic (cada 30s)
    useEffect(() => {
        if (state.status === 'RUNNING') {
            heartbeatRef.current = setInterval(() => {
                onUpdateHeartbeat({
                    actualDuration: Math.round(state.totalWorkSeconds / 60),
                    interruptions: state.interruptions,
                    pomodorosCompleted: state.pomodorosCompleted,
                    status: 'IN_PROGRESS'
                });
            }, 30000);
        } else {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        }

        return () => {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        };
    }, [state.status, state.totalWorkSeconds, state.interruptions, state.pomodorosCompleted]);

    const handlePhaseComplete = (prevState: PomodoroState) => {
        playNotificationSound();

        if (prevState.phase === 'WORK') {
            const newPomodoros = prevState.pomodorosCompleted + 1;
            const isLongBreak = newPomodoros % settings.longBreakInterval === 0;
            const nextPhase = isLongBreak ? 'LONG_BREAK' : 'SHORT_BREAK';
            const nextDuration = isLongBreak ? settings.longBreak : settings.shortBreak;

            setState(prev => ({
                ...prev,
                phase: nextPhase,
                timeLeft: nextDuration * 60,
                pomodorosCompleted: newPomodoros,
                status: settings.autoStart ? 'RUNNING' : 'PAUSED' // Auto-start break?
            }));

            onPomodoroComplete({
                actualDuration: Math.round(prevState.totalWorkSeconds / 60),
                interruptions: prevState.interruptions,
                pomodorosCompleted: newPomodoros
            });

            toast.success(`¡Pomodoro completado! Tómate un descanso de ${nextDuration} min.`);

            // Notificación de navegador
            if (Notification.permission === 'granted') {
                new Notification('¡Pomodoro Completado!', {
                    body: `Has completado ${newPomodoros} pomodoros. Hora del descanso.`,
                });
            }

        } else {
            // Fin del descanso
            setState(prev => ({
                ...prev,
                phase: 'WORK',
                timeLeft: settings.workDuration * 60,
                status: settings.autoStart ? 'RUNNING' : 'PAUSED'
            }));

            toast('¡Descanso terminado! A trabajar.', { icon: '💪' });

            if (Notification.permission === 'granted') {
                new Notification('¡A trabajar!', {
                    body: 'El descanso ha terminado. ¡Vamos a por el siguiente bloque!',
                });
            }
        }
    };

    const toggleTimer = () => {
        if (state.status === 'RUNNING') {
            // Pausa
            setState(prev => ({
                ...prev,
                status: 'PAUSED',
                interruptions: prev.phase === 'WORK' ? prev.interruptions + 1 : prev.interruptions
            }));
        } else {
            // Iniciar / Reanudar
            if (state.status === 'IDLE' && Notification.permission === 'default') {
                Notification.requestPermission();
            }
            setState(prev => ({ ...prev, status: 'RUNNING' }));
        }
    };

    const playNotificationSound = () => {
        // Simple beep or load an audio file
        // Using a reliable online sound or local asset would be better
        // For now, simple console log as placeholder for sound implementation
        console.log('DING! 🔔');
        // const audio = new Audio('/assets/sounds/bell.mp3');
        // audio.play().catch(e => console.log('Audio play failed', e));
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const totalSeconds = (
            state.phase === 'WORK' ? settings.workDuration :
                state.phase === 'SHORT_BREAK' ? settings.shortBreak :
                    settings.longBreak
        ) * 60;
        return ((totalSeconds - state.timeLeft) / totalSeconds) * 100;
    };

    const getColor = () => {
        switch (state.phase) {
            case 'WORK': return '#ef4444'; // Red-500
            case 'SHORT_BREAK': return '#3b82f6'; // Blue-500
            case 'LONG_BREAK': return '#8b5cf6'; // Violet-500
            default: return '#ef4444';
        }
    };

    const getPhaseLabel = () => {
        switch (state.phase) {
            case 'WORK': return 'Enfoque';
            case 'SHORT_BREAK': return 'Descanso Corto';
            case 'LONG_BREAK': return 'Descanso Largo';
        }
    };

    // Calcular concentración actual
    const concentrationScore = state.totalWorkSeconds > 0
        ? Math.round((state.totalWorkSeconds / (state.totalWorkSeconds + (state.interruptions * 60))) * 100)
        : 100;

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-sm mx-auto">
            {/* Header */}
            <div className="flex justify-between w-full mb-6 text-sm text-gray-500 font-medium">
                <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider">Sesión</span>
                    <span className="text-gray-900 font-bold">#{sessionId}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider">Pomodoros</span>
                    <span className="text-gray-900 font-bold">{state.pomodorosCompleted}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-wider">Concentración</span>
                    <span className={`font-bold ${concentrationScore >= 80 ? 'text-green-600' : concentrationScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {concentrationScore}%
                    </span>
                </div>
            </div>

            {/* Timer Circle */}
            <div className="w-64 h-64 mb-8 relative">
                <CircularProgressbar
                    value={getProgress()}
                    text={formatTime(state.timeLeft)}
                    styles={buildStyles({
                        pathColor: getColor(),
                        textColor: '#1f2937',
                        trailColor: '#f3f4f6',
                        pathTransitionDuration: 0.5,
                        textSize: '16px',
                    })}
                />
                <div className="absolute bottom-12 left-0 right-0 text-center">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                        {getPhaseLabel()}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 w-full">
                <button
                    onClick={toggleTimer}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${state.status === 'RUNNING'
                            ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        }`}
                >
                    {state.status === 'RUNNING' ? '⏸️ Pausar' : state.status === 'IDLE' ? '▶️ Iniciar' : '▶️ Reanudar'}
                </button>

                {state.status !== 'IDLE' && (
                    <button
                        onClick={() => {
                            if (confirm('¿Estás seguro de reiniciar el temporizador?')) {
                                setState(prev => ({
                                    ...prev,
                                    timeLeft: (prev.phase === 'WORK' ? settings.workDuration : prev.phase === 'SHORT_BREAK' ? settings.shortBreak : settings.longBreak) * 60,
                                    status: 'IDLE'
                                }));
                            }
                        }}
                        className="p-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                        title="Reiniciar"
                    >
                        🔄
                    </button>
                )}
            </div>

            {/* Stats Footer */}
            <div className="mt-6 pt-6 border-t border-gray-100 w-full flex justify-between text-xs text-gray-400">
                <span>Interrupciones: {state.interruptions}</span>
                <span>Tiempo total: {Math.round(state.totalWorkSeconds / 60)} min</span>
            </div>
        </div>
    );
};
