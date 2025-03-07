"use client";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  photo_url: string;
  auth_date: number;
  hash: string;
}

import { useEffect } from "react";

export default function TelegramIntegration({ onAuth }: { onAuth: (user: TelegramUser) => void }) {
  useEffect(() => {
    interface Telegram {
      WebApp: {
        ready: () => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name: string;
            username: string;
            photo_url: string;
          };
        };
        initData: string;
      };
    }

    if (typeof window !== "undefined" && (window as unknown as { Telegram: Telegram }).Telegram?.WebApp) {
      const tg = (window as unknown as { Telegram: Telegram }).Telegram.WebApp;

      tg.ready();

      const user = tg.initDataUnsafe?.user;
      if (user) {
        const telegramUser = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: Date.now(),
          hash: tg.initData,
        };
        localStorage.setItem("telegramUser", JSON.stringify(telegramUser));
        onAuth(telegramUser);
      }
    }
  }, [onAuth]);

  return null;
}
