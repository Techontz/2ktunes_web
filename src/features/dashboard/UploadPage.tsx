import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Upload } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { errorMessage, useResource } from "@/lib/api/useResource";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchArtists, fetchServices, uploadRelease } from "@/lib/api/dashboard";
import {
  Button,
  DataState,
  Field,
  Notice,
  PageHeader,
  Panel,
  SectionLabel,
  SelectField,
  Skeleton,
} from "./ui";

/**
 * NEW RELEASE — POST /api/releases/upload
 *
 * This posts real multipart data to the real endpoint. Nothing is stubbed, and
 * nothing is sent that the controller doesn't read.
 *
 * THE CONTRACT (ReleaseController@upload's validator, verbatim)
 * ------------------------------------------------------------
 *   release_title                          required|string|max:255
 *   artist_name                            required|string|max:255
 *   release_type                           required|in:Single,EP,Album
 *   release_date                           required|date
 *   cover_image                            required|image|max:10240   (10 MB)
 *   services                               required     ← JSON STRING, json_decode'd
 *   tracks                                 required|array|min:1
 *   tracks.*.title                         required|string|max:255
 *   tracks.*.audio_file                    required|file|max:51200    (50 MB)
 *   tracks.*.songwriters.*.first_name      required|string|min:1
 *   tracks.*.songwriters.*.last_name       required|string|min:1
 *   tracks.*.performers.*.role|name        required|string|min:1
 *   tracks.*.producers.*.role|name         required|string|min:1
 *   agreements                             required|array|min:1
 *
 * Everything else the controller reads (record label, genres, language, socials,
 * ISRC, explicit, featured artists) is optional and is only sent when filled.
 *
 * TWO REAL GATES, both surfaced rather than worked around
 * ------------------------------------------------------
 *  1. The route carries the `subscribed` middleware, which 403s any account
 *     whose `subscription_status` isn't 'active'.
 *  2. `services` must contain platforms, and platforms come from the `services`
 *     table via GET /api/services. That table ships empty, so until an admin
 *     adds rows there is nothing legitimate to send. Inventing platform names
 *     client-side would write fiction into `releases.platforms`.
 */

type Person = { first_name: string; last_name: string };
type Credit = { role: string; name: string };

const RELEASE_TYPES = ["Single", "EP", "Album"] as const;

const AGREEMENTS = [
  "I own or control all rights to this recording and its artwork.",
  "The metadata above is accurate and complete.",
  "I accept the 2K Tunes distribution terms.",
];

