import React, { useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  Globe,
  Users,
  Play,
} from "lucide-react";

export default function AnalyticsTab() {
  const [timeframe, setTimeframe] = useState("30D");

  const timeframes = ["7D", "30D", "90D", "ALL"];

  return (
    <div className="min-h-screen bg-[#111111] text-white overflow-x-hidden">

      {/* HEADER */}
      <div className="border-b border-white/[0.04] bg-[#181818]">
        <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

            {/* LEFT */}
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">
                2kTunes Analytics
              </p>

              <h1 className="text-[28px] sm:text-[34px] font-bold leading-none mb-4 break-words">
                Insights & Stats
              </h1>

              <p className="text-white/40 text-sm leading-relaxed max-w-xl">
                Deep insights into your listener growth, audience behavior and streaming performance.
              </p>
            </div>

            {/* TIMEFRAME */}
            <div className="w-full sm:w-auto">

              <div className="grid grid-cols-4 bg-[#1F1F1F] border border-white/[0.05] rounded-[3px] p-1 w-full sm:w-auto">

                {timeframes.map((item) => (
                  <button
                    key={item}
                    onClick={() => setTimeframe(item)}
                    className={`
                      relative
                      h-[38px]
                      min-w-0
                      px-2 sm:px-5
                      text-[10px] sm:text-[11px]
                      transition-all
                      rounded-[3px]
                      font-medium
                      flex items-center justify-center
                      whitespace-nowrap
                      ${
                        timeframe === item
                          ? "text-black"
                          : "text-white/35 hover:text-white"
                      }
                    `}
                  >
                    {timeframe === item && (
                      <motion.div
                        layoutId="activeTime"
                        className="absolute inset-0 bg-[#F5F500] rounded-[3px]"
                        transition={{
                          type: "spring",
                          duration: 0.5,
                        }}
                      />
                    )}

                    <span className="relative z-10">
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-8 lg:mt-10">

            {[
              {
                label: "Total Streams",
                value: "2.4M",
                icon: Play,
              },
              {
                label: "Growth",
                value: "+18%",
                icon: TrendingUp,
              },
              {
                label: "Countries",
                value: "182",
                icon: Globe,
              },
              {
                label: "Listeners",
                value: "84K",
                icon: Users,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#1A1A1A] border border-white/[0.04] rounded-[3px] p-4 sm:p-5 hover:border-white/[0.08] transition-all min-w-0"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <item.icon className="w-5 h-5 text-[#F5F500]" />

                  <BarChart3 className="w-4 h-4 text-white/10" />
                </div>

                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/25 mb-2">
                  {item.label}
                </p>

                <h3 className="text-[22px] sm:text-[28px] font-bold break-words">
                  {item.value}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-5">

        {/* CHART + PLATFORMS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* CHART */}
          <div className="xl:col-span-2 bg-[#1A1A1A] border border-white/[0.04] rounded-[3px] p-4 sm:p-6 overflow-hidden">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">

              <div>
                <h3 className="text-[18px] sm:text-[20px] font-semibold">
                  Audience Growth
                </h3>

                <p className="text-sm text-white/35 mt-1">
                  Stream activity over time.
                </p>
              </div>

              <div className="flex items-center gap-5 flex-wrap">

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#F5F500]" />

                  <span className="text-[11px] text-white/40">
                    New
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20" />

                  <span className="text-[11px] text-white/40">
                    Returning
                  </span>
                </div>
              </div>
            </div>

            {/* GRAPH */}
            <div className="h-[220px] sm:h-[280px] lg:h-[320px] bg-[#161616] border border-white/[0.04] rounded-[3px] p-3 sm:p-5 flex items-end gap-1 sm:gap-2 overflow-hidden">

              {[25, 35, 50, 40, 60, 45, 70, 55, 90, 75, 100, 85].map(
                (height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.5,
                    }}
                    className="flex-1 bg-[#F5F500] rounded-t-[2px] min-w-[8px]"
                  />
                )
              )}
            </div>
          </div>

          {/* PLATFORMS */}
          <div className="bg-[#1A1A1A] border border-white/[0.04] rounded-[3px] p-4 sm:p-6">

            <div className="mb-8">
              <h3 className="text-[18px] sm:text-[20px] font-semibold">
                Top Platforms
              </h3>

              <p className="text-sm text-white/35 mt-1">
                Stream distribution.
              </p>
            </div>

            <div className="space-y-6">

              {[
                {
                  name: "Spotify",
                  share: "45%",
                },
                {
                  name: "Apple Music",
                  share: "30%",
                },
                {
                  name: "YouTube Music",
                  share: "15%",
                },
                {
                  name: "Amazon Music",
                  share: "10%",
                },
              ].map((platform, index) => (
                <div key={index}>

                  <div className="flex items-center justify-between mb-3 gap-3">
                    <span className="text-sm text-white/70 truncate">
                      {platform.name}
                    </span>

                    <span className="text-sm text-[#F5F500] flex-shrink-0">
                      {platform.share}
                    </span>
                  </div>

                  <div className="h-[6px] bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: platform.share }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1,
                      }}
                      className="h-full bg-[#F5F500]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* COUNTRIES */}
          <div className="bg-[#1A1A1A] border border-white/[0.04] rounded-[3px] p-4 sm:p-6">

            <div className="mb-8">
              <h3 className="text-[18px] sm:text-[20px] font-semibold">
                Global Reach
              </h3>

              <p className="text-sm text-white/35 mt-1">
                Top streaming countries.
              </p>
            </div>

            <div className="space-y-3">

              {[
                {
                  name: "Tanzania",
                  streams: "450K",
                  growth: "+12%",
                },
                {
                  name: "Kenya",
                  streams: "320K",
                  growth: "+8%",
                },
                {
                  name: "USA",
                  streams: "120K",
                  growth: "+25%",
                },
                {
                  name: "Nigeria",
                  streams: "90K",
                  growth: "+5%",
                },
              ].map((country, index) => (
                <div
                  key={index}
                  className="min-h-[58px] px-4 sm:px-5 py-4 bg-[#161616] border border-white/[0.04] rounded-[3px] flex items-center justify-between gap-4 hover:border-white/[0.08] transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {country.name}
                    </p>

                    <p className="text-[11px] text-white/30 mt-1 truncate">
                      {country.streams} Streams
                    </p>
                  </div>

                  <span className="text-[12px] text-[#F5F500] flex-shrink-0">
                    {country.growth}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DEMOGRAPHICS */}
          <div className="bg-[#1A1A1A] border border-white/[0.04] rounded-[3px] p-4 sm:p-6 flex flex-col">

            <div className="mb-8">
              <h3 className="text-[18px] sm:text-[20px] font-semibold">
                Demographics
              </h3>

              <p className="text-sm text-white/35 mt-1">
                Audience breakdown.
              </p>
            </div>

            <div className="flex-1 bg-[#161616] border border-white/[0.04] rounded-[3px] flex flex-col items-center justify-center p-5 sm:p-8 text-center">

              <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] mb-6">

                <div className="absolute inset-0 rounded-full border-[10px] border-white/[0.04]" />

                <div className="absolute inset-0 rounded-full border-[10px] border-[#F5F500] border-t-transparent border-l-transparent rotate-45" />

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[24px] sm:text-[28px] font-bold">
                    65%
                  </span>

                  <span className="text-[10px] sm:text-[11px] text-white/35 mt-1 px-2">
                    Male Audience
                  </span>
                </div>
              </div>

              <p className="text-sm text-white/35 max-w-sm leading-relaxed">
                Your primary audience falls between 18–30 years old with strong engagement from East Africa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}