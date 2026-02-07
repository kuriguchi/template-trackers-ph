import Image from "next/image";

export default function TemplateTrackerIcon({ variant = "mark", className = "h-200 w-200", accentClass = "text-emerald-500" }) {
  return (
    <div className={`inline-block ${className} ${accentClass}`}>
      <Image
        src="/logo.png"
        alt="Template Trackers PH"
        width={200}
        height={200}
        className="object-contain"
      />
    </div>
  );
}