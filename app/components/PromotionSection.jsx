"use client";

export default function PromotionSection() {
  return (
    <section className="w-full bg-[#0B0B0B] py-32 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ========================================================= */}
        {/* TOP TITLE */}
        {/* ========================================================= */}
        <h2 className="text-center text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-20">
          Amplify your music <br /> with TikTok
        </h2>

        {/* ========================================================= */}
        {/* BIG TOP CARD */}
        {/* ========================================================= */}
        <div className="bg-[#111111] rounded-3xl p-12 md:p-16 shadow-2xl mb-6 flex flex-col md:flex-row items-center gap-10">

          {/* LEFT TEXT */}
          <div className="flex-1">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Partner with <br />
              <span className="text-[#A3FF3D]">TikTok creators</span>
            </h3>

            <p className="text-gray-300 text-lg leading-relaxed mt-6">
              Save time and money by getting direct access to TikTok’s creator network.
              Use artist-first promotional tools, editorial programming, and track
              optimization to help your music go viral.
            </p>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div>
                <h4 className="text-3xl font-extrabold text-white">3,000,000+</h4>
                <p className="text-gray-400 text-sm">creators partnering with us</p>
              </div>

              <div>
                <h4 className="text-3xl font-extrabold text-white">10,000+</h4>
                <p className="text-gray-400 text-sm">songs promoted</p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center">
            <img
              src="/images/tiktok_promo.png"
              alt="TikTok Promo"
              className="w-[330px] md:w-[370px] rounded-3xl shadow-xl"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3 LOWER CARDS (SMALLER GAPS LIKE SOUNDON) */}
        {/* ========================================================= */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* CARD 1 — CapCut */}
          <div className="bg-white rounded-3xl p-8 flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="text-[22px] font-extrabold text-black leading-tight">
                Promote on <br /> CapCut exclusively
              </h3>

              <p className="text-gray-600 mt-4 leading-relaxed">
                Reach millions of creators with exclusive CapCut promotional
                slots directly inside your 2kTunes dashboard.
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <img src="/icons/capcut.png" className="w-16 opacity-90" />
            </div>
          </div>

          {/* CARD 2 — DSP Support */}
          <div className="rounded-3xl bg-[#2D8CFF] p-8 text-white shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-[22px] font-extrabold leading-tight">
                Get marketing <br /> support across DSPs
              </h3>

              <p className="text-white/80 mt-4 leading-relaxed">
                Pitch playlists, unlock pre-saves, and use pre-release tools to
                boost visibility on Spotify, Apple Music, Boomplay, Audiomack, and more.
              </p>
            </div>

            <div className="flex justify-center mt-8">
              <img
                src="/images/promo_artist.png"
                className="w-24 rounded-xl shadow-lg"
              />
            </div>
          </div>

          {/* CARD 3 — Expert Guidance */}
          <div className="rounded-3xl bg-[#333333] p-8 text-white shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-[22px] font-extrabold leading-tight">
                Receive expert <br /> guidance
              </h3>

              <p className="text-white/80 mt-4 leading-relaxed">
                Personalized support from 2kTunes’ in-house marketing team —
                covering strategy, playlists, optimization, and rollout.
              </p>

              <p className="text-white/40 text-xs mt-2">
                *selected artists only
              </p>
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <img
                src="/images/artist1.png"
                className="w-16 h-16 rounded-2xl object-cover shadow-xl"
              />
              <img
                src="/images/artist2.png"
                className="w-16 h-16 rounded-2xl object-cover shadow-xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
