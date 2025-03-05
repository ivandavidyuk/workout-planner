"use client";

import { useEffect } from "react";

export default function TelegramIntegration() {
  useEffect(() => {
    // Проверяем, доступен ли объект Telegram в браузере
    if (typeof window !== "undefined" && (window).Telegram?.WebApp) {
      const tg = (window).Telegram.WebApp;
      
      // Разворачиваем WebApp
      tg.expand();

      // Настраиваем MainButton (по желанию)
      tg.MainButton.text = "Сохранить тренировку";
      tg.MainButton.show();

      tg.MainButton.onClick(() => {
        // Обработка нажатия на MainButton
        // Например, отправить результаты на сервер
        alert("Тренировка сохранена!");
      });
    }
  }, []);

  return null; // Компонент ничего не рендерит, просто конфигурирует WebApp
}
