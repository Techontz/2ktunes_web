"use client";

import { FaSearch, FaQuestionCircle, FaHeadset, FaBook } from "react-icons/fa";

export default function Help() {
  return (
    <section className="w-full bg-white text-black py-24 px-6">
      {/* ================== PAGE HEADER ================== */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Help Center
        </h1>
        <p className="text-gray-600 text-lg">
          Find answers, explore guides, or get in touch with support.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center w-full md:w-3/4 bg-gray-100 rounded-full px-6 py-3 shadow-md">
            <FaSearch className="text-gray-500 text-xl mr-3" />
            <input
              type="text"
              placeholder="Search for help..."
              className="bg-transparent outline-none w-full text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* ================== HELP SECTIONS ================== */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* FAQ CARD */}
        <div className="bg-gray-50 rounded-2xl p-8 shadow hover:shadow-lg transition">
          <FaQuestionCircle className="text-purple-600 text-4xl mb-4" />
          <h3 className="text-xl font-bold mb-2">FAQs</h3>
          <p className="text-gray-600 mb-4">
            Find answers to the most frequently asked questions.
          </p>
          <a className="text-purple-600 font-semibold cursor-pointer">
            View FAQs →
          </a>
        </div>

        {/* KNOWLEDGE BASE */}
        <div className="bg-gray-50 rounded-2xl p-8 shadow hover:shadow-lg transition">
          <FaBook className="text-purple-600 text-4xl mb-4" />
          <h3 className="text-xl font-bold mb-2">Guides & Documentation</h3>
          <p className="text-gray-600 mb-4">
            Learn how to use 2kTunes and explore helpful tutorials.
          </p>
          <a className="text-purple-600 font-semibold cursor-pointer">
            Open Guides →
          </a>
        </div>

        {/* LIVE SUPPORT */}
        <div className="bg-gray-50 rounded-2xl p-8 shadow hover:shadow-lg transition">
          <FaHeadset className="text-purple-600 text-4xl mb-4" />
          <h3 className="text-xl font-bold mb-2">Contact Support</h3>
          <p className="text-gray-600 mb-4">
            Need help from the team? We’re here for you 24/7.
          </p>
          <a className="text-purple-600 font-semibold cursor-pointer">
            Get Support →
          </a>
        </div>
      </div>

      {/* ================== QUICK FAQ SECTION ================== */}
      <div className="max-w-4xl mx-auto mt-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {[
            {
              q: "How do I upload my music?",
              a: "Go to your dashboard, click Upload, fill in metadata, and submit."
            },
            {
              q: "When do I get paid?",
              a: "Earnings are processed monthly and can be viewed in the Earnings section."
            },
            {
              q: "Which stores do you distribute to?",
              a: "We send your music to TikTok Music, Apple Music, Spotify, Boomplay, and more."
            }
          ].map((item, index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-xl shadow">
              <p className="font-semibold text-lg">{item.q}</p>
              <p className="text-gray-600 mt-2">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
