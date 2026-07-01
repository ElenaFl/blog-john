import { useState, useEffect, useRef } from "react";

export const SubscribeForm = ({ isOpen, setIsExpanded }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const timeoutRef = useRef(null);

  // Инициализация анимации через localStorage
  const [shouldAnimate] = useState(() => {
    if (typeof window === "undefined") return false;
    const hasSeenWidget = localStorage.getItem("has_seen_subscribe_widget");
    if (!hasSeenWidget) {
      localStorage.setItem("has_seen_subscribe_widget", "true");
      return true;
    }
    return false;
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (status === "loading") return;

    setErrorText("");
    setSuccessText("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setErrorText("Пожалуйста, заполните все поля");
      return;
    }

    // Валидация
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]{2,30}$/.test(cleanName)) {
      setErrorText("Имя должно содержать от 2 до 30 букв");
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      setErrorText("Введите корректный email");
      return;
    }

    setStatus("loading");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, email: cleanEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка подписки");

      setStatus("success");
      setSuccessText(data.message || "Вы успешно подписались!");
      setName("");
      setEmail("");

      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
        setStatus("");
      }, 4000);
    } catch (error) {
      setErrorText(error.message || "Ошибка соединения");
      setStatus("error");
    }
  };

  return (
    <div className="fixed left-0 top-[50%] -translate-y-1/2 z-[9999] select-none">
      {isOpen ? (
        <div className="w-[320px] max-xs:w-[280px] p-6 rounded-r-2xl border-y border-r border-gray-100/70 shadow-[15px_0_40px_rgba(0,0,0,0.05)] animate-slide-right relative bg-[#FBFBFA] text-[#222222]">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setErrorText(""); // ИСПРАВЛЕНО: стираем ошибку при закрытии
              setSuccessText(""); // ИСПРАВЛЕНО: стираем текст успеха
              setEmail(""); // На всякий случай очищаем поле ввода
              setName(""); // На всякий случай очищаем поле ввода
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-[#1A1A1A] transition-colors text-xs cursor-pointer"
          >
            ✕
          </button>

          <h4 className="text-base font-bold text-[#1A1A1A] mb-1 tracking-tight">
            Subscribe ✨
          </h4>
          <p className="text-gray-400 text-[11px] mb-4 leading-normal">
            Получайте уведомления о новых публикациях дизайнера на почту
          </p>

          {status === "success" ? (
            <div className="p-4 bg-green-50/60 text-green-800 border border-green-100 rounded-lg text-xs font-medium text-center animate-fade-in">
              🎉 {successText}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="text"
                required
                disabled={status === "loading"}
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-gray-200/80 rounded-lg bg-white text-[#222222] text-xs focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
              <input
                type="email"
                required
                disabled={status === "loading"}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-gray-200/80 rounded-lg bg-white text-[#222222] text-xs focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
              {errorText && (
                <p className="text-[10px] text-red-500 font-medium px-1">
                  ⚠️ {errorText}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-2.5 bg-[#00A8CC] hover:bg-[#00809B] text-white font-medium text-xs rounded-lg transition-all duration-300 cursor-pointer disabled:bg-gray-400"
              >
                {status === "loading" ? "Отправка..." : "Подписаться"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={`hidden min-[1127px]:flex items-center gap-2 pl-3 pr-4 py-2.5 text-white rounded-r-xl shadow-[4px_0_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:pl-4 group cursor-pointer bg-[#222222] ${shouldAnimate ? "animate-slide-right" : ""}`}
        >
          <span className="text-sm inline-block animate-bounce-horizontal">
            ✉️
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase">
            Newsletter
          </span>
        </button>
      )}
    </div>
  );
};
