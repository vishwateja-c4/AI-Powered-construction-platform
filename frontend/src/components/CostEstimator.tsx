import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { estimateCosts } from "../utils/api";
import { useAppStore } from "../store";

export default function CostEstimator() {
    const { plan, costs, setCosts, isEstimating, setIsEstimating, addToast } = useAppStore();
    const [quality, setQuality] = useState("standard");
    const [error, setError] = useState("");

    const handleEstimate = async () => {
        if (!plan) return;
        setError("");
        setIsEstimating(true);
        try {
            const res = await estimateCosts({ plan, quality });
            setCosts(res.costs);
        } catch (error: any) {
            console.error("Failed to estimate costs:", error);
            addToast({
                type: 'error',
                title: 'Estimation Failed',
                message: 'Could not estimate costs. Please try again later.'
            });
        } finally {
            setIsEstimating(false);
            addToast({
                type: 'success',
                title: 'Cost Estimation Complete',
                message: 'AI successfully broke down the construction costs.'
            });
        }
    };

    if (!plan) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No Plan Yet</h2>
                <p className="text-gray-500">Generate a construction plan first to get cost estimates.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold">
                        <DollarSign className="inline w-8 h-8 text-primary mr-2 -mt-1" />
                        Cost Estimator
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">AI-generated breakdown of materials, labor, and equipment in ₹</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        <option value="standard">Standard Quality</option>
                        <option value="premium">Premium Quality</option>
                        <option value="luxury">Luxury Quality</option>
                    </select>
                    <button
                        onClick={handleEstimate}
                        disabled={isEstimating}
                        className="bg-primary text-dark-900 font-semibold px-5 py-2 rounded-lg text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isEstimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                        {isEstimating ? "Estimating..." : "Estimate Costs"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">{error}</div>
            )}

            {costs && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
                            <p className="text-sm text-gray-400 mb-1">Total Estimated</p>
                            <div className="text-3xl font-bold text-white mt-1">
                                ₹{costs.total_estimated_cost.toLocaleString()}
                            </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                            <p className="text-sm text-gray-400 mb-1">Low Estimate</p>
                            <div className="text-2xl font-bold text-white mt-1">
                                ₹{costs.range_low.toLocaleString()}
                            </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                            <p className="text-sm text-gray-400 mb-1">High Estimate</p>
                            <p className="text-2xl font-bold text-red-400">
                                ₹{costs.range_high.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Cost Distribution Bar */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <h3 className="font-semibold mb-4">Cost Distribution</h3>
                        <div className="flex rounded-full overflow-hidden h-6 mb-4">
                            {[
                                { key: "materials", color: "bg-blue-500", label: "Materials" },
                                { key: "labor", color: "bg-green-500", label: "Labor" },
                                { key: "equipment", color: "bg-orange-500", label: "Equipment" },
                                { key: "permits", color: "bg-purple-500", label: "Permits" },
                                { key: "overhead", color: "bg-gray-500", label: "Overhead" },
                            ].map(({ key, color }) => {
                                const val = (costs.breakdown as any)[key]?.total || 0;
                                const pct = (val / costs.total_estimated_cost) * 100;
                                return pct > 0 ? (
                                    <div
                                        key={key}
                                        className={`${color} relative group`}
                                        style={{ width: `${pct}%` }}
                                        title={`${key}: ${pct.toFixed(1)}%`}
                                    />
                                ) : null;
                            })}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs">
                            {[
                                { key: "materials", color: "bg-blue-500", label: "Materials" },
                                { key: "labor", color: "bg-green-500", label: "Labor" },
                                { key: "equipment", color: "bg-orange-500", label: "Equipment" },
                                { key: "permits", color: "bg-purple-500", label: "Permits" },
                                { key: "overhead", color: "bg-gray-500", label: "Overhead" },
                            ].map(({ key, color, label }) => {
                                const val = (costs.breakdown as any)[key]?.total || 0;
                                return (
                                    <span key={key} className="flex items-center gap-1.5">
                                        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                        {label}: ₹{val.toLocaleString()}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Itemized Sections */}
                    {["materials", "labor", "equipment", "permits"].map((section) => {
                        const data = (costs.breakdown as any)[section];
                        if (!data || !data.items || data.items.length === 0) return null;
                        return (
                            <div key={section} className="rounded-xl border border-white/10 bg-white/5 p-6">
                                <h3 className="font-semibold mb-3 capitalize">
                                    {section} — ₹{data.total.toLocaleString()}
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-400 border-b border-white/10">
                                                <th className="pb-2">Item</th>
                                                <th className="pb-2 text-right">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {data.items.map((item: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="py-2">
                                                        {item.name || item.role}
                                                        {item.quantity && (
                                                            <span className="text-gray-500 ml-2 text-xs">({item.quantity})</span>
                                                        )}
                                                        {item.duration && (
                                                            <span className="text-gray-500 ml-2 text-xs">({item.duration})</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-right font-medium">
                                                        ₹{(item.cost || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                    {/* Extra Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                            <p className="text-xs text-gray-400">Cost per Sq Ft</p>
                            <p className="text-xl font-bold">₹{costs.cost_per_sqft}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                            <p className="text-xs text-gray-400">Contingency</p>
                            <p className="text-xl font-bold">{costs.contingency_percentage}%</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
