import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ImageWithSkeleton } from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton.jsx";

export const WorkDetailsMashin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);

  const [isMainHovered, setIsMainHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);

  const tagsArray = Array.isArray(work.tags)
    ? work.tags
    : typeof work.tags === "string"
      ? JSON.parse(work.tags || "[]")
      : [];
  const formattedTags = tagsArray
    .map((t) => `#${t.startsWith("#") ? t.slice(1) : t}`)
    .join(" ");

  const mainContainerRef = useRef(null);

  // Имитация загрузки данных (замените на ваш API вызов)
  useEffect(() => {
    const fetchWork = async () => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "https://john-back-elenafl.amvera.io";
        const response = await fetch(`${apiUrl}/api/works/${id}`);
        const data = await response.json();
        setWork(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWork();
  }, [id]);

  const handleMouseMove = (e) => {
    if (!mainContainerRef.current) return;
    const rect = mainContainerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (!work)
    return <div className="text-center py-24 text-gray-400">Загрузка...</div>;

  return (
    <div className="pt-12 sm:pt-36 bg-transparent">
      <div className="sm:max-w-[858px] ml-auto mr-auto pl-4 pr-4 sm:pl-6 sm:pr-6 mb-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-[var(--accent)] hover:text-[#00809B] cursor-pointer flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors"
        >
          ← GO BACK
        </button>

        <h2 className="mb-4 sm:mb-6 text-[28px] sm:text-[38px] font-bold leading-tight tracking-tight text-[var(--text-h)]">
          {work.title}
        </h2>

        <div className="w-full sm:w-fit flex flex-wrap gap-4 items-center mb-8">
          <span className="px-3 py-1 bg-[#1A1A1A] rounded-3xl text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider flex items-center justify-center shrink-0">
            {work.date}
          </span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="text-[15px] sm:text-[17px] text-gray-400 font-medium tracking-wide">
            {formattedTags}
          </span>
        </div>

        {/* Секция медиа */}
        <div className="max-w-3xl mx-auto p-6 max-sm:p-0 mb-10 max-sm:mb-6">
          <div
            ref={mainContainerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsMainHovered(true)}
            onMouseLeave={() => setIsMainHovered(false)}
            className="relative w-full overflow-hidden cursor-none sm:cursor-auto"
          >
            {/* Условие: Видео на десктопе, Картинка на мобильном */}
            <div className="hidden sm:block">
              {work.detailVideoSrc ? (
                <video
                  src={work.detailVideoSrc}
                  autoPlay
                  muted={isMuted}
                  loop
                  className="w-full h-auto object-cover"
                />
              ) : (
                <ImageWithSkeleton src={work.img} alt={work.title} />
              )}
            </div>

            <div className="block sm:hidden">
              <ImageWithSkeleton src={work.img} alt={work.title} />
            </div>

            {/* Кастомный курсор-кубик (только на десктопе при наведении) */}
            {isMainHovered &&
              window.innerWidth >= 640 &&
              work.detailVideoSrc && (
                <div
                  className="absolute w-8 h-8 bg-white border border-black pointer-events-none z-50 mix-blend-difference"
                  style={{
                    left: `${mousePos.x - 16}px`,
                    top: `${mousePos.y - 16}px`,
                  }}
                />
              )}

            {/* Кнопка динамика */}
            {work.detailVideoSrc && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 z-50 bg-white/20 backdrop-blur-md text-white border border-white/30 p-3 rounded-full hover:bg-[#4B0082] transition-colors duration-300"
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            )}
          </div>
        </div>

        <div
          className="text-[18px] sm:text-[20px] leading-relaxed text-[#222222] mt-12"
          style={{ textAlign: "justify" }}
        >
          {work.description}
        </div>
      </div>
    </div>
  );
};
