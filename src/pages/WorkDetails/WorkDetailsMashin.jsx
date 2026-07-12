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

          // if (item.type === "video") {
          //   return (
          //     <div
          //       key={index}
          //       className="w-full flex justify-center mb-10 max-sm:mb-6"
          //     >
          //       {/* Контейнер-оболочка */}
          //       <div className="relative w-full sm:w-[600px] aspect-video overflow-hidden rounded-2xl bg-[#FBFBFA] shadow-sm">
          //         {/* 1. Если мобилка — показываем только картинку */}
          //         {isMobile || isTouchDevice ? (
          //           <img
          //             src={item.img}
          //             alt="Preview"
          //             className="w-full h-full object-cover block"
          //           />
          //         ) : (
          //           /* 2. Десктоп: Видео и картинка наложены друг на друга */
          //           <div className="relative w-full h-full group">
          //             {/* Картинка как фон */}
          //             <img
          //               src={item.img}
          //               alt="Preview"
          //               className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
          //             />

          //             {/* Видео */}
          //             <video
          //               ref={(el) => (videoRefs.current[index] = el)}
          //               src={item.video}
          //               className="absolute inset-0 w-full h-full object-cover"
          //               playsInline
          //               muted
          //               loop
          //               onMouseEnter={(e) => {
          //                 // Прямой запуск
          //                 e.target
          //                   .play()
          //                   .catch((err) => console.error("Play error:", err));
          //               }}
          //               onMouseLeave={(e) => {
          //                 e.target.pause();
          //                 e.target.currentTime = 0;
          //               }}
          //             />
          //           </div>
          //         )}
          //       </div>
          //     </div>
          //   );
          // }

          if (item.type === "video") {
            const isHovered = hoveredIndex === index;
            // Можно добавить проверку на название, если нужно, или просто передать true/false
            const isGirlProject = true;

            return (
              <div
                key={index}
                className="w-full flex justify-center mb-10 max-sm:mb-6"
              >
                <div
                  className="relative w-full sm:w-[600px] aspect-video overflow-hidden rounded-2xl bg-[#FBFBFA] shadow-sm"
                  onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                  onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                >
                  {/* Картинка как фон */}
                  <img
                    src={item.img}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />

                  {/* Видео */}
                  <VideoPlayer
                    src={item.video}
                    shouldPlay={isHovered}
                    isMuted={true}
                    isGirlProject={isGirlProject}
                  />

                  {/* ПЛАШКИ (14% по бокам) */}
                  {isGirlProject && (
                    <>
                      <div className="absolute top-0 left-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                      <div className="absolute top-0 right-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                    </>
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
