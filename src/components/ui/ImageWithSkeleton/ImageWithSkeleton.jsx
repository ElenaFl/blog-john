import { useState } from "react";

export const ImageWithSkeleton = ({ src, alt, className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gray-100 ${className}`}
    >
      {/* Собственный встроенный мерцающий слой (показывается, пока картинка не загружена полностью) */}
      {!isLoaded && (
        <div className="absolute inset-0 w-full h-full bg-gray-200/70 animate-pulse rounded-2xl" />
      )}

      {/* Реальное изображение */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)} // Событие срабатывает при полной загрузке файла
        className={`w-full h-full object-cover transition-opacity duration-500 rounded-2xl ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
