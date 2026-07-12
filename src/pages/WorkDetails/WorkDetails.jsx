import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { WorkDetailsDefault } from "./WorkDetailsDefault.jsx";
import { WorkDetailsMashin } from "./WorkDetailsMashin.jsx";

export const WorkDetails = () => {
  const { id } = useParams();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || "https://john-back-elenafl.amvera.io";
        const response = await fetch(`${apiUrl}/api/works/${id}`);
        if (!response.ok) throw new Error("Ошибка загрузки");
        const data = await response.json();
        setWork(data);
      } catch (err) {
        console.error("Ошибка при получении работы:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, [id]);

  if (loading) {
    return <div className="text-center py-24 text-gray-400">Загрузка...</div>;
  }

  if (!work) {
    return <div className="text-center py-24 text-gray-400">Проект не найден.</div>;
  }

  // ЛОГИКА ДИСПЕТЧЕРИЗАЦИИ:
  // Проверяем заголовок на ключевые слова вашего проекта "Designing Dashboards & Automotive Interfaces"
  // Также оставляем проверку по ID, если нужно форсировать отображение для конкретной записи
  const isMashinProject = 
    work.title?.toLowerCase().includes("automotive") || 
    work.title?.toLowerCase().includes("dashboard") || 
    work.category === "mashin" || 
    id === "1"; // Если ID машины именно 1

  return isMashinProject ? (
    <WorkDetailsMashin work={work} />
  ) : (
    <WorkDetailsDefault work={work} />
  );
};