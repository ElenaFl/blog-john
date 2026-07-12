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
  const [hoveredVideos, setHoveredVideos] = useState({});

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
          //     <div key={index} className="w-full rounded-2xl mb-6">
          //       <div
          //         onMouseEnter={() => {
          //           if (!isMobile && !isTouchDevice) videoRefs.current[index]?.play().catch(() => {});
          //         }}
          //         onMouseLeave={() => {
          //           if (videoRefs.current[index]) {
          //             videoRefs.current[index].pause();
          //             videoRefs.current[index].currentTime = 0;
          //           }
          //         }}
          //         className="relative max-w-3xl aspect-video overflow-hidden rounded-md bg-[#FBFBFA] sm:cursor-none"
          //       >
          //         {item.img && <img src={item.img} alt="Preview" className=" mx-auto p-6 max-sm:p-0 mb-10 max-sm:mb-6 rounded-2xl w-full h-full object-cover"/>}
          //         <video
          //           ref={(el) => (videoRefs.current[index] = el)}
          //           src={item.video}
          //           playsInline
          //           muted
          //           className="hidden"
          //         />
          //       </div>
          //     </div>
          //   );
          // }

          if (item.type === "video") {
            return (
              <div
                key={index}
                className="w-full flex justify-center mb-10 max-sm:mb-6"
              >
                <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-[#FBFBFA] shadow-sm">
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={item.video}
                    // Постер — это картинка, она будет видна, пока видео не играет
                    poster={item.img}
                    playsInline
                    muted
                    loop
                    preload="metadata"
                    // Запускаем только на десктопе
                    onMouseEnter={() => {
                      if (!isMobile && !isTouchDevice) {
                        videoRefs.current[index]?.play().catch(() => {});
                      }
                    }}
                    // Останавливаем при уходе курсора
                    onMouseLeave={() => {
                      if (!isMobile && !isTouchDevice) {
                        const vid = videoRefs.current[index];
                        if (vid) {
                          vid.pause();
                          vid.currentTime = 0;
                        }
                      }
                    }}
                    // h-auto позволяет видео самому определять высоту без искажений
                    className="w-full h-auto block"
                  />
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
