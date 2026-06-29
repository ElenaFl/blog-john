import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card/Card.jsx";

export const WorksPage = () => {
  const [works, setWorks] = useState([]);

  //Синхронизация звука видео с localStorage, чтобы динамик работал
  const [globalMuted, setGlobalMuted] = useState(() => {
    const savedMuteStatus = localStorage.getItem("video_muted");
    return savedMuteStatus ? JSON.parse(savedMuteStatus) : true;
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("video_muted", JSON.stringify(globalMuted));
  }, [globalMuted]);

  const toggleMute = () => {
    setGlobalMuted((prev) => !prev);
  };

  useEffect(() => {
    const fetchWorks = async () => {
      const response = await fetch(`http://localhost:5000/api/works`);

      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }
      const data = await response.json();

      setWorks(data);
    };
    fetchWorks();
  }, []);

  return (
    <div className="sm:max-w-[858px] ml-auto mr-auto pt-6 sm:pt-36 pl-4 pr-4 mb-6 sm:mb-8">
      <h2 className="mt-3 sm:mt-[18px] text-3xl sm:text-[44px] font-bold mb-4 leading-tight text-[var(--text-h)]">
        WORK
      </h2>
      <div className="pt-6 sm:pt-[36px]">
        {works &&
          works.map((work, index) => (
            <Card
              key={work.id || index}
              data={work}
              variant="work"
              onOpenDetails={() => navigate(`/work-details/${work.id}`)}
              isMuted={globalMuted} //работа звука
              onToggleMute={toggleMute} //работа звука
            />
          ))}
      </div>
    </div>
  );
};
