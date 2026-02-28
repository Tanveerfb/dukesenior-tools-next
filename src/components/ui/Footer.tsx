import Link from "next/link";
import { FaDiscord, FaInstagram, FaTwitter } from "react-icons/fa";
import { RiNextjsFill } from "react-icons/ri";
import { SiKofi, SiTailwindcss } from "react-icons/si";

const navSections = [
  {
    title: "Explore",
    links: [
      { label: "Phasmo Tourney series", href: "/phasmotourney-series" },
      { label: "Posts & updates", href: "/posts" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Suggestions", href: "/suggestions" },
      { label: "Style check", href: "/style-check" },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "The Lair of Evil Discord",
        href: "https://discord.gg/xB9mpZfbq3",
        external: true,
      },
      {
        label: "Phasmo Tourney Discord",
        href: "https://discord.gg/r9WT8RUPxn",
        external: true,
      },
      { label: "Profile", href: "/profile" },
    ],
  },
];

const socialLinks = [
  {
    icon: <FaTwitter />,
    label: "Twitter",
    href: "https://twitter.com/dukesenior",
  },
  {
    icon: <FaInstagram />,
    label: "Instagram",
    href: "https://www.instagram.com/dukesenior22",
  },
  {
    icon: <FaDiscord />,
    label: "Discord",
    href: "https://discord.gg/xB9mpZfbq3",
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-dashed border-border dark:border-border-dark bg-card dark:bg-card-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-foreground dark:text-foreground-dark mb-3">
              The Lair of Evil
            </h2>
            <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted mb-5">
              Tools, event dashboards, and community resources powering the
              Phasmo Tourney project and the DukeSenior community.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <a
                href="https://ko-fi.com/dukesenior"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-warning hover:bg-warning-600 text-white rounded-lg font-medium text-sm transition-all hover:-translate-y-0.5"
              >
                <SiKofi />
                Support on Ko-Fi
              </a>
              <span className="text-xs text-foreground-muted dark:text-foreground-dark-muted">
                &copy; {new Date().getFullYear()} DukeSenior
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-foreground-muted dark:text-foreground-dark-muted">
                <RiNextjsFill size={16} /> Next.js
              </span>
              <span className="flex items-center gap-1 text-xs text-foreground-muted dark:text-foreground-dark-muted">
                <SiTailwindcss size={14} /> Tailwind
              </span>
            </div>
          </div>

          {/* Navigation Sections */}
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted dark:text-foreground-dark-muted mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground dark:text-foreground-dark hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-foreground dark:text-foreground-dark hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-border dark:border-border-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted">
            Built with care for players, casters, and crew of the Phasmo
            Tourney.
          </p>
          <div className="flex flex-wrap gap-5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex items-center gap-1.5 text-foreground-muted dark:text-foreground-dark-muted hover:text-primary transition-all hover:-translate-y-0.5"
              >
                {social.icon}
                <span className="text-xs">{social.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
