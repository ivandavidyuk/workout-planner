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

export default function TelegramIntegration({ onAuth }: { onAuth: (user: TelegramUser) => void }) {
  useEffect(() => {
    // Проверяем, что мы находимся в браузере и Telegram WebApp доступен
    if (typeof window !== "undefined") {
      // Создаем глобальную функцию для обработки готовности WebApp
      window.Telegram = {
        WebApp: {
          ...window.Telegram?.WebApp,
          ready: () => {
            console.log("Telegram WebApp ready");
          },
        },
      };

      // После инициализации WebApp получаем данные пользователя
      const initTelegramWebApp = () => {
        const tg = window.Telegram.WebApp;
        
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
          
          // Выводим в консоль для отладки
          console.log("Telegram user data:", telegramUser);
        } else {
          console.log("No user data available");
        }
      };

      // Запускаем инициализацию
      if (window.Telegram.WebApp) {
        initTelegramWebApp();
      }
    }
  }, [onAuth]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        onLoad={() => {
          console.log("Telegram WebApp script loaded");
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
            }
          }
        }}
      />
    </>
  );
}