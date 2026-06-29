import { useState } from "react";

export const AdminForm = () => {
  const [postData, setPostData] = useState({
    title: "",
    img: "/images/post1.webp",
    tags: "#react",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formattedDate = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const tagsArray = postData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Автоматически прикрепляет защищенную куку сессии
        body: JSON.stringify({
          ...postData,
          date: formattedDate,
          tags: tagsArray,
        }),
      });

      const data = await response.json();

      // Если сессия истекла на сервере, просто обновляем страницу
      // Router или AdminLayout увидят отсутствие куки и сами покажут окно логина
      if (response.status === 401 || response.status === 403) {
        window.location.reload();
        return;
      }

      if (!response.ok)
        throw new Error(data.message || "Не удалось сохранить пост");

      setShowSuccessModal(true);
      setPostData({
        title: "",
        img: "/images/post1.webp",
        tags: "#react, #interface",
        description: "",
      });
      setTimeout(() => setShowSuccessModal(false), 4000);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-[#FBFBFA]">
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#FBFBFA]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white p-8 max-w-md w-full text-center rounded-2xl border border-gray-200 shadow-xl">
            <div className="text-4xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              Опубликовано!
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Ваш post успешно отправлен.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[650px] mx-auto pt-4 px-4">
        <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight mb-8">
          Новая публикация
        </h2>

        <form onSubmit={handlePostSubmit} className="space-y-5">
          <input
            type="text"
            required
            placeholder="Заголовок статьи"
            value={postData.title}
            onChange={(e) =>
              setPostData({ ...postData, title: e.target.value })
            }
            className="w-full p-3 border border-gray-200 rounded-xl bg-white text-[#222222] focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Путь к картинке"
              value={postData.img}
              onChange={(e) =>
                setPostData({ ...postData, img: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-xl bg-white text-[#222222] focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm"
            />
            <input
              type="text"
              required
              placeholder="Теги (через запятую)"
              value={postData.tags}
              onChange={(e) =>
                setPostData({ ...postData, tags: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-xl bg-white text-[#222222] focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm"
            />
          </div>

          <textarea
            required
            rows="10"
            placeholder="Текст публикации..."
            value={postData.description}
            onChange={(e) =>
              setPostData({ ...postData, description: e.target.value })
            }
            className="w-full p-3 border border-gray-200 rounded-xl bg-white text-[#222222] focus:outline-none focus:border-[#1A1A1A] resize-none transition-colors text-sm"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#00809B] transition-all cursor-pointer disabled:bg-gray-400"
          >
            {isSubmitting ? "Публикация..." : "Опубликовать пост"}
          </button>

          {errorMessage && (
            <div className="p-4 text-center text-sm font-medium bg-red-50 text-red-600 border border-red-100 rounded-xl">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
