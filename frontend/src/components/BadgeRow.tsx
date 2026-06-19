import type { Badge } from "../dashboard/api/engine/engine-bridge";

type BadgeRowProps = {
  badges: Badge[];
};

export default function BadgeRow({ badges }: BadgeRowProps) {
  if (!badges?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={`${badge.type}-${badge.label}`}
          className="rounded-full border px-3 py-1 text-xs font-semibold"
          style={{ borderColor: badge.color || "#4b5563", color: badge.color || "#e5e7eb" }}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
