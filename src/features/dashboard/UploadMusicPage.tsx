import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Upload,
  Music2,
  Calendar,
  Globe,
  Image as ImageIcon,
  Check,
  ChevronDown,
  Plus,
  Disc3,
  AlertCircle,
  Sparkles,
  X,
  CreditCard,
  Radio,
  BadgeCheck,
  FileAudio,
} from "lucide-react";

export default function UploadMusicPage() {
  const navigate = useNavigate();

  const [releaseType, setReleaseType] = useState("Single");

  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "Spotify",
    "Apple Music",
    "TikTok",
    "Instagram & Facebook",
    "YouTube Music",
  ]);

  const platforms = [
    "Spotify",
    "Apple Music",
    "TikTok",
    "Instagram & Facebook",
    "YouTube Music",
    "Amazon Music",
    "Boomplay",
    "Audiomack",
    "Deezer",
    "Tidal",
    "Pandora",
    "iHeartRadio",
    "Saavn",
    "Claro Música",
  ];

  const extras = [
    {
      title: "Store Maximiser",
      price: "$7.95/yr",
      desc: "Automatically distribute your release to newly added stores.",
      icon: Globe,
    },
    {
      title: "Social Media Pack",
      price: "$4.95/yr",
      desc: "Monetise music on TikTok, Instagram and Facebook.",
      icon: Sparkles,
    },
    {
      title: "Discovery Pack",
      price: "$0.99/yr",
      desc: "Fingerprinting and discovery services.",
      icon: Radio,
    },
    {
      title: "Leave a Legacy",
      price: "$29 one-time",
      desc: "Keep your music online forever.",
      icon: BadgeCheck,
    },
  ];

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(
        selectedPlatforms.filter((p) => p !== platform)
      );
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white overflow-x-hidden">

      {/* HEADER */}
      <div className="sticky top-0 z-[100] bg-[#181818]/95 backdrop-blur-xl border-b border-white/[0.04]">

        <div
          className="
            h-[78px]
            sm:h-[86px]
            px-4
            sm:px-6
            lg:px-10
            flex
            items-center
            justify-between
            gap-4
          "
        >
          {/* LEFT */}
          <div className="flex items-center gap-4 min-w-0">

            {/* BACK BUTTON */}
            <button
              onClick={() => navigate("/dashboard/music")}
              className="
                w-11
                h-11
                rounded-[3px]
                bg-white/[0.03]
                border
                border-white/[0.05]
                flex
                items-center
                justify-center
                hover:border-white/[0.1]
                hover:bg-white/[0.05]
                transition-all
                flex-shrink-0
              "
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>

            <div className="min-w-0">

              <h1
                className="
                  text-[20px]
                  sm:text-[30px]
                  lg:text-[38px]
                  font-bold
                  leading-none
                  truncate
                "
              >
                Upload Release
              </h1>

              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/20 mt-2 truncate">
                2kTunes Distribution
              </p>
            </div>
          </div>

          {/* DESKTOP BUTTON */}
          <button
            className="
              hidden
              sm:flex
              h-[50px]
              px-6
              bg-[#F5F500]
              hover:bg-white
              text-black
              rounded-[3px]
              items-center
              justify-center
              gap-3
              text-sm
              font-bold
              transition-all
              active:scale-[0.98]
              shadow-[0_0_35px_rgba(245,245,0,0.12)]
              flex-shrink-0
            "
          >
            <Upload className="w-4 h-4" />

            <span>Upload Release</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">

        <div
          className="
            max-w-[1700px]
            mx-auto
            grid
            grid-cols-1
            xl:grid-cols-[1fr_360px]
            gap-6
          "
        >
          {/* MAIN */}
          <div className="space-y-6">

            {/* RELEASE INFO */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

              <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center">
                  <Disc3 className="w-5 h-5 text-[#F5F500]" />
                </div>

                <div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Release Information
                  </h2>

                  <p className="text-sm text-white/35 mt-1">
                    Main release metadata and details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">

                  <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Release Title
                  </label>

                  <input
                    type="text"
                    placeholder="Enter release title"
                    className="
                      w-full
                      h-[58px]
                      bg-[#1F1F1F]
                      border
                      border-white/[0.05]
                      rounded-[3px]
                      px-5
                      text-white
                      placeholder:text-white/20
                      outline-none
                      focus:border-[#F5F500]/30
                    "
                  />
                </div>

                {/* TYPE */}
                <div>

                  <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Release Type
                  </label>

                  <div className="grid grid-cols-3 gap-3">

                    {["Single", "EP", "Album"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setReleaseType(item)}
                        className={`
                          h-[52px]
                          rounded-[3px]
                          border
                          text-sm
                          font-semibold
                          transition-all
                          ${
                            releaseType === item
                              ? "bg-[#F5F500] border-[#F5F500] text-black"
                              : "bg-[#1F1F1F] border-white/[0.05] text-white/50 hover:text-white"
                          }
                        `}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DATE */}
                <div>

                  <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Release Date
                  </label>

                  <div className="relative">

                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F500]" />

                    <input
                      type="date"
                      className="
                        w-full
                        h-[58px]
                        bg-[#1F1F1F]
                        border
                        border-white/[0.05]
                        rounded-[3px]
                        pl-14
                        pr-5
                        text-white
                        outline-none
                        focus:border-[#F5F500]/30
                      "
                    />
                  </div>
                </div>

                {/* LABEL */}
                <div>

                  <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Record Label
                  </label>

                  <input
                    type="text"
                    placeholder="Enter label name"
                    className="
                      w-full
                      h-[58px]
                      bg-[#1F1F1F]
                      border
                      border-white/[0.05]
                      rounded-[3px]
                      px-5
                      text-white
                    "
                  />
                </div>

                {/* LANGUAGE */}
                <div>

                  <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Song Language
                  </label>

                  <div className="relative">

                    <select
                      className="
                        appearance-none
                        w-full
                        h-[58px]
                        bg-[#1F1F1F]
                        border
                        border-white/[0.05]
                        rounded-[3px]
                        px-5
                        text-white
                      "
                    >
                      <option>English</option>
                      <option>Swahili</option>
                      <option>French</option>
                    </select>

                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>

            {/* TRACK DETAILS */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

              {/* SINGLE ROW */}
              <div className="flex items-center justify-between gap-3 mb-8">

                {/* LEFT */}
                <div className="flex items-center gap-4 min-w-0 flex-1">

                  <div className="w-12 h-12 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center flex-shrink-0">
                    <Music2 className="w-5 h-5 text-[#F5F500]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[20px] sm:text-[28px] font-bold leading-tight">
                      Track Details
                    </h2>

                    <p className="text-sm text-white/35 mt-1">
                      Add audio files and song metadata.
                    </p>
                  </div>
                </div>

                {/* FIXED BUTTON */}
                <button
                  className="
                    h-[42px]
                    sm:h-[44px]
                    px-4
                    sm:px-5
                    bg-[#F5F500]
                    hover:bg-white
                    text-black
                    rounded-[3px]
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-[12px]
                    sm:text-sm
                    font-bold
                    transition-all
                    whitespace-nowrap
                    flex-shrink-0
                    min-w-fit
                  "
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />

                  <span className="block whitespace-nowrap">
                    Add Song
                  </span>
                </button>
              </div>

              <div className="bg-[#1F1F1F] border border-white/[0.05] rounded-[3px] p-5 sm:p-6">

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

                  {/* AUDIO */}
                  <div className="aspect-square bg-[#232323] border border-white/[0.04] rounded-[3px] flex flex-col items-center justify-center text-center p-6">

                    <FileAudio className="w-11 h-11 text-[#F5F500] mb-4" />

                    <p className="text-sm text-white/40">
                      WAV, FLAC, MP3, AIFF
                    </p>

                    <button className="mt-5 h-[42px] px-5 rounded-[3px] bg-white/[0.04] border border-white/[0.05] hover:bg-white/[0.08] text-sm transition-all">
                      Choose Audio
                    </button>
                  </div>

                  {/* INFO */}
                  <div className="space-y-5">

                    <input
                      type="text"
                      placeholder="Song title"
                      className="
                        w-full
                        h-[56px]
                        bg-[#232323]
                        border
                        border-white/[0.05]
                        rounded-[3px]
                        px-5
                        text-white
                      "
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <input
                        type="text"
                        placeholder="Artist name"
                        className="
                          w-full
                          h-[56px]
                          bg-[#232323]
                          border
                          border-white/[0.05]
                          rounded-[3px]
                          px-5
                          text-white
                        "
                      />

                      <input
                        type="text"
                        placeholder="ISRC code"
                        className="
                          w-full
                          h-[56px]
                          bg-[#232323]
                          border
                          border-white/[0.05]
                          rounded-[3px]
                          px-5
                          text-white
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* DISTRIBUTION */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

              <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#F5F500]" />
                </div>

                <div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Distribution Platforms
                  </h2>

                  <p className="text-sm text-white/35 mt-1">
                    Select streaming services.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                {platforms.map((platform) => {
                  const active =
                    selectedPlatforms.includes(platform);

                  return (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`
                        h-[68px]
                        px-5
                        rounded-[3px]
                        border
                        flex
                        items-center
                        justify-between
                        transition-all
                        ${
                          active
                            ? "bg-[#F5F500]/8 border-[#F5F500]/20"
                            : "bg-[#1F1F1F] border-white/[0.05]"
                        }
                      `}
                    >
                      <span
                        className={`
                          text-sm
                          font-medium
                          ${
                            active
                              ? "text-white"
                              : "text-white/50"
                          }
                        `}
                      >
                        {platform}
                      </span>

                      <div
                        className={`
                          w-6
                          h-6
                          rounded-[2px]
                          flex
                          items-center
                          justify-center
                          ${
                            active
                              ? "bg-[#F5F500]"
                              : "border border-white/[0.08]"
                          }
                        `}
                      >
                        {active && (
                          <Check className="w-4 h-4 text-black" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* EXTRAS */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

              <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#F5F500]" />
                </div>

                <div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Extras
                  </h2>

                  <p className="text-sm text-white/35 mt-1">
                    Additional promotional tools.
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                {extras.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={index}
                      className="
                        bg-[#1F1F1F]
                        border
                        border-white/[0.05]
                        rounded-[3px]
                        p-5
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-center
                        justify-between
                        gap-5
                      "
                    >
                      <div className="flex items-start gap-4">

                        <div className="w-10 h-10 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#F5F500]" />
                        </div>

                        <div>

                          <h3 className="text-[18px] font-semibold">
                            {item.title}
                          </h3>

                          <p className="text-sm text-white/35 mt-2 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <button className="h-[44px] px-5 bg-[#232323] border border-white/[0.05] rounded-[3px] text-[#F5F500] font-semibold">
                        {item.price}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* MOBILE BUTTON */}
            <div className="sm:hidden pt-2 pb-8">

              <button
                className="
                  w-full
                  h-[56px]
                  bg-[#F5F500]
                  hover:bg-white
                  text-black
                  rounded-[3px]
                  flex
                  items-center
                  justify-center
                  gap-3
                  text-sm
                  font-bold
                  transition-all
                  active:scale-[0.98]
                  shadow-[0_0_35px_rgba(245,245,0,0.12)]
                "
              >
                <Upload className="w-4 h-4" />

                Upload Release
              </button>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="hidden xl:block">

            <div className="sticky top-[110px] bg-[#181818] border border-white/[0.04] rounded-[3px] p-6">

              <div className="flex items-center justify-between mb-6">

                <h3 className="text-[24px] font-bold">
                  Release Summary
                </h3>

                <button className="w-10 h-10 rounded-[3px] bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              <div className="aspect-square rounded-[3px] bg-[#232323] border border-white/[0.04] flex items-center justify-center mb-6">

                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />

                  <p className="text-sm text-white/35">
                    No artwork selected
                  </p>
                </div>
              </div>

              <div className="space-y-5">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-white/35">
                    Release Type
                  </span>

                  <span className="font-medium">
                    {releaseType}
                  </span>
                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-white/35">
                    Platforms
                  </span>

                  <span className="font-medium">
                    {selectedPlatforms.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-white/35">
                    Distribution
                  </span>

                  <span className="font-medium text-[#F5F500]">
                    FREE
                  </span>
                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-white/35">
                    Payment
                  </span>

                  <span className="font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    **** 7233
                  </span>
                </div>
              </div>

              <div className="mt-7 bg-[#F5F500]/5 border border-[#F5F500]/10 rounded-[3px] p-4 flex items-start gap-3">

                <AlertCircle className="w-5 h-5 text-[#F5F500] flex-shrink-0 mt-0.5" />

                <p className="text-[13px] text-white/45 leading-relaxed">
                  Releases are reviewed within 24–72 hours.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}