import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Импортируем наш умный загрузчик картинок с плавным скелетоном
import {ImageWithSkeleton} from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton";

export const WorkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);

  // Определение мобильных и тач-устройств
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Ссылки на элементы для главного видео
  const mainVideoRef = useRef(null);
  const mainCanvasRef = useRef(null);
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [mainCoords, setMainCoords] = useState({ x: 0, y: 0 });

  // Ссылки на элементы для видео в галерее
  const galleryVideoRef = useRef(null);
  const galleryCanvasRef = useRef(null);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [galleryCoords, setGalleryCoords] = useState({ x: 0, y: 0 });

  // Общий статус звука (синхронизирован через localStorage)
  const [isMuted, setIsMuted] = useState(() => {
    const savedMuteStatus = localStorage.getItem("video_muted");
    return savedMuteStatus ? JSON.parse(savedMuteStatus) : false;
  });

  // Автоматическое определение типа устройства и тач-экрана при загрузке
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
    if (galleryVideoRef.current) galleryVideoRef.current.muted = isMuted;
  }, [isMuted]);

  // Загрузка детальных данных работы из бэкенда Amvera
  useEffect(() => {
    const fetchWork = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://john-back-elenafl.amvera.io";
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
  // УПРАВЛЕНИЕ И ВОСПРОИЗВЕДЕНИЕ ВИДЕО (Только на десктопах)
  // =========================================================================
  const showMainVideo = work?.detailVideoSrc && isMainHovered && !isTouchDevice;
  useEffect(() => {
    const video = mainVideoRef.current;
    if (!video) return;

    if (showMainVideo) {
      video.muted = isMuted;
      video.play().catch((err) => console.log("Автоплей главного видео заблокирован:", err));
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [showMainVideo, isMuted]);

  const showGalleryVideo = work?.videoSrc && isGalleryHovered && !isTouchDevice;
  useEffect(() => {
    const video = galleryVideoRef.current;
    if (!video) return;

    if (showGalleryVideo) {
      video.muted = isMuted;
      video.play().catch((err) => console.log("Автоплей видео галереи заблокирован:", err));
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [showGalleryVideo, isMuted]);

  // =========================================================================
  // ВЫСОКОПРОИЗВОДИТЕЛЬНАЯ ОТРИСОВКА НА CANVAS (60 FPS)
  // These effects do not re-run on coordinate changes!
  // =========================================================================
  useEffect(() => {
    const video = mainVideoRef.current;
    const canvas = mainCanvasRef.current;
    if (!video || !canvas || !showMainVideo) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    const render = () => {
      if (video.paused || video.ended) return;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(render);
    };

    video.addEventListener("play", render);
    if (!video.paused) render();

    return () => {
      video.removeEventListener("play", render);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showMainVideo]);

  useEffect(() => {
    const video = galleryVideoRef.current;
    const canvas = galleryCanvasRef.current;
    if (!video || !canvas || !showGalleryVideo) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    const render = () => {
      if (video.paused || video.ended) return;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(render);
    };

    video.addEventListener("play", render);
    if (!video.paused) render();

    return () => {
      video.removeEventListener("play", render);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showGalleryVideo]);

  // Слежение за движением мыши (полностью выключено на тач-экранах)
  const handleMainMouseMove = (e) => {
    if (!isTouchDevice) {
      setMainCoords({ x: e.clientX, y: e.clientY });
    }
  };

  const handleGalleryMouseMove = (e) => {
    if (!isTouchDevice) {
      setGalleryCoords({ x: e.clientX, y: e.clientY });
    }
  };

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
    galleryImages = typeof work.gallery === "string" ? JSON.parse(work.gallery) : (work.gallery || []);
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

  // УМНЫЙ МАРКЕР: Автоматически определяем проект "Девушка" по заголовку
  const isGirlProject = work.title?.toLowerCase().includes("девуш") || work.title?.toLowerCase().includes("girl");
  
  // Включаем зум (scale) только для проекта с девушкой, чтобы срезать черные полосы и водяной знак
  const shouldApplyZoom = isGirlProject;

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
          
          {/* Разделитель "|" (скрывается на мобильных для красоты адаптива) */}
          <span className="hidden sm:inline text-gray-300">|</span>
          
          {/* Серая строка тегов */}
          <span className="text-[15px] sm:text-[17px] text-gray-400 font-medium tracking-wide">
            {formattedTags}
          </span>
        </div>

        {/* Главное изображение проекта / Видео с эффектами на десктопе */}
        <div
          onMouseEnter={() => setIsMainHovered(true)}
          onMouseLeave={() => setIsMainHovered(false)}
          onMouseMove={handleMainMouseMove}
          className={`relative w-full aspect-video rounded-2xl overflow-hidden mb-10 border border-gray-200/40 bg-gray-100 ${
            work.detailVideoSrc && !isTouchDevice ? "cursor-none" : "cursor-pointer"
          }`}
        >
          {/* ИСПРАВЛЕНИЕ: Мы применили класс [&_img]:scale-[1.12], который зуммирует именно 
              внутреннюю картинку скелетона, оставляя рамку контейнера ровной. 
              Все черные бока и текст теперь идеально срезаны краями рамки! */}
          <ImageWithSkeleton
            src={work.img}
            alt={work.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${shouldApplyZoom ? "[&_img]:scale-[1.12]" : ""}`}
          />

          {/* Интерактивные видео-эффекты (рендерим только для мышки на ПК) */}
          {showMainVideo && (
            <>
              {/* Кастомный круглый курсор с золотым лотосом */}
              <div
                className="cursor-ring pointer-events-none fixed z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 border border-white/60 rounded-full w-10 h-10 transition-transform duration-75 ease-out"
                style={{
                  left: `${mainCoords.x}px`,
                  top: `${mainCoords.y}px`,
                }}
              >
                {/* Авторский SVG золотого цветка лотоса */}
                <svg 
                  viewBox="0 0 64 64" 
                  className="w-7 h-7 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.55)] animate-pulse" 
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M32 12C32 12 25 24 32 44C39 24 32 12 32 12Z" fill="#FBBF24" />
                  <path d="M32 20C24 22 18 32 26 44C34 44 32 20 32 20Z" fill="#F59E0B" />
                  <path d="M32 20C40 22 46 32 38 44C30 44 32 20 32 20Z" fill="#F59E0B" />
                  <path d="M16 44C16 44 24 48 32 48C40 48 48 44 48 44C48 44 40 42 32 42C24 42 16 44 16 44Z" fill="#D97706" />
                </svg>
              </div>

              {/* Умный холст */}
              {/* ИСПРАВЛЕНИЕ: К холсту видео также применен зум, чтобы идеально 
                  скрыть водяной знак и боковые полосы в режиме проигрывания! */}
              <canvas
                ref={mainCanvasRef}
                className={`absolute top-0 left-0 w-full h-full object-cover z-20 pointer-events-none animate-fade-in ${shouldApplyZoom ? "scale-[1.12]" : ""}`}
              />

              {/* Фоновое тег-видео */}
              <video
                ref={mainVideoRef}
                src={work.detailVideoSrc}
                playsInline
                autoPlay
                muted={isMuted}
                className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
              />

              {/* Кнопка громкости */}
              <button
                onClick={toggleMute}
                style={{ cursor: "inherit" }}
                className="absolute bottom-4 right-4 z-30 text-amber-100 p-2 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center w-8 h-8 hover:scale-110 active:scale-95 shadow-md border border-white/20 bg-black/35"
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            </>
          )}
        </div>

        {/* Краткое описание проекта */}
        <div
          style={{ textAlign: "justify" }}
          className="whitespace-pre-line text-[18px] sm:text-[20px] leading-relaxed opacity-95 text-justify text-[#222222] mb-12"
        >
          {work.description}
        </div>

        {/* ===================================================================
            УМНЫЕ УСЛОВИЯ ОТРИСОВКИ: Если это проект с девушкой (isGirlProject),
            все нижние секции ГАРАНТИРОВАНО полностью скрываются из структуры React!
            =================================================================== */}

        {/* Дополнительный раздел: Творческий процесс */}
        {!isGirlProject && work.sectionTitle && work.processText && (
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
                <div key={idx} className="rounded-2xl overflow-hidden border border-gray-200/40 aspect-video">
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

        {/* Дополнительное видео в галерее */}
        {!isGirlProject && work.videoSrc && (
          <div className="mb-12 border-t border-gray-200/40 pt-10 animate-fade-in">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
              Interactive Preview
            </h4>
            <div
              onMouseEnter={() => setIsGalleryHovered(true)}
              onMouseLeave={() => setIsGalleryHovered(false)}
              onMouseMove={handleGalleryMouseMove}
              className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-200/40 bg-gray-100 ${
                !isTouchDevice ? "cursor-none" : "cursor-pointer"
              }`}
            >
              <ImageWithSkeleton
                src={galleryImages[0] || work.img}
                alt="Превью видео"
                className="w-full h-full object-cover"
              />

              {showGalleryVideo && (
                <>
                  {/* Курсор-лотос для галерейного видео */}
                  <div
                    className="cursor-ring pointer-events-none fixed z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 border border-white/60 rounded-full w-10 h-10 transition-transform duration-75 ease-out"
                    style={{
                      left: `${galleryCoords.x}px`,
                      top: `${galleryCoords.y}px`,
                    }}
                  >
                    <svg 
                      viewBox="0 0 64 64" 
                      className="w-7 h-7 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.55)] animate-pulse" 
                      fill="currentColor"
                    >
                      <path d="M32 12C32 12 25 24 32 44C39 24 32 12 32 12Z" fill="#FBBF24" />
                      <path d="M32 20C24 22 18 32 26 44C34 44 32 20 32 20Z" fill="#F59E0B" />
                      <path d="M32 20C40 22 46 32 38 44C30 44 32 20 32 20Z" fill="#F59E0B" />
                      <path d="M16 44C16 44 24 48 32 48C40 48 48 44 48 44C48 44 40 42 32 42C24 42 16 44 16 44Z" fill="#D97706" />
                    </svg>
                  </div>

                  <canvas
                    ref={galleryCanvasRef}
                    className="absolute top-0 left-0 w-full h-full object-cover z-20 pointer-events-none animate-fade-in"
                  />

                  <video
                    ref={galleryVideoRef}
                    src={work.videoSrc}
                    playsInline
                    autoPlay
                    muted={isMuted}
                    className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
                  />
                </>
              )}
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