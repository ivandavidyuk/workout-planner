interface TelegramWebApp {
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
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};
