"use client";

import { useState } from "react";
import { Apple } from "lucide-react";

export default function SignUpPage() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");

  const languages = [
    { code: "EN", label: "English" },
    { code: "SW", label: "Swahili" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F7F8FC]">
      {/* ------------------ HEADER ------------------ */}
      <header className="w-full bg-black px-8 py-4 flex justify-between items-center border-b border-white/10 fixed top-0 left-0 z-50">
        <a href="/" className="text-2xl font-bold text-white tracking-wide cursor-pointer">
          <span className="font-extrabold">2k</span>Tunes
        </a>

        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="text-sm border border-white/20 text-white rounded-md px-3 py-1 hover:border-white/40 transition flex items-center gap-1"
            >
              {selectedLang}
              <span className="text-xs opacity-70">▼</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-black border border-white/20 rounded-md py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-white flex justify-between items-center 
                      ${selectedLang === lang.code ? "bg-white/10" : "hover:bg-white/10"}
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

          <a
            href="/login"
            className="bg-white text-black px-6 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 transition"
          >
            Sign in
          </a>
        </div>
      </header>

      {/* ------------------ BODY ------------------ */}
      <div className="flex min-h-screen pt-32 justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-10 border border-gray-200">
          {/* Title */}
          <h2 className="mb-2 text-3xl font-extrabold text-[#111]">
            Create your account
          </h2>

          <p className="mb-8 text-gray-600 text-sm">
            Distribute your music worldwide with 2kTunes by TechOn.
          </p>

          {/* ------------------ OAUTH BUTTONS ------------------ */}
          <div className="mb-8 grid gap-4">
            {/* GOOGLE */}
            <button className="h-12 w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition text-black font-medium">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                className="w-5 h-5 mr-2"
                alt="google"
              />
              Continue with Google
            </button>

            {/* APPLE */}
            <button className="h-12 w-full flex items-center justify-center bg-black text-white border rounded-lg hover:bg-gray-900 transition font-medium">
              <Apple className="mr-2 h-5 w-5" />
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          {/* ------------------ FORM ------------------ */}
          <form className="space-y-5">
            {/* NAME ROW */}
            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="First Name"
                className="h-12 bg-white text-black placeholder:text-gray-500 border border-gray-300 rounded-lg px-4"
              />
              <input
                placeholder="Last Name"
                className="h-12 bg-white text-black placeholder:text-gray-500 border border-gray-300 rounded-lg px-4"
              />
            </div>

            {/* EMAIL */}
            <input
              placeholder="Email address"
              type="email"
              className="h-12 w-full bg-white text-black placeholder:text-gray-500 border border-gray-300 rounded-lg px-4"
            />

            {/* PASSWORD */}
            <div>
              <input
                placeholder="Password"
                type="password"
                className="h-12 w-full bg-white text-black placeholder:text-gray-500 border border-gray-300 rounded-lg px-4"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
            </div>

            {/* SUBMIT */}
            <button className="h-12 w-full bg-[#7F00FF] text-white font-semibold rounded-lg hover:opacity-90 transition">
              Create Account
            </button>

            {/* LOGIN LINK */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-[#7F00FF] font-semibold hover:underline">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
