import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithSkeleton } from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton.jsx";

export const WorkDetailsMashin = ({ work }) => {
  const navigate = useNavigate();
  const videoRefs = useRef({});

  // 1. Инициализируем состояние БЕЗ useEffect
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false,
  );

  const [isTouchDevice, setIsTouchDevice] = useState(() =>
    typeof window !== "undefined"
      ? "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches
      : false,
  );

  // Cостояние для отслеживания наведения на  видео
  const [hoveredIndex, setHoveredIndex] = useState(null);

  //  Состояния для координат и звука:
  const [galleryCoords, setGalleryCoords] = useState({ x: -100, y: -100 });
  const [isMuted, setIsMuted] = useState(true);

  // 2. Эффект только для подписки на изменения
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches,
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tagsArray = Array.isArray(work.tags)
    ? work.tags
    : typeof work.tags === "string"
      ? JSON.parse(work.tags || "[]")
      : [];
  const formattedTags = tagsArray
    .map((t) => `#${t.startsWith("#") ? t.slice(1) : t}`)
    .join(" ");

  if (!work) return null;

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

        {work.gallery?.map((item, index) => {
          if (item.type === "heading")
            return (
              <h4
                key={index}
                className="text-xl sm:text-2xl font-bold mt-6 mb-4 text-left"
              >
                {item.text}
              </h4>
            );

          if (item.type === "text")
            return (
              <p
                key={index}
                className="text-[18px] sm:text-[20px] leading-relaxed  t mb-4"
              >
                {item.text}
              </p>
            );

          if (item.type === "video") {
            const isHovered = hoveredIndex === index;
            // Можно добавить проверку на название, если нужно, или просто передать true/false
            const isGirlProject = true;

            return (
              <div
                key={index}
                className="w-full flex justify-center mb-10 max-sm:mb-6 mt-3 sm:mt-6"
              >
                <div
                  className="relative w-full sm:w-[600px] aspect-video overflow-hidden bg-[#FBFBFA] cursor-none group"
                  onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                  onMouseLeave={() => {
                    !isMobile && setGalleryCoords({ x: -100, y: -100 });
                    !isMobile && setHoveredIndex(null);
                  }}
                  onMouseMove={(e) => {
                    if (isMobile) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setGalleryCoords({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                >
                  {/* Картинка как фон */}
                  <img
                    src={item.img}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Видео-плеер (используем логику VideoPlayer из прошлого ответа) */}
                  <VideoPlayer
                    src={item.video}
                    shouldPlay={hoveredIndex === index}
                    isMuted={isMuted}
                  />

                  {/* 3. ВОЗВРАЩАЕМ ПЛАШКИ (Z-Index 20, чтобы они были поверх видео) */}
                  {!isMobile && (
                    <>
                      <div className="absolute top-0 left-0 bottom-0 w-[11%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                      <div className="absolute top-0 right-0 bottom-0 w-[11%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                    </>
                  )}

                  {/* КАСТОМНЫЙ КУБИК (Курсор) */}
                  {hoveredIndex === index && galleryCoords.x > 0 && (
                    <div
                      className="gallery-3d-cube-container"
                      style={{
                        left: galleryCoords.x,
                        top: galleryCoords.y,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="cube-3d-core">
                        {/* Передняя и задняя */}
                        <div
                          className="cube-face"
                          style={{
                            transform: "rotateY(0deg) translateZ(16px)",
                          }}
                        />
                        <div
                          className="cube-face"
                          style={{
                            transform: "rotateY(180deg) translateZ(16px)",
                          }}
                        />
                        {/* Боковые */}
                        <div
                          className="cube-face"
                          style={{
                            transform: "rotateY(90deg) translateZ(12px)",
                          }}
                        />
                        <div
                          className="cube-face"
                          style={{
                            transform: "rotateY(-90deg) translateZ(12px)",
                          }}
                        />
                        {/* Верх и низ */}
                        <div
                          className="cube-face"
                          style={{
                            transform: "rotateX(90deg) translateZ(12px)",
                          }}
                        />
                        <div
                          className="cube-face"
                          style={{
                            transform: "rotateX(-90deg) translateZ(12px)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* КНОПКА ДИНАМИКА со стилем свечения */}
                  {!isMobile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="video-mute-btn absolute z-40 p-2.5 rounded-full flex items-center justify-center w-10 h-10 cursor-pointer"
                      style={{
                        bottom: isGirlProject ? "16px" : "16px",
                        right: isGirlProject ? "16px" : "16px",
                      }}
                      title={isMuted ? "Включить звук" : "Выключить звук"}
                    >
                      {/* Иконка динамика */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={
                            isMuted
                              ? "M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                              : "M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                          }
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          if (item.type === "image")
            return (
              <ImageWithSkeleton
                key={index}
                src={item.src}
                className="w-full h-auto rounded-md mb-6"
              />
            );

          return null;
        })}
      </div>
    </div>
  );
};

// 2. Вспомогательный компонент (добавьте его в этот же файл или рядом)
// Это ровно та логика из WorkDetailsDefault, которая заставляет видео работать
const VideoPlayer = ({ src, shouldPlay, isMuted }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay) {
      video.muted = isMuted;
      video.play().catch((err) => console.log("Play error:", err));
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [shouldPlay, isMuted]);

  return (
    <video
      ref={videoRef}
      src={src}
      className="absolute inset-0 w-full h-full object-cover z-10"
      playsInline
      loop
      muted={isMuted}
    />
  );
};
