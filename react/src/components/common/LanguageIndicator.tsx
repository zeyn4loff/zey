export default function LanguageIndicator() {
  return (
    <span
      aria-label="Dil: Azərbaycan"
      title="Hazırda yalnız Azərbaycan dili mövcuddur"
      className="inline-flex h-9 items-center gap-1 rounded-xl px-1.5 text-xs font-medium sm:px-3"
    >
      <img src="https://flagcdn.com/w40/az.png" alt="" className="h-4 w-6 rounded-sm object-cover" />
      <span className="hidden sm:inline">AZ</span>
    </span>
  );
}
