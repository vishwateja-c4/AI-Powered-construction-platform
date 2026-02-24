import React, { useState } from "react";
import { Sparkles, MapPin, Building2, DollarSign, Clock, Loader2 } from "lucide-react";
import { generatePlan } from "../utils/api";
import { useAppStore } from "../store";

export default function PlanGenerator() {
    const { setPlan, setIsGenerating, isGenerating, addToast, siteAddress } = useAppStore();
    const [description, setDescription] = useState("");
    const [projectType, setProjectType] = useState("residential");
    const [location, setLocation] = useState("");
    const [budget, setBudget] = useState("");
    const [timeline, setTimeline] = useState("");
    const [error, setError] = useState("");

    // Auto-fill location from Site Map
    React.useEffect(() => {
        if (siteAddress) setLocation(siteAddress);
    }, [siteAddress]);

    const handleGenerate = async () => {
        if (!description.trim()) {
            setError("Please describe your construction project.");
            return;
        }
        setError("");
        setIsGenerating(true);
        try {
            const res = await generatePlan({
                description,
                project_type: projectType,
                location: location || "General",
                budget: budget ? parseFloat(budget) : undefined,
                timeline: timeline || undefined,
            });
            setPlan(res.plan);
            addToast({
                type: 'success',
                title: 'Plan Generated',
                message: 'Your construction plan has been successfully finalized.'
            });
        } catch (error: any) {
            console.error("Failed to generate plan:", error);
            addToast({
                type: 'error',
                title: 'Generation Failed',
                message: 'Could not generate plan. Please try again.'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                    <Sparkles className="inline w-8 h-8 text-primary mr-2 -mt-1" />
                    AI Plan Generator
                </h2>
                <p className="text-gray-400">
                    Describe your construction project and our AI will generate a
                    comprehensive plan with phases, tasks, and timelines.
                </p>
            </div>

            {/* Prompt Input */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    placeholder="e.g. 2-story residential building with 4 bedrooms, modern design, 2500 sq ft, attached 2-car garage..."
                    className="w-full bg-dark-800 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none transition-colors"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                    {description.length}/2000
                </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Building2 className="w-4 h-4 mr-2 text-primary" /> Project Type
                    </label>
                    <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full bg-dark-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="mixed-use">Mixed Use</option>
                    </select>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-primary" /> Location
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Austin, TX"
                        className="w-full bg-dark-800 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                    />
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-primary" />
                        Budget (₹)
                    </label>
                    <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 300000"
                        className="w-full bg-dark-800 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                    />
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Clock className="w-4 h-4 mr-2 text-primary" /> Timeline
                    </label>
                    <input
                        type="text"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        placeholder="e.g. Complete by Dec 2026"
                        className="w-full bg-dark-800 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
                    {error}
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-primary text-dark-900 font-bold py-4 rounded-xl text-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Generating Plan...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" /> Generate Construction Plan
                    </>
                )}
            </button>
        </div>
    );
}
