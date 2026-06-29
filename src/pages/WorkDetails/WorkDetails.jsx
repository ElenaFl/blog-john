import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const WorkDetails = () => {
  const [work, setWork] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const mainVideoRef = useRef(null);

  const [isMainHovered, setIsMainHovered] = useState(false);
  const [mainCoords, setMainCoords] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Состояния для видео внутри последовательной галереи
  const galleryVideoRef = useRef(null);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [galleryCoords, setGalleryCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isMuted, setIsMuted] = useState(() => {
    const savedMuteStatus = localStorage.getItem("video_muted");
    return savedMuteStatus ? JSON.parse(savedMuteStatus) : false;
  });

  // Синхронизация звука для всех видео на странице
  useEffect(() => {
    localStorage.setItem("video_muted", JSON.stringify(isMuted));
    if (mainVideoRef.current) mainVideoRef.current.muted = isMuted;
    if (galleryVideoRef.current) galleryVideoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/works/${id}`);
        if (!response.ok) throw Error("Ошибка загрузки");
        const data = await response.json();
        setWork(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchWork();
  }, [id]);

  // Управление воспроизведением верхнего видео (dключается при ховере)
  useEffect(() => {
    const video = mainVideoRef.current;
    if (!video || !work?.detailVideoSrc) return;

    if (isMainHovered) {
      video.play().catch((err) => {
        console.error("Автоплей заблокирован:", err);
      });
    } else {
      // пауза только если видео запущено, чтобы не ломать первый кадр при загрузке
      if (!video.paused) {
        video.pause();
        video.currentTime = 0; // сброс в самое начало при уходе мыши
      }
    }
  }, [isMainHovered, work]);

  // управление воспроизведением видео в галерее 
  useEffect(() => {
    if (!galleryVideoRef.current) return;

    if (isGalleryHovered) {
      galleryVideoRef.current.play().catch(() => {
        setIsMuted(true);
      });
    } else {
      galleryVideoRef.current.pause();
      galleryVideoRef.current.currentTime = 0;
    }
  }, [isGalleryHovered]);

  const handleMainCanvasRender = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const video = mainVideoRef.current;
    if (!video || !ctx) return;

    let animationFrameId;
    const renderLoop = () => {
      if (video.paused || video.ended) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    video.addEventListener("play", renderLoop);
    if (!video.paused) renderLoop();

    return () => {
      video.removeEventListener("play", renderLoop);
      cancelAnimationFrame(animationFrameId);
    };
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  if (!work)
    return (
      <p className="text-center py-20 text-gray-500">Загрузка проекта...</p>
    );

  return (
    <div className="sm:max-w-[858px] ml-auto mr-auto pt-6 sm:pt-36 pl-4 pr-4 sm:pl-6 sm:pr-6 mb-6 sm:mb-8 text-black">
      {/* Кнопка назад */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 text-[var(--accent)] hover:text-[#00809B] cursor-pointer flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors"
      >
        ← go back
      </button>

      {/* Заголовок проекта */}
      <h2 className="mt-3 sm:mt-[18px] text-3xl sm:text-[44px]  font-bold mb-4">
        {work.title}
      </h2>

      <div className="pt-6 sm:pt-[36px]">
        {/* Метаданные */}
        <div className="flex gap-6 items-center mb-6 text-[20px] text-gray-400">
          {work.date && (
            <span className="px-4 py-0.5 bg-[var(--text-h)] text-white rounded-3xl text-sm font-medium flex items-center justify-center">
              {work.date}
            </span>
          )}

          <span>|</span>
          <span className="font-medium">
            {work.tags &&
              work.tags.map((tag, idx) => <span key={idx}>{tag} </span>)}
          </span>
        </div>

        {/* Описание проекта */}
        <p className="text-[17px] leading-relaxed whitespace-pre-line mb-10 text-gray-800">
          {work.description}
        </p>

        {/*1. Рендеринг видео ДЕВУШКА */}
        <div className="max-w-3xl mx-auto p-6 max-sm:p-0 mb-10 max-sm:mb-6">
          <div
            onMouseEnter={() => setIsMainHovered(true)}
            onMouseLeave={() => setIsMainHovered(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const currentX = e.clientX - rect.left;
              const currentY = e.clientY - rect.top;

              // Ограничиваем лотос границами видео (16% слева и 16% справа)
              const leftBound = rect.width * 0.16;
              const rightBound = rect.width * 0.84;

              if (currentX >= leftBound && currentX <= rightBound) {
                setMainCoords({ x: currentX, y: currentY });
              } else {
                setMainCoords({ x: -10, y: -10 });
              }
            }}
            className="relative w-full aspect-video overflow-hidden rounded-md bg-[#FBFBFA] cursor-none group"
          >
            {work.detailVideoSrc && work.detailVideoSrc.trim() !== "" ? (
              <>
                {/* 1. ЕДИНСТВЕННАЯ КАРТИНКА ДЛЯ ВСЕХ УСТРОЙСТВ */}
                {work.img && (
                  <img
                    src={work.img}
                    alt={work.title}
                    className={`${
                      isMobile
                        ? "relative w-full h-auto object-cover rounded-2xl shadow-sm z-10"
                        : "absolute top-1/2 left-1/2 w-[68%] h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none rounded-md z-10"
                    }`}
                  />
                )}

                {/* 2. ХОЛСТ-ЗЕРКАЛО И ПЛАШКИ: Просыпаются на десктопе при ховере */}
                {!isMobile && isMainHovered ? (
                  <>
                    {/* СЛОЙ 1 (z-10): ХОЛСТ ДЛЯ ДЕСКТОПА */}
                    <canvas
                      ref={handleMainCanvasRender}
                      width={640}
                      height={360}
                      className="absolute top-1/2 left-1/2 w-auto h-full -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none animate-fade-in"
                    />

                    {/* СЛОЙ 2 (z-20): ДЕКОРАТИВНЫЕ ПЛАШКИ ПО БОКАМ) */}
                    <div className="absolute top-0 left-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                  </>
                ) : null}

                {/* СКРЫТЫЙ ПЛЕЕР ДЛЯ ДЕСКТОПА (1x1 пиксель) */}
                {!isMobile && (
                  <video
                    ref={mainVideoRef}
                    src={work.detailVideoSrc}
                    playsInline
                    muted={isMuted}
                    preload="auto"
                    className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
                  />
                )}

                {/* СЛОЙ 2.5 (z-25): ОРАНЖЕВАЯ МАСКА-ЗАВУАЛИРОВЩИК ИЗ INDEX.CSS */}
                {!isMobile && (
                  <div className="video-corner-mask z-25 pointer-events-none" />
                )}

                {/* СЛОЙ 5 (z-50): Кастомный ГЕОМЕТРИЧЕСКИЙ 3D ЖЕЛТЫЙ ЛОТОС */}
                {isMainHovered && mainCoords.x > 0 && (
                  <div
                    className="floating-3d-cursor pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
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
                            "rotateZ(90deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
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
                            "rotateZ(270deg) rotateX(-25deg) translateY(-10px) translateZ(0px)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(45deg) rotateX(-15deg) translateY(-9px) translateZ(4px) scale(0.8)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(135deg) rotateX(-15deg) translateY(-9px) translateZ(4px) scale(0.8)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(225deg) rotateX(-15deg) translateY(-9px) translateZ(4px) scale(0.8)",
                        }}
                      ></div>
                      <div
                        className="lotus-petal"
                        style={{
                          transform:
                            "rotateZ(315deg) rotateX(-15deg) translateY(-9px) translateZ(4px) scale(0.8)",
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* РАССЕИВАНИЕ внизу видео) */}
                {!isMobile && (
                  <div className="video-radial-scrim z-25 pointer-events-none" />
                )}

                {/* СЛОЙ 4 (z-40): КНОПКА ДИНАМИКА */}
                {!isMobile && (
                  <button
                    onClick={toggleMute}
                    className="video-mute-btn absolute z-40 hover:scale-110 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-white/20 bg-[rgba(245,158,11,0.45) text-amber-100 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-white/10"
                    style={{
                      bottom: isMobile ? "12px" : "32px",
                      right: isMobile ? "12px" : "calc(16% + 20px)",
                      cursor: "inherit"
                    }}
                    title={isMuted ? "Включить звук" : "Выключить звук"}
                  >
                    {isMuted ? (
                      <svg
                        xmlns="http://w3.org"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://w3.org"
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
                )}

                {/* СЛОЙ 3 (z-30): Внутренняя рамка*/}
                <div className="absolute inset-0 z-30 pointer-events-none border-8 border-[#FBFBFA] rounded-md"></div>
              </>
            ) : (
              work.img && (
                <img
                  src={work.img}
                  alt={work.title}
                  className="w-full h-full object-cover rounded-md"
                />
              )
            )}
          </div>
        </div>

        {/* СЕКЦИЯ ДЕТАЛЕЙ */}
        {work.sectionTitle && (
          <h3 className="text-2xl sm:text-[26px] text-black font-bold mt-12 mb-4 text-left">
            {work.sectionTitle}
          </h3>
        )}

        {work.processText && (
          <p className="text-[16px] leading-relaxed whitespace-pre-line mb-10 text-gray-800 text-left">
            {work.processText}
          </p>
        )}
        {/* --- НАЧАЛО ВСТАВКИ:  КОНСТРУКТОР ГАЛЕРЕИ СО СМЕЩЕНИЕМ ВЛЕВО --- */}
        {work.gallery && work.gallery.length > 0 && (
          <div className="flex flex-col gap-8 mt-8 mb-10 items-start w-full">
            {work.gallery.map((item, index) => {
              // 1. Рендеринг встроенных заголовков
              if (item.type === "heading") {
                return (
                  <h4
                    key={index}
                    className="text-xl sm:text-2xl text-black font-bold mt-6 mb-2 text-left"
                  >
                    {item.text}
                  </h4>
                );
              }

              // 2. Рендеринг встроенных абзацев текста
              if (item.type === "text") {
                return (
                  <p
                    key={index}
                    className="text-[16px] leading-relaxed text-gray-800 text-left mb-2"
                  >
                    {item.text}
                  </p>
                );
              }

              // 3. Рендеринг ВИДЕО МАШИНА 
              if (item.type === "video") {
                return (
                  <div
                    key={index}
                    className="w-full mb-6 max-sm:mb-4 text-left"
                  >
                    <div
                      onMouseEnter={(e) => {
                        if (isMobile) return;
                        setIsGalleryHovered(true);
                        const localVideo =
                          e.currentTarget.querySelector("video");
                        if (localVideo)
                          localVideo.play().catch((err) => console.log(err));
                      }}
                      onMouseLeave={(e) => {
                        if (isMobile) return;
                        setIsGalleryHovered(false);
                        const localVideo =
                          e.currentTarget.querySelector("video");
                        if (localVideo) {
                          localVideo.pause();
                          localVideo.currentTime = 0;
                        }
                      }}
                      onMouseMove={(e) => {
                        if (isMobile) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const currentX = e.clientX - rect.left;
                        const currentY = e.clientY - rect.top;

                        const leftBound = rect.width * 0.16;
                        const rightBound = rect.width * 0.84;

                        if (currentX >= leftBound && currentX <= rightBound) {
                          setGalleryCoords({ x: currentX, y: currentY });
                        } else {
                          setGalleryCoords({ x: -10, y: -10 });
                        }
                      }}
                      className="relative w-full aspect-video max-sm:h-auto max-sm:aspect-none overflow-hidden rounded-md max-sm:rounded-none bg-[#FBFBFA] sm:cursor-none group"
                    >
                      {/* СТАТИЧНАЯ ОБЛОЖКА: На мобилках px-4, на десктопе 68% без прыжков */}
                      {item.img && (
                        <img
                          src={item.img}
                          alt="Превью видео машины"
                          className={`${
                            isMobile
                              ? "relative w-full h-auto object-cover max-sm:px-4 max-sm:rounded-2xl shadow-sm z-10"
                              : "absolute top-1/2 left-1/2 w-[68%] h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none rounded-md z-10"
                          }`}
                        />
                      )}

                      {/* ХОЛСТ-ЗЕРКАЛО И ПЛАШКИ: Только на десктопе */}
                      {!isMobile && isGalleryHovered ? (
                        <>
                          {/* СЛОЙ 1 (z-10): ХОЛСТ ДЛЯ ДЕСКТОПА */}
                          <canvas
                            ref={(canvas) => {
                              if (!canvas) return;
                              const ctx = canvas.getContext("2d");
                              const video = canvas.parentElement
                                ? canvas.parentElement.querySelector("video")
                                : null;
                              if (ctx && video) {
                                const renderLoop = () => {
                                  if (video.paused || video.ended) return;
                                  ctx.clearRect(
                                    0,
                                    0,
                                    canvas.width,
                                    canvas.height,
                                  );
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
                                if (!video.paused) renderLoop();
                              }
                            }}
                            width={640}
                            height={360}
                            className="absolute top-1/2 left-1/2 w-[68%] h-full -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none animate-fade-in"
                            style={{ objectFit: "cover" }}
                          />

                          <div className="absolute top-0 left-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                          <div className="absolute top-0 right-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                        </>
                      ) : null}

                      {/* СКРЫТЫЙ ПЛЕЕР ДЛЯ ДЕСКТОПА */}
                      {!isMobile && (
                        <video
                          src={item.video}
                          playsInline
                          muted={isMuted}
                          preload="auto"
                          className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
                        />
                      )}

                      {/* ВСЮ ШИРИНУ ВИДЕО СНИЗУ (Мягкое рассеивание) */}
                      {!isMobile && (
                        <div className="video-radial-scrim z-25 pointer-events-none" />
                      )}

                      {/* СЛОЙ 5 (z-50): КУБИК СО СКВОЗНОЙ ПРОЗРАЧНОЙ ПЛОСКОСТЬЮ) */}
                      {!isMobile && isGalleryHovered && galleryCoords.x > 0 && (
                        <div
                          className="gallery-3d-cube-container pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
                          style={{
                            left: `${galleryCoords.x}px`,
                            top: `${galleryCoords.y}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <div className="cube-3d-core flex items-center justify-center">
                            {/* Боковые грани — вынос translateZ  14px */}
                            <div
                              className="cube-face"
                              style={{
                                transform: "rotateY(0deg) translateZ(14px)",
                              }}
                            ></div>
                            <div
                              className="cube-face"
                              style={{
                                transform: "rotateY(180deg) translateZ(14px)",
                              }}
                            ></div>
                            <div
                              className="cube-face"
                              style={{
                                transform: "rotateY(90deg) translateZ(14px)",
                              }}
                            ></div>
                            <div
                              className="cube-face"
                              style={{
                                transform: "rotateY(-90deg) translateZ(14px)",
                              }}
                            ></div>

                            {/* Сквозная плоскость — 14px для  пропорций */}
                            <div
                              className="cube-face"
                              style={{
                                transform: "rotateX(90deg) translateZ(14px)",
                                background: "transparent",
                                boxShadow: "none",
                              }}
                            ></div>
                            <div
                              className="cube-face"
                              style={{
                                transform: "rotateX(-90deg) translateZ(14px)",
                                background: "transparent",
                                boxShadow: "none",
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* КНОПКА ДИНАМИКА */}
                      {!isMobile && (
                        <button
                          onClick={toggleMute}
                          className="video-mute-btn absolute z-40 bg-black/15 hover:bg-purple-950 text-taupe-400 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-white/10"
                          style={{
                            bottom: "32px",
                            right: "calc(16% + 20px)",
                            cursor: "inherit"
                          }}
                          title={isMuted ? "Включить звук" : "Выключить звук"}
                        >
                          {isMuted ? (
                            <svg
                              xmlns="http://w3.org"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://w3.org"
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
                      )}

                      {/* СЛОЙ 3 (z-30): Внутренняя рамка */}
                      <div className="hidden sm:block absolute inset-0 z-30 pointer-events-none border-8 border-[#FBFBFA] rounded-md"></div>
                    </div>
                  </div>
                );
              }

              // 4. Рендеринг картинки под машиной
              if (item.type === "image") {
                return (
                  <img
                    key={index}
                    src={item.src}
                    alt="Элемент галереи"
                    className="max-w-full h-auto rounded-md object-contain text-left mb-6 pointer-events-none"
                  />
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
