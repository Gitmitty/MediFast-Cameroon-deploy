import { Heart } from "lucide-react";

export default function HeroSection({ darkMode, t }) {
  return (
    <div className="relative h-[50vh] overflow-hidden">
      <img
        src="https://d64gsuwffb70l.cloudfront.net/692db78c383879166ccc73e9_1764608413301_99c6de1b.webp"
        alt="Hospital"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="text-red-400" size={20} />
          <span className="text-sm opacity-80">HealthTech Pioneers</span>
        </div>

        <h1 className="text-4xl font-bold mb-1">MboaMed</h1>
        <p className="text-lg opacity-90">{t("slogan")}</p>
      </div>
    </div>
  );
}
