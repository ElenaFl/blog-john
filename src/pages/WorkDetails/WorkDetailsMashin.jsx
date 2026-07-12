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

  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [galleryCoords, setGalleryCoords] = useState({ x: -10, y: -10 });
  const [isMuted, setIsMuted] = useState(true); // Состояние звука
  const toggleMute = () => setIsMuted(!isMuted);

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
          //       <div className="relative w-full sm:w-[600px] aspect-video overflow-hidden rounded-2xl bg-[#FBFBFA] shadow-sm">
          //         {/* Мобильная версия: статичная картинка */}
          //         {isMobile || isTouchDevice ? (
          //           <img
          //             src={item.img}
          //             alt="Preview"
          //             className="w-full h-full object-cover block"
          //           />
          //         ) : (
          //           /* Десктопная версия: видео с постером */
          //           <video
          //             ref={(el) => (videoRefs.current[index] = el)}
          //             src={item.video}
          //             poster={item.img} // Тот самый первый кадр
          //             className="w-full h-full object-cover block"
          //             playsInline
          //             muted
          //             preload="metadata" // Загружаем только метаданные, чтобы не грузить лишнее
          //             onMouseEnter={(e) => {
          //               // Добавляем проверку, готов ли элемент
          //               if (e.target.readyState >= 2) {
          //                 e.target
          //                   .play()
          //                   .catch((err) => console.error("Play error:", err));
          //               }
          //             }}
          //             onMouseLeave={(e) => {
          //               e.target.pause();
          //               e.target.currentTime = 0;
          //             }}
          //           />
          //         )}
          //       </div>
          //     </div>
          //   );
          // }

          // 3. Рендеринг ВИДЕО МАШИНА
          // if (item.type === "video") {
          //   return (
          //     <div key={index} className="w-full mb-6 max-sm:mb-4 text-left">
          //       <div
          //         onMouseEnter={(e) => {
          //           if (isMobile) return;
          //           setIsGalleryHovered(true);
          //           const localVideo = e.currentTarget.querySelector("video");
          //           if (localVideo)
          //             localVideo.play().catch((err) => console.log(err));
          //         }}
          //         onMouseLeave={(e) => {
          //           if (isMobile) return;
          //           setIsGalleryHovered(false);
          //           const localVideo = e.currentTarget.querySelector("video");
          //           if (localVideo) {
          //             localVideo.pause();
          //             localVideo.currentTime = 0;
          //           }
          //         }}
          //         onMouseMove={(e) => {
          //           if (isMobile) return;
          //           const rect = e.currentTarget.getBoundingClientRect();
          //           const currentX = e.clientX - rect.left;
          //           const currentY = e.clientY - rect.top;

          //           const leftBound = rect.width * 0.16;
          //           const rightBound = rect.width * 0.84;

          //           if (currentX >= leftBound && currentX <= rightBound) {
          //             setGalleryCoords({ x: currentX, y: currentY });
          //           } else {
          //             setGalleryCoords({ x: -10, y: -10 });
          //           }
          //         }}
          //         className="relative w-full aspect-video max-sm:h-auto max-sm:aspect-none overflow-hidden rounded-md max-sm:rounded-none bg-[#FBFBFA] sm:cursor-none group"
          //       >
          //         {/* СТАТИЧНАЯ ОБЛОЖКА: На мобилках px-4, на десктопе 68% без прыжков */}
          //         {item.img && (
          //           <img
          //             src={item.img}
          //             alt="Превью видео машины"
          //             className={`${
          //               isMobile
          //                 ? "relative w-full h-auto object-cover max-sm:px-4 max-sm:rounded-2xl shadow-sm z-10"
          //                 : "absolute top-1/2 left-1/2 w-[68%] h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none rounded-md z-10"
          //             }`}
          //           />
          //         )}

          //         {/* ХОЛСТ-ЗЕРКАЛО И ПЛАШКИ: Только на десктопе */}
          //         {!isMobile && isGalleryHovered ? (
          //           <>
          //             {/* СЛОЙ 1 (z-10): ХОЛСТ ДЛЯ ДЕСКТОПА */}
          //             <canvas
          //               ref={(canvas) => {
          //                 if (!canvas) return;
          //                 const ctx = canvas.getContext("2d");
          //                 const video = canvas.parentElement
          //                   ? canvas.parentElement.querySelector("video")
          //                   : null;
          //                 if (ctx && video) {
          //                   const renderLoop = () => {
          //                     if (video.paused || video.ended) return;
          //                     ctx.clearRect(0, 0, canvas.width, canvas.height);
          //                     ctx.drawImage(
          //                       video,
          //                       0,
          //                       0,
          //                       canvas.width,
          //                       canvas.height,
          //                     );
          //                     requestAnimationFrame(renderLoop);
          //                   };
          //                   video.addEventListener("play", renderLoop);
          //                   if (!video.paused) renderLoop();
          //                 }
          //               }}
          //               width={640}
          //               height={360}
          //               className="absolute top-1/2 left-1/2 w-[68%] h-full -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none animate-fade-in"
          //               style={{ objectFit: "cover" }}
          //             />

          //             <div className="absolute top-0 left-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
          //             <div className="absolute top-0 right-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
          //           </>
          //         ) : null}

          //         {/* СКРЫТЫЙ ПЛЕЕР ДЛЯ ДЕСКТОПА */}
          //         {!isMobile && (
          //           <video
          //             src={item.video}
          //             playsInline
          //             muted={isMuted}
          //             preload="auto"
          //             className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
          //           />
          //         )}

          //         {/* ВСЮ ШИРИНУ ВИДЕО СНИЗУ (Мягкое рассеивание) */}
          //         {!isMobile && (
          //           <div className="video-radial-scrim z-25 pointer-events-none" />
          //         )}

          //         {/* СЛОЙ 5 (z-50): КУБИК СО СКВОЗНОЙ ПРОЗРАЧНОЙ ПЛОСКОСТЬЮ) */}
          //         {!isMobile && isGalleryHovered && galleryCoords.x > 0 && (
          //           <div
          //             className="gallery-3d-cube-container pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
          //             style={{
          //               left: `${galleryCoords.x}px`,
          //               top: `${galleryCoords.y}px`,
          //               transform: "translate(-50%, -50%)",
          //             }}
          //           >
          //             <div className="cube-3d-core flex items-center justify-center">
          //               {/* Боковые грани — вынос translateZ  14px */}
          //               <div
          //                 className="cube-face"
          //                 style={{
          //                   transform: "rotateY(0deg) translateZ(14px)",
          //                 }}
          //               ></div>
          //               <div
          //                 className="cube-face"
          //                 style={{
          //                   transform: "rotateY(180deg) translateZ(14px)",
          //                 }}
          //               ></div>
          //               <div
          //                 className="cube-face"
          //                 style={{
          //                   transform: "rotateY(90deg) translateZ(14px)",
          //                 }}
          //               ></div>
          //               <div
          //                 className="cube-face"
          //                 style={{
          //                   transform: "rotateY(-90deg) translateZ(14px)",
          //                 }}
          //               ></div>

          //               {/* Сквозная плоскость — 14px для  пропорций */}
          //               <div
          //                 className="cube-face"
          //                 style={{
          //                   transform: "rotateX(90deg) translateZ(14px)",
          //                   background: "transparent",
          //                   boxShadow: "none",
          //                 }}
          //               ></div>
          //               <div
          //                 className="cube-face"
          //                 style={{
          //                   transform: "rotateX(-90deg) translateZ(14px)",
          //                   background: "transparent",
          //                   boxShadow: "none",
          //                 }}
          //               ></div>
          //             </div>
          //           </div>
          //         )}

          //         {/* КНОПКА ДИНАМИКА */}
          //         {!isMobile && (
          //           <button
          //             onClick={toggleMute}
          //             className="video-mute-btn absolute z-40 bg-black/15 hover:bg-purple-950 text-taupe-400 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-white/10"
          //             style={{
          //               bottom: "32px",
          //               right: "calc(16% + 20px)",
          //               cursor: "inherit",
          //             }}
          //             title={isMuted ? "Включить звук" : "Выключить звук"}
          //           >
          //             {isMuted ? (
          //               <svg
          //                 xmlns="http://w3.org"
          //                 fill="none"
          //                 viewBox="0 0 24 24"
          //                 strokeWidth={1.5}
          //                 stroke="currentColor"
          //                 className="w-4 h-4 sm:w-5 sm:h-5"
          //               >
          //                 <path
          //                   strokeLinecap="round"
          //                   strokeLinejoin="round"
          //                   d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
          //                 />
          //               </svg>
          //             ) : (
          //               <svg
          //                 xmlns="http://w3.org"
          //                 fill="none"
          //                 viewBox="0 0 24 24"
          //                 strokeWidth={1.5}
          //                 stroke="currentColor"
          //                 className="w-4 h-4 sm:w-5 sm:h-5"
          //               >
          //                 <path
          //                   strokeLinecap="round"
          //                   strokeLinejoin="round"
          //                   d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
          //                 />
          //               </svg>
          //             )}
          //           </button>
          //         )}

          //         {/* СЛОЙ 3 (z-30): Внутренняя рамка */}
          //         <div className="hidden sm:block absolute inset-0 z-30 pointer-events-none border-8 border-[#FBFBFA] rounded-md"></div>
          //       </div>
          //     </div>
          //   );
          // }

          if (item.type === "video") {
            return (
              <div key={index} className="w-full mb-6 max-sm:mb-4 text-left">
                <div
                  onMouseEnter={() => {
                    if (isMobile) return;
                    setIsGalleryHovered(true);
                  }}
                  onMouseLeave={() => {
                    if (isMobile) return;
                    setIsGalleryHovered(false);
                    setGalleryCoords({ x: -10, y: -10 });
                  }}
                  onMouseMove={(e) => {
                    if (isMobile) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setGalleryCoords({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  className="relative w-full aspect-video overflow-hidden rounded-md bg-[#FBFBFA] sm:cursor-none group"
                >
                  {/* Обложка */}
                  {item.img && (
                    <img
                      src={item.img}
                      alt="Превью"
                      className={`${isMobile ? "w-full h-full object-cover" : "absolute inset-0 w-full h-full object-cover z-0"}`}
                    />
                  )}

                  {/* СКРЫТЫЙ ПЛЕЕР (Источник видео) */}
                  {!isMobile && (
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={item.video}
                      playsInline
                      muted={isMuted}
                      loop
                      className="hidden" // Скрыт, но работает как источник для canvas
                    />
                  )}

                  {/* ХОЛСТ (Отрисовка видео) */}
                  {!isMobile && isGalleryHovered && (
                    <canvas
                      ref={(canvas) => {
                        if (!canvas) return;
                        const video = videoRefs.current[index];
                        if (!video) return;
                        const ctx = canvas.getContext("2d");

                        // Запуск видео при появлении canvas
                        video.play().catch(console.error);

                        const renderLoop = () => {
                          if (!video || video.paused || video.ended) return;
                          ctx.drawImage(
                            video,
                            0,
                            0,
                            canvas.width,
                            canvas.height,
                          );
                          requestAnimationFrame(renderLoop);
                        };
                        video.addEventListener("play", renderLoop);
                      }}
                      width={640}
                      height={360}
                      className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
                    />
                  )}

                  {/* Остальные элементы (рамки, кнопки) оставить как есть */}
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
