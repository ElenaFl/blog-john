import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom"; // ИСПРАВЛЕНО: Импортировали Link

export const AdminPosts = () => {
  const context = useOutletContext();
  const onLogout = context ? context.onLogout : () => window.location.reload();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Загрузка всех постов для админки
  useEffect(() => {
    const fetchAdminPosts = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/admin/posts`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
          onLogout();
          return;
        }

        if (!response.ok) throw new Error("Не удалось загрузить список статей.");

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminPosts();
  }, [apiUrl]);

  // Функция удаления публикации
  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту публикацию?")) return;

    try {
      const response = await fetch(`${apiUrl}/api/admin/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Удаляем пост из локального состояния, чтобы таблица обновилась мгновенно
        setPosts(posts.filter(post => post.id !== id));
      } else {
        alert(data.message || "Ошибка при удалении.");
      }
    } catch (err) {
      console.error("Ошибка запроса на удаление:", err);
      alert("Не удалось связаться с сервером.");
    }
  };

  if (isLoading) return <div className="text-xs text-gray-400 font-medium">Загрузка списка публикаций...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>;

  return (
    <div className="max-w-[900px] mx-auto pt-4">
      <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-8">Все публикации</h2>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">У вас пока нет ни одного поста. Создайте первый!</p>
      ) : (
        <div className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#FBFBFA] border-b border-gray-200/60 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6">Дата</th>
                <th className="p-4">Заголовок</th>
                <th className="p-4 text-right pr-6">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#222222]">
              {posts.map((post) => (
                <tr key={post.id || post._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6 text-gray-400 whitespace-nowrap text-xs">
                    {post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "")}
                  </td>
                  
                  {/* ИСПРАВЛЕНО: Заголовок теперь обёрнут в Link. При клике статья откроется 
                      в новой вкладке (target="_blank"), сохраняя вашу панель админки нетронутой! */}
                  <td className="p-4 font-medium max-w-[400px] truncate">
                    <Link
                      to={`/post-details/${post.id || post._id}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[#00809B] transition-colors cursor-pointer"
                    >
                      {post.title}
                    </Link>
                  </td>
                  
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleDelete(post.id || post._id)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

