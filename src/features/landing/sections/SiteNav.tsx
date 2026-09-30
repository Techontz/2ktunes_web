import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { NAV } from "../data";
import { Wordmark } from "../ui";
import { cn } from "@/lib/utils";

/**
 * Landing navigation.
 *
 * Deliberately quiet: a 64px black bar, no borders, no icons. It only asserts
 * itself once the hero has scrolled past, when a hairline and a blur appear.
 */
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500",
          scrolled
            ? "border-b border-white/[0.07] bg-ink/80 backdrop-blur-xl"
            : "border-b border-transparent bg-ink",
        )}
      >
        <nav className="shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="text-[1.375rem] leading-none"
              aria-label="2K Tunes — home"
            >
              <Wordmark />
            </Link>

            <ul className="hidden items-center gap-8 lg:flex">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[0.875rem] font-medium text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <Link
              to="/auth"
              className="hidden text-[0.875rem] font-medium text-white/70 transition-colors hover:text-white sm:block"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="hidden h-9 items-center rounded-full bg-white px-5 text-[0.875rem] font-semibold text-ink transition-colors hover:bg-bone-2 sm:inline-flex"
            >
              Sign up
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="relative -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span className="relative block h-3.5 w-6">
                <motion.span
                  animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-0 block h-[2px] w-6 rounded-full bg-white"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-0 left-0 block h-[2px] w-6 rounded-full bg-white"
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu — full-bleed black, oversized type, nothing else. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-40 flex flex-col bg-ink pt-16 lg:hidden"
          >
            <div className="shell flex flex-1 flex-col justify-between overflow-y-auto py-10">
              <ul className="flex flex-col gap-1">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 + i * 0.055,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 text-[2.25rem] font-extrabold tracking-[-0.04em] text-white"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-12 flex flex-col gap-3"
              >
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex h-14 items-center justify-center rounded-full bg-white text-[1.0625rem] font-semibold text-ink"
                >
                  Get started
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex h-14 items-center justify-center rounded-full border border-white/20 text-[1.0625rem] font-semibold text-white"
                >
                  Log in
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
