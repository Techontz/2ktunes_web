"use client";

export default function CallToAction() {
  return (
    <section
      className="w-full py-32 flex flex-col items-center justify-center"
      style={{ backgroundColor: "#7F00FF" }} // PURPLE
    >
      <h2 className="text-white text-4xl md:text-5xl font-extrabold text-center leading-snug">
        Ready to build your
        <br />
        music career?
      </h2>
    <button
        onClick={() => window.location.href = "/signup"}
        className="mt-8 bg-white text-black px-8 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition"
        >
        Get Started
    </button>
    </section>
  );
}
