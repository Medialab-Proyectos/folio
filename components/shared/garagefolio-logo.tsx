'use client';

interface GarageFolioLogoProps {
  variant?: 'dark' | 'gold' | 'white';
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 20,
  md: 26,
  lg: 32,
  xl: 44,
};

export function GarageFolioLogo({
  variant = 'dark',
  showText = true,
  className = '',
  size = 'md',
}: GarageFolioLogoProps) {
  const height = sizeMap[size];
  const src = variant === 'gold' ? '/logo-gold.png' : '/logo-dark.png';

  // Fallback para hacer el logo blanco usando un filtro CSS si es necesario
  const filter = variant === 'white' ? 'brightness(0) invert(1)' : 'none';

  return (
    <div 
      className={`relative inline-flex items-center justify-start ${className}`}
      style={{ 
        height, 
        width: showText ? 'auto' : height * 1.15, 
        overflow: 'hidden' 
      }}
    >
      <img
        src={src}
        alt="GarageFolio Logo"
        style={{ 
          height: '100%', 
          width: 'auto', 
          maxWidth: 'none', 
          objectFit: 'contain', 
          objectPosition: 'left',
          filter 
        }}
      />
    </div>
  );
}
