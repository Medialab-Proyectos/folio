'use client';

interface AuthBackgroundProps {
  children: React.ReactNode;
  showCarImage?: boolean;
}

export function AuthBackground({ children, showCarImage = false }: AuthBackgroundProps) {
  return (
    <div className="min-h-[100dvh] relative overflow-hidden font-nunito bg-[#fdfdfd]">
      {/* Golden gradient background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(160deg, #B4955C 0%, #DACEAE 63%)',
        }}
      />

      {/* Car image - visible when showCarImage is true */}
      {showCarImage && (
        <img
          src="/auth-car.png"
          alt=""
          className="absolute top-[15%] left-1/2 -translate-x-[45%] w-[160vw] max-w-[650px] sm:max-w-[750px] md:max-w-none md:w-[650px] lg:w-[750px] object-contain pointer-events-none drop-shadow-2xl z-[1]"
          aria-hidden="true"
        />
      )}

      {/* Decorative curved lines - top left */}
      <img
        src="/auth-lines-tl.svg"
        alt=""
        className="absolute -top-[200px] -left-[250px] sm:-top-[276px] sm:-left-[334px] w-[400px] h-[380px] sm:w-[548px] sm:h-[521px] opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative curved lines - bottom right */}
      <img
        src="/auth-lines-br.svg"
        alt=""
        className="absolute -bottom-[100px] -right-[200px] sm:-bottom-[140px] sm:-right-[280px] w-[400px] h-[380px] sm:w-[548px] sm:h-[521px] opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      {/* White lower section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[30%] sm:h-[35%] bg-[#fdfdfd]"
        style={{
          clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}

export function AuthCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full max-w-[345px] sm:max-w-[380px] bg-white rounded-xl shadow-[0px_0px_20px_4px_rgba(0,0,0,0.15)] px-5 py-7 sm:px-6 sm:py-8 flex flex-col items-center gap-6 sm:gap-8 animate-fade-in-up ${className}`}>
      {children}
    </div>
  );
}
