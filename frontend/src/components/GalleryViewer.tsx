import { useState } from "react";
import type { CreatorPhoto } from "../dashboard/api/engine/engine-bridge";

type GalleryViewerProps = {
  photos: CreatorPhoto[];
};

export default function GalleryViewer({ photos }: GalleryViewerProps) {
  const [active, setActive] = useState<CreatorPhoto | null>(null);

  if (!photos?.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <img
            key={`${photo.id || photo.url}-${index}`}
            src={photo.url}
            alt={photo.title || "Creator photo"}
            className="h-28 w-full cursor-pointer rounded object-cover"
            onClick={() => setActive(photo)}
          />
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <img
            src={active.url}
            alt={active.title || "Preview"}
            className="max-h-[85vh] max-w-[92vw] rounded"
          />
        </div>
      )}
    </>
  );
}
