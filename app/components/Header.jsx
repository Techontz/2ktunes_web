"use client";

import { useState } from "react";

export default function Header() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");

  const languages = [
    { code: "EN", label: "English" },
    { code: "SW", label: "Swahili" },
  ];

  /* =============================
     SMOOTH SCROLL FUNCTION
  ============================== */
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (!section) return;

    const yOffset = -90; // Offset for fixed header
    const y =
      section.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <header className="w-full bg-black text-white py-4 px-8 flex justify-between items-center fixed top-0 left-0 z-50 border-b border-white/10 backdrop-blur-md">

      {/* LOGO */}
      <div className="text-2xl font-bold cursor-pointer" onClick={() => scrollToSection("top")}>
        2kTunes
      </div>

      {/* NAVIGATION */}
      <nav className="hidden md:flex gap-8 text-sm font-medium">
        <button onClick={() => scrollToSection("distribution")} className="hover:text-gray-300 transition">Distribution</button>
        <button onClick={() => scrollToSection("promotion")} className="hover:text-gray-300 transition">Promotion</button>
        <button onClick={() => scrollToSection("analytics")} className="hover:text-gray-300 transition">Analytics</button>
        <button onClick={() => scrollToSection("earnings")} className="hover:text-gray-300 transition">Earnings</button>
        <button onClick={() => scrollToSection("help")} className="hover:text-gray-300 transition">Help</button>
      </nav>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* LANGUAGE DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="text-sm border border-white/20 rounded-md px-3 py-1 hover:border-white/40 transition flex items-center gap-1"
          >
            {selectedLang}
            <span className="text-xs opacity-70">▼</span>
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-black border border-white/20 rounded-md shadow-lg z-50 py-1 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex justify-between
                    ${selectedLang === lang.code ? "bg-white/10 text-white" : "hover:bg-white/10"}
                  `}
                >
                  {lang.label}
                  {selectedLang === lang.code && (
                    <span className="text-green-400 text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LOGIN */}
        <button className="text-sm hover:text-gray-300 transition">Log in</button>

        {/* SIGNUP */}
        <button
            onClick={() => window.location.href = "/signup"}
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
            >
            Sign up
        </button>
      </div>
    </header>
  );
}
