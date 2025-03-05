import type { TelegramWebApp } from "telegram-webapps-types";

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};
