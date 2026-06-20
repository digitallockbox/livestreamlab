import RoleGate from "../../src/dashboard/shared/ui/RoleGate";
import { useEffect, useState, type ChangeEvent } from "react";
import {
  createStoreProduct,
  deleteStoreProduct,
  getCreatorEarnings,
  getCreatorStats,
  getStoreProducts,
  updateStoreProduct,
  uploadStoreProductImage,
} from "../../src/dashboard/api/engine/engine-bridge";

export default function MonetizationPage() {
  const [stats, setStats] = useState<unknown>(null);
  const [earnings, setEarnings] = useState<unknown>(null);
  const [products, setProducts] = useState<unknown>(null);
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Ready.");

  async function refreshData() {
    const [statsRes, earningsRes, productsRes] = await Promise.all([
      getCreatorStats(),
      getCreatorEarnings(),
      getStoreProducts(),
    ]);

    if (statsRes.ok) setStats(statsRes.data);
    if (earningsRes.ok) setEarnings(earningsRes.data);
    if (productsRes.ok) setProducts(productsRes.data);

    if (!statsRes.ok || !earningsRes.ok || !productsRes.ok) {
      setStatus(
        statsRes.error ||
          earningsRes.error ||
          productsRes.error ||
          "Unable to refresh monetization data"
      );
      return;
    }

    setStatus("Monetization data refreshed");
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function onCreate() {
    if (!productName.trim()) {
      setStatus("Product name is required");
      return;
    }

    const res = await createStoreProduct({
      name: productName.trim(),
      price: Number(price || 0),
    });
    if (!res.ok) {
      setStatus(res.error || "Unable to create product");
      return;
    }

    setProductName("");
    setPrice("");
    await refreshData();
  }

  async function onUpdate() {
    if (!productId.trim()) {
      setStatus("Product ID is required for update");
      return;
    }

    const res = await updateStoreProduct({
      id: productId.trim(),
      name: productName.trim() || undefined,
      price: price ? Number(price) : undefined,
    });
    if (!res.ok) {
      setStatus(res.error || "Unable to update product");
      return;
    }

    await refreshData();
  }

  async function onDelete() {
    if (!productId.trim()) {
      setStatus("Product ID is required for delete");
      return;
    }

    const res = await deleteStoreProduct(productId.trim());
    if (!res.ok) {
      setStatus(res.error || "Unable to delete product");
      return;
    }

    setProductId("");
    await refreshData();
  }

  async function onUploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const res = await uploadStoreProductImage(file);
    if (!res.ok) {
      setStatus(res.error || "Unable to upload image");
      return;
    }

    setStatus("Product image uploaded");
  }

  return (
    <RoleGate requiredRoles={["admin", "creator"]}>
      <main className="space-y-4 text-white">
        <h1 className="text-2xl font-bold">Monetization</h1>
        <div className="card">
          <div className="mb-3 flex flex-wrap gap-2">
            <button className="rounded bg-blue-600 px-4 py-2" onClick={refreshData}>
              Refresh Revenue and Store
            </button>
          </div>

          <h2 className="text-lg font-semibold">Creator Stats</h2>
          <pre className="mt-2 overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(stats, null, 2)}
          </pre>

          <h2 className="mt-4 text-lg font-semibold">Creator Earnings</h2>
          <pre className="mt-2 overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(earnings, null, 2)}
          </pre>

          <h2 className="mt-4 text-lg font-semibold">Store Product Management</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            <label>
              Product ID (for update/delete)
              <input
                className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              />
            </label>
            <label>
              Product Name
              <input
                className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
              />
            </label>
            <label>
              Price
              <input
                className="mt-1 w-full rounded border border-gray-700 bg-gray-950 px-3 py-2"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                type="number"
                min="0"
                step="0.01"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded bg-emerald-600 px-4 py-2" onClick={onCreate}>
              Create Product
            </button>
            <button className="rounded bg-amber-600 px-4 py-2" onClick={onUpdate}>
              Update Product
            </button>
            <button className="rounded bg-red-600 px-4 py-2" onClick={onDelete}>
              Delete Product
            </button>
            <label className="rounded bg-gray-700 px-4 py-2">
              Upload Image
              <input className="hidden" type="file" accept="image/*" onChange={onUploadImage} />
            </label>
          </div>

          <h2 className="mt-4 text-lg font-semibold">Store Products</h2>
          <pre className="mt-2 overflow-auto rounded bg-black/40 p-3 text-xs">
            {JSON.stringify(products, null, 2)}
          </pre>
          <p className="mt-2 text-sm text-gray-300">{status}</p>
        </div>
      </main>
    </RoleGate>
  );
}
