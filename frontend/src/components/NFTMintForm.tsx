import { useState } from "react";
import { mintCreatorNft } from "../dashboard/api/engine/engine-bridge";

type NFTMintFormProps = {
  creatorId?: string;
  onMinted?: (payload: unknown) => void;
};

export default function NFTMintForm({ creatorId = "current", onMinted }: NFTMintFormProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  async function handleMint() {
    setLoading(true);
    setLog("");

    const res = await mintCreatorNft({
      creatorId,
      name,
      image: imageUrl,
      description,
    });

    if (!res.ok) setLog(res.error || "Mint failed");
    else {
      setLog(JSON.stringify(res.data, null, 2));
      onMinted?.(res.data);
    }

    setLoading(false);
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-900/70 p-4">
      <h3 className="mb-3 text-lg font-semibold text-white">Mint New NFT</h3>
      <div className="grid gap-3">
        <input
          className="rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
          placeholder="NFT Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <textarea
          className="min-h-24 rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={handleMint}
          disabled={loading || !name || !imageUrl}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Minting..." : "Mint NFT"}
        </button>
      </div>
      {log && (
        <pre className="mt-3 overflow-auto rounded bg-black/50 p-3 text-xs text-emerald-200">
          {log}
        </pre>
      )}
    </div>
  );
}
