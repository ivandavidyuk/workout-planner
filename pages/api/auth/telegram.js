import { createHash, createHmac } from "crypto";

export default function handler(req, res) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const { hash, ...data } = req.query;
  const secret = createHash("sha256").update(TELEGRAM_BOT_TOKEN).digest();
  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");
  const hmac = createHmac("sha256", secret).update(checkString).digest("hex");

  if (hmac === hash) {
    // Данные подлинны, можно обработать их
    console.log("Authenticated user:", data);
    // Сохраните данные пользователя в базе данных или выполните другие действия
    res.redirect("/"); // Перенаправьте пользователя обратно в приложение
  } else {
    // Данные недействительны
    res.status(403).send("Forbidden");
  }
}