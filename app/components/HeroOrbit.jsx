"use client";

import { useState, useEffect } from "react";

export default function HeroOrbit() {
  // Start at middle to avoid blank beginning
  const INITIAL_OFFSET = 10000;

  const [scrollOffset, setScrollOffset] = useState(INITIAL_OFFSET);
  const [screenWidth, setScreenWidth] = useState(null);

  useEffect(() => {
    setScreenWidth(window.innerWidth);

    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Smooth infinite scroll
    const interval = setInterval(() => {
      setScrollOffset((prev) => {
        // Reset BEFORE end of large loop
        if (prev > 20000) return INITIAL_OFFSET;
        return prev + 2;
      });
    }, 50);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, []);

  const images = [
    "/images/a1.jpeg",
    "/images/a2.jpeg",
    "/images/a3.jpeg",
    "/images/a4.jpeg",
    "/images/a5.jpeg",
    "/images/a6.jpeg",
    "/images/a7.jpeg",
    "/images/a8.jpeg",
    "/images/a9.jpeg",
    "/images/a10.jpeg",
  ];

  if (!screenWidth) return null;

  // BIG extended list for perfect infinite scroll
  const extended = Array(20)
    .fill(null)
    .flatMap(() => images);

  const spacing = 320;

  const renderItems = () => {
    return extended.map((img, i) => {
      const x = i * spacing - scrollOffset;

      const distance = Math.abs((x % (spacing * images.length)));
      const normalized = Math.min(distance / (spacing * 2), 1);

      const skew = normalized * 25;
      const scale = 1 - normalized * 0.35;
      const opacity = 0.5 + (1 - normalized) * 0.5;

      return (
        <div
          key={`${i}-${scrollOffset}`}
          style={{
            position: "absolute",
            left: `${50 + (x / screenWidth) * 100}%`,
            top: "50%",
            transform: `
              translateX(-50%)
              translateY(-50%)
              perspective(1200px)
              rotateY(${x > 0 ? -skew : skew}deg)
              scale(${scale})
            `,
            opacity,
            zIndex: Math.round((1 - normalized) * 100),
          }}
          className="group"
        >
          <div className="relative w-72 h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <img src={img} className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 group-hover:to-black/40 transition-all duration-300" />
          </div>
        </div>
      );
    });
  };

  return (
    <section className="relative w-full h-[95vh] overflow-hidden bg-black flex items-center justify-center">

      {/* MOVING CAROUSEL */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full" style={{ perspective: "1200px" }}>
          {renderItems()}
        </div>
      </div>

      {/* TEXT */}
      <div className="relative text-center text-white z-20 mt-8 px-4">
        <h1
          className="
            font-extrabold
            text-[65px]
            md:text-[95px]
            leading-[1.05]
            tracking-tight
            drop-shadow-2xl
          "
        >
          Distribute and promote <br /> your music globally
        </h1>

        <p className="mt-6 text-gray-300 text-[22px] md:text-[28px] font-medium">
          2kTunes — built in Africa, designed for every artist worldwide
        </p>

        <button
        onClick={() => window.location.href = "/signup"}
        className="mt-10 bg-white text-black px-10 py-5 rounded-full text-xl font-semibold shadow-lg hover:bg-gray-200 transition"
        >
        Get started
        </button>
      </div>
    </section>
  );
}
