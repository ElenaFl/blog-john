export const PostSkeleton = () => {
  return (
    <div className="animate-pulse space-y-5 border-b border-gray-100 pb-10 w-full">
      {/* Заголовок статьи */}
      <div className="h-7 w-3/4 bg-gray-200/85 rounded-xl" />

      {/* Мета-информация (дата, теги) */}
      <div className="flex gap-4 items-center pt-1">
        <div className="h-4 w-20 bg-gray-200/50 rounded-lg" />
        <div className="h-4 w-32 bg-gray-200/50 rounded-lg" />
      </div>

      {/* Обложка статьи */}
      <div className="h-[220px] sm:h-[380px] w-full bg-gray-200/60 rounded-2xl my-2" />

      {/* Строки текста превью */}
      <div className="space-y-3 pt-2">
        <div className="h-4 w-full bg-gray-200/85 rounded-lg" />
        <div className="h-4 w-11/12 bg-gray-200/85 rounded-lg" />
        <div className="h-4 w-4/5 bg-gray-200/85 rounded-lg" />
      </div>
    </div>
  );
};
