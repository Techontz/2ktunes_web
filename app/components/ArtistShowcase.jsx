"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ArtistShowcase() {
  /* BACKGROUND COLORS */
  const backgrounds = ["#2563EB", "#5B21B6", "#059669", "#F97316", "#7C3AED"];
  const [bgIndex, setBgIndex] = useState(0);

  /* ARTISTS & NAMES (MATCH ORDER) */
  const artists = [
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

  const artistNames = [
    "Glenn Samuel",
    "Rayvanny",
    "Zuchu",
    "H_art The Band",
    "Marioo",
    "Bey T",
    "Diamond Platnumz",
    "Ayra Starr",
    "Jux",
    "Otile Brown",
  ];

  const [slideIndex, setSlideIndex] = useState(0);

  /* AUTO SLIDE — SLOW (7 sec) */
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
      setSlideIndex((prev) => (prev + 1) % artists.length);
    }, 7000); // slower like SoundOn

    return () => clearInterval(interval);
  }, []);

  /* GET 5 VISIBLE IMAGES */
  const visible = Array.from({ length: 5 }, (_, i) => {
    const index = (slideIndex + i) % artists.length;
    return { img: artists[index], name: artistNames[index] };
  });

  /* CENTER ARTIST NAME */
  const centerArtistName = visible[2].name;

  /* SLIDE ANIMATION */
  const slideVariants = {
    initial: { opacity: 0, x: 180 },
    animate: { opacity: 1, x: 0 },
  };

  return (
    <section
      className="w-full py-24 transition-colors duration-[2500ms]"
      style={{ backgroundColor: backgrounds[bgIndex] }}
    >
      {/* TITLE */}
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center text-4xl md:text-5xl font-extrabold text-white leading-snug"
        >
          1,158,470 partners and growing,
          <br />
          including <span className="text-white/80">{centerArtistName}</span>
        </motion.h2>

        <div className="flex justify-center mt-8 mb-16">
        <button
        onClick={() => window.location.href = "/signup"}
        className="bg-white text-black px-8 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition"
        >
        Join us
        </button>
        </div>
      </div>

      {/* SLIDER */}
      <div className="w-full flex items-center justify-between overflow-hidden px-0 gap-[0.2rem]">

        {visible.map((item, index) => {
          const isCenter = index === 2;

          return (
            <motion.div
              key={index}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 1.4,
                ease: "easeOut",
              }}
              className="flex-shrink-0"
            >
              <img
                src={item.img}
                className={`
                  object-cover
                  shadow-xl
                  transition-all duration-700
                  w-[320px] h-[320px]
                  ${isCenter ? "rounded-full" : "rounded-[22px]"}
                `}
              />
            </motion.div>
          );
        })}

      </div>
    </section>
  );
}
