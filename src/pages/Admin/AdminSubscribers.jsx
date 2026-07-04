import { useState, useEffect, useCallback } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Загрузка списка подписчиков
  // Оборачиваем в useCallback, чтобы ссылка на функцию не менялась
  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setErrorText("");
    try {
      const response = await fetch(`${apiUrl}/api/admin/subscribers`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setSubscribers(data.subscribers || data);
      } else {
        throw new Error(data.message || "Не удалось загрузить подписчиков");
      }
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]); // Переменная apiUrl идет в зависимости

  // Удаление подписчика
  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого подписчика?"))
      return;

    try {
      const response = await fetch(`${apiUrl}/api/admin/subscribers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Мгновенно убираем из списка на экране
        setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
      } else {
        alert(data.message || "Ошибка при удалении");
      }
    } catch (error) {
      console.error("Ошибка запроса на удаление:", error);
      alert("Ошибка соединения с сервером");
    }
  };

  // Загружаем данные один раз при монтировании компонента
  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Управление подписками
        </h2>
        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          Всего: {subscribers.length}
        </span>
      </div>

      {errorText && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-lg text-sm">
          {errorText}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">
          Загрузка списка подписчиков...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Имя</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    {sub.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {sub.name}
                  </td>
                  <td className="px-6 py-4">{sub.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === "active"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {sub.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}

              {subscribers.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Список подписчиков пока пуст.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
