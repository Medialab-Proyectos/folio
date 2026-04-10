'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/app-context';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { GarageFolioLogo } from '@/components/shared/garagefolio-logo';

export default function SplashPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  useEffect(() => {
    if (currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  if (currentUser) return null;

  return (
    <div className="h-[100dvh] relative overflow-hidden font-nunito bg-[#fdfdfd]">
      {/* Golden gradient background - covers top ~72% */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '72%',
          background: 'linear-gradient(160deg, #B4955C 0%, #DACEAE 63%)',
        }}
      />

      {/* White diagonal section - bottom portion */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '50%',
          background: '#fdfdfd',
          clipPath: 'polygon(0 25%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Logo - dark variant, right-aligned like Figma (x=196 of 393) */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/4 z-10">
        <GarageFolioLogo variant="dark" size="lg" showText={true} />
      </div>

      {/* Car image - large, starts off-screen left, ~70% visible */}
      <img
        src="/auth-car.png"
        alt=""
        className="absolute pointer-events-none z-[2]"
        style={{
          top: '14%',
          left: '-70%',
          width: '190%',
          height: 'auto',
          maxWidth: 'none',
          filter: 'drop-shadow(0px 8px 10px rgba(0,0,0,0.2))',
        }}
        aria-hidden="true"
      />

      {/* Text + Button - positioned in the white zone using flex to avoid overlap */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-[24px] pb-[40px] flex flex-col" style={{ top: '67%' }}>
        <div className="flex flex-col gap-3 flex-1 justify-center">
          <div className="flex flex-col">
            <h1 className="font-nunito font-semibold text-[32px] leading-[1.1] text-[#1a1a1a]">
              Redefining the way
            </h1>
            <h1 className="font-nunito font-semibold text-[32px] leading-[1.1] text-[#8d6941]">
              to preserve cars
            </h1>
          </div>
          <p className="font-nunito text-base leading-normal text-[#727272]">
            {`Great stories don't belong in dusty folders. Preserve your car's legacy — one log at a time.`}
          </p>
        </div>

        <div className="mt-auto">
        <button
          onClick={() => router.push('/login')}
          className="w-full h-[46px] bg-[#b4955c] hover:bg-[#a5824d] rounded-xl flex items-center justify-center gap-3 font-nunito font-semibold text-base text-[#1a1a1a] transition-all active:scale-[0.97] shadow-md hover:shadow-lg cursor-pointer"
        >
          {`Let's Go`}
          <ArrowRight className="w-5 h-5" />
        </button>
        </div>
      </div>
    </div>
  );
}