const MAX_COVER_BYTES = 10240 * 1024;
const MAX_AUDIO_BYTES = 51200 * 1024;

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const services = useResource((signal) => fetchServices(signal));
  const artists = useResource((signal) => fetchArtists(signal));

  const [form, setForm] = useState({
    release_title: "",
    artist_name: "",
    release_type: "Single" as (typeof RELEASE_TYPES)[number],
    release_date: "",
    record_label: "",
    language: "",
    primary_genre: "",
    secondary_genre: "",
    track_title: "",
    isrc: "",
  });
  const [cover, setCover] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [songwriter, setSongwriter] = useState<Person>({ first_name: "", last_name: "" });
  const [performer, setPerformer] = useState<Credit>({ role: "Main Artist", name: "" });
  const [producer, setProducer] = useState<Credit>({ role: "Producer", name: "" });
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [agreed, setAgreed] = useState<boolean[]>(AGREEMENTS.map(() => false));

  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (!user) return null;

  const subscribed = user.subscription_status === "active";

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  /** Mirrors the server's rules so the user isn't taught them by a 422. */
  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.release_title.trim()) next.release_title = "Required.";
    if (!form.artist_name.trim()) next.artist_name = "Required.";
    if (!form.release_date) next.release_date = "Required.";
    if (!cover) next.cover_image = "Cover artwork is required.";
    else if (cover.size > MAX_COVER_BYTES) next.cover_image = "Artwork must be under 10 MB.";
    if (!form.track_title.trim()) next.track_title = "Required.";
    if (!audio) next.audio_file = "An audio file is required.";
    else if (audio.size > MAX_AUDIO_BYTES) next.audio_file = "Audio must be under 50 MB.";
    if (!songwriter.first_name.trim()) next.sw_first = "Required.";
    if (!songwriter.last_name.trim()) next.sw_last = "Required.";
    if (!performer.name.trim()) next.performer_name = "Required.";
    if (!performer.role.trim()) next.performer_role = "Required.";
    if (!producer.name.trim()) next.producer_name = "Required.";
    if (!producer.role.trim()) next.producer_role = "Required.";
    if (!platforms.length) next.services = "Choose at least one platform.";
    if (!agreed.every(Boolean)) next.agreements = "Accept all three to continue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    setFormError(null);
    if (!validate()) return;

    const body = new FormData();
    body.append("release_title", form.release_title.trim());
    body.append("artist_name", form.artist_name.trim());
    body.append("release_type", form.release_type);
    body.append("release_date", form.release_date);
    body.append("cover_image", cover!);
    // json_decode'd server-side into `releases.platforms`.
    body.append("services", JSON.stringify(platforms));

    for (const [key, value] of [
      ["record_label", form.record_label],
      ["language", form.language],
      ["primary_genre", form.primary_genre],
      ["secondary_genre", form.secondary_genre],
    ] as const) {
      if (value.trim()) body.append(key, value.trim());
    }

    body.append("tracks[0][title]", form.track_title.trim());
    body.append("tracks[0][audio_file]", audio!);
    if (form.isrc.trim()) body.append("tracks[0][isrc]", form.isrc.trim());
    body.append("tracks[0][songwriters][0][first_name]", songwriter.first_name.trim());
    body.append("tracks[0][songwriters][0][last_name]", songwriter.last_name.trim());
    body.append("tracks[0][performers][0][role]", performer.role.trim());
    body.append("tracks[0][performers][0][name]", performer.name.trim());
    body.append("tracks[0][producers][0][role]", producer.role.trim());
    body.append("tracks[0][producers][0][name]", producer.name.trim());

    AGREEMENTS.forEach((text) => body.append("agreements[]", text));

    setBusy(true);
    try {
      const res = await uploadRelease(body);
      if (res.release?.id) navigate(`/dashboard/music/${res.release.id}`, { replace: true });
      else navigate("/dashboard/music", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.isValidation) {
        // Server field names are nested (tracks.0.audio_file); map the ones the
        // form owns and show the rest as a summary rather than losing them.
        const mapped: Record<string, string> = {};
        const leftovers: string[] = [];
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          const key =
            field === "tracks.0.title"
              ? "track_title"
              : field === "tracks.0.audio_file"
                ? "audio_file"
                : field.startsWith("tracks.0.songwriters")
                  ? "sw_first"
                  : field.startsWith("tracks.0.performers")
                    ? "performer_name"
                    : field.startsWith("tracks.0.producers")
                      ? "producer_name"
                      : field;
          if (key.includes(".")) leftovers.push(message);
          else mapped[key] = message;
        }
        setErrors(mapped);
        setFormError(
          leftovers.length
            ? leftovers[0]
            : Object.keys(mapped).length
              ? null
              : "Some details were rejected. Check the fields above.",
        );
      } else if (err instanceof ApiError && err.status === 403) {
        setFormError(err.message);
      } else {
        setFormError(errorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  /* ── GATE 1: subscription ── */
  if (!subscribed) {
    return (
      <>
        <PageHeader eyebrow="2K Tunes / Distribution" title="New Release" />
        <Panel className="flex flex-col items-start gap-5 p-7">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/[0.09] bg-white/[0.03] text-white/35"
            aria-hidden
          >
            <Lock className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[1.125rem] font-bold text-white">
              Distribution needs an active plan
            </p>
            <p className="mt-2.5 max-w-[52ch] text-[0.875rem] font-medium leading-relaxed text-white/40">
              Your subscription status is{" "}
              <span className="font-bold text-white/70">
                {user.subscription_status ?? "inactive"}
              </span>
              . The upload endpoint refuses releases until it’s active, so the
              form is closed rather than letting you fill it in and fail.
            </p>
          </div>
          <Link to="/dashboard/plan">
            <Button>See plans</Button>
          </Link>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="2K Tunes / Distribution"
        title="New Release"
        lede="Deliver a single to every platform you select. Everything marked required is required by the backend, not by this form."
      />

      <DataState state={services} skeleton={<Skeleton className="h-[28rem]" />}>
        {(catalogue) =>
          /* ── GATE 2: no platforms exist to deliver to ── */
          catalogue.length === 0 ? (
            <Notice tone="attention" title="No delivery platforms are configured">
              <code className="text-white/60">GET /api/services</code> returned
              an empty list, so there is nothing to deliver this release to. An
              administrator adds platforms in the admin panel; they’ll appear
              here as soon as they exist.
            </Notice>
          ) : (
            <form onSubmit={submit} className="min-w-0 space-y-4" noValidate>
              {/* ── RELEASE ── */}
              <Panel>
                <SectionLabel>Release</SectionLabel>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Release title *"
                    value={form.release_title}
                    onChange={set("release_title")}
                    error={errors.release_title}
                    maxLength={255}
                  />
                  <Field
                    label="Artist name *"
                    value={form.artist_name}
                    onChange={set("artist_name")}
                    error={errors.artist_name}
                    maxLength={255}
                    list="artist-names"
                    hint={
                      artists.data?.artists.length
                        ? "Pick one of your artists, or type a new name."
                        : undefined
                    }
                  />
                  <datalist id="artist-names">
                    {artists.data?.artists.map((a) => (
                      <option key={a.id} value={a.name} />
                    ))}
                  </datalist>
                  <SelectField
                    label="Release type *"
                    value={form.release_type}
                    onChange={set("release_type")}
                  >
                    {RELEASE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </SelectField>
                  <Field
                    label="Release date *"
                    type="date"
                    value={form.release_date}
                    onChange={set("release_date")}
                    error={errors.release_date}
                  />
                  <Field
                    label="Record label"
                    value={form.record_label}
                    onChange={set("record_label")}
                  />
                  <Field label="Language" value={form.language} onChange={set("language")} />
                  <Field
                    label="Primary genre"
                    value={form.primary_genre}
                    onChange={set("primary_genre")}
                  />
                  <Field
                    label="Secondary genre"
                    value={form.secondary_genre}
                    onChange={set("secondary_genre")}
                  />
                  <Field
                    label="Cover artwork *"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                    error={errors.cover_image}
                    hint="JPG or PNG, up to 10 MB. Square artwork of at least 3000×3000 is the platform standard."
                    className="sm:col-span-2"
                  />
                </div>
              </Panel>

              {/* ── TRACK ── */}
              <Panel>
                <SectionLabel>Track</SectionLabel>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Track title *"
                    value={form.track_title}
                    onChange={set("track_title")}
                    error={errors.track_title}
                    maxLength={255}
                  />
                  <Field
                    label="ISRC"
                    value={form.isrc}
                    onChange={set("isrc")}
                    hint="Leave blank and one will be assigned."
                  />
                  <Field
                    label="Audio file *"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
                    error={errors.audio_file}
                    hint="WAV or FLAC preferred, up to 50 MB."
                    className="sm:col-span-2"
                  />
                </div>
              </Panel>

              {/* ── CREDITS ── */}
              <Panel>
                <SectionLabel>Credits</SectionLabel>
                <p className="mt-2.5 text-[0.8125rem] font-medium leading-relaxed text-white/35">
                  Platforms reject deliveries without a songwriter, a performer
                  and a producer, so all three are required.
                </p>

                <div className="mt-5 space-y-5">
                  <div>
                    <p className="mb-3 text-[0.8125rem] font-bold text-white/65">Songwriter *</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="First name"
                        value={songwriter.first_name}
                        onChange={(e) =>
                          setSongwriter((s) => ({ ...s, first_name: e.target.value }))
                        }
                        error={errors.sw_first}
                      />
                      <Field
                        label="Last name"
                        value={songwriter.last_name}
                        onChange={(e) =>
                          setSongwriter((s) => ({ ...s, last_name: e.target.value }))
                        }
                        error={errors.sw_last}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[0.8125rem] font-bold text-white/65">Performer *</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Name"
                        value={performer.name}
                        onChange={(e) =>
                          setPerformer((p) => ({ ...p, name: e.target.value }))
                        }
                        error={errors.performer_name}
                      />
                      <Field
                        label="Role"
                        value={performer.role}
                        onChange={(e) =>
                          setPerformer((p) => ({ ...p, role: e.target.value }))
                        }
                        error={errors.performer_role}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[0.8125rem] font-bold text-white/65">Producer *</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Name"
                        value={producer.name}
                        onChange={(e) =>
                          setProducer((p) => ({ ...p, name: e.target.value }))
                        }
                        error={errors.producer_name}
                      />
                      <Field
                        label="Role"
                        value={producer.role}
                        onChange={(e) =>
                          setProducer((p) => ({ ...p, role: e.target.value }))
                        }
                        error={errors.producer_role}
                      />
                    </div>
                  </div>
                </div>
              </Panel>

              {/* ── PLATFORMS ── */}
              <Panel>
                <SectionLabel>Platforms *</SectionLabel>
                <p className="mt-2.5 text-[0.8125rem] font-medium text-white/35">
                  Where this release is delivered. Loaded from the platforms
                  2K Tunes has configured.
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {catalogue.map((service) => {
                    const on = platforms.includes(service.name);
                    return (
                      <li key={service.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            setPlatforms((list) =>
                              on
                                ? list.filter((n) => n !== service.name)
                                : [...list, service.name],
                            )
                          }
                          className={`rounded-full border px-3.5 py-2 text-[0.8125rem] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-volt-lit/70 ${
                            on
                              ? "border-volt-lit/50 bg-volt/[0.16] text-white"
                              : "border-white/[0.11] text-white/50 hover:border-white/25 hover:text-white/80"
                          }`}
                        >
                          {service.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {errors.services && (
                  <p role="alert" className="mt-3 text-[0.75rem] font-medium text-clay">
                    {errors.services}
                  </p>
                )}
              </Panel>

              {/* ── AGREEMENTS ── */}
              <Panel>
                <SectionLabel>Agreements *</SectionLabel>
                <ul className="mt-4 space-y-3">
                  {AGREEMENTS.map((text, i) => (
                    <li key={text}>
                      <label className="flex cursor-pointer items-start gap-3 text-[0.875rem] font-medium leading-relaxed text-white/60">
                        <input
                          type="checkbox"
                          checked={agreed[i]}
                          onChange={(e) =>
                            setAgreed((list) =>
                              list.map((v, j) => (j === i ? e.target.checked : v)),
                            )
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#6D2BFF]"
                        />
                        {text}
                      </label>
                    </li>
                  ))}
                </ul>
                {errors.agreements && (
                  <p role="alert" className="mt-3 text-[0.75rem] font-medium text-clay">
                    {errors.agreements}
                  </p>
                )}
              </Panel>

              {formError && (
                <p
                  role="alert"
                  className="rounded-[12px] border border-clay/30 bg-clay/[0.07] px-4 py-3 text-[0.8125rem] font-medium text-clay"
                >
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 pb-4">
                <Button type="submit" busy={busy}>
                  <Upload className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                  {busy ? "Uploading…" : "Submit release"}
                </Button>
                <p className="text-[0.75rem] font-medium text-white/25">
                  Large files take a moment — don’t close this tab.
                </p>
              </div>
            </form>
          )
        }
      </DataState>
    </>
  );
}
