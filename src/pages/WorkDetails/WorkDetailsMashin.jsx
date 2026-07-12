import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ImageWithSkeleton } from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton.jsx";

export const WorkDetailsMashin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  
  // Состояния для курсора и видео
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);
  const mainContainerRef = useRef(null);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://john-back-elenafl.amvera.io";
        const response = await fetch(`${apiUrl}/api/works/${id}`);
        const data = await response.json();
        setWork(data);
      } catch (err) { console.error("Ошибка загрузки:", err); }
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

  if (!work) return <div className="text-center py-24 text-gray-400">Загрузка...</div>;

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

        {/* Контейнер медиа */}
        <div 
          ref={mainContainerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsMainHovered(true)}
          onMouseLeave={() => setIsMainHovered(false)}
          className="relative w-full overflow-hidden cursor-none sm:cursor-auto rounded-xl bg-gray-100"
        >
          {/* Видео-контент */}
          <div className="w-full">
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
              <ImageWithSkeleton src={work.img} alt={work.title} className="w-full h-auto" />
            )}
          </div>
          
          {/* Кастомный курсор-кубик (только десктоп) */}
          {isMainHovered && window.innerWidth >= 640 && work.detailVideoSrc && (
            <div 
              className="absolute w-10 h-10 border border-white bg-black/30 backdrop-blur-sm pointer-events-none z-50 flex items-center justify-center transition-transform duration-75"
              style={{ left: `${mousePos.x - 20}px`, top: `${mousePos.y - 20}px` }}
            >
              <div className="w-2 h-2 bg-white animate-pulse" />
            </div>
          )}
          
          {/* Кнопка управления звуком */}
          {work.detailVideoSrc && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
              className="absolute bottom-4 right-4 z-40 bg-black/50 backdrop-blur-md text-white border border-white/20 p-3 rounded-full hover:bg-[#00809B] transition-colors"
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          )}
        </div>

        {/* Описание */}
        <div className="text-[18px] sm:text-[20px] leading-relaxed text-[#222222] mt-12" style={{ textAlign: "justify" }}>
          {work.description}
        </div>
      </div>
    </div>
  );
};