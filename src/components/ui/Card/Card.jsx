import { useState, useRef, useEffect } from "react";

// Возвращаем ваши исходные стили
const variantStyles = {
  post: {
    container:
      "sm:min-h-[335px] p-5 sm:p-6 border border-gray-200/40 rounded-2xl mb-6 bg-[#FBFBFA]",
    title: "mb-4 sm:mb-6 font-bold text-2xl text-[#1A1A1A]",
    image: "hidden",
    infoWrapper: "flex gap-2 mb-4 flex-nowrap",
    date: "mb-4 text-lg",
    tags: "text-lg",
    description: "sm:text-[17px] line-clamp-3 text-[#444444]",
  },
  work: {
    container:
      "flex flex-col gap-[18px] sm:flex-row pb-6 sm:pb-9 border-b border-gray-200/40 mb-6 sm:mb-7 bg-[#FBFBFA]",
    title: "mb-4 text-2xl font-bold sm:text-2xl text-[#1A1A1A]",
    imgWrapper:
      "w-full sm:w-[246px] relative aspect-video overflow-hidden rounded-xl bg-gray-100 shrink-0",
    image: "w-full h-full object-cover rounded-xl absolute top-0 left-0 z-10",
    video: "w-full h-full object-cover rounded-xl absolute top-0 left-0 z-20",
    infoWrapper: "mb-4 flex gap-6 sm:gap-7 text-[20px]",
    date: "px-3 bg-[#1A1A1A] rounded-3xl text-white flex items-center justify-center text-sm font-medium",
    tags: "text-gray-400 font-medium",
    description: "text-[17px] line-clamp-3 text-[#444444]",
  },
  postBlog: {
    container:
      "pt-6 pb-6 sm:pt-8 sm:pb-7 border-b border-gray-200/40 bg-[#FBFBFA]",
    title:
      "text-[26px]/[30px] sm:text-[30px] mb-3 sm:mb-4 font-bold text-[#1A1A1A]",
    image: "hidden",
    infoWrapper:
      "flex gap-4 sm:gap-5 mb-3 sm:mb-4 font-bold text-gray-400 text-[17px] sm:text-[20px] font-medium",
    description: "text-[17px] line-clamp-3 text-[#444444]",
  },
};

export const Card = ({
  data,
  onOpenDetails,
  variant,
  isMuted = true,
  onToggleMute,
}) => {
  const { id, title, img, videoSrc, tags, description } = data;
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  const s = variantStyles[variant] || variantStyles.post;

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.muted = isMuted;
        videoRef.current.play().catch((err) => console.log(err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, isMuted]);

  return (
    <article
      onClick={() => onOpenDetails?.(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={(e) => setMouseCoords({ x: e.clientX, y: e.clientY })}
       className={`${s.container} ${variant === "work" && videoSrc ? "cursor-none" : "cursor-pointer"} transition-all duration-300 ${!videoSrc ? "hover:opacity-85" : ""} text-[#222222]`}
    >
      {variant === "work" && (
        <div className={s.imgWrapper}>
          {img && <img src={img} alt={title} className={s.image} />}

          {videoSrc && isHovered && (
            <>
              {/* ВСТАВЛЯЕМ КУРСОР ЗДЕСЬ */}
              <div
                className="cursor-ring flex items-center justify-center"
                style={{
                  left: `${mouseCoords.x}px`,
                  top: `${mouseCoords.y}px`,
                }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
              </div>
              <canvas
                ref={(canvas) => {
                  if (!canvas) return;
                  const ctx = canvas.getContext("2d");
                  const video = canvas.parentElement?.querySelector("video");
                  if (ctx && video) {
                    const renderLoop = () => {
                      if (video.paused || video.ended) return;
                      canvas.width = video.videoWidth || 320;
                      canvas.height = video.videoHeight || 180;
                      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                      requestAnimationFrame(renderLoop);
                    };
                    video.addEventListener("play", renderLoop);
                    if (!video.paused) renderLoop();
                  }
                }}
                className={`${s.video} pointer-events-none animate-fade-in`}
              />
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                autoPlay
                muted={isMuted}
                className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none -z-50"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute?.();
                }}
                style={{ cursor: "inherit" }}
                className="absolute bottom-3 right-3 z-30 text-amber-100 p-1.5 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center w-7 h-7 hover:scale-110 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-white/20 bg-[rgba(240,156,9,0.15)]"
                title={isMuted ? "Включить звук" : "Выключить звук"}
              >
                {isMuted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                    />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      )}
      <div className="flex-1">
        {title && <h3 className={s.title}>{title}</h3>}
        <div className={s.infoWrapper}>
          {(data.date || data.createdAt) && (
            <span className={s.date}>
              {data.date ||
                new Date(data.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </span>
          )}
          <span>|</span>
          {tags && <span className={s.tags}>{tags?.join(" ")}</span>}
        </div>
        {description && <p className={s.description}>{description}</p>}
      </div>
    </article>
  );
};
