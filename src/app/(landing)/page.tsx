"use client"
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/countdown-timer';
import Image from 'next/image';
import Link from 'next/link';
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
    <main className="min-h-screen bg-black flex flex-col items-center justify-between text-white font-sans">
      {/* Hero Section */}
      <section className="w-full relative h-[620px] sm:h-[820px] flex items-end justify-center">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover object-top opacity-90"
          >
            <source src="/landing.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Bottom fade overlay — independent of masthead */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black to-transparent z-[2]" />
        {/* Masthead layer */}
        <div className="absolute w-full flex flex-col items-center pb-8 px-8 z-10">
          <Image src="/assets/masthead.svg" className='sm:-mb-36 -mb-10' alt="YTHWKND and the Multiverse of Mystery Logo" width={700} height={700} />
        </div>
      </section>

      {/* Event Details */}
      <section className="w-full max-w-xl flex flex-col items-center px-6 py-8 z-10 mt-16 sm:mt-36">
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-jejuhallasan tracking-wide text-[#bababa] uppercase">30 May to 1 June</div>
          <div className="border-t border-gray-500 w-24 mx-auto my-6" />
          <div className="text-4xl md:text-5xl font-jejuhallasan tracking-wide text-[#bababa] uppercase leading-none">
            Peacehaven<br />Genting Highlands
          </div>
        </div>

        <div className="border-t border-gray-500 w-24 mx-auto my-6" />
        {/* Pricing */}
        <div className="flex flex-col gap-4 text-center w-full">
          {[
            { price: "RM160", label1: "YM", label2: "MEMBER" },
            { price: "RM130", label1: "NEW", label2: "FRIENDS" },
          ].map((item) => (
            <div
              key={item.label1 + item.label2}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-4xl md:text-5xl font-jejuhallasan text-[#bababa]">
                {item.price}
              </span>
              <div className="flex flex-col text-start leading-none">
                <span className="text-lg text-[#bababa] leading-none">{item.label1}</span>
                <span className="text-lg text-[#bababa] leading-none">{item.label2}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-[#bababa] mt-10 uppercase">
          *For non-Muslims only
        </div>
        {/* Register Button - only show after registration opens */}
        {isRegistrationOpen && (
          <div className="w-full mt-8">
            <Button
              asChild
              className="w-full rounded-full py-6 text-2xl font-jejuhallasan bg-white text-black hover:bg-gray-200"
            >
              <Link href="/register">Register now</Link>
            </Button>
          </div>
        )}
        {/* Countdown Timer - only show before registration opens */}
        {!isRegistrationOpen && (
          <div className="w-full mt-8">
            <div className="text-center mb-4">
              <p className="text-[#BABABA] text-2xl font-jejuhallasan">
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
