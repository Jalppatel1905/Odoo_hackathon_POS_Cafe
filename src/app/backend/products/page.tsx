"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Archive,
  X,
  Package,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Product, ProductVariant } from "@/types";

const TAX_OPTIONS = [0, 5, 18, 28];
const UNIT_OPTIONS = ["Unit", "KG", "Liter"];

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  category: "",
  price: 0,
  unit: "Unit",
  tax: 5,
  description: "",
  variants: [],
  image: "",
};

export default function ProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProducts } =
    useStore();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"general" | "variants">("general");
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categoryMap = useMemo(() => {
    const m: Record<string, { name: string; color: string }> = {};
    categories.forEach((c) => {
      m[c.id] = { name: c.name, color: c.color };
    });
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (categoryMap[p.category]?.name || "").toLowerCase().includes(q)
    );
  }, [products, search, categoryMap]);

  if (!mounted) return null;

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyProduct, category: categories[0]?.id || "" });
    setVariants([]);
    setTab("general");
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      unit: p.unit,
      tax: p.tax,
      description: p.description,
      variants: p.variants,
      image: p.image,
    });
    setVariants([...p.variants]);
    setTab("general");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (form.price < 0) {
      toast.error("Price must be positive");
      return;
    }
    const data = { ...form, variants };
    if (editingId) {
      updateProduct(editingId, data);
      toast.success("Product updated");
    } else {
      addProduct({ id: genId(), ...data });
      toast.success("Product created");
    }
    setModalOpen(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((p) => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (!selected.length) return;
    deleteProducts(selected);
    setSelected([]);
    toast.success(`Deleted ${selected.length} product(s)`);
  };

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { id: genId(), attribute: "", value: "", unit: "Unit", extraPrice: 0 },
    ]);
  };

  const updateVariant = (
    idx: number,
    field: keyof ProductVariant,
    val: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: val } : v))
    );
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Products</h1>
          <p className="text-coffee-light text-sm mt-0.5">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-light" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
          />
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-coffee-light">
              {selected.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-2 bg-danger/10 text-danger rounded-lg text-sm hover:bg-danger/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              onClick={() => {
                setSelected([]);
                toast.success("Archived (simulated)");
              }}
              className="flex items-center gap-1 px-3 py-2 bg-warning/10 text-warning rounded-lg text-sm hover:bg-warning/20 transition"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-cream border border-cream-medium rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-dark text-left text-espresso">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 && selected.length === filtered.length
                  }
                  onChange={toggleAll}
                  className="accent-coffee rounded"
                />
              </th>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Sale Price</th>
              <th className="px-4 py-3 font-semibold">Tax %</th>
              <th className="px-4 py-3 font-semibold">UOM</th>
              <th className="px-4 py-3 font-semibold">Category</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-coffee-light">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No products found</p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const cat = categoryMap[p.category];
                return (
                  <tr
                    key={p.id}
                    className="border-t border-cream-medium hover:bg-cream-dark/50 transition cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="accent-coffee rounded"
                      />
                    </td>
                    <td
                      className="px-4 py-3 font-medium text-espresso"
                      onClick={() => openEdit(p)}
                    >
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-coffee-light">
                      {p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-coffee-light">{p.tax}%</td>
                    <td className="px-4 py-3 text-coffee-light">{p.unit}</td>
                    <td className="px-4 py-3">
                      {cat ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: cat.color + "22",
                            color: cat.color,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      ) : (
                        <span className="text-coffee-light text-xs">
                          Uncategorized
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream-medium">
              <h2 className="text-lg font-semibold text-espresso">
                {editingId ? "Edit Product" : "New Product"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded hover:bg-cream-dark transition"
              >
                <X className="w-5 h-5 text-coffee-light" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-cream-medium px-5">
              <button
                onClick={() => setTab("general")}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
                  tab === "general"
                    ? "border-coffee text-coffee"
                    : "border-transparent text-coffee-light hover:text-espresso"
                }`}
              >
                General Info
              </button>
              <button
                onClick={() => setTab("variants")}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
                  tab === "variants"
                    ? "border-coffee text-coffee"
                    : "border-transparent text-coffee-light hover:text-espresso"
                }`}
              >
                Variants
                {variants.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-coffee/10 text-coffee rounded-full">
                    {variants.length}
                  </span>
                )}
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {tab === "general" ? (
                <>
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-espresso mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Cappuccino"
                      className="w-full px-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-espresso mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                    >
                      <option value="">-- Select --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price + Unit row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-espresso mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={form.price}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            price: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-espresso mb-1">
                        Unit of Measure
                      </label>
                      <select
                        value={form.unit}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, unit: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tax */}
                  <div>
                    <label className="block text-xs font-medium text-espresso mb-1">
                      Tax
                    </label>
                    <select
                      value={form.tax}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          tax: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                    >
                      {TAX_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}%
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-espresso mb-1">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Short description..."
                      className="w-full px-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none resize-none"
                    />
                  </div>
                </>
              ) : (
                /* Variants Tab */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-coffee-light">
                      Add product variants like size, flavor, etc.
                    </p>
                    <button
                      onClick={addVariantRow}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-coffee border border-coffee rounded-lg hover:bg-coffee hover:text-cream transition"
                    >
                      <Plus className="w-3 h-3" />
                      New
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <div className="text-center py-8 text-coffee-light text-sm">
                      No variants yet. Click &ldquo;New&rdquo; to add one.
                    </div>
                  ) : (
                    <div className="border border-cream-medium rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-cream-dark text-espresso">
                            <th className="px-3 py-2 text-left font-semibold">
                              Attribute
                            </th>
                            <th className="px-3 py-2 text-left font-semibold">
                              Value
                            </th>
                            <th className="px-3 py-2 text-left font-semibold">
                              Unit
                            </th>
                            <th className="px-3 py-2 text-left font-semibold">
                              Extra Price
                            </th>
                            <th className="px-3 py-2 w-8" />
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, idx) => (
                            <tr
                              key={v.id}
                              className="border-t border-cream-medium"
                            >
                              <td className="px-2 py-1.5">
                                <input
                                  type="text"
                                  value={v.attribute}
                                  onChange={(e) =>
                                    updateVariant(
                                      idx,
                                      "attribute",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Size"
                                  className="w-full px-2 py-1 border border-cream-medium rounded text-xs bg-cream outline-none focus:ring-1 focus:ring-coffee"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="text"
                                  value={v.value}
                                  onChange={(e) =>
                                    updateVariant(idx, "value", e.target.value)
                                  }
                                  placeholder="e.g. Large"
                                  className="w-full px-2 py-1 border border-cream-medium rounded text-xs bg-cream outline-none focus:ring-1 focus:ring-coffee"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <select
                                  value={v.unit}
                                  onChange={(e) =>
                                    updateVariant(idx, "unit", e.target.value)
                                  }
                                  className="w-full px-2 py-1 border border-cream-medium rounded text-xs bg-cream outline-none focus:ring-1 focus:ring-coffee"
                                >
                                  {UNIT_OPTIONS.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={v.extraPrice}
                                  onChange={(e) =>
                                    updateVariant(
                                      idx,
                                      "extraPrice",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-full px-2 py-1 border border-cream-medium rounded text-xs bg-cream outline-none focus:ring-1 focus:ring-coffee"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <button
                                  onClick={() => removeVariant(idx)}
                                  className="p-1 text-danger hover:bg-danger/10 rounded transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-cream-medium">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-coffee-light hover:text-espresso transition"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
              >
                {editingId ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
