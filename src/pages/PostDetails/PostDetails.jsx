import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const PostDetails = () => {
  const [post, setPost] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}`);
        if (!response.ok) {
          throw Error("Ошибка загрузки");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchPost();
  }, [id]);

  if (!post) return <div className="text-center py-20 text-gray-400 text-sm">Загрузка статьи...</div>;

  return (
    <div className="pt-12 sm:pt-36 bg-transparent">
      <div className="sm:max-w-[858px] ml-auto mr-auto pl-4 pr-4 sm:pl-6 sm:pr-6 mb-12"> 
        
        {/* Кнопка возврата на страницу блога */}
        <button
          onClick={() => navigate(-1)} 
          className="mb-8 text-[var(--accent)] hover:text-[#00809B] cursor-pointer flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors"
        >
          ← go back
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
              post.tags.map((tag, index) => (
                <span key={index}>
                  {tag}{" "}
                </span>
              ))}
          </span>
        </div>

        {/* =========================================================
                        ВЫВОД АБЗАЦЕВ
            ========================================================= */}
        <div className="text-base sm:text-[17px] leading-relaxed opacity-95 custom-article-container">
          {post.description && post.description.split("\n").map((paragraph, index) => {
            // Если строчка пустая (после двойного переноса \n\n), пропускаем её, чтобы не плодить пустые места
            if (!paragraph.trim()) return null;
            
            return (
              <p 
                key={index} 
                style={{ textAlign: "justify" }} 
                className="custom-paragraph"
              >
                {paragraph}
              </p>
            );
          })}
        </div>

      </div>
    </div>
  );
};

