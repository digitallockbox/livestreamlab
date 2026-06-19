import { useState } from "react";
import { updateProfileMedia } from "../dashboard/api/engine/engine-bridge";

type ProfileMediaEditorProps = {
  initialBanner?: string;
  initialAvatar?: string;
};

export default function ProfileMediaEditor({
  initialBanner = "",
  initialAvatar = "",
}: ProfileMediaEditorProps) {
  const [bannerUrl, setBannerUrl] = useState(initialBanner);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSave() {
    setLoading(true);
    const res = await updateProfileMedia({ bannerUrl, avatarUrl });
    if (!res.ok) setMsg(res.error || "Save failed");
    else setMsg("Profile media updated");
    setLoading(false);
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-900/70 p-4">
      <h3 className="mb-3 text-lg font-semibold text-white">Profile Media</h3>
      <div className="grid gap-3">
        <label className="text-sm text-gray-200">
          Banner URL
          <input
            className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
          />
        </label>

        <label className="text-sm text-gray-200">
          Avatar URL
          <input
            className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </label>

        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        {msg && <p className="text-sm text-gray-200">{msg}</p>}
      </div>
    </div>
  );
}
