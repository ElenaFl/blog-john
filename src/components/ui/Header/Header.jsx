import { useState } from "react";
import { Link } from "react-router-dom";

const menu = [
  { path: "/", name: "Home" },
  { path: "/blog", name: "Blog" },
  { path: "/works", name: "Works" },
  { path: "/contact", name: "Contact" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative w-full z-50">
      <div className="w-full bg-[#FBFBFA]">
        <div className="max-w-[1032px] mx-auto pt-5 pb-5 px-4 sm:pt-7 sm:pb-3">
          
          <div className="flex justify-end items-center">
            {/* Десктопное меню */}
            <nav className="hidden sm:flex gap-8">
              {menu.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="pb-3 text-xs font-bold uppercase tracking-widest text-[#222222] hover:text-[#00809B] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Мобильная кнопка */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="block sm:hidden pb-3 cursor-pointer focus:outline-none"
              aria-label="Toggle menu"
            >
              <img
                className="w-[30px] h-[20px] object-contain opacity-80 hover:opacity-100 transition-opacity"
                src="/images/menu.jpg"
                alt="burger-menu"
              />
            </button>
          </div>

          {/* Мобильное меню */}
          {isOpen && (
            <nav className="flex flex-col items-center gap-4 pt-5 pb-5 border border-gray-200/40 rounded-xl sm:hidden animate-fade-in mt-2 bg-[#FBFBFA]">
              {menu.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold uppercase tracking-widest text-[#222222] hover:text-[#00809B] py-1.5 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
