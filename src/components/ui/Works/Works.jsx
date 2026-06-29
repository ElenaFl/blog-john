import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../Card/Card.jsx";

/**
 * Компонент Works - секция работ с фильтрацией и автосохранением звука
 */
export const Works = () => {
  const [works, setWorks] = useState([]);

  // 0.Стейт для определения мобильной версии
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 640px — это стандартный брейкпоинт 'sm' в Tailwind
      setIsMobile(window.innerWidth < 640);
    };

    handleResize(); // Проверка при первой загрузке
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Стейт для фильтра по тегам (по умолчанию "All")
  const [selectedTag, setSelectedTag] = useState("All");

  // 2. Инициализируем звук из localStorage (если пусто — по умолчанию true/выключен)
  const [globalMuted, setGlobalMuted] = useState(() => {
    const savedMuteStatus = localStorage.getItem("video_muted");
    return savedMuteStatus ? JSON.parse(savedMuteStatus) : true;
  });

  const navigate = useNavigate();

  // 3. Записываем изменения звука в память браузера при каждом переключении
  useEffect(() => {
    localStorage.setItem("video_muted", JSON.stringify(globalMuted));
  }, [globalMuted]);

  const toggleMute = () => {
    setGlobalMuted((prev) => !prev);
  };

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/api/posts`);
        if (!response.ok) {
          throw new Error("Ошибка загрузки данных");
        }
        const data = await response.json();
        setWorks(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchWorks();
  }, []);

  // 4. Сбор тегов будет происходить только тогда, когда реально изменится массив works
  const allTags = useMemo(() => {
    return ["All", ...new Set(works.flatMap((work) => work.tags || []))];
  }, [works]);

  // 5. Фильтрация будет срабатывать только при смене тега или обновлении списка работ
  const filteredWorks = useMemo(() => {
    return selectedTag === "All"
      ? works
      : works.filter((work) => work.tags && work.tags.includes(selectedTag));
  }, [selectedTag, works]);

  // 6. Массив для рендеринга зависит от мобильного стейта и отфильтрованных работ
  const displayedWorks = useMemo(() => {
    return isMobile ? filteredWorks.slice(0, 1) : filteredWorks.slice(0, 3);
  }, [isMobile, filteredWorks]);

  return (
    <section id="works" className="pt-6 sm:pt-8 bg-transparent">
      <div className="mx-auto px-4 sm:max-w-[858px]">
        {/* СМЯГЧЕНО: Заголовок теперь берет мягкий глубокий уголь var(--text-h) */}
        <h3 className="mb-6 sm:mb-8 text-lg text-center sm:text-left sm:text-2xl font-bold tracking-tight text-[var(--text-h)]">
          Featured works
        </h3>

        {/* =========================================================
                                  КНОПОКИ-ТЕГИ
            ========================================================= */}
        {works.length > 0 && !isMobile && (
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-10">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer border ${
                  selectedTag === tag
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_4px_15px_rgba(0,168,204,0.15)] hover:bg-[#00809B] hover:border-[#00809B]"
                    : "bg-[#FBFBFA] text-gray-400 border-gray-200/50 hover:text-[#1A1A1A] hover:border-gray-300/80"
                }`}
              >
                {tag === "All" ? "All Projects" : `${tag.toLowerCase()}`}
              </button>
            ))}
          </div>
        )}

        {/* 7. Список карточек */}
        <div className="flex flex-col gap-6">
          {displayedWorks &&
            displayedWorks.map((work, index) => (
              <div key={work.id || index} className="animate-fade-in">
                <Card
                  data={work}
                  variant="work"
                  onOpenDetails={() => navigate(`/work-details/${work.id}`)}
                  isMuted={globalMuted}
                  onToggleMute={toggleMute}
                />
              </div>
            ))}
        </div>

        {/* 8. Сообщение, если по выбранному тегу ничего не найдено */}
        {displayedWorks.length === 0 && works.length > 0 && (
          <p className="text-gray-400 text-center py-12 text-sm">No projects found for this tag.</p>
        )}
      </div>
    </section>
  );
};