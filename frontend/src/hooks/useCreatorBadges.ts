import { useEffect, useState } from "react";
import type { Badge } from "../dashboard/api/engine/engine-bridge";
import { getCreatorBadges } from "../dashboard/api/engine/engine-bridge";

export function useCreatorBadges(creatorId: string) {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        getCreatorBadges(creatorId).then((res) => {
            if (!mounted) return;

            if (res.ok) {
                const payload = res.data as { badges?: Badge[] } | Badge[] | null;
                const nextBadges = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.badges)
                        ? payload.badges
                        : [];
                setBadges(nextBadges);
            } else {
                setBadges([]);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
        };
    }, [creatorId]);

    return { badges, loading };
}
