import React, { useState } from "react";

export const ImageWithSkeleton = ({ src, alt, className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gray-100 ${className}`}>
      {/* Собственный встроенный мерцающий слой (показывается, пока картинка не загружена полностью) */}
      {!isLoaded && (
        <div className="absolute inset-0 w-full h-full bg-gray-200/70 animate-pulse rounded-2xl" />
      )}
      
      {/* Real Image 
          Cпециальная защита от iOS Haptic Touch:
          - pointer-events-none: клики летят сразу на карточку, предотвращая системный "отрыв" картинки
          - select-none: отключает выделение
          - [-webkit-touch-callout:none]: убирает вызов меню сохранения картинки в Safari */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)} // Событие срабатывает при полной загрузке файла
        className={`w-full h-full object-cover transition-opacity duration-500 rounded-2xl pointer-events-none select-none [touch-callout:none] [-webkit-touch-callout:none] ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
