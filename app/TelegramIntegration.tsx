"use client";

import { useEffect } from "react";
import { useWorkout } from "./context/WorkoutContext";

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
        };
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            start_param?: string;
          };
        };
      };
    };
  }
}

interface TelegramIntegrationProps {
  onAuth: (user: { 
    first_name: string; 
    last_name?: string;
    id?: number;
  }) => void;
  onReady: () => void;
  onError: (error: Error) => void;
}

const TelegramIntegration = ({
  onAuth,
  onReady,
  onError,
}: TelegramIntegrationProps) => {
  const { setUserId } = useWorkout();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();

        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
          setUserId(user.id.toString());
          onAuth({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
          });
        } else {
          onError(new Error("User data not found"));
        }

        onReady();
      } catch (error) {
        onError(error instanceof Error ? error : new Error("Unknown error"));
      }
    };
    script.onerror = () => {
      onError(new Error("Failed to load Telegram Web App script"));
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onAuth, onReady, onError, setUserId]);

  return null;
};

export default TelegramIntegration;