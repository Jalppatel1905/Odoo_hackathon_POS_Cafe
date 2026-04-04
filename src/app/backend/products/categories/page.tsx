"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, GripVertical, Tag } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { ProductCategory } from "@/types";

const COLOR_PRESETS = [
  "#ffd43b",
  "#74c0fc",
  "#f783ac",
  "#69db7c",
  "#ff8787",
  "#b197fc",
];

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function CategoriesPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const colorPickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close color picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setColorPickerOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!mounted) return null;

  const sorted = [...categories].sort((a, b) => a.sequence - b.sequence);

  const handleAdd = () => {
    const seq = categories.length
      ? Math.max(...categories.map((c) => c.sequence)) + 1
      : 1;
    const newCat: ProductCategory = {
      id: genId(),
      name: "",
      color: COLOR_PRESETS[categories.length % COLOR_PRESETS.length],
      sequence: seq,
    };
    addCategory(newCat);
    setEditingId(newCat.id);
    setEditName("");
    toast.success("New category added — type a name");
  };

  const commitName = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }
    updateCategory(id, { name: trimmed });
    setEditingId(null);
    toast.success("Category saved");
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    toast.success("Category deleted");
  };

  const handleColorChange = (id: string, color: string) => {
    updateCategory(id, { color });
    setColorPickerOpen(null);
  };

  const startEdit = (cat: ProductCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  // Drag and drop reorder
  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...sorted];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);
    const updated = reordered.map((c, i) => ({ ...c, sequence: i + 1 }));
    reorderCategories(updated);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso">
            Product Categories
          </h1>
          <p className="text-coffee-light text-sm mt-0.5">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* List */}
      <div className="bg-cream border border-cream-medium rounded-xl overflow-hidden">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-coffee-light">
            <Tag className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              No categories yet. Click &ldquo;New&rdquo; to create one.
            </p>
          </div>
        ) : (
          <ul>
            {sorted.map((cat, idx) => (
              <li
                key={cat.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-3 px-4 py-3 ${
                  idx > 0 ? "border-t border-cream-medium" : ""
                } hover:bg-cream-dark/50 transition group`}
              >
                {/* Drag Handle */}
                <button className="cursor-grab active:cursor-grabbing text-coffee-light hover:text-espresso">
                  <GripVertical className="w-4 h-4" />
                </button>

                {/* Color Dot */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setColorPickerOpen(
                        colorPickerOpen === cat.id ? null : cat.id
                      )
                    }
                    className="w-5 h-5 rounded-full border-2 border-cream-medium hover:scale-110 transition-transform"
                    style={{ backgroundColor: cat.color }}
                    title="Change color"
                  />
                  {colorPickerOpen === cat.id && (
                    <div
                      ref={colorPickerRef}
                      className="absolute left-0 top-8 z-20 bg-cream border border-cream-medium rounded-lg shadow-lg p-2 flex gap-1.5"
                    >
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          onClick={() => handleColorChange(cat.id, c)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                            cat.color === c
                              ? "border-espresso scale-110"
                              : "border-cream-medium"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => commitName(cat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitName(cat.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      placeholder="Category name..."
                      className="w-full px-2 py-1 border border-cream-medium rounded text-sm bg-cream outline-none focus:ring-2 focus:ring-coffee"
                    />
                  ) : (
                    <span
                      className="text-sm font-medium text-espresso cursor-pointer hover:underline"
                      onClick={() => startEdit(cat)}
                    >
                      {cat.name || (
                        <span className="text-coffee-light italic">
                          Untitled
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-coffee-light hover:text-danger hover:bg-danger/10 rounded transition opacity-0 group-hover:opacity-100"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
