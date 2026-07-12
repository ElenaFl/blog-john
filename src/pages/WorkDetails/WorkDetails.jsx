import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ImageWithSkeleton } from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton.jsx";

export const WorkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Ссылки на элементы для главного видео
  const mainVideoRef = useRef(null);
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [mainCoords, setMainCoords] = useState({ x: 0, y: 0 });

  // Общий статус звука (синхронизирован через localStorage)
  const [isMuted, setIsMuted] = useState(() => {
    const savedMuteStatus = localStorage.getItem("video_muted");
    return savedMuteStatus ? JSON.parse(savedMuteStatus) : false;
  });

  // Автоматическое определение мобильной версии и тач-экрана при загрузке
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    if (typeof window !== "undefined") {
      const hasTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches;
      setIsTouchDevice(hasTouch);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Синхронизация звука на всех плеерах страницы
  useEffect(() => {
    localStorage.setItem("video_muted", JSON.stringify(isMuted));
    if (mainVideoRef.current) mainVideoRef.current.muted = isMuted;
  }, [isMuted]);

  // Загрузка детальных данных работы из бэкенда Amvera
  useEffect(() => {
    const fetchWork = async () => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "https://john-back-elenafl.amvera.io";
        const response = await fetch(`${apiUrl}/api/works/${id}`);
        if (!response.ok) throw new Error("Ошибка загрузки");
        const data = await response.json();
        setWork(data);
      } catch (err) {
        console.error("Ошибка при получении работы:", err.message);
      }
    };
    fetchWork();
  }, [id]);

  // =========================================================================
  // УПРАВЛЕНИЕ ВИДЕО: Безопасно ловим любые ошибки прерывания (AbortError)
  // =========================================================================
  const showMainVideo = work?.detailVideoSrc && isMainHovered && !isTouchDevice;
  useEffect(() => {
    const video = mainVideoRef.current;
    if (!video) return;

    if (showMainVideo) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== "AbortError") {
            console.log("Автоплей главного видео заблокирован:", err);
          }
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [showMainVideo, isMuted]);

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  // Если данные еще не загружены, показываем аккуратное состояние загрузки
  if (!work) {
    return (
      <div className="text-center py-24 text-gray-400 text-sm">
        Загрузка проекта...
      </div>
    );
  }

  // Безопасный разбор галереи и тегов проекта
  let galleryImages = [];
  try {
    galleryImages =
      typeof work.gallery === "string"
        ? JSON.parse(work.gallery)
        : work.gallery || [];
  } catch (e) {
    console.error("Ошибка парсинга галереи проекта:", e);
  }

  const tagsArray = Array.isArray(work.tags)
    ? work.tags
    : typeof work.tags === "string"
      ? JSON.parse(work.tags || "[]")
      : [];

  const formattedTags = tagsArray
    .map((tag) => {
      const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;
      return `#${cleanTag}`;
    })
    .join(" ");

  // УМНЫЙ МАРКЕР: Исключаем первый ID (id === "1"), так как там галерея НУЖНА.
  const lowerTitle = work.title?.toLowerCase() || "";
  const isGirlProject =
    lowerTitle.includes("девуш") ||
    lowerTitle.includes("girl") ||
    lowerTitle.includes("портрет") ||
    lowerTitle.includes("portrait") ||
    lowerTitle.includes("арт") ||
    lowerTitle.includes("art") ||
    id === "2" ||
    id === "3" ||
    (id !== "1" && galleryImages.length === 0);

  const hasProcessContent =
    work.sectionTitle?.trim() || work.processText?.trim();

  return (
    <div className="pt-12 sm:pt-36 bg-transparent">
      <div className="sm:max-w-[858px] ml-auto mr-auto pl-4 pr-4 sm:pl-6 sm:pr-6 mb-16">
        {/* Кнопка возврата */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 text-[var(--accent)] hover:text-[#00809B] cursor-pointer flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors"
        >
          ← GO BACK
        </button>

        {/* Заголовок проекта */}
        <h2 className="mb-4 sm:mb-6 text-[28px] sm:text-[38px] font-bold leading-tight tracking-tight text-[var(--text-h)]">
          {work.title}
        </h2>

        {/* Дата и теги */}
        <div className="w-full sm:w-fit flex flex-wrap gap-4 items-center mb-8">
          {/* Дата-капсула */}
          <span className="px-3 py-1 bg-[#1A1A1A] rounded-3xl text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider flex items-center justify-center shrink-0">
            {work.date}
          </span>

          {/* Разделитель "|" */}
          <span className="hidden sm:inline text-gray-300">|</span>

          {/* Серая строка тегов */}
          <span className="text-[15px] sm:text-[17px] text-gray-400 font-medium tracking-wide">
            {formattedTags}
          </span>
        </div>

        {/* =========================================================================
            БЕЗУПРЕЧНЫЙ НАТИВНЫЙ ПЛЕЕР ВИДЕО С ОБРЕЗКОЙ И 3D ЛОТОСОМ
            ========================================================================= */}
        <div className="max-w-3xl mx-auto p-6 max-sm:p-0 mb-10 max-sm:mb-6">
          <div
            onMouseEnter={() => setIsMainHovered(true)}
            onMouseLeave={() => setIsMainHovered(false)}
            onMouseMove={(e) => {
              if (isTouchDevice || isMobile) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const currentX = e.clientX - rect.left;
              const currentY = e.clientY - rect.top;

              // Границы лотоса: скрываем, когда он залетает на маскирующие боковые поля и низ
              const leftBound = rect.width * 0.16;
              const rightBound = rect.width * 0.84;
              const bottomBound = rect.height * 0.9;

              if (
                currentX >= leftBound &&
                currentX <= rightBound &&
                currentY <= bottomBound
              ) {
                setMainCoords({ x: currentX, y: currentY });
              } else {
                setMainCoords({ x: -100, y: -100 });
              }
            }}
            className="relative w-full aspect-video overflow-hidden rounded-2xl bg-[#FBFBFA] cursor-none group"
          >
            {isMobile ? (
              /* НА МОБИЛЬНОМ: Только статичная качественная картинка */
              work.img && (
                <img
                  src={work.img}
                  alt={work.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )
            ) : /* НА ДЕСКТОПЕ: Прямое видео без переключений и скачков */
            work.detailVideoSrc && work.detailVideoSrc.trim() !== "" ? (
              <>
                {/* Сразу отображаем видео-плеер на полный экран. 
                      По умолчанию он стоит на паузе, показывая первый кадр (Preload) */}
                <video
                  ref={mainVideoRef}
                  src={work.detailVideoSrc}
                  playsInline
                  muted={isMuted}
                  preload="auto"
                  className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-10"
                />

                {/* СЛОЙ 2 (z-20): ДЕКОРАТИВНЫЕ МАСКИ-РАМКИ ДЛЯ ОБРЕЗКИ ЧЕРНЫХ ПОЛОС И ВОДЯНОГО ЗНАКА */}
                {isGirlProject && (
                  <>
                    {/* Левая маска */}
                    <div className="absolute top-0 left-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                    {/* Правая маска */}
                    <div className="absolute top-0 right-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                    {/* Нижняя маска (закрывает текст, поднята до 14% для 100% маскирования) */}
                    <div className="absolute bottom-0 left-0 right-0 h-[14%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                  </>
                )}

                {/* СЛОЙ 5 (z-50): Легендарный кастомный геометрический 3D-лотос */}
                {isMainHovered && mainCoords.x > 0 && (
                  <div
                    className="floating-3d-cursor"
                    style={{
                      left: `${mainCoords.x}px`,
                      top: `${mainCoords.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="lotus-3d-core flex items-center justify-center">
                      <div className="lotus-center"></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(0deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(45deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(90deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(135deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(180deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(225deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(270deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(315deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Рассеивание света внизу */}
                <div className="video-radial-scrim z-25 pointer-events-none" />

                {/* СЛОЙ 4 (z-40): КНОПКА ДИНАМИКА */}
                <button
                  onClick={toggleMute}
                  className="video-mute-btn absolute z-40 hover:scale-110 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-white/20 bg-[rgba(245,158,11,0.45)] text-amber-100 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
                  style={{
                    bottom: isGirlProject ? "calc(14% + 16px)" : "32px",
                    right: isGirlProject ? "calc(16% + 20px)" : "32px",
                    cursor: "inherit",
                  }}
                  title={isMuted ? "Включить звук" : "Выключить звук"}
                >
                  {isMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l2.25-2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                      />
                    </svg>
                  )}
                </button>

                {/* СЛОЙ 3 (z-30): Элегантная рамка */}
                <div className="absolute inset-0 z-30 pointer-events-none border-8 border-[#FBFBFA] rounded-2xl"></div>
              </>
            ) : (
              /* Если десктопного видео нет, выводим изображение */
              work.img && (
                <img
                  src={work.img}
                  alt={work.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )
            )}
          </div>
        </div>

        {/* Краткое описание проекта */}
        <div
          style={{ textAlign: "justify" }}
          className="whitespace-pre-line text-[18px] sm:text-[20px] leading-relaxed opacity-95 text-justify text-[#222222] mb-12"
        >
          {work.description}
        </div>

        {/* ===================================================================
            ДИНАМИЧЕСКИЕ И УМНЫЕ СЕКЦИИ: 
            Они скроются, если это проект с девушкой, ИЛИ если данные в базе пусты!
            =================================================================== */}

        {/* Дополнительный раздел: Творческий процесс */}
        {!isGirlProject && hasProcessContent && (
          <div className="border-t border-gray-200/40 pt-10 mb-12 animate-fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-h)] mb-4 tracking-tight">
              {work.sectionTitle}
            </h3>
            <p
              style={{ textAlign: "justify" }}
              className="whitespace-pre-line text-[18px] sm:text-[20px] leading-relaxed opacity-95 text-justify text-[#444444]"
            >
              {work.processText}
            </p>
          </div>
        )}

        {/* Слайдер-галерея изображений проекта */}
        {!isGirlProject && galleryImages.length > 0 && (
          <div className="space-y-6 mb-12 border-t border-gray-200/40 pt-10 animate-fade-in">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
              Project Gallery
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {galleryImages.map((imagePath, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden border border-gray-200/40 aspect-video"
                >
                  <ImageWithSkeleton
                    src={imagePath}
                    alt={`Галерея ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ссылка на проект (живой сайт) */}
        {work.projectLink && (
          <div className="border-t border-gray-200/40 pt-10 text-center sm:text-left">
            <a
              href={work.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-widest py-3.5 px-8 rounded-xl bg-[#1A1A1A] text-white shadow-md hover:bg-[#00809B] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] no-underline"
            >
              Visit Live Website ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
