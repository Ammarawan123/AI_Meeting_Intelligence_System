"use client";

import { createContext, useContext, useMemo, useRef, useState, type RefObject } from "react";

interface PlayerContextValue {
  audioRef: RefObject<HTMLAudioElement | null>;
  currentTime: number;
  setCurrentTime: (value: number) => void;
  seekTo: (seconds: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const seekTo = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    if (audioRef.current) {
      audioRef.current.currentTime = safeSeconds;
    }
    setCurrentTime(safeSeconds);
  };

  const value = useMemo<PlayerContextValue>(
    () => ({
      audioRef,
      currentTime,
      setCurrentTime,
      seekTo,
    }),
    [currentTime],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }

  return context;
}
