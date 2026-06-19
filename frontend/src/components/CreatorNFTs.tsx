import { useCallback, useEffect, useState } from "react";
import type { CreatorNft } from "../dashboard/api/engine/engine-bridge";
import { getCreatorNfts } from "../dashboard/api/engine/engine-bridge";
import NFTMintForm from "./NFTMintForm";

type CreatorNFTsProps = {
  creatorId?: string;
};

function normalizeNfts(payload: unknown): CreatorNft[] {
  if (Array.isArray(payload)) {
    return payload as CreatorNft[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { nfts?: unknown[] }).nfts)
  ) {
    return (payload as { nfts: CreatorNft[] }).nfts;
  }

  return [];
}

export default function CreatorNFTs({ creatorId = "current" }: CreatorNFTsProps) {
  const [nfts, setNfts] = useState<CreatorNft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNfts = useCallback(() => {
    setLoading(true);
    setError(null);

    getCreatorNfts(creatorId).then((res) => {
      if (res.ok) {
        setNfts(normalizeNfts(res.data));
      } else {
        setError(res.error || "Unable to load NFTs");
      }
      setLoading(false);
    });
  }, [creatorId]);

  useEffect(() => {
    loadNfts();
  }, [loadNfts]);

  return (
    <section className="space-y-4 rounded border border-gray-700 bg-gray-900/60 p-4">
      <h2 className="text-xl font-semibold text-white">Creator NFTs</h2>
      <NFTMintForm creatorId={creatorId} onMinted={loadNfts} />

      {loading && <p className="text-sm text-gray-300">Loading NFTs...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nfts.map((nft, index) => (
            <article
              key={`${nft.id || nft.image || nft.name || "nft"}-${index}`}
              className="rounded border border-gray-700 bg-black/30 p-3 text-white"
            >
              {nft.image && (
                <img
                  src={nft.image}
                  alt={nft.name || "NFT image"}
                  className="mb-2 h-40 w-full rounded object-cover"
                />
              )}
              <h4 className="font-semibold">{nft.name || "Untitled NFT"}</h4>
              {nft.description && <p className="mt-1 text-sm text-gray-300">{nft.description}</p>}
            </article>
          ))}

          {!nfts.length && <p className="text-sm text-gray-300">No NFTs minted yet.</p>}
        </div>
      )}
    </section>
  );
}
