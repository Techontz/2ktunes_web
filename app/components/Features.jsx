export default function Features() {
    return (
      <section id="distribution" className="w-full bg-[#F4F4F4] py-28 px-6">
        <div className="max-w-6xl mx-auto">
  
          {/* TITLE */}
          <h2 className="text-center text-4xl md:text-5xl font-extrabold text-black tracking-tight mb-20">
            Powerful Tools Built for Artists
          </h2>
  
          {/* OUTER GRID */}
          <div className="grid md:grid-cols-2 gap-8">
  
            {/* ========================================================= */}
            {/* 🔥 UPPER BIG CARD — IMPROVED + BALANCED */}
            {/* ========================================================= */}
            <div className="relative md:col-span-2 bg-white rounded-[40px] p-12 md:p-16 overflow-hidden flex flex-col md:flex-row items-center gap-12">
  
              {/* LEFT IMAGE */}
              <div className="w-full md:w-auto flex justify-center md:justify-start">
                <img
                  src="/mockups/phone.jpeg"
                  alt="TechOn Distribution App"
                  className="w-72 md:w-64 rounded-3xl"
                />
              </div>
  
              {/* RIGHT CONTENT */}
              <div className="flex-1 md:pr-10">
                <h3 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-4">
                  Powered by TechOn’s <br /> Global Distribution System
                </h3>
  
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  TechOn’s distribution ecosystem was engineered in Africa and designed for the world —
                  delivering <span className="font-semibold text-purple-600">world-class reliability</span>,
                  ultra-fast metadata processing, and seamless DSP delivery. Whether you're in Lagos,
                  Nairobi, Dar es Salaam, Johannesburg, Europe, Asia, or America —  
                  <span className="font-semibold text-orange-500"> your music goes worldwide instantly.</span>
                </p>
  
                {/* FEATURES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: "⚡", title: "Ultra-Fast Delivery", desc: "Your music hits DSPs instantly.", color: "purple-600" },
                    { icon: "🔐", title: "Secure Infrastructure", desc: "Powered by TechOn Software Company.", color: "orange-500" },
                    { icon: "🌍", title: "Global Reach", desc: "Spotify, Apple Music, TikTok + more.", color: "black" },
                    { icon: "📈", title: "Real-Time Tracking", desc: "Live analytics & monitoring.", color: "purple-600" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center`}>
                        <span className={`text-${item.color} text-2xl`}>{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-black">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
  
              {/* PURPLE GLOW */}
              <div className="absolute top-[-40px] right-[-40px] w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>
  
            {/* ========================================================= */}
            {/* 🎵 LOWER LEFT — PERFECT ICON SPACING + SAME CURVE */}
            {/* ========================================================= */}
            <div className="relative bg-white rounded-[40px] p-16 overflow-hidden min-h-[820px]">
  
              {/* ICONS ALIGNED TO WALLS (NEVER TOUCH TEXT) */}
              <img src="/icons/facebook.png" className="absolute top-[40px] left-[40px] w-30 opacity-95" />
              <img src="/icons/instagram.png" className="absolute top-[40px] right-[40px] w-20 opacity-95" />
  
              <img src="/icons/tiktok.png" className="absolute top-[200px] left-[150px] w-20 opacity-95" />
              <img src="/icons/youtube.png" className="absolute top-[200px] right-[110px] w-20 opacity-95" />
  
              <img src="/icons/apple.png" className="absolute top-[500px] left-[-30px] w-37 opacity-95" />
              <img src="/icons/soundcloud.png" className="absolute top-[360px] right-[0px] w-20 opacity-95" />
  
              <img src="/icons/audiomack.png" className="absolute bottom-[170px] right-[50px] w-20 opacity-95" />
              <img src="/icons/spotify.png" className="absolute bottom-[60px] left-[150px] w-24 opacity-95" />
  
              {/* TEXT CENTERED PERFECTLY */}
              <div className="relative z-10 pt-[260px]">
                <h3 className="text-[36px] font-extrabold text-black text-center leading-tight">
                  Distribute your <br /> music across <br /> multiple platforms
                </h3>
  
                <p className="text-center text-gray-600 mt-6 text-lg leading-relaxed">
                  Reach millions of listeners worldwide across <br />
                  every major streaming platform.
                </p>
  
                <p className="mt-6 text-center">
                  <a className="text-purple-600 font-semibold underline text-lg" href="#">
                    Check all stores
                  </a>
                </p>
              </div>
            </div>
  
            {/* ========================================================= */}
            {/* 🔥 LOWER RIGHT — TALL CIRCLE CARD MATCHING HEIGHT */}
            {/* ========================================================= */}
            <div className="relative rounded-[40px] bg-gradient-to-br from-orange-500 to-orange-600 p-16 overflow-hidden min-h-[820px] flex items-center justify-center">
  
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[650px] h-[650px] bg-white/20 rounded-full blur-2xl"></div>
              </div>
  
              <div className="relative z-10 text-center px-6">
                <h3 className="text-[42px] font-extrabold text-white leading-tight mb-6">
                  Stay in control <br />
                  with 100% <br />
                  ownership
                </h3>
  
                <p className="text-white/90 text-lg leading-relaxed max-w-sm mx-auto">
                  Keep full rights to your music and enjoy transparent royalty payments without hidden fees.
                </p>
              </div>
            </div>
  
          </div>
        </div>
      </section>
    );
  }
  