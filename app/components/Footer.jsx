"use client";

import { FaTiktok, FaInstagram, FaFacebookF } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-10 px-6">

      {/* ================= TOP SECTION ================= */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">

        {/* ----- LEFT: LOGO + SOCIALS ----- */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-6">
            <span className="text-white">2k</span>
            <span className="text-[#7F00FF]">Tunes</span>
          </h1>

          {/* Social icons */}
          <div className="flex gap-6 text-xl mt-4">
            <FaTiktok className="cursor-pointer hover:opacity-70 transition" />
            <FaInstagram className="cursor-pointer hover:opacity-70 transition" />
            <FaFacebookF className="cursor-pointer hover:opacity-70 transition" />
          </div>
        </div>

        {/* ----- MIDDLE: CONTACT LINKS ----- */}
        <div>
          <h3 className="font-semibold text-lg mb-6">Contact</h3>

          <ul className="space-y-4 text-gray-300">
            <li className="hover:text-white transition cursor-pointer">Terms of Service</li>
            <li className="hover:text-white transition cursor-pointer">Cookie Policy</li>
            <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* ----- RIGHT: COMMUNITY LINKS ----- */}
        <div>
          <h3 className="font-semibold text-lg mb-6">Community</h3>

          <ul className="space-y-4 text-gray-300">
            <li className="hover:text-white transition cursor-pointer">Blog</li>
            <li className="hover:text-white transition cursor-pointer">Knowledge Hub</li>
          </ul>
        </div>
      </div>


      {/* ================= DIVIDER ================= */}
      <div className="max-w-6xl mx-auto border-t border-gray-800 mt-16 pt-8"></div>


      {/* ================= EXPLORE LINKS ================= */}
      <div className="max-w-6xl mx-auto flex flex-wrap gap-6 text-gray-400 text-sm mb-10">
        <span className="text-white">Explore:</span>
        <a className="hover:text-white transition" href="#">TikTok</a>
        <a className="hover:text-white transition" href="#">TikTok Shop</a>
        <a className="hover:text-white transition" href="#">Lemon8</a>
        <a className="hover:text-white transition" href="#">CapCut</a>
        <a className="hover:text-white transition" href="#">Creative Center</a>
        <a className="hover:text-white transition" href="#">Lark</a>
      </div>


      {/* ================= BOTTOM COPYRIGHT ================= */}
      <div className="max-w-6xl mx-auto text-gray-400 text-sm text-right">
        © 2025 2kTunes
      </div>
    </footer>
  );
}
