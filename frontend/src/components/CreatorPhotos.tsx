import { useCallback, useEffect, useState } from "react";
import type { CreatorPhoto } from "../dashboard/api/engine/engine-bridge";
import { getCreatorPhotos } from "../dashboard/api/engine/engine-bridge";
import GalleryViewer from "./GalleryViewer";
import PhotoUploader from "./PhotoUploader";

type CreatorPhotosProps = {
  creatorId?: string;
};

function normalizePhotos(payload: unknown): CreatorPhoto[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is CreatorPhoto => Boolean((item as CreatorPhoto)?.url));
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { photos?: unknown[] }).photos)
  ) {
    return (payload as { photos: CreatorPhoto[] }).photos.filter((item) => Boolean(item?.url));
  }

  return [];
}

export default function CreatorPhotos({ creatorId = "current" }: CreatorPhotosProps) {
  const [photos, setPhotos] = useState<CreatorPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(() => {
    setLoading(true);
    setError(null);

    getCreatorPhotos(creatorId).then((res) => {
      if (res.ok) {
        setPhotos(normalizePhotos(res.data));
      } else {
        setError(res.error || "Unable to load photos");
      }
      setLoading(false);
    });
  }, [creatorId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return (
    <section className="space-y-4 rounded border border-gray-700 bg-gray-900/60 p-4">
      <h2 className="text-xl font-semibold text-white">Creator Photos</h2>
      <PhotoUploader creatorId={creatorId} onUploaded={loadPhotos} />

      {loading && <p className="text-sm text-gray-300">Loading photos...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && <GalleryViewer photos={photos} />}
    </section>
  );
}
