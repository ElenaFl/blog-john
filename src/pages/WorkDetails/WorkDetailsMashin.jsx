import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithSkeleton } from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton.jsx";

export const WorkDetailMashin = ({ work }) => {
  const navigate = useNavigate();
  const videoRefs = useRef({});

  // 1. Инициализируем состояние БЕЗ useEffect
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false
  );

  const [isTouchDevice, setIsTouchDevice] = useState(() => 
    typeof window !== "undefined" 
      ? ("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches) 
      : false
  );

  // 2. Эффект только для подписки на изменения
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

        {work.gallery?.map((item, index) => {
          if (item.type === "heading")
            return <h4 key={index} className="text-xl sm:text-2xl text-black font-bold mt-6 mb-2 text-left">{item.text}</h4>;
          
          if (item.type === "text")
            return <p key={index} className="text-[16px] leading-relaxed text-gray-800 text-left mb-2">{item.text}</p>;

          if (item.type === "video") {
            return (
              <div key={index} className="w-full mb-6 text-left">
                <div
                  onMouseEnter={() => {
                    if (!isMobile && !isTouchDevice) videoRefs.current[index]?.play().catch(() => {});
                  }}
                  onMouseLeave={() => {
                    if (videoRefs.current[index]) {
                      videoRefs.current[index].pause();
                      videoRefs.current[index].currentTime = 0;
                    }
                  }}
                  className="relative w-full aspect-video overflow-hidden rounded-md bg-[#FBFBFA] sm:cursor-none"
                >
                  {item.img && <img src={item.img} alt="Preview" className="w-full h-auto" />}
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={item.video}
                    playsInline
                    muted
                    className="hidden"
                  />
                </div>
              </div>
            );
          }

          if (item.type === "image")
            return <ImageWithSkeleton key={index} src={item.src} className="w-full h-auto rounded-md mb-6" />;

          return null;
        })}
      </div>
    </div>
  );
};
