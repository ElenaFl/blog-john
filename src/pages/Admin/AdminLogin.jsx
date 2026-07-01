import { useState } from "react";

export const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      // ВАЖНО: credentials: "include" позволяет fetch-запросу принять httpOnly куку сессии от бэкенда!
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password.trim() }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(); // Переключаем Layout в режим авторизованного админа!
      } else {
        setError(data.message || "Неверный пароль администратора.");
      }
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      setError("Не удалось связаться с сервером. Проверьте сеть.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto p-6 sm:p-8 rounded-2xl border border-gray-200/40 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.02)] text-center animate-fade-in">
      <span className="text-3xl mb-3 inline-block">🔒</span>
      <h3 className="text-xl font-bold text-[#1A1A1A] mb-1 tracking-tight">
        Admin Access
      </h3>
      <p className="text-gray-400 text-xs mb-6">
        Введите пароль
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* ХАК ДОСТУПНОСТИ: Скрытое поле логина для браузера Chrome. 
            Оно полностью невидимо для людей, но убирает жёлтое предупреждение [DOM] из консоли!  -- что встроенные экранные дикторы для слабовидящих людей или менеджеры паролей не смогут правильно связать этот код доступа с конкретным пользователем (но у меня админка без логина, не нужно показывать текстовое поле для имени пользователя) */}
          <input
            type="text"
            name="username"
            value="admin" // скрытно даю имя --- admin
            readOnly
            autoComplete="username"
            style={{ display: "none" }}
          />
          
          <input
            type="password"
            required
            disabled={isLoading}
            /* атрибут autoComplete - запрет менеджерам паролей сохранять временный динамический код! */
            autoComplete="new-password"
            placeholder="Код доступа"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-200/60 rounded-xl bg-[#FBFBFA] text-[#222222] text-sm text-center focus:outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-100 rounded-xl animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{ backgroundColor: "#1A1A1A" }}
          className="w-full py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#00809B] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm disabled:bg-gray-400"
        >
          {isLoading ? "Проверка..." : "Войти в панель"}
        </button>
      </form>
    </div>
  );
};
