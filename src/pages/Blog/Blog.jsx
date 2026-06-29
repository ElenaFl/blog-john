import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card/Card.jsx";
import { SubscribeForm } from "../../components/ui/SubscribeForm/SubscribeForm.jsx";

export const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1126 : false
  );

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1126);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/posts`);
        if (!response.ok) throw new Error("Ошибка загрузки данных");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Ошибка при получении постов:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="mx-auto px-4 py-8 sm:max-w-[858px] relative">
      {/* ХЕДЕР БЛОГА */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
          Blog
        </h1>

        <button
          type="button"
          onClick={() => setIsSubscribeOpen(true)}
          className="min-[1127px]:hidden flex items-center justify-center w-9 h-9 rounded-full bg-[#222222] text-white shadow-md active:scale-95 transition-transform cursor-pointer"
          title="Подписаться"
        >
          ✉️
        </button>
      </div>

      {/* Список постов */}
      <div className="space-y-2">
        {posts.map((post, index) => (
          <Card
            key={post.id || index}
            data={post}
            variant="postBlog"
            onOpenDetails={() => navigate(`/post-details/${post.id}`)}
          />
        ))}
      </div>

      {/* Виджет подписки */}
      <SubscribeForm
        isOpen={isSubscribeOpen}
        setIsExpanded={setIsSubscribeOpen}
      />
    </div>
  );
};
