import React, { useEffect, useRef, useState } from "react";
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
  Disc3,
  AlertCircle,
  Sparkles,
  X,
  CreditCard,
  Radio,
  BadgeCheck,
  FileAudio,
  ImagePlus,
  Trash2,
} from "lucide-react";

type Track = {
  id: number;
  title: string;
  artist: string;
  isrc: string;
  audioFile: File | null;
  audioPreview: string;
};

export default function UploadMusicPage() {
  const navigate = useNavigate();

  const coverInputRef = useRef<HTMLInputElement | null>(
    null
  );

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [coverPreview, setCoverPreview] =
    useState("");

  const [releaseType, setReleaseType] =
    useState("Single");

  const [trackCount, setTrackCount] = useState(1);

  const [tracks, setTracks] = useState<Track[]>([
    {
      id: 1,
      title: "",
      artist: "",
      isrc: "",
      audioFile: null,
      audioPreview: "",
    },
  ]);

  const [selectedPlatforms, setSelectedPlatforms] =
    useState([
      "Spotify",
      "Apple Music",
      "TikTok",
      "Instagram & Facebook",
      "YouTube Music",
    ]);

  const languages = [
    "English",
    "Swahili",
    "French",
    "Spanish",
    "Arabic",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
    "German",
    "Italian",
    "Russian",
    "Turkish",
    "Dutch",
    "Zulu",
    "Yoruba",
    "Igbo",
    "Somali",
    "Amharic",
    "Tamil",
    "Telugu",
    "Thai",
    "Vietnamese",
  ];

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
        selectedPlatforms.filter(
          (p) => p !== platform
        )
      );
    } else {
      setSelectedPlatforms([
        ...selectedPlatforms,
        platform,
      ]);
    }
  };

  useEffect(() => {
    let count = 1;

    if (releaseType === "Single") {
      count = 1;
    }

    if (releaseType === "EP") {
      count = trackCount;
    }

    if (releaseType === "Album") {
      count = trackCount;
    }

    const updatedTracks = Array.from(
      { length: count },
      (_, index) => ({
        id: index + 1,
        title: tracks[index]?.title || "",
        artist: tracks[index]?.artist || "",
        isrc: tracks[index]?.isrc || "",
        audioFile:
          tracks[index]?.audioFile || null,
        audioPreview:
          tracks[index]?.audioPreview || "",
      })
    );

    setTracks(updatedTracks);
  }, [trackCount, releaseType]);

  const handleReleaseTypeChange = (
    type: string
  ) => {
    setReleaseType(type);

    if (type === "Single") {
      setTrackCount(1);
    }

    if (type === "EP") {
      setTrackCount(4);
    }

    if (type === "Album") {
      setTrackCount(10);
    }
  };

  const updateTrack = (
    id: number,
    field: keyof Track,
    value: any
  ) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === id
          ? {
              ...track,
              [field]: value,
            }
          : track
      )
    );
  };

  const handleAudioUpload = (
    id: number,
    file: File | null
  ) => {
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setTracks((prev) =>
      prev.map((track) =>
        track.id === id
          ? {
              ...track,
              audioFile: file,
              audioPreview: preview,
            }
          : track
      )
    );
  };

  const handleCoverUpload = (
    file: File | null
  ) => {
    if (!file) return;

    setCoverImage(file);

    const preview = URL.createObjectURL(file);

    setCoverPreview(preview);
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview("");
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
          <div className="flex items-center gap-4 min-w-0">

            <button
              onClick={() =>
                navigate("/dashboard/music")
              }
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
              "
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>

            <div>

              <h1 className="text-[20px] sm:text-[30px] lg:text-[38px] font-bold">
                Upload Release
              </h1>

              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/20 mt-2">
                2kTunes Distribution
              </p>
            </div>
          </div>

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
            "
          >
            <Upload className="w-4 h-4" />
            Upload Release
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">

        <div className="max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

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

              {/* COVER */}
            <div className="mb-10">

            <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-4 block">
            Album Cover
            </label>

            <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
                handleCoverUpload(
                e.target.files?.[0] || null
                )
            }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8">

            {/* LEFT IMAGE */}
            <div>

                {!coverPreview ? (
                <button
                    onClick={() =>
                    coverInputRef.current?.click()
                    }
                    className="
                    w-full
                    aspect-square
                    bg-[#232323]
                    border
                    border-white/[0.06]
                    rounded-[4px]
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    hover:border-[#F5F500]/20
                    transition-all
                    p-8
                    "
                >
                    <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mb-6">
                    <ImagePlus className="w-10 h-10 text-[#F5F500]" />
                    </div>

                    <h3 className="text-[20px] font-semibold">
                    Choose New Image
                    </h3>

                    <p className="text-sm text-white/35 mt-3 max-w-[260px] leading-relaxed">
                    Upload high quality square artwork
                    for your release cover.
                    </p>

                    <div className="mt-7 h-[46px] px-6 rounded-[3px] bg-[#F5F500] text-black flex items-center justify-center font-bold text-sm">
                    Upload Artwork
                    </div>
                </button>
                ) : (
                <div className="relative">

                    <img
                    src={coverPreview}
                    alt="cover"
                    className="
                        w-full
                        aspect-square
                        object-cover
                        rounded-[4px]
                        border
                        border-white/[0.06]
                    "
                    />

                    <button
                    onClick={removeCover}
                    className="
                        absolute
                        top-4
                        right-4
                        w-11
                        h-11
                        rounded-[3px]
                        bg-black/60
                        backdrop-blur-md
                        border
                        border-white/10
                        flex
                        items-center
                        justify-center
                        hover:bg-red-500
                        transition-all
                    "
                    >
                    <Trash2 className="w-5 h-5 text-white" />
                    </button>
                </div>
                )}
            </div>

            {/* RIGHT INSTRUCTIONS */}
            <div className="flex flex-col justify-center">

                <div className="bg-[#1A1A1A] border border-white/[0.05] rounded-[4px] p-6 sm:p-7">

                <h3 className="text-[22px] font-bold mb-7">
                    Artwork Guidelines
                </h3>

                <div className="space-y-7">

                    {/* ITEM */}
                    <div className="flex items-start gap-4">

                    <div className="w-10 h-10 rounded-full bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-[#F5F500]" />
                    </div>

                    <div>

                        <h4 className="text-sm font-semibold mb-2">
                        Recommended Size
                        </h4>

                        <p className="text-sm text-white/45 leading-relaxed">
                        Recommended artwork should be
                        3000 × 3000 pixels in JPG or PNG
                        format. Square images work best
                        across all music platforms.
                        </p>
                    </div>
                    </div>

                    {/* ITEM */}
                    <div className="flex items-start gap-4">

                    <div className="w-10 h-10 rounded-full bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-[#F5F500]" />
                    </div>

                    <div>

                        <h4 className="text-sm font-semibold mb-2">
                        Avoid Rejections
                        </h4>

                        <p className="text-sm text-white/45 leading-relaxed">
                        Do not upload blurry, pixelated,
                        copyrighted or low-quality images.
                        Avoid website URLs, social handles,
                        streaming logos or promotional text
                        on artwork.
                        </p>
                    </div>
                    </div>

                    {/* ITEM */}
                    <div className="flex items-start gap-4">

                    <div className="w-10 h-10 rounded-full bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-[#F5F500]" />
                    </div>

                    <div>

                        <h4 className="text-sm font-semibold mb-2">
                        Best Practice
                        </h4>

                        <p className="text-sm text-white/45 leading-relaxed">
                        Use unique artwork for every release
                        and make sure text is readable on
                        smaller mobile screens.
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* TITLE */}
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
                    "
                  />
                </div>

                {/* TYPE */}
                <div>

                  <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Release Type
                  </label>

                  <div className="grid grid-cols-3 gap-3">

                    {[
                      "Single",
                      "EP",
                      "Album",
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() =>
                          handleReleaseTypeChange(
                            item
                          )
                        }
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
                              : "bg-[#1F1F1F] border-white/[0.05] text-white/50"
                          }
                        `}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SONG COUNT */}
                {(releaseType === "EP" ||
                  releaseType === "Album") && (
                  <div>

                    <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                      Number of Songs
                    </label>

                    <div className="relative">

                      <select
                        value={trackCount}
                        onChange={(e) =>
                          setTrackCount(
                            Number(e.target.value)
                          )
                        }
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
                        {Array.from(
                          { length: 30 },
                          (_, i) => i + 2
                        ).map((num) => (
                          <option
                            key={num}
                            value={num}
                          >
                            {num} Songs
                          </option>
                        ))}
                      </select>

                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    </div>
                  </div>
                )}

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
                <div className="md:col-span-2">

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
                      {languages.map((language) => (
                        <option
                          key={language}
                          value={language}
                        >
                          {language}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  </div>
                </div>
              </div>
            </section>

            {/* TRACK DETAILS */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

              <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-[#F5F500]" />
                </div>

                <div>
                  <h2 className="text-[20px] sm:text-[28px] font-bold">
                    Track Details
                  </h2>

                  <p className="text-sm text-white/35 mt-1">
                    {tracks.length} tracks ready for
                    upload.
                  </p>
                </div>
              </div>

              <div className="space-y-6">

                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="
                      bg-[#1F1F1F]
                      border
                      border-white/[0.05]
                      rounded-[3px]
                      p-5
                      sm:p-6
                    "
                  >
                    <div className="flex items-center justify-between mb-6">

                      <div>
                        <h3 className="text-lg font-semibold">
                          Track {index + 1}
                        </h3>

                        <p className="text-sm text-white/35 mt-1">
                          Upload audio and metadata.
                        </p>
                      </div>

                      <div className="px-3 h-[34px] rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center text-[#F5F500] text-xs font-semibold uppercase tracking-[0.15em]">
                        Song {index + 1}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

                      {/* AUDIO */}
                      <div>

                        <label
                          className="
                            aspect-square
                            bg-[#232323]
                            border
                            border-white/[0.04]
                            rounded-[3px]
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-center
                            p-6
                            cursor-pointer
                            hover:border-[#F5F500]/30
                            transition-all
                          "
                        >
                          <input
                            type="file"
                            accept=".mp3,.wav,.flac,.aiff,audio/*"
                            className="hidden"
                            onChange={(e) =>
                              handleAudioUpload(
                                track.id,
                                e.target.files?.[0] ||
                                  null
                              )
                            }
                          />

                          <FileAudio className="w-11 h-11 text-[#F5F500] mb-4" />

                          {track.audioFile ? (
                            <>
                              <p className="text-sm font-medium text-white break-all">
                                {
                                  track.audioFile
                                    .name
                                }
                              </p>

                              <p className="text-xs text-[#F5F500] mt-2">
                                Audio Uploaded
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-white/40">
                                WAV, FLAC, MP3,
                                AIFF
                              </p>

                              <div className="mt-5 h-[42px] px-5 rounded-[3px] bg-white/[0.04] border border-white/[0.05] flex items-center justify-center text-sm">
                                Choose Audio
                              </div>
                            </>
                          )}
                        </label>

                        {track.audioPreview && (
                          <audio
                            controls
                            className="w-full mt-4"
                          >
                            <source
                              src={
                                track.audioPreview
                              }
                            />
                          </audio>
                        )}
                      </div>

                      {/* INFO */}
                      <div className="space-y-5">

                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) =>
                            updateTrack(
                              track.id,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder={`Track ${
                            index + 1
                          } title`}
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
                            value={track.artist}
                            onChange={(e) =>
                              updateTrack(
                                track.id,
                                "artist",
                                e.target.value
                              )
                            }
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
                            value={track.isrc}
                            onChange={(e) =>
                              updateTrack(
                                track.id,
                                "isrc",
                                e.target.value
                              )
                            }
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
                ))}
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
                    selectedPlatforms.includes(
                      platform
                    );

                  return (
                    <button
                      key={platform}
                      onClick={() =>
                        togglePlatform(platform)
                      }
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
                        className={`text-sm font-medium ${
                          active
                            ? "text-white"
                            : "text-white/50"
                        }`}
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

                        <div className="w-10 h-10 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center">
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

              <div className="aspect-square rounded-[3px] overflow-hidden bg-[#232323] border border-white/[0.04] flex items-center justify-center mb-6">

                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />

                    <p className="text-sm text-white/35">
                      No artwork selected
                    </p>
                  </div>
                )}
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
                    Total Tracks
                  </span>

                  <span className="font-medium">
                    {tracks.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-white/35">
                    Platforms
                  </span>

                  <span className="font-medium">
                    {
                      selectedPlatforms.length
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-white/35">
                    Cover
                  </span>

                  <span className="font-medium text-[#F5F500]">
                    {coverImage
                      ? "Uploaded"
                      : "Missing"}
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
                  Releases are reviewed within
                  24–72 hours.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}