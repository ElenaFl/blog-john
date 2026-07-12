import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithSkeleton } from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton.jsx";

// Принимаем { work } как пропс от диспетчера
export const WorkDetailsMashin = ({ work }) => {
  const navigate = useNavigate();

  const [isMainHovered, setIsMainHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);

  const mainContainerRef = useRef(null);

  // Обработка тегов (теперь безопасно внутри компонента)
  const tagsArray = Array.isArray(work?.tags)
    ? work.tags
    : typeof work?.tags === "string"
      ? JSON.parse(work.tags || "[]")
      : [];

  const formattedTags = tagsArray
    .map((t) => `#${t.startsWith("#") ? t.slice(1) : t}`)
    .join(" ");

  const handleMouseMove = (e) => {
    if (!mainContainerRef.current) return;
    const rect = mainContainerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Если вдруг пришел пустой объект
  if (!work)
    return (
      <div className="text-center py-24 text-gray-400">
        Данные отсутствуют...
      </div>
    );

  return (
    <div className="pt-12 sm:pt-36 bg-[#FBFBFA] min-h-screen">
      <div className="sm:max-w-[858px] mx-auto px-4 sm:px-6 mb-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-[#1A1A1A] font-bold uppercase text-[11px] tracking-widest hover:text-[#00809B] transition-colors"
        >
          ← НАЗАД
        </button>

        <h2 className="mb-6 text-[32px] sm:text-[48px] font-bold leading-tight tracking-tighter text-[#1A1A1A]">
          {work.title}
        </h2>

        {/* Секция медиа */}
        <div
          ref={mainContainerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsMainHovered(true)}
          onMouseLeave={() => setIsMainHovered(false)}
          className="relative w-full overflow-hidden cursor-none sm:cursor-auto rounded-xl bg-gray-100"
        >
          <div className="hidden sm:block">
            {work.detailVideoSrc ? (
              <video
                src={work.detailVideoSrc}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-auto object-cover"
              />
            ) : (
              <ImageWithSkeleton
                src={work.img}
                alt={work.title}
                className="w-full h-auto"
              />
            )}
          </div>

          <div className="block sm:hidden">
            <ImageWithSkeleton
              src={work.img}
              alt={work.title}
              className="w-full h-auto"
            />
          </div>

          {/* Кастомный курсор-кубик */}
          {isMainHovered && window.innerWidth >= 640 && work.detailVideoSrc && (
            <div
              className="absolute w-10 h-10 border border-white bg-black/30 backdrop-blur-sm pointer-events-none z-50 flex items-center justify-center transition-transform duration-75"
              style={{
                left: `${mousePos.x - 20}px`,
                top: `${mousePos.y - 20}px`,
              }}
            >
              <div className="w-2 h-2 bg-white animate-pulse" />
            </div>
          )}

          {/* Кнопка динамика */}
          {work.detailVideoSrc && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-4 right-4 z-50 bg-black/50 backdrop-blur-md text-white border border-white/20 p-3 rounded-full hover:bg-[#00809B] transition-colors"
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          )}
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
