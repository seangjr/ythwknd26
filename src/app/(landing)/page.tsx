"use client"
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/countdown-timer';
import Image from 'next/image';
import { TransitionLink } from '@/components/transition-link';
import { useEffect, useState } from 'react';

// 🌌 In a parallel universe, this code is written in Klingon
export default function Home() {
  const targetDate = new Date(2024, 2, 30, 12, 30, 0); // March 30, 2026, 12:30 PM (bypassed for dev)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      setIsRegistrationOpen(new Date() >= targetDate);
    };
    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-between text-[#F7EAD9] font-sans">
      {/* Hero Section */}
      <section className="w-full relative h-screen flex items-end justify-center">
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ maskImage: 'linear-gradient(to bottom, white 40%, transparent 75%)', WebkitMaskImage: 'linear-gradient(to bottom, white 40%, transparent 75%)' }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 min-h-full min-w-full"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          >
            <source src="/landing.webm" type="video/webm" />
          </video>
        </div>
        {/* Masthead layer */}
        <div className="absolute w-full flex flex-col items-center pb-8 px-8 z-10">
          <Image src="/assets/masthead.svg" className='md:mb-0 mb-32' alt="YTHWKND and the Multiverse of Mystery Logo" width={700} height={700} priority />
        </div>
      </section>

      {/* Event Details */}
      <section className="w-full max-w-xl flex flex-col items-center px-6 py-8 z-10">
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-jejuhallasan tracking-tighter text-[#F7EAD9] uppercase mb-5">30 May to 1 June</div>
          {/* <div className="border-t border-gray-500 w-24 mx-auto my-6" /> */}
          <div className="text-4xl md:text-5xl font-jejuhallasan tracking-tighter text-[#F7EAD9] uppercase leading-none mb-5">
            Peacehaven<br />Genting Highlands
          </div>
        </div>

        {/* <div className="border-t border-gray-500 w-24 mx-auto my-6" /> */}
        {/* Pricing */}
        <div className="flex flex-col gap-2 text-center w-full">
          {[
            { price: "RM160", label1: "YM", label2: "MEMBER" },
            { price: "RM130", label1: "NEW", label2: "FRIENDS" },
          ].map((item) => (
            <div
              key={item.label1 + item.label2}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-4xl md:text-5xl font-jejuhallasan tracking-tighter text-[#F7EAD9]">
                {item.price}
              </span>
              <div className="flex flex-col text-start leading-none">
                <span className="text-lg text-[#F7EAD9] leading-none">{item.label1}</span>
                <span className="text-lg text-[#F7EAD9] leading-none">{item.label2}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-[#F7EAD9] mt-10 uppercase">
          *For non-Muslims only
        </div>
        {/* Register Button - only show after registration opens */}
        {isRegistrationOpen && (
          <div className="w-full mt-8">
            <Button
              asChild
              variant="parchment" size="2xl" className="w-full"
            >
              <TransitionLink href="/register">Register now</TransitionLink>
            </Button>
          </div>
        )}
        {/* Countdown Timer - only show before registration opens */}
        {!isRegistrationOpen && (
          <div className="w-full mt-8">
            <div className="text-center mb-4">
              <p className="text-[#F7EAD9] text-2xl font-jejuhallasan">
                Registration opens on March 30, 2026 at 12:30 PM
              </p>
            </div>
            <CountdownTimer targetDate={targetDate} />
          </div>
        )}
      </section>
    </main>
  );
}
