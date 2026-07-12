import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithSkeleton } from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton.jsx";

export const WorkDetailMashin = ({ work }) => {
  const navigate = useNavigate();

  // Состояния для логики галереи
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("video_muted") || "false");
    } catch {
      return false;
    }
  });
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [galleryCoords, setGalleryCoords] = useState({ x: -10, y: -10 });

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev;
      localStorage.setItem("video_muted", JSON.stringify(newState));
      return newState;
    });
  };

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

        {/* --- ГАЛЕРЕЯ СО СМЕЩЕНИЕМ ВЛЕВО --- */}
        {work.gallery && work.gallery.length > 0 && (
          <div className="flex flex-col gap-8 mt-8 mb-10 items-start w-full">
            {work.gallery.map((item, index) => {
              if (item.type === "heading")
                return (
                  <h4
                    key={index}
                    className="text-xl sm:text-2xl text-black font-bold mt-6 mb-2 text-left"
                  >
                    {item.text}
                  </h4>
                );
              if (item.type === "text")
                return (
                  <p
                    key={index}
                    className="text-[16px] leading-relaxed text-gray-800 text-left mb-2"
                  >
                    {item.text}
                  </p>
                );

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
                        const v = e.currentTarget.querySelector("video");
                        if (v) v.play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        if (isMobile) return;
                        setIsGalleryHovered(false);
                        const v = e.currentTarget.querySelector("video");
                        if (v) {
                          v.pause();
                          v.currentTime = 0;
                        }
                      }}
                      onMouseMove={(e) => {
                        if (isMobile) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        setGalleryCoords({
                          x:
                            x > rect.width * 0.16 && x < rect.width * 0.84
                              ? x
                              : -10,
                          y,
                        });
                      }}
                      className="relative w-full aspect-video overflow-hidden rounded-md bg-[#FBFBFA] sm:cursor-none group"
                    >
                      {item.img && (
                        <img
                          src={item.img}
                          alt="Preview"
                          className={
                            isMobile
                              ? "relative w-full h-auto px-4 rounded-2xl"
                              : "absolute top-1/2 left-1/2 w-[68%] h-full -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none"
                          }
                        />
                      )}
                      {!isMobile && isGalleryHovered && (
                        <>
                          <canvas
                            ref={(c) => {
                              if (c) {
                                /* Логика рендера канваса */
                              }
                            }}
                            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                          />
                          <div className="absolute top-0 left-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none" />
                          <div className="absolute top-0 right-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none" />
                        </>
                      )}
                      {!isMobile && (
                        <video
                          src={item.video}
                          playsInline
                          muted={isMuted}
                          className="fixed top-0 left-0 w-px h-px opacity-0 -z-50"
                        />
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
        )}
      </div>
    </div>
  );
};
