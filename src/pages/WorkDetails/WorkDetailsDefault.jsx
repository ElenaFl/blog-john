import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithSkeleton } from "../../components/ui/ImageWithSkeleton/ImageWithSkeleton.jsx";

export const WorkDetailsDefault = ({ work }) => {
  const navigate = useNavigate();

  // Состояния
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [mainCoords, setMainCoords] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(() => {
    const savedMuteStatus = localStorage.getItem("video_muted");
    return savedMuteStatus ? JSON.parse(savedMuteStatus) : false;
  });

  const mainVideoRef = useRef(null);

  // Инициализация размеров и тач-девайсов
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);

    if (typeof window !== "undefined") {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
      setIsTouchDevice(hasTouch);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Синхронизация звука
  useEffect(() => {
    localStorage.setItem("video_muted", JSON.stringify(isMuted));
    if (mainVideoRef.current) mainVideoRef.current.muted = isMuted;
  }, [isMuted]);

  // Управление воспроизведением
  const showMainVideo = work?.detailVideoSrc && isMainHovered && !isTouchDevice;
  useEffect(() => {
    const video = mainVideoRef.current;
    if (!video) return;
    if (showMainVideo) {
      video.muted = isMuted;
      video.play().catch((err) => { if (err.name !== "AbortError") console.log("Video play error:", err); });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [showMainVideo, isMuted]);

  // Парсинг данных
  let galleryImages = [];
  try {
    galleryImages = typeof work.gallery === "string" ? JSON.parse(work.gallery) : work.gallery || [];
  } catch (e) { console.error("Gallery parse error:", e); }

  const tagsArray = Array.isArray(work.tags) ? work.tags : typeof work.tags === "string" ? JSON.parse(work.tags || "[]") : [];
  const formattedTags = tagsArray.map(t => `#${t.startsWith("#") ? t.slice(1) : t}`).join(" ");

  const lowerTitle = work.title?.toLowerCase() || "";
  const isGirlProject = lowerTitle.includes("девуш") || lowerTitle.includes("girl") || lowerTitle.includes("portrait");
  const hasProcessContent = work.sectionTitle && work.processText;

  const toggleMute = (e) => { e.stopPropagation(); setIsMuted(!isMuted); };

  return (
    <div className="pt-12 sm:pt-36 bg-transparent">
      <div className="sm:max-w-[858px] ml-auto mr-auto pl-4 pr-4 sm:pl-6 sm:pr-6 mb-16">
        <button onClick={() => navigate(-1)} className="mb-8 text-[var(--accent)] hover:text-[#00809B] cursor-pointer flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors">
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
          <span className="text-[15px] sm:text-[17px] text-gray-400 font-medium tracking-wide">{formattedTags}</span>
        </div>

        <div className="max-w-3xl mx-auto p-6 max-sm:p-0 mb-10 max-sm:mb-6">
          <div
            onMouseEnter={() => setIsMainHovered(true)}
            onMouseLeave={() => { setIsMainHovered(false); setMainCoords({ x: -100, y: -100 }); }}
            onMouseMove={(e) => {
              if (isTouchDevice || isMobile) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const currentX = e.clientX - rect.left;
              const currentY = e.clientY - rect.top;
              const leftBound = rect.width * 0.16;
              const rightBound = rect.width * 0.84;
              const bottomBound = rect.height * 0.86;

              if (currentX >= leftBound && currentX <= rightBound && currentY <= bottomBound) {
                setMainCoords({ x: currentX, y: currentY });
              } else {
                setMainCoords({ x: -100, y: -100 });
              }
            }}
            className="relative w-full aspect-video overflow-hidden rounded-2xl bg-[#FBFBFA] cursor-none group select-none [transform:translateZ(0)]"
          >
            {isMobile ? (
              work.img && <img src={work.img} alt={work.title} className="w-full h-full object-cover rounded-2xl" />
            ) : work.detailVideoSrc && work.detailVideoSrc.trim() !== "" ? (
              <>
                <video ref={mainVideoRef} src={work.detailVideoSrc} playsInline muted={isMuted} preload="auto" className={`absolute top-0 h-full object-cover pointer-events-none z-10 rounded-2xl transition-all duration-300 ${isGirlProject ? "left-[16%] w-[68%]" : "left-0 w-full"}`} />
                {isGirlProject && (
                  <>
                    <div className="absolute top-0 left-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 bottom-0 w-[16%] bg-[#FBFBFA] z-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-[16%] right-[16%] h-[14%] bg-[#FBFBFA] z-20 pointer-events-none rounded-b-2xl"></div>
                  </>
                )}
                {isMainHovered && mainCoords.x > 0 && (
                  <div className="floating-3d-cursor" style={{ position: "absolute", left: `${mainCoords.x}px`, top: `${mainCoords.y}px`, transform: "translate(-50%, -50%)", pointerEvents: "none", userSelect: "none" }}>
                    <div className="lotus-3d-core flex items-center justify-center">
                       <div className="lotus-center"></div>
                       {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                         <div key={deg} className="lotus-petal" style={{ transform: `rotateZ(${deg}deg) rotateX(-25deg) translateY(-10px) translateZ(0px)` }}></div>
                       ))}
                    </div>
                  </div>
                )}
                <button onClick={toggleMute} className="absolute z-40 shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-white/20 bg-[rgba(240,156,9,0.15)] text-amber-100 p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center w-10 h-10 cursor-pointer" style={{ bottom: isGirlProject ? "calc(14% + 16px)" : "24px", right: isGirlProject ? "calc(16% + 20px)" : "24px" }}>
                   {/* SVG иконка звука */}
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d={isMuted ? "M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" : "M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"} /></svg>
                </button>
                <div className={`absolute top-0 z-30 pointer-events-none border-8 border-[#FBFBFA] rounded-2xl ${isGirlProject ? "left-[16%] w-[68%] h-full" : "left-0 w-full h-full"}`}></div>
              </>
            ) : work.img && <img src={work.img} alt={work.title} className="w-full h-full object-cover rounded-2xl" />}
          </div>
        </div>

        <div style={{ textAlign: "justify" }} className="whitespace-pre-line text-[18px] sm:text-[20px] leading-relaxed opacity-95 text-[#222222] mb-12">
          {work.description}
        </div>

        {!isGirlProject && hasProcessContent && (
          <div className="border-t border-gray-200/40 pt-10 mb-12 animate-fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-h)] mb-4 tracking-tight">{work.sectionTitle}</h3>
            <p style={{ textAlign: "justify" }} className="whitespace-pre-line text-[18px] sm:text-[20px] leading-relaxed opacity-95 text-[#444444]">{work.processText}</p>
          </div>
        )}

        {!isGirlProject && galleryImages.length > 0 && (
          <div className="space-y-6 mb-12 border-t border-gray-200/40 pt-10 animate-fade-in">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Project Gallery</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {galleryImages.map((img, i) => <div key={i} className="rounded-2xl overflow-hidden border border-gray-200/40 aspect-video"><ImageWithSkeleton src={img} className="w-full h-full object-cover" /></div>)}
            </div>
          </div>
        )}

        {work.projectLink && (
           <div className="border-t border-gray-200/40 pt-10 text-center sm:text-left">
             <a href={work.projectLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-widest py-3.5 px-8 rounded-xl bg-[#1A1A1A] text-white hover:bg-[#00809B] transition-all duration-300 no-underline">Visit Live Website ↗</a>
           </div>
        )}
      </div>
    </div>
  );
};
