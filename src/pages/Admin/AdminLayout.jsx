import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AdminLogin } from "./AdminLogin.jsx";

export const AdminLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Фоновая проверка сессии на сервере через httpOnly куки
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/admin/check`, { // Используем apiUrl
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        
        // Сверяем строго с тем, что возвращает бэкенд (data.authorized)
        if (data.success && data.authorized) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Ошибка проверки сессии:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [apiUrl]);

  // Функция безопасного выхода со стиранием куки
  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    } finally {
      setIsAuthenticated(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[700px] bg-[#FBFBFA] flex items-center justify-center text-xs text-gray-400 font-medium">
        Проверка безопасности...
      </div>
    );
  }

  // СЦЕНАРИЙ 1: Если админ НЕ авторизован — только форма входа
  if (!isAuthenticated) {
    return (
      <div className="mt-44 bg-[#FBFBFA] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[420px]">
          <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
        </div>
      </div>
    );
  }

  // СЦЕНАРИЙ 2: Если авторизация успешна — разворачивается боковое меню и контент
  return (
    <div className="flex bg-[#FBFBFA] animate-fade-in">
      {/* Боковое меню */}
      <aside className="min-h-[92vh] w-64 border-r border-gray-200 p-6 bg-white shrink-0 flex flex-col justify-between">
        <div>
          <h1 className="font-bold mb-8 text-base text-[#1A1A1A] tracking-tight">
            Панель управления
          </h1>
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <Link
              to="/admin/posts"
              className="text-gray-500 hover:text-[#1A1A1A] transition-colors"
            >
              Список постов
            </Link>
            <Link
              to="/admin/create"
              className="text-gray-500 hover:text-[#1A1A1A] transition-colors"
            >
              Создать пост
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-4 text-red-500 border-t border-gray-200/50">
          <button onClick={handleLogout} className="cursor-pointer hover:text-red-700 transition-colors">
            Выйти из системы
          </button>
        </div>
      </aside>

      {/* Контентная часть */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet context={{ onLogout: handleLogout }} />
      </div>
    </div>
  );
};
