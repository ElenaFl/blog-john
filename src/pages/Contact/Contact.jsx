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

    // 1. ЗАЩИТА ОТ СПАМА: Если скрытое поле заполнено — это бот. Блокируем отправку.

    if (honeypot.trim() !== "") {
      console.warn("Spam bot detected!");

      return;
    }

    // 2. ВАЛИДАЦИЯ ИМЕНИ: Запрещаем цифры и спецсимволы, только буквы и пробелы

    const nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/;

    if (!nameRegex.test(formData.name.trim())) {
      setErrorMsg("Name can only contain letters, spaces, or hyphens.");

      return;
    }

    // 3. ВАЛИДАЦИЯ ПУСТЫХ СТРОК

    if (formData.name.trim().length < 2) {
      setErrorMsg("Name must be at least 2 characters long.");

      return;
    }

    if (formData.message.trim().length < 5) {
      setErrorMsg("Message must be at least 5 characters long.");

      return;
    }

    setIsSending(true);

    try {
      // ИСПРАВЛЕНО: Адрес берется динамически из .env (VITE_API_URL) вместо хардкода localhost

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // Внутри Contact.jsx в функции handleSubmit:
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          username_hp: honeypot, // ДОБАВЬТЕ ЭТУ СТРОКУ
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);

        setFormData({ name: "", email: "", message: "" });

        setTimeout(() => setSubmitted(false), 4000);
      } else {
        setErrorMsg(data.message || "Error sending message from server.");
      }
    } catch (error) {
      console.error("Network error:", error);

      setErrorMsg(
        "Failed to connect to the server. Please check your connection.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="sm:max-w-[858px] ml-auto mr-auto pt-6 sm:pt-36 pl-4 pr-4  mb-6 sm:mb-8">
      <h2 className="mt-3 sm:mt-[18px] text-3xl sm:text-[44px] text-black font-bold mb-4">
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
              {" "}
              {/* ХОНЕЙПОТ (ЛОВУШКА ДЛЯ БОТОВ): Полностью скрыт от людей через opacity-0 и абсолютное сжатие.

                  Обычный пользователь его не увидит, а бот заполнит и выдаст себя! */}
              <div className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden -z-50">
                <input
                  type="text"
                  name="username_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>
              {/* Блок ошибок валидации */}
              {errorMsg && (
                <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-100 rounded-xl animate-fade-in">
                  ⚠️ {errorMsg}
                </div>
              )}
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
              <button
                type="submit"
                disabled={isSending} // Отключаем кнопку во время отправки запроса
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
