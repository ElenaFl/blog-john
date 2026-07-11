import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const PostDetails = () => {
  const [post, setPost] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "https://john-back-elenafl.amvera.io";
        const response = await fetch(`${apiUrl}/api/posts/${id}`);
        if (!response.ok) {
          throw new Error("Ошибка загрузки");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchPost();
  }, [id]);

  if (!post)
    return (
      <div className="text-center py-20 text-gray-400 text-sm">
        Загрузка статьи...
      </div>
    );

  return (
    <div className="pt-12 sm:pt-36 bg-transparent">
      <div className="sm:max-w-[858px] ml-auto mr-auto pl-4 pr-4 sm:pl-6 sm:pr-6 mb-12">
        {/* Кнопка возврата на страницу блога */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-[var(--accent)] hover:text-[#00809B] cursor-pointer flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors"
        >
          ← GO BACK
        </button>

        {/* Заголовок статьи */}
        <h2 className="mb-4 sm:mb-6 text-3xl sm:text-[44px] font-bold leading-tight text-[var(--text-h)]">
          {post.title}
        </h2>

        {/* Блок метаданных (Дата и Теги) */}
        <div className="w-full sm:w-fit flex flex-wrap gap-4 items-center mb-8 text-gray-400">
          <span className="font-medium">{post.date}</span>
          <span className="hidden sm:inline">|</span>
          <span className="font-medium">
            {post.tags &&
              post.tags.map((tag, index) => <span key={index}>{tag} </span>)}
          </span>
        </div>
        {/* ===================================================================
            ИСПРАВЛЕНИЕ: Выводим текст напрямую. Класс whitespace-pre-line сам 
            сделает всю работу по отображению абзацев и пустых строк!
            =============================================================== */}
        <div
          style={{ textAlign: "justify" }}
          className="whitespace-pre-line text-base sm:text-[17px] leading-relaxed opacity-95 custom-article-container custom-paragraph text-justify"
        >
          {post.description}
        </div>
      </div>
    </div>
  );
};
