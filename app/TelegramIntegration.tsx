"use client";

import { useEffect } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  photo_url: string;
  auth_date: number;
  hash: string;
}

export default function TelegramIntegration({ onAuth }: { onAuth: (user: TelegramUser) => void }) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tg = (window as any).Telegram.WebApp;

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
