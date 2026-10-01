import { useState, type FormEvent } from "react";
import { CheckCircle2, Copy, LifeBuoy, Mail, MapPin } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { useLanguage, type Localized } from "@/lib/LanguageContext";
import { Orbs, TextLink } from "../kit";
import { usePageMeta } from "../usePageMeta";

/**
 * Contact.
 *
 * There is no contact endpoint in the API, so rather than a form that pretends
 * to send, this composes a real email: the visitor's own mail app opens with
 * the subject and body filled in, addressed to CONTACT_EMAIL. The message can
 * also be copied, for people without a configured mail app.
 */
export const CONTACT_EMAIL =
  ((import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? "").trim() || "support@2ktunes.com";

const TOPICS = [
  "general",
  "distribution",
  "royalties",
  "promotion",
  "labels",
  "creators",
  "press",
] as const;

const COPY: Localized<{
  title: string;
  eyebrow: string;
  lede: string;
  emailLabel: string;
  officeLabel: string;
  office: string;
  helpLabel: string;
  helpBody: string;
  helpLink: string;
  subject: string;
}> = {
  EN: {
    eyebrow: "Contact",
    title: "Talk to a person.",
    lede: "Questions about a release, royalties or working with us? Write to our team in English or Kiswahili. We usually reply within one business day.",
    emailLabel: "Email",
    officeLabel: "Office",
    office: "Dar es Salaam, Tanzania",
    helpLabel: "Quick answers",
    helpBody: "Many questions are already answered in the Help Center.",
    helpLink: "Search the Help Center",
    subject: "2kTunes enquiry",
  },
  SW: {
    eyebrow: "Mawasiliano",
    title: "Zungumza na mtu halisi.",
    lede: "Una maswali kuhusu toleo, mirabaha au kufanya kazi nasi? Iandikie timu yetu kwa Kiingereza au Kiswahili. Kwa kawaida tunajibu ndani ya siku moja ya kazi.",
    emailLabel: "Barua pepe",
    officeLabel: "Ofisi",
    office: "Dar es Salaam, Tanzania",
    helpLabel: "Majibu ya haraka",
    helpBody: "Maswali mengi tayari yamejibiwa kwenye Kituo cha Msaada.",
    helpLink: "Tafuta kwenye Kituo cha Msaada",
    subject: "Swali kwa 2kTunes",
  },
  FR: {
    eyebrow: "Contact",
    title: "Parlez à une vraie personne.",
    lede: "Une question sur une sortie, vos royalties ou une collaboration ? Écrivez à notre équipe en anglais ou en kiswahili. Nous répondons généralement sous un jour ouvré.",
    emailLabel: "E-mail",
    officeLabel: "Bureau",
    office: "Dar es Salaam, Tanzanie",
    helpLabel: "Réponses rapides",
    helpBody: "Beaucoup de questions ont déjà leur réponse dans le Centre d’aide.",
    helpLink: "Rechercher dans le Centre d’aide",
    subject: "Demande 2kTunes",
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildMailto(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ContactPage() {
  const { t, pick } = useLanguage();
  const c = pick(COPY);
  usePageMeta(c.eyebrow, c.lede);

  const [values, setValues] = useState({ name: "", email: "", topic: "general", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [composed, setComposed] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = t("contact.err_name");
    if (!EMAIL_RE.test(values.email.trim())) next.email = t("contact.err_email");
    if (values.message.trim().length < 10) next.message = t("contact.err_message");
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    const topicLabel = t(`contact.topic_${values.topic}`);
    const subject = `${c.subject}: ${topicLabel}`;
    const body = `${values.message.trim()}\n\n— ${values.name.trim()}\n${values.email.trim()}\n${t("contact.topic")}: ${topicLabel}`;
    setComposed({ subject, body });
    setCopied(false);
    window.location.href = buildMailto(CONTACT_EMAIL, subject, body);
  };

  const copy = async () => {
    if (!composed) return;
    try {
      await navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\nSubject: ${composed.subject}\n\n${composed.body}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="theme-dark bg-hero relative overflow-hidden pb-20 pt-28 text-text md:pb-28 md:pt-36">
      <Orbs />
      <div className="shell relative grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <p className="t-eyebrow mb-4 text-accent-text">{c.eyebrow}</p>
          <h1 className="t-display">{c.title}</h1>
          <p className="t-lead mt-5 max-w-[34rem] text-text-muted">{c.lede}</p>

          <dl className="mt-10 space-y-6">
            <div className="flex gap-4">
              <Mail aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" />
              <div>
                <dt className="text-body-sm text-text-subtle">{c.emailLabel}</dt>
                <dd className="mt-0.5 text-body font-semibold">
                  <a className="underline-offset-4 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" />
              <div>
                <dt className="text-body-sm text-text-subtle">{c.officeLabel}</dt>
                <dd className="mt-0.5 text-body font-semibold">{c.office}</dd>
              </div>
            </div>
            <div className="flex gap-4">
              <LifeBuoy aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" />
              <div>
                <dt className="text-body-sm text-text-subtle">{c.helpLabel}</dt>
                <dd className="mt-0.5 text-body text-text-muted">
                  {c.helpBody}{" "}
                  <TextLink to="/help" className="mt-1">
                    {c.helpLink}
                  </TextLink>
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-panel border border-white/12 bg-surface-raised/80 p-5 shadow-overlay backdrop-blur-md sm:p-8">
          <form noValidate onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("contact.name")} error={errors.name} id="contact-name" required>
                <Input autoComplete="name" value={values.name} onChange={set("name")} />
              </Field>
              <Field label={t("contact.email")} error={errors.email} id="contact-email" required>
                <Input type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set("email")} />
              </Field>
            </div>
            <Field label={t("contact.topic")} id="contact-topic">
              <Select value={values.topic} onChange={set("topic")}>
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {t(`contact.topic_${topic}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={t("contact.message")}
              hint={t("contact.message_hint")}
              error={errors.message}
              id="contact-message"
              required
            >
              <Textarea rows={6} value={values.message} onChange={set("message")} />
            </Field>
            <p className="text-body-sm text-text-subtle">{t("contact.mailto_note")}</p>
            <Button type="submit" size="lg" leftIcon={<Mail />} className="w-full sm:w-auto">
              {t("contact.send")}
            </Button>
          </form>

          {composed && (
            <div role="status" className="mt-6 rounded-card border border-success/25 bg-success-soft/50 p-5">
              <p className="flex items-start gap-2.5 text-body font-semibold text-text">
                <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                {t("contact.opened")}
              </p>
              <p className="mt-2 pl-7 text-body-sm text-text-muted">
                {t("contact.opened_fallback", { email: CONTACT_EMAIL })}
              </p>
              <div className="mt-4 pl-7">
                <Button variant="secondary" size="sm" leftIcon={<Copy />} onClick={copy}>
                  {copied ? t("contact.copied") : t("contact.copy")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
