import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";

export const AdminPosts = () => {
  const context = useOutletContext();
  const onLogout = context ? context.onLogout : () => window.location.reload();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Состояния для модального окна редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    img: "",
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Состояния для безопасного удаления без системного confirm/alert
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [actionError, setActionError] = useState("");

  // ИСПРАВЛЕНИЕ: динамический выбор адреса бэкенда на основе имени хоста.
  // Это полностью исключает предупреждения компилятора об "import.meta.env" в ES2015 
  // и гарантирует идеальное переключение между локальным тестированием и Amvera!
  const apiUrl = typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://john-back-elenafl.amvera.io";

  // Загрузка всех постов для админки
  const fetchAdminPosts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/posts`, {
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchAdminPosts();
  }, [apiUrl]);

  // Безопасное инициирование удаления
  const handleInitiateDelete = (id) => {
    setActionError("");
    setDeletingPostId(id);
  };

  // Подтверждение удаления
  const handleConfirmDelete = async () => {
    if (!deletingPostId) return;

    try {
      const response = await fetch(`${apiUrl}/api/posts/${deletingPostId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setPosts(posts.filter(post => post.id !== deletingPostId));
        setDeletingPostId(null);
      } else {
        setActionError(data.message || "Ошибка при удалении.");
      }
    } catch (err) {
      console.error("Ошибка запроса на удаление:", err);
      setActionError("Не удалось связаться с сервером.");
    }
  };

  // Шаг 1. Открытие модального окна и заполнение формы старыми данными поста
  const handleStartEdit = (post) => {
    console.log("📝 [Edit Mode] Инициализируем редактирование поста:", post);
    setEditingPost(post);
    setEditFormData({
      title: post.title,
      description: post.description,
      img: post.img || "",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
    });
    setSaveError("");
    setIsEditModalOpen(true);
  };

  // Шаг 2. Обработка ввода изменений в форму
  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Шаг 3. Отправка измененного поста на бэкенд (PUT)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");

    console.log("📡 [Edit Mode] Отправляем измененные данные на бэкенд...");

    if (!editFormData.title.trim() || !editFormData.description.trim()) {
      setSaveError("Заголовок и текст статьи обязательны для заполнения.");
      setIsSaving(false);
      return;
    }

    const tagsArray = editFormData.tags
      ? editFormData.tags.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    try {
      const response = await fetch(`${apiUrl}/api/posts/${editingPost.id || editingPost._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: editFormData.title.trim(),
          description: editFormData.description.trim(),
          img: editFormData.img.trim(),
          tags: tagsArray,
        }),
      });

      const data = await response.json();
      console.log("📥 [Edit Mode] Получен ответ от бэкенда:", data);

      if (response.ok && data.success) {
        console.log("✨ [Edit Mode] Пост успешно обновлен на сервере!");
        setIsEditModalOpen(false);
        setEditingPost(null);
        fetchAdminPosts();
      } else {
        setSaveError(data.message || "Ошибка при сохранении изменений на сервере.");
      }
    } catch (err) {
      console.error("❌ Критическая ошибка при отправке PUT запроса:", err);
      setSaveError("Не удалось соединиться с сервером. Проверьте сеть.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-xs text-gray-400 font-medium p-6">Загрузка списка публикаций...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>;

  return (
    <div className="max-w-[900px] mx-auto pt-4 relative px-4">
      <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-8">Все публикации</h2>

      {actionError && (
        <div className="p-3 mb-4 text-xs bg-red-50 text-red-600 border border-red-100 rounded-xl animate-fade-in">
          ⚠️ {actionError}
        </div>
      )}

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
                  
                  <td className="p-4 text-right pr-6 space-x-4 whitespace-nowrap">
                    {/* КНОПКА РЕДАКТИРОВАНИЯ */}
                    <button
                      onClick={() => handleStartEdit(post)}
                      className="text-xs text-yellow-600 hover:text-yellow-700 font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Редактировать 📝
                    </button>

                    {/* КНОПКА УДАЛЕНИЯ */}
                    <button
                      onClick={() => handleInitiateDelete(post.id || post._id)}
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

      {/* =========================================================================
          КРАСИВОЕ ДИАЛОГОВОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ (Вместо confirm)
          ========================================================================= */}
      {deletingPostId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-sm w-full p-6 animate-fade-in text-center">
            <span className="text-4xl mb-3 block">🗑️</span>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Удаление статьи</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              Вы уверены, что хотите безвозвратно удалить эту публикацию из базы данных? Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPostId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ВСПЛЫВАЮЩЕЕ ОКНО (MODAL) ДЛЯ БЕЗОПАСНОГО РЕДАКТИРОВАНИЯ СТАТЬИ
          ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">Редактирование публикации</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-[#1A1A1A] transition-colors text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {saveError && (
              <div className="p-3 mb-4 text-xs bg-red-50 text-red-600 border border-red-100 rounded-xl">
                ⚠️ {saveError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-5">
              {/* Поле Заголовка */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Заголовок статьи:
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-200/60 rounded-xl bg-white text-sm focus:outline-none focus:border-[#00809B] transition-colors"
                  placeholder="Введите заголовок"
                />
              </div>

              {/* Поле Картинки */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Ссылка на обложку (Image URL):
                </label>
                <input
                  type="text"
                  name="img"
                  value={editFormData.img}
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-200/60 rounded-xl bg-white text-sm focus:outline-none focus:border-[#00809B] transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Поле Тегов */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Теги (через запятую):
                </label>
                <input
                  type="text"
                  name="tags"
                  value={editFormData.tags}
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-200/60 rounded-xl bg-white text-sm focus:outline-none focus:border-[#00809B] transition-colors"
                  placeholder="Design, Tech, Future"
                />
              </div>

              {/* Поле Описания (Контента) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Текст публикации:
                </label>
                <textarea
                  name="description"
                  required
                  rows="10"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  className="w-full p-3 border border-gray-200/60 rounded-xl bg-white text-sm focus:outline-none focus:border-[#00809B] transition-colors resize-none whitespace-pre-wrap"
                  placeholder="Напишите вашу статью здесь..."
                />
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-center"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 text-white text-xs font-bold uppercase tracking-widest rounded-xl bg-[#1A1A1A] hover:bg-[#00809B] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-center"
                >
                  {isSaving ? "Сохранение..." : "Сохранить изменения 💾"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

