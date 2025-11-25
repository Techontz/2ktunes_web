"use client";

export default function EarningsSection() {
  return (
    <section className="w-full bg-[#0B0B0B] py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ========================================================= */}
        {/* TITLE */}
        {/* ========================================================= */}
        <h2 className="text-center text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-snug mb-14">
          Get your <span className="text-[#FFE55E]">$ earnings</span> <br />
          effortlessly at lightning speed
        </h2>

        {/* ========================================================= */}
        {/* TOP CARDS (equal spacing, big titles) */}
        {/* ========================================================= */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">

          {/* CARD 1 */}
          <div className="bg-[#1A1A1A] rounded-3xl p-12 shadow-xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl border border-[#FFE55E] flex items-center justify-center">
                <span className="text-[#FFE55E] font-bold text-base">FREE</span>
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-white leading-tight mb-3">
              Free <br /> royalty splits
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
              Split earnings with collaborators effortlessly, without extra fees.
            </p>
          </div>

          {/* CARD 2 */}
          <div className="bg-[#1A1A1A] rounded-3xl p-12 shadow-xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl border border-[#FFE55E] flex items-center justify-center">
                <span className="text-[#FFE55E] text-2xl">💵</span>
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-white leading-tight mb-3">
              Transparent <br /> royalty reports
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
              Access clear and detailed royalty analytics instantly.
            </p>
          </div>

        </div>

        {/* ========================================================= */}
        {/* LOWER CARDS (same spacing + big titles) */}
        {/* ========================================================= */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* CARD 3 */}
          <div className="bg-[#1A1A1A] rounded-3xl p-12 shadow-xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl border border-[#FFE55E] flex items-center justify-center">
                <span className="text-[#FFE55E] text-2xl">📅</span>
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-white leading-tight mb-3">
              Monthly <br /> payments
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
              Receive monthly payouts and withdraw anytime.
            </p>
          </div>

          {/* CARD 4 */}
          <div className="bg-[#1A1A1A] rounded-3xl p-12 shadow-xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl border border-[#FFE55E] flex items-center justify-center">
                <span className="text-[#FFE55E] text-2xl">😊</span>
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-white leading-tight mb-3">
              Hassle-free <br /> withdrawals
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
              Withdraw directly to mobile money, bank, or e-wallet fast.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
