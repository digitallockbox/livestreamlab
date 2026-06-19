import { useState } from "react";
import { uploadCreatorPhoto } from "../dashboard/api/engine/engine-bridge";

type PhotoUploaderProps = {
  creatorId?: string;
  onUploaded?: (payload: unknown) => void;
};

export default function PhotoUploader({ creatorId = "current", onUploaded }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const res = await uploadCreatorPhoto(creatorId, file);
      if (!res.ok) setError(res.error || "Upload failed");
      else onUploaded?.(res.data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-900/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-gray-100 file:mr-3 file:rounded file:border-0 file:bg-gray-700 file:px-3 file:py-2 file:text-white"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload Photo"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
