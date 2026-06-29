import { AudioJohn } from "../AudioJohn/AudioJohn.jsx";

export const Banner = () => {
  return (
    <section
      id="banner"
      className="pt-8 sm:pt-[160px] pb-12 sm:pb-[76px] px-6 text-[17px]"
    >
      <div className="sm:max-w-[858px] mx-auto">
        <div className="flex flex-col items-center md:flex-row sm:justify-between">
          <div className="sm:w-[60%] w-full order-2 md:order-1 flex flex-col items-center md:items-start">
            <h1 className="sm:mt-4 sm:mb-8 mb-3 font-bold sm:text-[44px]/[50px] text-[32px]/[36px] md:text-left text-center">
              Hi, I am John, Creative Technologist
            </h1>
            <p className="sm:mb-9 mb-0 md:text-left text-center opacity-90 leading-relaxed text-base">
              I specialize in creating intuitive digital products by combining
              design aesthetics with powerful technical solutions. My approach
              is based on a deep analysis of user experience and a commitment to
              functional simplicity. I help brands transform complex ideas into
              elegant interfaces that work effectively on any device.
            </p>
            
            <div className="flex items-center flex-wrap justify-center md:justify-start gap-4 mt-6">
              <a
                href="/Resume.pdf"
                download="John_Resume.pdf"
                className="text-[11px] font-bold uppercase tracking-widest py-3 px-6 rounded-xl 
                  bg-[#1A1A1A] text-white shadow-[0_4px_15px_rgba(0,0,0,0.06)] 
                  transition-all duration-300 hover:bg-[#222222] hover:scale-[1.03] 
                  active:scale-[0.98] inline-flex items-center justify-center no-underline cursor-pointer"
              >
                Download Resume
              </a>
              
              <AudioJohn />
            </div>
          </div>
          
          <div className="w-full md:w-[30%] order-1 md:order-2 mb-3 sm:mb-9 flex justify-center">
            <picture>
              <source media="(min-width: 640px)" srcSet="/images/fotoBig.jpg" />
              <img
                src="/images/fotoSmall.jpg"
                alt="John"
                loading="lazy"
                className="bg-[#FBFBFA] object-cover sm:w-60 sm:h-60 w-[174px] h-[174px] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.05)] pointer-events-none"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
};

