"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [newZone, setNewZone] = useState({
    zone: "",
    name: "",
    keywords: "",
    rate: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Fetch zones
  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/delivery/admin/zones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setZones(data.data);
      else toast.error("Failed to fetch zones");
    } catch (err) {
      toast.error("Error fetching zones");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // Create new zone
  const handleAddZone = async () => {
    if (!newZone.zone || !newZone.name || !newZone.rate) {
      toast.error("Please fill all required fields");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/delivery/admin/zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newZone,
          keywords: newZone.keywords.split(",").map((k) => k.trim()),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Zone created successfully");
        setNewZone({ zone: "", name: "", keywords: "", rate: "" });
        fetchZones();
      } else toast.error(data.message || "Failed to create zone");
    } catch (err) {
      toast.error("Error creating zone");
    }
    setAdding(false);
  };

  // ✅ Update zone (save changes)
  const handleUpdateZone = async (id) => {
    const updates = editedFields[id];
    if (!updates || Object.keys(updates).length === 0) return;

    try {
      const res = await fetch(`${API_URL}/api/delivery/admin/zones/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Zone updated successfully");
        setEditedFields((prev) => ({ ...prev, [id]: {} }));
        setEditingZone(null);
        fetchZones();
      } else toast.error(data.message || "Failed to update zone");
    } catch (err) {
      toast.error("Error updating zone");
    }
  };

  // Track field edits
  const handleFieldChange = (id, field, value) => {
    setEditedFields((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Delete zone
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    try {
      const res = await fetch(`${API_URL}/api/delivery/admin/zones/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Zone deleted");
        setZones((prev) => prev.filter((z) => z._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete zone");
    }
  };

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 pt-[5rem] px-6 md:px-12">
        <h1 className="text-4xl font-bold text-center mb-10 mt-[4rem] text-gray-800 font-heading">
          Delivery Rate Management
        </h1>

        {/* Add Zone Form */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-10"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <FaPlus className="text-indigo-600" /> Add New Zone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="Zone Number"
              value={newZone.zone}
              onChange={(e) => setNewZone({ ...newZone, zone: e.target.value })}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Zone Name"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Keywords (comma separated)"
              value={newZone.keywords}
              onChange={(e) => setNewZone({ ...newZone, keywords: e.target.value })}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Rate (₹)"
              value={newZone.rate}
              onChange={(e) => setNewZone({ ...newZone, rate: e.target.value })}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleAddZone}
            disabled={adding}
            className="mt-5 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-xl disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add Zone"}
          </button>
        </motion.div>

        {/* Zones Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <table className="w-full border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-4 text-left">Zone</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Keywords</th>
                <th className="p-4 text-left">Rate (₹)</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      Loading zones...
                    </td>
                  </tr>
                ) : zones.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400">
                      No zones found
                    </td>
                  </tr>
                ) : (
                  zones.map((zone) => {
                    const edits = editedFields[zone._id] || {};
                    const isEdited = Object.keys(edits).length > 0;

                    return (
                      <motion.tr
                        key={zone._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-4 font-semibold text-gray-800">{zone.zone}</td>

                        {/* Editable Name */}
                        <td className="p-4">
                          <input
                            type="text"
                            defaultValue={zone.name}
                            onChange={(e) =>
                              handleFieldChange(zone._id, "name", e.target.value)
                            }
                            className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Editable Keywords */}
                        <td className="p-4">
                          <input
                            type="text"
                            defaultValue={zone.keywords.join(", ")}
                            onChange={(e) =>
                              handleFieldChange(
                                zone._id,
                                "keywords",
                                e.target.value.split(",").map((k) => k.trim())
                              )
                            }
                            className="p-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Editable Rate */}
                        <td className="p-4">
                          <input
                            type="number"
                            defaultValue={zone.rate}
                            onChange={(e) =>
                              handleFieldChange(zone._id, "rate", e.target.value)
                            }
                            className="p-2 border rounded-lg w-24 text-center focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center flex items-center justify-center gap-3">
                          {isEdited && (
                            <button
                              onClick={() => handleUpdateZone(zone._id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                              title="Save Changes"
                            >
                              <FaSave />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(zone._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Delete Zone"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      </div>
    </>
  );
}
