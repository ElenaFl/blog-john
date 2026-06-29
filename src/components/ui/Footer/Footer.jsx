export const Footer = () => {
  return (
    <footer className="pt-52 pb-14 sm:pt-64 text-[#222222]">
      <div className="w-full sm:max-w-[858px] mx-auto">
        <div className="mb-6 flex justify-center items-center gap-6">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
            <img
              src="/images/insta.svg"
              alt="Instagram"
              className="w-[18px] h-[18px] sm:w-[24px] sm:h-[24px] object-cover"
            />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
            <img
              src="/images/github.jpg"
              alt="GitHub"
              className="w-[20px] h-[20px] sm:w-[26px] sm:h-[26px] object-cover"
            />
          </a>
        </div>
        
        <p className="text-[14px] text-center opacity-70">
          Copyright © {new Date().getFullYear()} All rights reserved
        </p>
      </div>
    </footer>
  );
};
