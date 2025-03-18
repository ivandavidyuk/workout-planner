"use client";

import { useEffect } from "react";
import Script from "next/script";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  photo_url: string;
  auth_date: number;
  hash: string;
}

interface TelegramIntegrationProps {
  onAuth: (user: TelegramUser) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export default function TelegramIntegration({ onAuth, onReady, onError }: TelegramIntegrationProps) {
  useEffect(() => {
    // Проверяем, что мы находимся в браузере
    if (typeof window === "undefined") return;

    // Проверяем, есть ли уже сохраненные данные пользователя
    const storedUser = localStorage.getItem("telegramUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        onAuth(user);
        onReady?.();
        return;
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("telegramUser");
      }
    }

    // Если Telegram WebApp уже доступен, инициализируем его
    if (window.Telegram?.WebApp) {
      initializeTelegramWebApp();
    }
  }, [onAuth, onReady, onError]);

  const initializeTelegramWebApp = () => {
    try {
      const tg = window.Telegram.WebApp;
      
      if (!tg) {
        throw new Error("Telegram WebApp не инициализирован");
      }
      
      // Сообщаем WebApp, что мы готовы принимать данные
      tg.ready();
      
      // Получаем данные пользователя
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
        
        // Сохраняем данные пользователя
        localStorage.setItem("telegramUser", JSON.stringify(telegramUser));
        onAuth(telegramUser);
        onReady?.();
        
        console.log("Telegram user data:", telegramUser);
      } else {
        console.log("No user data available in Telegram WebApp");
        // Не вызываем onError, так как это может быть нормальной ситуацией
        // при запуске в обычном браузере
      }
    } catch (error) {
      console.error("Error initializing Telegram WebApp:", error);
      onError?.(error instanceof Error ? error : new Error("Неизвестная ошибка"));
    }
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        onLoad={() => {
          console.log("Telegram WebApp script loaded");
          initializeTelegramWebApp();
        }}
        onError={(error) => {
          console.error("Error loading Telegram WebApp script:", error);
          onError?.(new Error("Ошибка загрузки скрипта Telegram WebApp"));
        }}
      />
    </>
  );
}