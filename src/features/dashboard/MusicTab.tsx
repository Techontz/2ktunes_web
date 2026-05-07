import React, { useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  ExternalLink,
  Play,
  Filter,
  ArrowRight,
  Disc,
  XCircle,
  TrendingUp,
  Music4,
} from "lucide-react";
import { motion } from "motion/react";

export default function MusicTab() {
  const [searchQuery, setSearchQuery] = useState("");

  const releases = [
    {
      id: "1",
      title: "Midnight Echoes",
      type: "Single",
      status: "Live",
      date: "May 12, 2026",
      artwork:
        "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop",
      stats: "1.2M Streams",
    },
    {
      id: "2",
      title: "Lost in Translation",
      type: "Album",
      status: "Pending",
      date: "Pending",
      artwork:
        "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=300&auto=format&fit=crop",
      stats: "Processing",
    },
    {
      id: "3",
      title: "Cyber City",
      type: "Single",
      status: "Rejected",
      date: "N/A",
      artwork:
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=300&auto=format&fit=crop",
      stats: "Copyright Issue",
    },
  ];

  const filteredReleases = releases.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111111] text-white overflow-x-hidden">

      {/* HEADER */}
      <div className="border-b border-white/[0.04] bg-[#181818]">
        <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

            {/* LEFT */}
            <div className="min-w-0">

              <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-[3px] bg-[#F5F500] flex items-center justify-center flex-shrink-0">
                  <Music4 className="w-5 h-5 text-black" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                    2kTunes Artist
                  </p>

                  <h1 className="text-[28px] sm:text-[34px] font-bold text-white leading-none mt-1 break-words">
                    Music Catalog
                  </h1>
                </div>
              </div>

              <p className="text-white/40 max-w-xl text-sm leading-relaxed">
                Upload, manage and track your releases across global streaming
                platforms.
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

              {/* SEARCH */}
              <div className="relative flex-1">

                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />

                <input
                  type="text"
                  placeholder="Search releases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    h-[44px]
                    w-full
                    sm:w-[250px]
                    bg-[#1F1F1F]
                    border
                    border-white/[0.05]
                    rounded-[3px]
                    pl-11
                    pr-4
                    text-sm
                    text-white
                    placeholder:text-white/20
                    focus:outline-none
                    focus:border-[#F5F500]/20
                    transition-all
                  "
                />
              </div>

              {/* BUTTON */}
              <button
                className="
                  h-[44px]
                  px-5
                  bg-[#F5F500]
                  hover:bg-white
                  text-black
                  rounded-[3px]
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  text-sm
                  font-medium
                  active:scale-[0.98]
                  whitespace-nowrap
                "
              >
                <Plus className="w-4 h-4" />
                Release
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-8 lg:mt-10">

            {[
              {
                label: "Releases",
                value: "24",
                icon: Disc,
              },
              {
                label: "Streams",
                value: "2.4M",
                icon: TrendingUp,
              },
              {
                label: "Live Stores",
                value: "182",
                icon: CheckCircle,
              },
              {
                label: "Pending",
                value: "3",
                icon: Clock,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="
                  bg-[#1A1A1A]
                  border
                  border-white/[0.04]
                  rounded-[3px]
                  p-4
                  sm:p-5
                  hover:border-white/[0.08]
                  transition-all
                  min-w-0
                "
              >
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <item.icon className="w-5 h-5 text-[#F5F500]" />

                  <ArrowRight className="w-4 h-4 text-white/10" />
                </div>

                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/25 mb-2">
                  {item.label}
                </p>

                <h3 className="text-[22px] sm:text-[30px] font-bold text-white break-words">
                  {item.value}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELEASES */}
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8">

        {/* TOP */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>
            <h2 className="text-[20px] sm:text-[22px] font-semibold">
              Your Releases
            </h2>

            <p className="text-sm text-white/35 mt-1">
              Manage your distributed music.
            </p>
          </div>

          <button
            className="
              h-[40px]
              px-4
              bg-[#1A1A1A]
              border
              border-white/[0.05]
              rounded-[3px]
              text-white/60
              hover:text-white
              hover:border-white/[0.08]
              transition-all
              flex
              items-center
              justify-center
              gap-2
              text-sm
              w-full
              sm:w-auto
            "
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">

          {filteredReleases.map((release, index) => (
            <motion.div
              key={release.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="
                bg-[#1A1A1A]
                border
                border-white/[0.04]
                rounded-[3px]
                overflow-hidden
                hover:border-white/[0.08]
                transition-all
              "
            >
              <div className="p-4 sm:p-5">

                <div className="flex flex-col sm:flex-row gap-5">

                  {/* COVER */}
                  <div className="relative w-full sm:w-[88px] h-[220px] sm:h-[88px] rounded-[3px] overflow-hidden flex-shrink-0 bg-[#222]">

                    <img
                      src={release.artwork}
                      alt={release.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-current" />
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">

                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0 flex-1">

                        <h3 className="text-[20px] sm:text-[21px] font-bold leading-tight break-words">
                          {release.title}
                        </h3>

                        <div className="flex items-center gap-3 mt-3 flex-wrap">

                          <span className="px-3 h-[24px] flex items-center bg-white/[0.03] border border-white/[0.05] rounded-[3px] text-[10px] uppercase tracking-[0.15em] text-white/50 whitespace-nowrap">
                            {release.type}
                          </span>

                          <span className="text-[10px] text-white/25 uppercase tracking-[0.15em] break-all">
                            UPC: 84029302{release.id}
                          </span>
                        </div>
                      </div>

                      <button className="w-8 h-8 flex items-center justify-center rounded-[3px] hover:bg-white/[0.03] text-white/40 hover:text-white transition-all flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* STATUS */}
                    <div className="flex flex-wrap items-center gap-3 mt-5">

                      {release.status === "Live" && (
                        <div className="h-[28px] px-3 bg-[#F5F500]/10 border border-[#F5F500]/15 rounded-[3px] flex items-center gap-2 text-[#F5F500]">
                          <CheckCircle className="w-3.5 h-3.5" />

                          <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                            Live
                          </span>
                        </div>
                      )}

                      {release.status === "Pending" && (
                        <div className="h-[28px] px-3 bg-white/[0.03] border border-white/[0.05] rounded-[3px] flex items-center gap-2 text-white/70">
                          <Clock className="w-3.5 h-3.5" />

                          <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                            Pending
                          </span>
                        </div>
                      )}

                      {release.status === "Rejected" && (
                        <div className="h-[28px] px-3 bg-red-500/10 border border-red-500/15 rounded-[3px] flex items-center gap-2 text-red-400">
                          <XCircle className="w-3.5 h-3.5" />

                          <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                            Rejected
                          </span>
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/[0.04] mt-5 pt-4">

                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-white/25 mb-1">
                          Analytics
                        </p>

                        <h4 className="text-[16px] sm:text-[17px] font-semibold text-white break-words">
                          {release.stats}
                        </h4>
                      </div>

                      <button
                        className="
                          h-[36px]
                          px-4
                          rounded-[3px]
                          bg-[#F5F500]
                          hover:bg-white
                          text-black
                          transition-all
                          flex
                          items-center
                          justify-center
                          gap-2
                          text-sm
                          font-medium
                          active:scale-[0.98]
                          w-full
                          sm:w-auto
                          whitespace-nowrap
                        "
                      >
                        Open
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ARCHIVE */}
        <div className="mt-8 bg-[#1A1A1A] border border-white/[0.04] rounded-[3px] p-6 sm:p-8 text-center">

          <Disc className="w-9 h-9 text-[#F5F500] mx-auto mb-5" />

          <h3 className="text-[24px] sm:text-[28px] font-bold mb-3 break-words">
            Need older releases?
          </h3>

          <p className="text-white/35 max-w-xl mx-auto mb-7 text-sm leading-relaxed">
            Access archived music, historical reports and previous royalty data.
          </p>

          <button
            className="
              h-[44px]
              px-5
              bg-[#F5F500]
              hover:bg-white
              text-black
              rounded-[3px]
              transition-all
              inline-flex
              items-center
              justify-center
              gap-3
              text-sm
              font-medium
              active:scale-[0.98]
              w-full
              sm:w-auto
            "
          >
            Check Archives
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}