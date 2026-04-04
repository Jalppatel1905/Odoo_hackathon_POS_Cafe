"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { Floor, Table } from "@/types";

const generateId = () => Math.random().toString(36).substring(2, 10);

export default function FloorsPage() {
  const { floors, addFloor, updateFloor, deleteFloor } = useStore();
  const [mounted, setMounted] = useState(false);
  const [selectedTables, setSelectedTables] = useState<
    Record<string, Set<string>>
  >({});

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // --- Floor actions ---

  const handleAddFloor = () => {
    const newFloor: Floor = {
      id: generateId(),
      name: "New Floor",
      posTerminal: "SipSync",
      tables: [],
    };
    addFloor(newFloor);
    toast.success("Floor added");
  };

  const handleDeleteFloor = (id: string) => {
    deleteFloor(id);
    setSelectedTables((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast.success("Floor deleted");
  };

  const handleFloorNameChange = (id: string, name: string) => {
    updateFloor(id, { name });
  };

  const handlePosChange = (id: string, posTerminal: string) => {
    updateFloor(id, { posTerminal });
  };

  // --- Table actions ---

  const handleAddTable = (floor: Floor) => {
    const maxNumber =
      floor.tables.length > 0
        ? Math.max(...floor.tables.map((t) => t.number))
        : 0;
    const newTable: Table = {
      id: generateId(),
      number: maxNumber + 1,
      seats: 2,
      active: true,
      floorId: floor.id,
    };
    updateFloor(floor.id, { tables: [...floor.tables, newTable] });
    toast.success(`Table ${newTable.number} added`);
  };

  const handleTableChange = (
    floor: Floor,
    tableId: string,
    data: Partial<Table>
  ) => {
    updateFloor(floor.id, {
      tables: floor.tables.map((t) =>
        t.id === tableId ? { ...t, ...data } : t
      ),
    });
  };

  const toggleTableSelect = (floorId: string, tableId: string) => {
    setSelectedTables((prev) => {
      const set = new Set(prev[floorId] || []);
      if (set.has(tableId)) {
        set.delete(tableId);
      } else {
        set.add(tableId);
      }
      return { ...prev, [floorId]: set };
    });
  };

  const toggleSelectAll = (floor: Floor) => {
    setSelectedTables((prev) => {
      const current = prev[floor.id] || new Set();
      if (current.size === floor.tables.length && floor.tables.length > 0) {
        return { ...prev, [floor.id]: new Set() };
      }
      return {
        ...prev,
        [floor.id]: new Set(floor.tables.map((t) => t.id)),
      };
    });
  };

  const getSelected = (floorId: string): Set<string> =>
    selectedTables[floorId] || new Set();

  const handleDuplicateSelected = (floor: Floor) => {
    const sel = getSelected(floor.id);
    if (sel.size === 0) {
      toast.error("No tables selected");
      return;
    }
    const maxNumber =
      floor.tables.length > 0
        ? Math.max(...floor.tables.map((t) => t.number))
        : 0;
    let counter = maxNumber;
    const duplicated: Table[] = floor.tables
      .filter((t) => sel.has(t.id))
      .map((t) => {
        counter++;
        return { ...t, id: generateId(), number: counter };
      });
    updateFloor(floor.id, { tables: [...floor.tables, ...duplicated] });
    setSelectedTables((prev) => ({ ...prev, [floor.id]: new Set() }));
    toast.success(`${duplicated.length} table(s) duplicated`);
  };

  const handleDeleteSelected = (floor: Floor) => {
    const sel = getSelected(floor.id);
    if (sel.size === 0) {
      toast.error("No tables selected");
      return;
    }
    updateFloor(floor.id, {
      tables: floor.tables.filter((t) => !sel.has(t.id)),
    });
    setSelectedTables((prev) => ({ ...prev, [floor.id]: new Set() }));
    toast.success(`${sel.size} table(s) deleted`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/backend/settings"
            className="w-9 h-9 rounded-lg bg-cream-dark flex items-center justify-center hover:bg-cream-medium transition"
          >
            <ArrowLeft className="w-4 h-4 text-coffee" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-espresso">
              Floor Plan Management
            </h1>
            <p className="text-coffee-light text-sm mt-0.5">
              Manage floors and table layouts for SipSync
            </p>
          </div>
        </div>
        <button
          onClick={handleAddFloor}
          className="flex items-center gap-2 px-4 py-2.5 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
        >
          <Plus className="w-4 h-4" />
          New Floor
        </button>
      </div>

      {/* Floor Cards */}
      {floors.length === 0 && (
        <div className="bg-cream border border-cream-medium rounded-xl p-10 text-center">
          <LayoutGrid className="w-10 h-10 text-cream-medium mx-auto mb-3" />
          <p className="text-coffee-light text-sm">
            No floors yet. Click &quot;New Floor&quot; to get started.
          </p>
        </div>
      )}

      {floors.map((floor) => {
        const selected = getSelected(floor.id);
        const allSelected =
          floor.tables.length > 0 && selected.size === floor.tables.length;

        return (
          <div
            key={floor.id}
            className="bg-cream border border-cream-medium rounded-xl overflow-hidden"
          >
            {/* Floor Header */}
            <div className="p-5 border-b border-cream-medium">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Floor Name */}
                  <div>
                    <label className="block text-xs font-medium text-espresso mb-1">
                      Floor Name
                    </label>
                    <input
                      type="text"
                      value={floor.name}
                      onChange={(e) =>
                        handleFloorNameChange(floor.id, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-cream-medium rounded-lg text-sm bg-white focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                    />
                  </div>
                  {/* POS Terminal */}
                  <div>
                    <label className="block text-xs font-medium text-espresso mb-1">
                      Point of Sale
                    </label>
                    <div className="relative">
                      <select
                        value={floor.posTerminal}
                        onChange={(e) =>
                          handlePosChange(floor.id, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-cream-medium rounded-lg text-sm bg-white focus:ring-2 focus:ring-coffee focus:border-transparent outline-none appearance-none pr-8"
                      >
                        <option value="SipSync">SipSync</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-coffee-light absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFloor(floor.id)}
                  className="mt-5 w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition shrink-0"
                  title="Delete floor"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Table List */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-espresso">
                  Tables ({floor.tables.length})
                </h3>
                <div className="flex items-center gap-2">
                  {selected.size > 0 && (
                    <>
                      <button
                        onClick={() => handleDuplicateSelected(floor)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-cream-dark text-coffee rounded-lg hover:bg-cream-medium transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Duplicate ({selected.size})
                      </button>
                      <button
                        onClick={() => handleDeleteSelected(floor)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete ({selected.size})
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleAddTable(floor)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-coffee text-cream rounded-lg hover:bg-coffee-dark transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Table
                  </button>
                </div>
              </div>

              {floor.tables.length === 0 ? (
                <p className="text-xs text-coffee-light py-4 text-center">
                  No tables yet. Click &quot;Add Table&quot; to create one.
                </p>
              ) : (
                <div className="border border-cream-medium rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[40px_1fr_1fr_80px] bg-cream-dark px-4 py-2.5 text-xs font-semibold text-coffee uppercase tracking-wide">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleSelectAll(floor)}
                        className="w-4 h-4 rounded border-cream-medium text-coffee focus:ring-coffee accent-coffee cursor-pointer"
                      />
                    </div>
                    <div>Table No.</div>
                    <div>Seats</div>
                    <div className="text-center">Active</div>
                  </div>

                  {/* Table Rows */}
                  {floor.tables.map((table) => (
                    <div
                      key={table.id}
                      className={`grid grid-cols-[40px_1fr_1fr_80px] px-4 py-2.5 border-t border-cream-medium items-center text-sm ${
                        selected.has(table.id)
                          ? "bg-coffee/5"
                          : "bg-white hover:bg-cream-dark/40"
                      } transition`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selected.has(table.id)}
                          onChange={() =>
                            toggleTableSelect(floor.id, table.id)
                          }
                          className="w-4 h-4 rounded border-cream-medium text-coffee focus:ring-coffee accent-coffee cursor-pointer"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={table.number}
                          onChange={(e) =>
                            handleTableChange(floor, table.id, {
                              number: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-20 px-2 py-1 border border-cream-medium rounded text-sm bg-white focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={table.seats}
                          onChange={(e) =>
                            handleTableChange(floor, table.id, {
                              seats: parseInt(e.target.value) || 1,
                            })
                          }
                          min={1}
                          className="w-20 px-2 py-1 border border-cream-medium rounded text-sm bg-white focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={table.active}
                            onChange={(e) =>
                              handleTableChange(floor, table.id, {
                                active: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-cream-medium rounded-full peer peer-checked:bg-coffee transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 after:shadow-sm" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
