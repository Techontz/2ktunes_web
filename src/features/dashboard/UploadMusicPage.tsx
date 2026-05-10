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
  
    aiGenerated: string;
    aiSelections: string[];
  
    previewClipMode: string;
    previewMinutes: string;
    previewSeconds: string;
  
    containsLyrics: string;
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

  const [artists, setArtists] = useState([
    "Mager MJ",
    "2KOOL",
  ]);
  
  const [selectedArtist, setSelectedArtist] =
    useState("Mager MJ");
  
  const [newArtist, setNewArtist] =
    useState("");

    const [
        previouslyReleased,
        setPreviouslyReleased,
        ] = useState("No");

    const [
    spotifyArtistProfile,
    setSpotifyArtistProfile,
    ] = useState("No");

    const [
        appleMusicProfile,
        setAppleMusicProfile,
      ] = useState("No");
      
    const [
    youtubeMusicProfile,
    setYoutubeMusicProfile,
    ] = useState("No");
    
    const [
        instagramProfile,
        setInstagramProfile,
      ] = useState("No");
      
    const [
    facebookProfile,
    setFacebookProfile,
    ] = useState("No");
    
    const [primaryGenre, setPrimaryGenre] =
        useState("Afrobeats");

    const [secondaryGenre, setSecondaryGenre] =
        useState("None");

    const [tracks, setTracks] = useState<Track[]>([
        {
            id: 1,
            title: "",
            artist: "",
            isrc: "",
        
            audioFile: null,
            audioPreview: "",
        
            aiGenerated: "No",
            aiSelections: [],
        
            previewClipMode: "auto",
            previewMinutes: "00",
            previewSeconds: "00",
        
            containsLyrics: "Contains Lyrics",
        },
    ]);

    const [showCredits, setShowCredits] =
        useState(true);

    const [performers, setPerformers] =
    useState<Record<
        number,
        { role: string; name: string }[]
    >>({});

    const [producers, setProducers] =
    useState<Record<
        number,
        { role: string; name: string }[]
    >>({});

  const [songwriters, setSongwriters] = useState([
    {
      role: "Music and lyrics",
      firstName: "",
      middleName: "",
      lastName: "",
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

  const genres = [
    "Afrobeats",
    "Amapiano",
    "Bongo Flava",
    "Hip Hop",
    "Trap",
    "R&B",
    "Pop",
    "Dancehall",
    "Reggae",
    "Gospel",
    "Jazz",
    "Soul",
    "Electronic",
    "Rock",
    "Classical",
    "Country",
    "Piano",
    "Singeli",
    "Taarab",
    "Alternative",
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

          aiGenerated:
          tracks[index]?.aiGenerated || "No",
        
        aiSelections:
          tracks[index]?.aiSelections || [],
        
        previewClipMode:
          tracks[index]?.previewClipMode || "auto",
        
        previewMinutes:
          tracks[index]?.previewMinutes || "00",
        
        previewSeconds:
          tracks[index]?.previewSeconds || "00",

        containsLyrics:
          tracks[index]?.containsLyrics ||
          "Contains Lyrics",
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

  const [selectedExtras, setSelectedExtras] =
  useState<string[]>([]);

  const toggleExtra = (title: string) => {
    if (selectedExtras.includes(title)) {
      setSelectedExtras(
        selectedExtras.filter(
          (item) => item !== title
        )
      );
    } else {
      setSelectedExtras([
        ...selectedExtras,
        title,
      ]);
    }
  };
  
  const addNewArtist = () => {
    if (!newArtist.trim()) return;
  
    if (!artists.includes(newArtist)) {
      setArtists((prev) => [
        ...prev,
        newArtist,
      ]);
    }
  
    setSelectedArtist(newArtist);
  
    setNewArtist("");
  };

  const addPerformer = (trackId: number) => {
    setPerformers((prev) => ({
      ...prev,
      [trackId]: [
        ...(prev[trackId] || []),
        {
          role: "",
          name: "",
        },
      ],
    }));
  };
  
  const addProducer = (trackId: number) => {
    setProducers((prev) => ({
      ...prev,
      [trackId]: [
        ...(prev[trackId] || []),
        {
          role: "",
          name: "",
        },
      ],
    }));
  };
  
  const updatePerformer = (
    trackId: number,
    index: number,
    field: "role" | "name",
    value: string
  ) => {
    setPerformers((prev) => {
      const updated = [...(prev[trackId] || [])];
  
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
  
      return {
        ...prev,
        [trackId]: updated,
      };
    });
  };
  
  const updateProducer = (
    trackId: number,
    index: number,
    field: "role" | "name",
    value: string
  ) => {
    setProducers((prev) => {
      const updated = [...(prev[trackId] || [])];
  
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
  
      return {
        ...prev,
        [trackId]: updated,
      };
    });
  };
  
  const creditsComplete = tracks.every(
    (track) =>
      performers[track.id]?.length > 0 &&
      producers[track.id]?.length > 0 &&
      performers[track.id]?.every(
        (p) => p.role && p.name
      ) &&
      producers[track.id]?.every(
        (p) => p.role && p.name
      )
  );

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
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">

        <div className="max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

          {/* MAIN */}
          <div className="space-y-6">
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

                {/* RELEASE TITLE */}
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

                {/* MAIN ARTIST */}
                <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                Artist Name
                </label>

                <div className="relative">

                <select
                    value={selectedArtist}
                    onChange={(e) =>
                    setSelectedArtist(
                        e.target.value
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
                    {artists.map((artist) => (
                    <option
                        key={artist}
                        value={artist}
                    >
                        {artist}
                    </option>
                    ))}
                </select>

                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                </div>
                </div>

                {/* ADD NEW ARTIST */}
                <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                Add New Artist
                </label>

                <div className="flex gap-3">

                <input
                    type="text"
                    value={newArtist}
                    onChange={(e) =>
                    setNewArtist(
                        e.target.value
                    )
                    }
                    placeholder="Enter artist name"
                    className="
                    flex-1
                    h-[58px]
                    bg-[#1F1F1F]
                    border
                    border-white/[0.05]
                    rounded-[3px]
                    px-5
                    text-white
                    "
                />

                <button
                    type="button"
                    onClick={addNewArtist}
                    className="
                    h-[58px]
                    px-6
                    bg-[#F5F500]
                    hover:bg-white
                    text-black
                    rounded-[3px]
                    font-bold
                    transition-all
                    whitespace-nowrap
                    "
                >
                    Add Artist
                </button>
                </div>
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

            {/* PREVIOUSLY RELEASED */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#F5F500]" />
                </div>

                <div>

                <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Previous Release
                </h2>

                <p className="text-sm text-white/35 mt-1">
                    Tell us if this music has already
                    been released before.
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* RELEASED BEFORE */}
                <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Previously Released
                </label>

                <div className="grid grid-cols-2 gap-3">

                    {["No", "Yes"].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() =>
                        setPreviouslyReleased(item)
                        }
                        className={`
                        h-[56px]
                        rounded-[3px]
                        border
                        font-semibold
                        transition-all
                        ${
                            previouslyReleased === item
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

                {/* ORIGINAL DATE */}
                {previouslyReleased === "Yes" && (
                <div>

                    <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Original Release Date
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
                )}
            </div>
            </section>

            {/* SPOTIFY ARTIST PROFILE */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#1ED760]/10 border border-[#1ED760]/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-[#1ED760]" />
                </div>

                <div>

                <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Spotify Artist Profile
                </h2>

                <p className="text-sm text-white/35 mt-1">
                    Connect your existing Spotify artist
                    page if available.
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* HAS PROFILE */}
                <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Already On Spotify?
                </label>

                <div className="grid grid-cols-2 gap-3">

                    {["No", "Yes"].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() =>
                        setSpotifyArtistProfile(item)
                        }
                        className={`
                        h-[56px]
                        rounded-[3px]
                        border
                        font-semibold
                        transition-all
                        ${
                            spotifyArtistProfile === item
                            ? "bg-[#1ED760] border-[#1ED760] text-black"
                            : "bg-[#1F1F1F] border-white/[0.05] text-white/50"
                        }
                        `}
                    >
                        {item}
                    </button>
                    ))}
                </div>
                </div>

                {/* PROFILE LINK */}
                {spotifyArtistProfile === "Yes" && (
                <div>

                    <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Spotify Artist Profile Link
                    </label>

                    <input
                    type="text"
                    placeholder="https://open.spotify.com/artist/..."
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

                    <p className="text-xs text-white/35 mt-3 leading-relaxed">
                    Paste your official Spotify artist
                    profile link to send releases to the
                    correct artist page.
                    </p>
                </div>
                )}
            </div>
            </section>

            {/* APPLE MUSIC PROFILE */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#FC3C44]/10 border border-[#FC3C44]/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-[#FC3C44]" />
                </div>

                <div>

                <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Apple Music Artist Profile
                </h2>

                <p className="text-sm text-white/35 mt-1">
                    Connect your Apple Music artist page.
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Already On Apple Music?
                </label>

                <div className="grid grid-cols-2 gap-3">

                    {["No", "Yes"].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() =>
                        setAppleMusicProfile(item)
                        }
                        className={`
                        h-[56px]
                        rounded-[3px]
                        border
                        font-semibold
                        transition-all
                        ${
                            appleMusicProfile === item
                            ? "bg-[#FC3C44] border-[#FC3C44] text-white"
                            : "bg-[#1F1F1F] border-white/[0.05] text-white/50"
                        }
                        `}
                    >
                        {item}
                    </button>
                    ))}
                </div>
                </div>

                {appleMusicProfile === "Yes" && (
                <div>

                    <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Apple Music Artist Link
                    </label>

                    <input
                    type="text"
                    placeholder="https://music.apple.com/..."
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
                )}
            </div>
            </section>

            {/* YOUTUBE MUSIC PROFILE */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#FF0000]/10 border border-[#FF0000]/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-[#FF0000]" />
                </div>

                <div>

                <h2 className="text-[24px] sm:text-[28px] font-bold">
                    YouTube Music Profile
                </h2>

                <p className="text-sm text-white/35 mt-1">
                    Connect your YouTube Music artist page.
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Already On YouTube Music?
                </label>

                <div className="grid grid-cols-2 gap-3">

                    {["No", "Yes"].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() =>
                        setYoutubeMusicProfile(item)
                        }
                        className={`
                        h-[56px]
                        rounded-[3px]
                        border
                        font-semibold
                        transition-all
                        ${
                            youtubeMusicProfile === item
                            ? "bg-[#FF0000] border-[#FF0000] text-white"
                            : "bg-[#1F1F1F] border-white/[0.05] text-white/50"
                        }
                        `}
                    >
                        {item}
                    </button>
                    ))}
                </div>
                </div>

                {youtubeMusicProfile === "Yes" && (
                <div>

                    <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    YouTube Music Artist Link
                    </label>

                    <input
                    type="text"
                    placeholder="https://music.youtube.com/..."
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
                )}
            </div>
            </section>

            {/* INSTAGRAM PROFILE */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#E1306C]/10 border border-[#E1306C]/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-[#E1306C]" />
                </div>

                <div>

                <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Instagram Profile
                </h2>

                <p className="text-sm text-white/35 mt-1">
                    Connect your official Instagram account.
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Do You Have Instagram?
                </label>

                <div className="grid grid-cols-2 gap-3">

                    {["No", "Yes"].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() =>
                        setInstagramProfile(item)
                        }
                        className={`
                        h-[56px]
                        rounded-[3px]
                        border
                        font-semibold
                        transition-all
                        ${
                            instagramProfile === item
                            ? "bg-[#E1306C] border-[#E1306C] text-white"
                            : "bg-[#1F1F1F] border-white/[0.05] text-white/50"
                        }
                        `}
                    >
                        {item}
                    </button>
                    ))}
                </div>
                </div>

                {instagramProfile === "Yes" && (
                <div>

                    <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Instagram Username Or Link
                    </label>

                    <input
                    type="text"
                    placeholder="@artistname or https://instagram.com/artist"
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
                )}
            </div>
            </section>

            {/* FACEBOOK PROFILE */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#1877F2]/10 border border-[#1877F2]/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-[#1877F2]" />
                </div>

                <div>

                <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Facebook Profile
                </h2>

                <p className="text-sm text-white/35 mt-1">
                    Connect your official Facebook account.
                </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Do You Have Facebook?
                </label>

                <div className="grid grid-cols-2 gap-3">

                    {["No", "Yes"].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() =>
                        setFacebookProfile(item)
                        }
                        className={`
                        h-[56px]
                        rounded-[3px]
                        border
                        font-semibold
                        transition-all
                        ${
                            facebookProfile === item
                            ? "bg-[#1877F2] border-[#1877F2] text-white"
                            : "bg-[#1F1F1F] border-white/[0.05] text-white/50"
                        }
                        `}
                    >
                        {item}
                    </button>
                    ))}
                </div>
                </div>

                {facebookProfile === "Yes" && (
                <div>

                    <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                    Facebook Username Or Link
                    </label>

                    <input
                    type="text"
                    placeholder="facebook.com/artistname"
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
                )}
            </div>
            </section>

            {/* PRIMARY GENRE */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-[#F5F500]" />
                </div>

                <div>

                <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Primary Genre
                </h2>

                <p className="text-sm text-white/35 mt-1">
                    Select the main genre of this release.
                </p>
                </div>
            </div>

            <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                Main Genre
                </label>

                <div className="relative">

                <select
                    value={primaryGenre}
                    onChange={(e) =>
                    setPrimaryGenre(
                        e.target.value
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
                    {genres.map((genre) => (
                    <option
                        key={genre}
                        value={genre}
                    >
                        {genre}
                    </option>
                    ))}
                </select>

                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                </div>
            </div>
            </section>

            {/* SECONDARY GENRE */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 rounded-[3px] bg-[#8B5CF6]/10 border border-[#8B5CF6]/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-[#8B5CF6]" />
                </div>

                <div>

                <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Secondary Genre
                </h2>

                <p className="text-sm text-white/35 mt-1">
                    Select an optional secondary genre.
                </p>
                </div>
            </div>

            <div>

                <label className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3 block">
                Secondary Genre
                </label>

                <div className="relative">

                <select
                    value={secondaryGenre}
                    onChange={(e) =>
                    setSecondaryGenre(
                        e.target.value
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
                    <option value="None">
                    None
                    </option>

                    {genres.map((genre) => (
                    <option
                        key={genre}
                        value={genre}
                    >
                        {genre}
                    </option>
                    ))}
                </select>

                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                </div>
            </div>
            </section>

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

                    <div className="space-y-8">

                    {/* SONG TITLE */}
                    <div>

                        <h3 className="text-[26px] font-bold mb-3">
                        Song title
                        </h3>

                        <p className="text-white/45 text-[15px] leading-relaxed mb-6">
                        Just the title, no feat. artists or
                        other info
                        </p>

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
                            h-[62px]
                            bg-[#232323]
                            border
                            border-white/[0.06]
                            rounded-[4px]
                            px-5
                            text-white
                            text-lg
                        "
                        />

                        <div className="mt-6 space-y-5 text-[15px] leading-relaxed">

                        <p className="text-white/75">
                            💡 <span className="font-bold">
                            Don't include featured artists
                            here.
                            </span>{" "}
                            Add them below instead.
                        </p>

                        <p className="text-white/75">
                            💡 <span className="font-bold">
                            If a cover song,
                            </span>{" "}
                            don't include original artist's
                            name.
                        </p>

                        <p className="text-white/75">
                            💡 <span className="font-bold">
                            No year/dates.
                            </span>{" "}
                            Do not include any year info in
                            your title.
                        </p>
                        </div>
                    </div>

                    {/* FEATURED ARTIST */}
                    <div className="border-t border-white/[0.06] pt-8">

                    <h3 className="text-[24px] font-bold mb-3">
                    Add featured artist to song title?
                    </h3>

                    <p className="text-white/45 text-[15px] mb-6">
                    Featured artist or remixer
                    </p>

                    <div className="space-y-5">

                    {/* NO */}
                    <label className="flex items-start gap-4 cursor-pointer">

                        <input
                        type="radio"
                        name={`featured-${track.id}`}
                        checked={!track.artist}
                        onChange={() =>
                            updateTrack(track.id, "artist", "")
                        }
                        className="mt-1 w-5 h-5"
                        />

                        <span className="text-[18px] text-white/80">
                        No, don't show any other artists in song title
                        </span>
                    </label>

                    {/* YES */}
                    <div>

                        <label className="flex items-start gap-4 cursor-pointer mb-5">

                        <input
                            type="radio"
                            name={`featured-${track.id}`}
                            checked={!!track.artist}
                            onChange={() =>
                            updateTrack(track.id, "artist", "feat. ")
                            }
                            className="mt-1 w-5 h-5"
                        />

                        <span className="text-[18px] text-white/80">
                            Yes, add featured artists to track title
                        </span>
                        </label>

                        {!!track.artist && (
                        <div className="ml-9 space-y-4">

                            <input
                            type="text"
                            value={track.artist.replace("feat. ", "")}
                            onChange={(e) =>
                                updateTrack(
                                track.id,
                                "artist",
                                `feat. ${e.target.value}`
                                )
                            }
                            placeholder="Example: Conrad Bubex, Marioo, Deeblery"
                            className="
                                w-full
                                h-[58px]
                                bg-[#232323]
                                border
                                border-white/[0.05]
                                rounded-[4px]
                                px-5
                                text-white
                            "
                            />

                            <div className="bg-[#232323] border border-white/[0.05] rounded-[4px] p-5">

                            <p className="text-[15px] text-white/75 leading-relaxed">
                                💡 If there are multiple featured artists,
                                separate each artist using a comma(,).
                            </p>

                            <p className="text-[15px] text-white/45 leading-relaxed mt-3">
                                Example:
                                <span className="text-[#F5F500]">
                                {" "}
                                Conrad Bubex, Marioo, Deeblery
                                </span>
                            </p>

                            <p className="text-[15px] text-white/45 leading-relaxed mt-3">
                                Your title preview will appear like:
                                <span className="text-white">
                                {" "}
                                Track Name (feat. Conrad Bubex, Marioo, Deeblery)
                                </span>
                            </p>
                            </div>
                        </div>
                        )}
                    </div>
                    </div>
                    </div>
                    {/* VERSION */}
                    <div className="border-t border-white/[0.06] pt-8">

                    <h3 className="text-[24px] font-bold mb-6">
                    Add "version" info to song title?
                    </h3>

                    <div className="space-y-5">

                    {/* NORMAL */}
                    <label className="flex items-start gap-4 cursor-pointer">

                        <input
                        type="radio"
                        name={`version-${track.id}`}
                        defaultChecked
                        className="mt-1 w-5 h-5"
                        />

                        <span className="text-[18px] text-white/80">
                        No, this is the normal version
                        </span>
                    </label>

                    {/* RADIO EDIT */}
                    <label className="flex items-start gap-4 cursor-pointer">

                        <input
                        type="radio"
                        name={`version-${track.id}`}
                        className="mt-1 w-5 h-5"
                        />

                        <span className="text-[18px] text-white/80">
                        Radio Edit
                        </span>
                    </label>

                    {/* OTHER */}
                    <div>

                        <label className="flex items-start gap-4 cursor-pointer mb-5">

                        <input
                            type="radio"
                            name={`version-${track.id}`}
                            className="mt-1 w-5 h-5"
                        />

                        <span className="text-[18px] text-white/80">
                            Other
                        </span>
                        </label>

                        <input
                        type="text"
                        placeholder='Example: Acoustic Version'
                        className="
                            ml-9
                            w-[calc(100%-36px)]
                            h-[58px]
                            bg-[#232323]
                            border
                            border-white/[0.05]
                            rounded-[4px]
                            px-5
                            text-white
                        "
                        />
                    </div>
                    </div>
                    </div>

                    {/* PREVIEW */}
                    <div className="border-t border-white/[0.06] pt-8">

                        <h3 className="text-[24px] font-bold mb-6">
                        Song title preview
                        </h3>

                        <div className="bg-[#1B2333] rounded-[4px] p-6 flex items-center gap-5">

                        <div className="text-white/40 text-2xl">
                            {index + 1}
                        </div>

                        <div className="w-24 h-24 bg-[#737B8C] rounded-[4px] flex items-center justify-center">
                            <Music2 className="w-10 h-10 text-white" />
                        </div>

                        <div>

                            <h4 className="text-2xl font-bold">
                            {track.title || `Track ${index + 1}`}
                            </h4>

                            <p className="text-white/45 text-lg mt-1">
                            {selectedArtist}
                            </p>
                        </div>
                        </div>
                        {/* DISCLAIMERS */}
                        <div className="mt-8">

                        <h4 className="text-[22px] font-bold mb-6">
                        Disclaimers:
                        </h4>

                        <div className="space-y-6 text-[17px] text-white/75 leading-relaxed">

                        <div className="flex items-start gap-4">
                            <span className="mt-2 w-2 h-2 rounded-full bg-white/60" />

                            <p>
                            Different streaming services show
                            titles differently, thus yours may
                            not appear exactly as above and
                            that's okay!
                            </p>
                        </div>

                        <div className="flex items-start gap-4">
                            <span className="mt-2 w-2 h-2 rounded-full bg-white/60" />

                            <p>
                            <span className="font-bold">
                                Producers
                            </span>{" "}
                            aren't shown in song titles.
                            Spotify shows them underneath the
                            track title; other services show
                            producers inside credits.
                            </p>
                        </div>

                        <div className="flex items-start gap-4">
                            <span className="mt-2 w-2 h-2 rounded-full bg-white/60" />

                            <p>
                            <span className="font-bold">
                                Primary artists
                            </span>{" "}
                            aren't shown in song titles.
                            Streaming platforms display them
                            below the song title.
                            </p>
                        </div>
                        </div>
                        </div>
                    </div>

                    {/* AUDIO */}
                    <div className="border-t border-white/[0.06] pt-8">

                    <h3 className="text-[26px] font-bold mb-3">
                    Audio file
                    </h3>

                    <p className="text-white/45 text-[15px] mb-2">
                    WAV, FLAC, MP3, M4A, AIFF
                    </p>

                    {/* ISRC SECTION */}
                    <div className="mb-7">

                    <h4 className="text-[20px] font-semibold mb-5">
                        Already got an ISRC code?
                    </h4>

                    <div className="space-y-5">

                        {/* NO */}
                        <label className="flex items-center gap-4 cursor-pointer">

                        <input
                            type="radio"
                            name={`isrc-${track.id}`}
                            checked={!track.isrc}
                            onChange={() =>
                            updateTrack(track.id, "isrc", "")
                            }
                            className="w-5 h-5"
                        />

                        <span className="text-[18px] text-white/80">
                            No, generate ISRC automatically
                        </span>
                        </label>

                        {/* YES */}
                        <div>

                        <label className="flex items-center gap-4 cursor-pointer mb-5">

                            <input
                            type="radio"
                            name={`isrc-${track.id}`}
                            checked={!!track.isrc}
                            onChange={() =>
                                updateTrack(track.id, "isrc", " ")
                            }
                            className="w-5 h-5"
                            />

                            <span className="text-[18px] text-white/80">
                            Yes, I already have an ISRC code
                            </span>
                        </label>

                        {!!track.isrc && (
                            <div className="ml-9 space-y-4">

                            <input
                                type="text"
                                value={track.isrc}
                                onChange={(e) =>
                                updateTrack(
                                    track.id,
                                    "isrc",
                                    e.target.value.toUpperCase()
                                )
                                }
                                placeholder="Example: TZABC2412345"
                                className="
                                w-full
                                h-[58px]
                                bg-[#232323]
                                border
                                border-white/[0.05]
                                rounded-[4px]
                                px-5
                                text-white
                                "
                            />

                            <div className="bg-[#232323] border border-white/[0.05] rounded-[4px] p-5">

                                <p className="text-[15px] text-white/75 leading-relaxed">
                                💡 ISRC stands for International Standard
                                Recording Code used to identify your song
                                globally across streaming platforms.
                                </p>

                                <p className="text-[15px] text-white/45 leading-relaxed mt-3">
                                Example:
                                <span className="text-[#F5F500]">
                                    {" "}
                                    TZABC2412345
                                </span>
                                </p>

                                <p className="text-[15px] text-white/45 leading-relaxed mt-3">
                                Leave this empty if you want 2kTunes
                                to generate one automatically.
                                </p>
                            </div>
                            </div>
                        )}
                        </div>
                    </div>
                    </div>

                    {/* AUDIO UPLOAD */}
                    <label
                    className="
                        h-[160px]
                        bg-[#232323]
                        border
                        border-white/[0.05]
                        rounded-[4px]
                        flex
                        flex-col
                        items-center
                        justify-center
                        cursor-pointer
                    "
                    >
                    <input
                        type="file"
                        accept=".mp3,.wav,.flac,.aiff,audio/*"
                        className="hidden"
                        onChange={(e) =>
                        handleAudioUpload(
                            track.id,
                            e.target.files?.[0] || null
                        )
                        }
                    />

                    <div className="h-[52px] px-7 rounded-[4px] border border-white/[0.08] flex items-center justify-center text-lg">
                        Choose File
                    </div>

                    {track.audioFile && (
                        <p className="mt-5 text-[#F5F500]">
                        {track.audioFile.name}
                        </p>
                    )}
                    </label>

                    <p className="mt-6 text-[16px] text-white/75 leading-relaxed">
                    💡{" "}
                    <span className="font-bold">
                        Choose a file from your local
                        device storage
                    </span>
                    </p>

                    {track.audioPreview && (
                    <audio
                        controls
                        className="w-full mt-6"
                    >
                        <source src={track.audioPreview} />
                    </audio>
                    )}
                    </div>

                    {/* SONGWRITER */}
                    <div className="border-t border-white/[0.06] pt-8">

                    <h3 className="text-[26px] font-bold mb-3">
                        Songwriter(s) real name
                    </h3>

                    <p className="text-white/45 text-[15px] mb-7">
                        Real names, not stage names
                    </p>

                    <div className="space-y-8">

                        {songwriters.map((writer, writerIndex) => (
                        <div
                            key={writerIndex}
                            className="
                            bg-[#232323]
                            border
                            border-white/[0.05]
                            rounded-[4px]
                            p-5
                            space-y-5
                            "
                        >

                            {/* ROLE */}
                            <div className="relative">

                            <select
                                value={writer.role}
                                onChange={(e) => {
                                const updated = [...songwriters];

                                updated[writerIndex].role =
                                    e.target.value;

                                setSongwriters(updated);
                                }}
                                className="
                                appearance-none
                                w-full
                                h-[62px]
                                bg-[#1A1A1A]
                                border
                                border-white/[0.05]
                                rounded-[4px]
                                px-5
                                text-white
                                text-lg
                                "
                            >
                                <option>
                                Music and lyrics
                                </option>

                                <option>
                                Music
                                </option>

                                <option>
                                Lyrics
                                </option>
                            </select>

                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            </div>

                            {/* FIRST NAME */}
                            <input
                            type="text"
                            placeholder="First name"
                            value={writer.firstName}
                            onChange={(e) => {
                                const updated = [...songwriters];

                                updated[writerIndex].firstName =
                                e.target.value;

                                setSongwriters(updated);
                            }}
                            className="
                                w-full
                                h-[62px]
                                bg-[#1A1A1A]
                                border
                                border-white/[0.05]
                                rounded-[4px]
                                px-5
                                text-white
                                text-lg
                            "
                            />

                            {/* MIDDLE NAME */}
                            <input
                            type="text"
                            placeholder="Middle name"
                            value={writer.middleName}
                            onChange={(e) => {
                                const updated = [...songwriters];

                                updated[writerIndex].middleName =
                                e.target.value;

                                setSongwriters(updated);
                            }}
                            className="
                                w-full
                                h-[62px]
                                bg-[#1A1A1A]
                                border
                                border-white/[0.05]
                                rounded-[4px]
                                px-5
                                text-white
                                text-lg
                            "
                            />

                            {/* LAST NAME */}
                            <input
                            type="text"
                            placeholder="Last name"
                            value={writer.lastName}
                            onChange={(e) => {
                                const updated = [...songwriters];

                                updated[writerIndex].lastName =
                                e.target.value;

                                setSongwriters(updated);
                            }}
                            className="
                                w-full
                                h-[62px]
                                bg-[#1A1A1A]
                                border
                                border-white/[0.05]
                                rounded-[4px]
                                px-5
                                text-white
                                text-lg
                            "
                            />

                            {/* REMOVE */}
                            {songwriters.length > 1 && (
                            <button
                                type="button"
                                onClick={() => {
                                const updated =
                                    songwriters.filter(
                                    (_, i) =>
                                        i !== writerIndex
                                    );

                                setSongwriters(updated);
                                }}
                                className="
                                h-[48px]
                                px-5
                                bg-red-500/10
                                border
                                border-red-500/20
                                rounded-[4px]
                                text-red-400
                                font-semibold
                                "
                            >
                                Remove Songwriter
                            </button>
                            )}
                        </div>
                        ))}

                        {/* ADD BUTTON */}
                        <button
                        type="button"
                        onClick={() =>
                            setSongwriters([
                            ...songwriters,
                            {
                                role: "Music and lyrics",
                                firstName: "",
                                middleName: "",
                                lastName: "",
                            },
                            ])
                        }
                        className="
                            flex
                            items-center
                            gap-3
                            text-[#F5F500]
                            font-semibold
                            text-lg
                        "
                        >
                        <span className="text-3xl leading-none">
                            +
                        </span>

                        Add another songwriter
                        </button>
                    </div>
                    </div>

                    {/* INSTRUMENTAL OR LYRICS */}
                    <div className="border-t border-white/[0.06] pt-8">

                    <h3 className="text-[24px] font-bold mb-3">
                        Audio Type
                    </h3>

                    <p className="text-white/45 text-[15px] mb-6">
                        Select whether this track contains vocals or is purely instrumental.
                    </p>

                    <div className="space-y-5">

                        {/* CONTAINS LYRICS */}
                        <label className="flex items-center gap-4 cursor-pointer">

                        <input
                            type="radio"
                            name={`lyrics-type-${track.id}`}
                            checked={
                            track.containsLyrics ===
                            "Contains Lyrics"
                            }
                            onChange={() =>
                            updateTrack(
                                track.id,
                                "containsLyrics",
                                "Contains Lyrics"
                            )
                            }
                            className="w-5 h-5"
                        />

                        <span className="text-[18px]">
                            Contains Lyrics
                        </span>
                        </label>

                        {/* INSTRUMENTAL */}
                        <label className="flex items-center gap-4 cursor-pointer">

                        <input
                            type="radio"
                            name={`lyrics-type-${track.id}`}
                            checked={
                            track.containsLyrics ===
                            "Instrumental"
                            }
                            onChange={() =>
                            updateTrack(
                                track.id,
                                "containsLyrics",
                                "Instrumental"
                            )
                            }
                            className="w-5 h-5"
                        />

                        <span className="text-[18px]">
                            Instrumental
                        </span>
                        </label>
                    </div>
                    </div>
                    {/* EXPLICIT */}
                    <div className="border-t border-white/[0.06] pt-8">

                        <h3 className="text-[24px] font-bold mb-6">
                        Explicit lyrics
                        </h3>

                        <div className="space-y-5">

                        <label className="flex items-center gap-4">
                            <input
                            type="radio"
                            defaultChecked
                            name={`explicit-${track.id}`}
                            className="w-5 h-5"
                            />

                            <span className="text-[18px]">
                            No
                            </span>
                        </label>

                        <label className="flex items-center gap-4">
                            <input
                            type="radio"
                            name={`explicit-${track.id}`}
                            className="w-5 h-5"
                            />

                            <span className="text-[18px]">
                            Yes
                            </span>
                        </label>
                        </div>
                    </div>

                    {/* AI GENERATED */}
                    <div className="border-t border-white/[0.06] pt-8">

                    <h3 className="text-[24px] font-bold mb-3">
                        Does this song include AI-generated
                        music, vocals, or lyrics?
                    </h3>

                    <p className="text-white/45 text-[15px] mb-6">
                        Using AI for mastering or mixing
                        doesn't count.
                    </p>

                    <div className="space-y-5">

                        {/* NO */}
                        <label className="flex items-center gap-4 cursor-pointer">

                        <input
                            type="radio"
                            name={`ai-${track.id}`}
                            checked={track.aiGenerated === "No"}
                            onChange={() =>
                            updateTrack(
                                track.id,
                                "aiGenerated",
                                "No"
                            )
                            }
                            className="w-5 h-5"
                        />

                        <span className="text-[18px]">
                            No
                        </span>
                        </label>

                        {/* YES */}
                        <label className="flex items-center gap-4 cursor-pointer">

                        <input
                            type="radio"
                            name={`ai-${track.id}`}
                            checked={track.aiGenerated === "Yes"}
                            onChange={() =>
                            updateTrack(
                                track.id,
                                "aiGenerated",
                                "Yes"
                            )
                            }
                            className="w-5 h-5"
                        />

                        <span className="text-[18px]">
                            Yes
                        </span>
                        </label>
                    </div>

                    {/* POPUP */}
                    {track.aiGenerated === "Yes" && (
                        <div className="mt-7 bg-[#232323] border border-white/[0.05] rounded-[4px] p-6">

                        <h4 className="text-[22px] font-bold mb-3">
                            Which parts were AI-generated?
                        </h4>

                        <p className="text-white/45 mb-6">
                            Select all that apply.
                        </p>

                        <div className="space-y-5">

                            {[
                            "Lyrics (written by AI)",
                            "Music (composed by AI)",
                            "All of the audio (performed by AI)",
                            "Part of the audio (performed by AI + humans)",
                            ].map((item) => {

                            const active =
                                track.aiSelections.includes(item);

                            return (
                                <label
                                key={item}
                                className="flex items-start gap-4 cursor-pointer"
                                >

                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={(e) => {

                                    const updatedSelections =
                                        e.target.checked
                                        ? [
                                            ...track.aiSelections,
                                            item,
                                            ]
                                        : track.aiSelections.filter(
                                            (i) => i !== item
                                            );

                                    updateTrack(
                                        track.id,
                                        "aiSelections",
                                        updatedSelections
                                    );
                                    }}
                                    className="w-5 h-5 mt-1"
                                />

                                <span className="text-[17px] text-white/80 leading-relaxed">
                                    {item}
                                </span>
                                </label>
                            );
                            })}
                        </div>
                        </div>
                    )}
                    </div>

                    {/* PREVIEW CLIP START TIME */}
                    <div className="border-t border-white/[0.06] pt-8">

                    <h3 className="text-[24px] font-bold mb-3">
                        Preview clip start time
                    </h3>

                    <p className="text-white/45 text-[15px] mb-6">
                        TikTok, Apple Music, iTunes
                    </p>

                    <div className="space-y-6">

                        {/* AUTO */}
                        <label className="flex items-start gap-4 cursor-pointer">

                        <input
                            type="radio"
                            name={`preview-${track.id}`}
                            checked={
                            track.previewClipMode === "auto"
                            }
                            onChange={() =>
                            updateTrack(
                                track.id,
                                "previewClipMode",
                                "auto"
                            )
                            }
                            className="mt-1 w-5 h-5"
                        />

                        <span className="text-[18px] text-white/80">
                            Let streaming services decide
                        </span>
                        </label>

                        {/* MANUAL */}
                        <div>

                        <label className="flex items-start gap-4 cursor-pointer mb-5">

                            <input
                            type="radio"
                            name={`preview-${track.id}`}
                            checked={
                                track.previewClipMode === "manual"
                            }
                            onChange={() =>
                                updateTrack(
                                track.id,
                                "previewClipMode",
                                "manual"
                                )
                            }
                            className="mt-1 w-5 h-5"
                            />

                            <span className="text-[18px] text-white/80">
                            Let me specify when the good
                            part starts
                            </span>
                        </label>

                        {track.previewClipMode ===
                            "manual" && (
                            <div className="ml-9 flex items-center gap-4">

                            {/* MINUTES */}
                            <div className="relative">

                                <select
                                value={track.previewMinutes}
                                onChange={(e) =>
                                    updateTrack(
                                    track.id,
                                    "previewMinutes",
                                    e.target.value
                                    )
                                }
                                className="
                                    appearance-none
                                    w-[110px]
                                    h-[62px]
                                    bg-[#232323]
                                    border
                                    border-white/[0.05]
                                    rounded-[4px]
                                    px-5
                                    text-white
                                    text-2xl
                                "
                                >
                                {Array.from(
                                    { length: 60 },
                                    (_, i) =>
                                    i
                                        .toString()
                                        .padStart(2, "0")
                                ).map((num) => (
                                    <option
                                    key={num}
                                    value={num}
                                    >
                                    {num}
                                    </option>
                                ))}
                                </select>

                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            </div>

                            <span className="text-3xl text-white/60">
                                :
                            </span>

                            {/* SECONDS */}
                            <div className="relative">

                                <select
                                value={track.previewSeconds}
                                onChange={(e) =>
                                    updateTrack(
                                    track.id,
                                    "previewSeconds",
                                    e.target.value
                                    )
                                }
                                className="
                                    appearance-none
                                    w-[110px]
                                    h-[62px]
                                    bg-[#232323]
                                    border
                                    border-white/[0.05]
                                    rounded-[4px]
                                    px-5
                                    text-white
                                    text-2xl
                                "
                                >
                                {Array.from(
                                    { length: 60 },
                                    (_, i) =>
                                    i
                                        .toString()
                                        .padStart(2, "0")
                                ).map((num) => (
                                    <option
                                    key={num}
                                    value={num}
                                    >
                                    {num}
                                    </option>
                                ))}
                                </select>

                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            </div>
                            </div>
                        )}
                        </div>
                    </div>
                    </div>

                    {/* TRACK PRICE */}
                    <div className="border-t border-white/[0.06] pt-8">

                        <h3 className="text-[24px] font-bold mb-3">
                        Track Price
                        </h3>

                        <p className="text-white/45 text-[15px] mb-6">
                        iTunes and Amazon
                        </p>

                        <div className="relative">

                        <select
                            className="
                            appearance-none
                            w-full
                            h-[62px]
                            bg-[#232323]
                            border
                            border-white/[0.05]
                            rounded-[4px]
                            px-5
                            text-white
                            text-lg
                            "
                        >
                            <option>$0.69</option>
                            <option>$0.99</option>
                            <option>$1.29</option>
                        </select>

                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        </div>

                        <p className="mt-5 text-white/45 text-[15px]">
                        Tracks over 10 minutes long will
                        be priced higher.
                        </p>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* APPLE MUSIC CREDITS */}
            <section className="bg-[#181818] border border-white/[0.04] rounded-[3px] p-5 sm:p-7">

            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">

                <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-[4px] bg-white flex items-center justify-center">
                    <Music2 className="w-7 h-7 text-black" />
                </div>

                <div>

                    <h2 className="text-[24px] sm:text-[28px] font-bold">
                    Apple Music Credits
                    </h2>

                    <p className="text-sm text-white/35 mt-1">
                    Performer & producer credits
                    required by Apple Music.
                    </p>
                </div>
                </div>

                <div
            className={`
                h-[42px]
                px-5
                rounded-[4px]
                border
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                ${
                creditsComplete
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-[#F5F500]/10 border-[#F5F500]/20 text-[#F5F500]"
                }
            `}
            >
            <AlertCircle className="w-4 h-4" />

            {creditsComplete
                ? "Completed"
                : "Not yet complete"}
            </div>
            </div>

            <div className="bg-[#1F1F1F] border border-white/[0.05] rounded-[4px] p-6">

                <p className="text-[17px] text-white/80 leading-relaxed mb-8">
                Apple Music requires at least one
                performer and producer credit for
                each song.
                </p>

                {/* ENABLE */}
                <div className="mb-8">

                    <button
                    type="button"
                    onClick={() =>
                        setShowCredits(!showCredits)
                    }
                    className="
                        w-full
                        min-h-[80px]
                        bg-[#232323]
                        border
                        border-white/[0.05]
                        rounded-[4px]
                        px-6
                        flex
                        items-center
                        justify-between
                        text-left
                    "
                    >
                    <div className="flex items-center gap-5">

                    <div className="w-12 h-12 rounded-full bg-[#F5F500]/10 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-[#F5F500]" />
                    </div>

                    <div>

                        <h3 className="text-[20px] font-bold">
                        Add credits for each song
                        </h3>

                        <p className="text-white/40 mt-1">
                        Performer & producer details
                        </p>
                    </div>
                    </div>

                    <div className="text-[32px] font-light text-white/70">
                        {showCredits ? "−" : "+"}
                    </div>
                </button>
                </div>

                {/* TRACK CREDIT CARD */}
                {tracks.map((track, index) => (
                <div
                    key={track.id}
                    className="
                    bg-[#232323]
                    border
                    border-white/[0.05]
                    rounded-[4px]
                    overflow-hidden
                    mb-8
                    "
                >

                    {/* HEADER */}
                    <div className="bg-[#19233A] px-6 py-5 flex items-center gap-5">

                    <div className="text-white/40 text-3xl">
                        {index + 1}
                    </div>

                    <div>

                        <h3 className="text-[28px] font-bold">
                        {track.title || "Song title"}
                        </h3>

                        <p className="text-white/40 mt-1">
                        Credit information
                        </p>
                    </div>
                    </div>

                    <div className="p-6 space-y-10">

                    {/* PERFORMER */}
                    <div>

                        <h4 className="text-[24px] font-bold mb-6">
                        Performer
                        </h4>

                        <div className="space-y-5">

                        {(performers[track.id] || []).map(
                            (performer, performerIndex) => (
                            <div
                                key={performerIndex}
                                className="space-y-4"
                            >

                                <div className="relative">

                                <select
                                    value={performer.role}
                                    onChange={(e) =>
                                    updatePerformer(
                                        track.id,
                                        performerIndex,
                                        "role",
                                        e.target.value
                                    )
                                    }
                                    className="
                                    appearance-none
                                    w-full
                                    h-[58px]
                                    bg-[#1A1A1A]
                                    border
                                    border-white/[0.05]
                                    rounded-[4px]
                                    px-5
                                    text-white
                                    "
                                >
                                    <option value="">
                                    Select a role
                                    </option>

                                    <option>
                                    Main Artist
                                    </option>

                                    <option>
                                    Featured Artist
                                    </option>

                                    <option>
                                    Vocalist
                                    </option>
                                </select>

                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                </div>

                                <input
                                type="text"
                                placeholder="Name"
                                value={performer.name}
                                onChange={(e) =>
                                    updatePerformer(
                                    track.id,
                                    performerIndex,
                                    "name",
                                    e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-[58px]
                                    bg-[#1A1A1A]
                                    border
                                    border-white/[0.05]
                                    rounded-[4px]
                                    px-5
                                    text-white
                                "
                                />
                            </div>
                            )
                        )}

                        <button
                            type="button"
                            onClick={() =>
                            addPerformer(track.id)
                            }
                            className="
                            flex
                            items-center
                            gap-3
                            text-[#F5F500]
                            font-semibold
                            "
                        >
                            <span className="text-2xl">
                            +
                            </span>

                            Add another performer
                        </button>
                        </div>
                    </div>

                    {/* PRODUCER */}
                    <div className="border-t border-white/[0.05] pt-10">

                        <h4 className="text-[24px] font-bold mb-6">
                        Producer
                        </h4>

                        <div className="space-y-5">

                        {(producers[track.id] || []).map(
                            (producer, producerIndex) => (
                            <div
                                key={producerIndex}
                                className="space-y-4"
                            >

                                <div className="relative">

                                <select
                                    value={producer.role}
                                    onChange={(e) =>
                                    updateProducer(
                                        track.id,
                                        producerIndex,
                                        "role",
                                        e.target.value
                                    )
                                    }
                                    className="
                                    appearance-none
                                    w-full
                                    h-[58px]
                                    bg-[#1A1A1A]
                                    border
                                    border-white/[0.05]
                                    rounded-[4px]
                                    px-5
                                    text-white
                                    "
                                >
                                    <option value="">
                                    Select a role
                                    </option>

                                    <option>
                                    Producer
                                    </option>

                                    <option>
                                    Co-Producer
                                    </option>

                                    <option>
                                    Executive Producer
                                    </option>
                                </select>

                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                </div>

                                <input
                                type="text"
                                placeholder="Name"
                                value={producer.name}
                                onChange={(e) =>
                                    updateProducer(
                                    track.id,
                                    producerIndex,
                                    "name",
                                    e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-[58px]
                                    bg-[#1A1A1A]
                                    border
                                    border-white/[0.05]
                                    rounded-[4px]
                                    px-5
                                    text-white
                                "
                                />
                            </div>
                            )
                        )}

                        <button
                            type="button"
                            onClick={() =>
                            addProducer(track.id)
                            }
                            className="
                            flex
                            items-center
                            gap-3
                            text-[#F5F500]
                            font-semibold
                            "
                        >
                            <span className="text-2xl">
                            +
                            </span>

                            Add another producer
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                ))}

                {/* FOOTNOTE */}
                <div className="border-t border-white/[0.05] pt-6">

                <p className="text-[15px] text-white/60 leading-relaxed">
                    To skip this step for now,
                    deselect Apple Music and iTunes
                    from your distribution platforms.
                    You can always add credits later.
                </p>
                </div>
            </div>
            </section>

            {/* EXTRAS */}
            <section className="space-y-6">

            {/* OPTIONAL EXTRAS CARD */}
            <div className="bg-[#181818] border border-white/[0.04] rounded-[4px] p-5 sm:p-7">

            <div className="mb-8">

                <h2 className="text-[26px] font-bold">
                Extras
                <span className="text-white/40 font-medium">
                    {" "}
                    (optional but awesome)
                </span>
                </h2>

                <div className="h-[1px] bg-white/[0.06] mt-6" />
            </div>

            <div className="space-y-8">

                {extras.map((item, index) => {

                const Icon = item.icon;

                const active =
                    selectedExtras.includes(item.title);

                return (
                    <button
                    key={index}
                    type="button"
                    onClick={() =>
                        toggleExtra(item.title)
                    }
                    className="
                        w-full
                        text-left
                        transition-all
                    "
                    >
                    <div className="flex items-start gap-5">

                        {/* LEFT CHECKBOX */}
                        <div
                        className={`
                            mt-1
                            w-7
                            h-7
                            rounded-[4px]
                            border
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                            transition-all
                            ${
                            active
                                ? "bg-[#F5F500] border-[#F5F500]"
                                : "border-white/[0.15] bg-transparent"
                            }
                        `}
                        >
                        {active && (
                            <Check className="w-4 h-4 text-black" />
                        )}
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1">

                        <div className="flex items-start gap-4">

                            <div className="w-11 h-11 rounded-[4px] bg-[#F5F500]/10 border border-[#F5F500]/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-[#F5F500]" />
                            </div>

                            <div>

                            <h3 className="text-[24px] leading-tight font-bold">
                                {item.title}
                                <span className="text-white/45 font-medium">
                                {" "}
                                ({item.price})
                                </span>
                            </h3>

                            <p className="text-[16px] text-white/55 leading-relaxed mt-3 max-w-[900px]">
                                {item.desc}
                            </p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </button>
                );
                })}
            </div>
            </div>

            {/* IMPORTANT CHECKBOXES CARD */}
            <div className="bg-[#181818] border border-white/[0.04] rounded-[4px] p-5 sm:p-7">

            <div className="mb-8">

                <h2 className="text-[26px] font-bold">
                Important checkboxes
                <span className="text-red-400">
                    {" "}
                    (mandatory)
                </span>
                </h2>

                <div className="h-[1px] bg-white/[0.06] mt-6" />
            </div>

            <div className="space-y-8">

                {[
                `I selected "YouTube Music" as a store. So I won't email later asking why my music was uploaded there.`,
                
                `I won't use fake promo services, stream bots or playlist manipulation services.`,
                
                `I recorded this music and I am authorized to distribute and collect royalties worldwide.`,
                
                `I'm not using another artist's name, song title or album title without permission.`,
                
                `I have read and agreed to the 2kTunes Distribution Agreement.`,
                ].map((text, index) => (

                <label
                    key={index}
                    className="flex items-start gap-5 cursor-pointer"
                >

                    {/* LEFT CHECKBOX */}
                    <input
                    type="checkbox"
                    className="
                        mt-1
                        w-7
                        h-7
                        rounded-[4px]
                        border-white/20
                        bg-transparent
                        accent-[#F5F500]
                        flex-shrink-0
                    "
                    />

                    {/* TEXT */}
                    <p className="text-[19px] text-white/80 leading-relaxed max-w-[1100px]">
                    {text}
                    </p>
                </label>
                ))}
            </div>
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
      
      {/* FINAL UPLOAD ACTION */}
        <div className="bg-[#181818] border border-white/[0.04] rounded-[4px] p-5 sm:p-7">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            {/* LEFT */}
            <div>

            <h3 className="text-[28px] font-bold">
                Ready to distribute?
            </h3>

            <p className="text-white/45 text-[16px] mt-3 leading-relaxed max-w-[700px]">
                Your release will be reviewed before being delivered
                to all selected streaming platforms.
            </p>
            </div>

            {/* BUTTON */}
            <button
            type="button"
            className="
                w-full
                lg:w-auto
                h-[64px]
                px-10
                rounded-[4px]
                bg-[#F5F500]
                hover:bg-white
                text-black
                font-bold
                text-[16px]
                flex
                items-center
                justify-center
                gap-3
                transition-all
            "
            >
            <Upload className="w-5 h-5" />

            Upload Release
            </button>
        </div>
        </div>
    </div>
  );
}