import { useRef, useState } from 'react';
import { Volume2, Square } from 'lucide-react';

export const AudioJohn = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="inline-flex items-center">
      <audio 
        ref={audioRef} 
        src="/audio/john-voice.wav"
        onEnded={() => setIsPlaying(false)} 
      />

      <button
        onClick={toggleAudio}
        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide 
          bg-[#FBFBFA] text-[#222222]
          border border-gray-200/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] 
          transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] 
          group cursor-pointer
          ${isPlaying 
            ? 'border-[#00A8CC]/40 shadow-[0_4px_15px_rgba(0,168,204,0.05)]' 
            : 'hover:border-gray-300/80'
          }`}
      >
        {isPlaying ? (
          <Square size={14} className="text-[#00A8CC]" fill="currentColor" />
        ) : (
          <Volume2 size={14} className="text-gray-400 group-hover:text-[#222222] transition-colors" />
        )}
        
        <span className="uppercase text-[11px] tracking-widest">
          {isPlaying ? 'Stop Listening' : 'Hear John'}
        </span>
      </button>
    </div>
  );
};
