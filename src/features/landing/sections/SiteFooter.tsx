import { Link } from "react-router-dom";
import { FOOTER_COLUMNS } from "../data";
import { Wordmark } from "../ui";

export default function SiteFooter() {
  return (
    <footer className="bg-ink pb-10 pt-20 md:pt-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Wordmark className="text-[1.75rem]" />
            <p className="mt-5 max-w-[34ch] text-[0.9375rem] font-medium leading-relaxed text-white/45">
              Music distribution built for African artists with a global
              audience.
            </p>
            <Link
              to="/auth"
              className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-6 text-[0.875rem] font-bold text-ink transition-colors hover:bg-bone-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-lit"
            >
              Get started
            </Link>
          </div>

          {/* Link columns — on-page destinations only. */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:gap-8">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="t-eyebrow text-white/35">{col.title}</h3>
                <ul className="mt-5 space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link
                          to={link.href}
                          className="rounded text-[0.9375rem] font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-lit"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="rounded text-[0.9375rem] font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-lit"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-between md:mt-20">
          <p className="text-[0.8125rem] font-medium text-white/35">
            © {new Date().getFullYear()} 2K Tunes. All rights reserved.
          </p>
          <p className="text-[0.8125rem] font-medium text-white/35">
            Built in Tanzania for artists everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
