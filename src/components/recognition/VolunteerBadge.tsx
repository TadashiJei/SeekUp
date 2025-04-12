
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeLevel = "bronze" | "silver" | "gold" | "platinum";

interface VolunteerBadgeProps {
  level: BadgeLevel;
  name: string;
  description: string;
  className?: string;
}

const badgeColors = {
  bronze: "bg-amber-600",
  silver: "bg-slate-400",
  gold: "bg-yellow-400",
  platinum: "bg-gradient-to-r from-sky-400 to-purple-500"
};

const VolunteerBadge = ({ level, name, description, className }: VolunteerBadgeProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center p-4 rounded-lg shadow-md border border-gray-200",
      className
    )}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-2 text-white",
        badgeColors[level]
      )}>
        <BadgeCheck className="h-8 w-8" />
      </div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-600 text-center mt-1">{description}</p>
    </div>
  );
};

export default VolunteerBadge;
