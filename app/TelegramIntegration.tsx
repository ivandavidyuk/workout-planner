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
    // Проверяем, что мы находимся в браузере и Telegram WebApp доступен
    if (typeof window !== "undefined") {
      // Создаем глобальную функцию для обработки готовности WebApp
      window.Telegram = {
        WebApp: {
          ...window.Telegram?.WebApp,
          ready: () => {
            console.log("Telegram WebApp ready");
            onReady?.();
          },
        },
      };

      // После инициализации WebApp получаем данные пользователя
      const initTelegramWebApp = () => {
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
            
            // Выводим в консоль для отладки
            console.log("Telegram user data:", telegramUser);
          } else {
            console.log("No user data available");
            onError?.(new Error("Данные пользователя недоступны"));
          }
        } catch (error) {
          console.error("Error initializing Telegram WebApp:", error);
          onError?.(error instanceof Error ? error : new Error("Неизвестная ошибка"));
        }
      };

      // Запускаем инициализацию
      if (window.Telegram.WebApp) {
        initTelegramWebApp();
      }
    }
  }, [onAuth, onReady, onError]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        onLoad={() => {
          console.log("Telegram WebApp script loaded");
          try {
            if (window.Telegram?.WebApp) {
              const tg = window.Telegram.WebApp;
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
                onReady?.();
              }
            }
          } catch (error) {
            console.error("Error in Telegram WebApp script onLoad:", error);
            onError?.(error instanceof Error ? error : new Error("Неизвестная ошибка"));
          }
        }}
        onError={(error) => {
          console.error("Error loading Telegram WebApp script:", error);
          onError?.(new Error("Ошибка загрузки скрипта Telegram WebApp"));
        }}
      />
    </>
  );
}