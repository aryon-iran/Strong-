import { init } from "./ui.js";
try { init(); } catch (e) { console.error(e); document.body.insertAdjacentHTML("afterbegin", '<p style="background:#8b2e22;color:#fff;padding:8px">بازی بارگذاری نشد. اگر فایل را با file:// باز کرده‌اید، آن را با یک سرور محلی اجرا کنید (راهنما: README.md).</p>'); }
