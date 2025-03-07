import { useEffect } from "react";

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  photo_url: string;
  auth_date: number;
  hash: string;
}

const TelegramLogin = ({ onAuth }: { onAuth: (user: TelegramUser) => void }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?19";
    script.async = true;
    script.setAttribute("data-telegram-login", "training_mini_app_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", "https://workout-planner-mocha.vercel.app/api/auth/telegram");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    document.getElementById("telegram-login")?.appendChild(script);

    window.onTelegramAuth = (user: TelegramUser) => {
      localStorage.setItem("telegramUser", JSON.stringify(user));
      onAuth(user);
    };
  }, [onAuth]);

  return <div id="telegram-login"></div>;
};

export default TelegramLogin;