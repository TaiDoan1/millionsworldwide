type Social = {
  name: string;
  href: string;
  path: React.ReactNode;
};

const SOCIALS: Social[] = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/millions.worldwide?xtok=MTZ5emN0bGV4aWkxZg%3D%3D&utm_source=qr",
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/14sNnRXMaZJ/?mibextid=wwXIfr",
    path: (
      <path
        d="M14 8.5V7c0-.7.3-1 1.2-1H17V3h-2.5C12 3 11 4.4 11 6.5V8.5H9V12h2v9h3v-9h2.2l.5-3.5H14z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/",
    path: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/",
    path: (
      <path
        d="M14 3c.3 2.1 1.6 3.6 3.8 3.9v2.6c-1.4.1-2.7-.3-3.8-1v5.6a5 5 0 11-5-5c.3 0 .6 0 .9.1v2.7a2.4 2.4 0 101.7 2.3V3H14z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com/",
    path: (
      <path
        d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4 4 0 00-6.9 3.7A11.4 11.4 0 013.6 4.6a4 4 0 001.3 5.4c-.7 0-1.3-.2-1.8-.5a4 4 0 003.2 4c-.6.1-1.2.2-1.8.1a4 4 0 003.8 2.8A8.1 8.1 0 012 18.1a11.4 11.4 0 006.2 1.8c7.4 0 11.5-6.2 11.5-11.5v-.5c.8-.6 1.5-1.3 2.1-2z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
  {
    name: "WhatsApp",
    href: "https://whatsapp.com/",
    path: (
      <path
        d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.5A10 10 0 1012 2zm0 2a8 8 0 016.8 12.2l-.3.5.7 2.6-2.7-.7-.5.3A8 8 0 1112 4zm-3.3 4.1c-.2 0-.5 0-.7.4-.3.4-1 1-1 2.3s1 2.7 1.2 2.9c.2.2 2 3.1 5 4.2 2.4.9 2.9.8 3.5.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4-.3-.2-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.5-.4-.5-.6-.5h-.2z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
];

export default function SocialIcons() {
  return (
    <div className="flex items-center justify-center gap-6">
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="text-black transition-opacity hover:opacity-60"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {s.path}
          </svg>
        </a>
      ))}
    </div>
  );
}
