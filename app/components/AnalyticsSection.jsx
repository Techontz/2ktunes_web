"use client";

export default function AnalyticsSection() {
  return (
    <section className="w-full bg-white py-32 px-6">
      <div className="max-w-6xl mx-auto">

        {/* TITLE */}
        <h2 className="text-center text-4xl md:text-5xl font-extrabold text-black tracking-tight">
          Make informed decisions <br /> backed by data
        </h2>

        <p className="text-center text-gray-600 text-lg max-w-2xl mx-auto mt-6">
          2kTunes helps you understand TikTok videos and creators through rich data analytics.
          Get insights into video categories, demographics, and how your music performs across
          TikTok and streaming platforms.
        </p>

        {/* WRAPPER */}
        <div className="grid md:grid-cols-2 gap-10 mt-24">

          {/* LEFT — PURPLE CATEGORY GRID */}
          <div className="bg-purple-500 rounded-3xl p-10">
            <h3 className="text-white text-xl font-semibold">Video categories</h3>
            <h2 className="text-white text-3xl font-extrabold mt-2">
              TikTok videos with <br /> your music
            </h2>

            <div className="grid grid-cols-2 gap-6 mt-10">

              {/* CARD 1 */}
              <div className="relative rounded-2xl overflow-hidden">
                <img src="/images/cat1.jpeg" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                  Daily life <span className="ml-2 text-white/90">33%</span>
                </div>
              </div>

              {/* CARD 2 */}
              <div className="relative rounded-2xl overflow-hidden">
                <img src="/images/cat2.jpeg" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                  Music <span className="ml-2 text-white/90">26%</span>
                </div>
              </div>

              {/* CARD 3 */}
              <div className="relative rounded-2xl overflow-hidden">
                <img src="/images/cat3.jpeg" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                  Travel <span className="ml-2 text-white/90">17%</span>
                </div>
              </div>

              {/* CARD 4 */}
              <div className="relative rounded-2xl overflow-hidden">
                <img src="/images/cat4.jpeg" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                  Beauty <span className="ml-2 text-white/90">24%</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT — STREAMING GRAPH BOX */}
          <div className="bg-[#1C1C1C] rounded-3xl p-10">
            <h4 className="text-gray-300 text-sm">Music performance</h4>
            <h3 className="text-white text-3xl font-extrabold mt-2">
              TikTok & Streaming
            </h3>

            <div className="mt-10">
              <img
                src="/images/stream_graph.png"
                className="w-full rounded-2xl"
              />
            </div>

            <div className="flex items-center gap-4 mt-6 text-gray-300 text-sm">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-400"></div> TikTok</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Spotify</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-500"></div> Apple Music</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-600"></div> YouTube Music</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
