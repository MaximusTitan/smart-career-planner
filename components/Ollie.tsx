export function Ollie({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Ollie the owl"
    >
      <path d="M22 30 L34 10 L48 26 Z" fill="#8a5a3c" />
      <path d="M98 30 L86 10 L72 26 Z" fill="#8a5a3c" />
      <ellipse cx="60" cy="68" rx="42" ry="46" fill="#a9744f" />
      <ellipse cx="60" cy="82" rx="26" ry="28" fill="#f6dfb8" />
      <circle cx="42" cy="52" r="17" fill="#fff" />
      <circle cx="78" cy="52" r="17" fill="#fff" />
      <circle cx="44" cy="54" r="8" fill="#2b2118" />
      <circle cx="76" cy="54" r="8" fill="#2b2118" />
      <circle cx="47" cy="51" r="2.6" fill="#fff" />
      <circle cx="79" cy="51" r="2.6" fill="#fff" />
      <path d="M53 62 L67 62 L60 76 Z" fill="#ff9f43" />
      <path d="M14 70 Q8 92 24 100 Q26 82 24 66 Z" fill="#8a5a3c" />
      <path d="M106 70 Q112 92 96 100 Q94 82 96 66 Z" fill="#8a5a3c" />
      <path d="M48 108 h8 M64 108 h8" stroke="#ff9f43" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
