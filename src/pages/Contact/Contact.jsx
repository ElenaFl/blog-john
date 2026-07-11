import { useState } from "react";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Поле-ловушка для спам-ботов (Honeypot)
  const [honeypot, setHoneypot] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // --- ОТЛАДОЧНЫЕ ЛОГИ ---
    console.log("🚀 [Contact] Запущена отправка формы...");
    console.log("📋 Данные полей:", {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim()
    });
    console.log("🍯 Значение honeypot (fax_hp):", `"${honeypot}"`);

    // 1. ЗАЩИТА ОТ СПАМА: Если скрытое поле заполнено — это бот. Блокируем отправку.
    if (honeypot.trim() !== "") {
      console.warn("🚨 [Contact] Сработал Honeypot! Отправка заблокирована на клиенте.");
      setErrorMsg("Spam protection triggered. Please refresh and try again without autofilling hidden fields.");
      return;
    }

    // 2. ВАЛИДАЦИЯ ИМЕНИ: Запрещаем цифры и спецсимволы, только буквы и пробелы
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/;
    if (!nameRegex.test(formData.name.trim())) {
      console.warn("⚠️ [Contact] Имя не прошло валидацию регулярным выражением.");
      setErrorMsg("Name can only contain letters, spaces, or hyphens.");
      return;
    }

    // 3. ВАЛИДАЦИЯ ПУСТЫХ СТРОК И МИНИМАЛЬНОЙ ДЛИНЫ
    if (formData.name.trim().length < 2) {
      console.warn("⚠️ [Contact] Имя слишком короткое (меньше 2 символов).");
      setErrorMsg("Name must be at least 2 characters long.");
      return;
    }

    if (formData.message.trim().length < 5) {
      console.warn("⚠️ [Contact] Сообщение слишком короткое (меньше 5 символов).");
      setErrorMsg("Message must be at least 5 characters long.");
      return;
    }

    setIsSending(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://john-back-elenafl.amvera.io";
      const requestUrl = `${apiUrl}/api/contact`;

      console.log(`📡 [Contact] Отправка fetch-запроса на адрес: ${requestUrl}`);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          fax_hp: honeypot, // отправляем новое поле honeypot
        }),
      });

      console.log(`📥 [Contact] Получен ответ от сервера. Статус HTTP: ${response.status} (${response.statusText})`);

      const data = await response.json();
      console.log("📦 [Contact] Распакованный JSON-ответ:", data);

      if (response.ok && data.success) {
        console.log("✨ [Contact] Успешно отправлено!");
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        console.error("❌ [Contact] Сервер вернул ошибку выполнения:", data.message);
        setErrorMsg(data.message || "Error sending message from server.");
      }
    } catch (error) {
      console.error("💥 [Contact] Критическая сетевая ошибка fetch-запроса:", error);
      setErrorMsg(
        "Failed to connect to the server. Please check your connection.",
      );
    } finally {
      setIsSending(false);
      console.log("🏁 [Contact] Обработка цикла отправки завершена.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="sm:max-w-[858px] ml-auto mr-auto pt-6 sm:pt-36 pl-4 pr-4  mb-6 sm:mb-8">
      <h2 className="mt-3 sm:mt-[18px] text-3xl sm:text-[44px] font-bold mb-4">
        Contact
      </h2>

      <div className="flex flex-col md:flex-row gap-10 md:gap-16 border-t border-gray-200/40 pt-8">
        {/* Левая колонка: Контакты */}
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-2">
              Get in touch
            </h3>
            <p className="text-xl sm:text-2xl text-[var(--text-h)] font-semibold tracking-tight">
              n.a.092024@yandex.ru
            </p>
          </div>
        </div>

        {/* Правая колонка: Форма связи */}
        <div
          style={{ backgroundColor: "#FBFBFA" }}
          className="flex-[1.5] p-6 sm:p-8 rounded-2xl border border-gray-200/40 shadow-[0_4px_25px_rgba(0,0,0,0.02)]"
        >
          {submitted ? (
            <div className="h-full flex flex-col justify-center items-center text-center py-12 animate-fade-in">
              <span className="text-4xl mb-3">🎉</span>
              <h4 className="text-xl font-bold text-[var(--text-h)] mb-1">
                Thank you!
              </h4>
              <p className="text-gray-400 text-sm">
                Your message has been sent successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Блок ошибок валидации */}
              {errorMsg && (
                <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-100 rounded-xl animate-fade-in">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Имя */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Your name:
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200/60 rounded-xl bg-white text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text-h)] transition-colors"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Your email:
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200/60 rounded-xl bg-white text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text-h)] transition-colors"
                  placeholder="your@mail.com"
                />
              </div>

              {/* Сообщение */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Your message:
                </label>
                <textarea
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200/60 rounded-xl bg-white text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text-h)] transition-colors resize-none"
                  placeholder="message here..."
                />
              </div>

              {/* ХОНЕЙПОТ (ЛОВУШКА ДЛЯ БОТОВ)
                  Используем autoComplete="new-password", чтобы полностью отключить автозаполнение браузером Яндекса/Chrome. */}
              <div className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden -z-50">
                <input
                  type="text"
                  name="fax_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex="-1"
                  autoComplete="new-password"
                />
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={isSending}
                style={{ backgroundColor: isSending ? "#666" : "#1A1A1A" }}
                className="w-full py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#00809B] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:hover:bg-[#666] disabled:hover:scale-100"
              >
                {isSending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};