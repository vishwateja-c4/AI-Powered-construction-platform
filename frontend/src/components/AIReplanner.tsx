import React, { useState } from "react";
import { RefreshCw, ArrowRight, Save, X, Bot, Zap, Clock, DollarSign, Activity } from "lucide-react";
import { useAppStore } from "../store";

export default function AIReplanner() {
    const { plan, setPlan, addChatMessage } = useAppStore();
    const [constraint, setConstraint] = useState("");
    const [isReplanning, setIsReplanning] = useState(false);
    const [proposedPlan, setProposedPlan] = useState<any>(null);

    if (!plan) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <RefreshCw className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-400 mb-2">AI Replanner</h2>
                <p className="text-gray-500">Generate a construction plan first to use the replanner.</p>
            </div>
        );
    }

    const handleReplan = () => {
        if (!constraint.trim()) return;

        setIsReplanning(true);

        // Simulate API call to Claude to replan based on constraint
        setTimeout(() => {
            // Create a mock modified plan logic
            const modifiedPlan = JSON.parse(JSON.stringify(plan));

            let durationDiff = 0;
            let costDiff = 0;

            // Mock modifications based on keywords
            const lowerConstraint = constraint.toLowerCase();
            if (lowerConstraint.includes("faster") || lowerConstraint.includes("rush")) {
                // Compress schedule, increase cost
                modifiedPlan.phases.forEach((p: any) => {
                    p.tasks.forEach((t: any) => {
                        if (t.duration_days > 2) {
                            const oldDuration = t.duration_days;
                            t.duration_days = Math.max(1, Math.floor(t.duration_days * 0.7));
                            durationDiff -= (oldDuration - t.duration_days);
                        }
                    });
                });
                costDiff = 1200000;
                modifiedPlan.replanner_note = "Compressed schedule by allocating parallel crews and expediting shipping. Increases labor and logistics costs.";
            } else if (lowerConstraint.includes("cheaper") || lowerConstraint.includes("budget")) {
                // Expand schedule, decrease cost
                modifiedPlan.phases.forEach((p: any) => {
                    p.tasks.forEach((t: any) => {
                        const oldDuration = t.duration_days;
                        t.duration_days = Math.floor(t.duration_days * 1.4);
                        durationDiff += (t.duration_days - oldDuration);
                    });
                });
                costDiff = -1600000;
                modifiedPlan.replanner_note = "Switched to standard shipping and reduced concurrent labor. Extended timeline to accommodate cheaper material sourcing.";
            } else {
                // Random modifications for specific requests
                modifiedPlan.replanner_note = `Adjusted plan sequences to accommodate: "${constraint}". Note: specific task dependencies have been rerouted.`;
                durationDiff = Math.floor(Math.random() * 10) - 5;
                costDiff = (Math.floor(Math.random() * 20) - 10) * 80000;
            }

            modifiedPlan.diff = {
                duration: durationDiff,
                cost: costDiff
            };

            setProposedPlan(modifiedPlan);
            setIsReplanning(false);

            // Add context to chat
            addChatMessage({
                role: "assistant",
                content: `I've generated a new plan proposal based on your constraint: "${constraint}". Review the changes in the AI Replanner tab.`
            });

        }, 2000);
    };

    const acceptPlan = () => {
        setPlan(proposedPlan);
        setProposedPlan(null);
        setConstraint("");
        addChatMessage({
            role: "assistant",
            content: "Excellent. I have updated your active project with the new replanned schedule."
        });
    };

    const rejectPlan = () => {
        setProposedPlan(null);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold">
                    <RefreshCw className="inline w-8 h-8 text-primary mr-2 -mt-1" />
                    AI Replanner
                </h2>
                <p className="text-gray-400 text-sm mt-1">Modify constraints and let AI instantly recalculate timelines and resources.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Input */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-dark-800 rounded-xl border border-white/10 p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Bot className="w-5 h-5 text-primary mr-2" />
                            New Constraint
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    What needs to change?
                                </label>
                                <textarea
                                    value={constraint}
                                    onChange={(e) => setConstraint(e.target.value)}
                                    placeholder="e.g. 'We need to finish 2 weeks faster' or 'Cut the budget by 10%'"
                                    className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none h-32"
                                    disabled={isReplanning || proposedPlan !== null}
                                />
                            </div>

                            {!proposedPlan && (
                                <button
                                    onClick={handleReplan}
                                    disabled={!constraint.trim() || isReplanning}
                                    className="w-full bg-primary text-dark-900 font-semibold py-3 rounded-lg flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50 disabled:hover:brightness-100"
                                >
                                    {isReplanning ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                            Analyzing Impacts...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5 mr-2" />
                                            Generate Alternative
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {!proposedPlan && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm">
                            <h4 className="font-semibold text-primary mb-2 flex items-center">
                                <Activity className="w-4 h-4 mr-2" />
                                How it works
                            </h4>
                            <p className="text-gray-400 leading-relaxed">
                                BuildWise AI analyzes your entire critical path. If you accelerate a task, it automatically recalculates dependent tasks, identifies new labor bottlenecks, and estimates the cost difference for rush delivery.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column - Diff / Comparison */}
                <div className="lg:col-span-2">
                    {proposedPlan ? (
                        <div className="bg-dark-800 rounded-xl border border-primary/30 p-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-yellow-500" />

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center text-white">
                                        Proposed Revision
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">{proposedPlan.replanner_note}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={rejectPlan}
                                        className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors flex items-center"
                                    >
                                        <X className="w-4 h-4 mr-1.5" />
                                        Discard
                                    </button>
                                    <button
                                        onClick={acceptPlan}
                                        className="px-4 py-2 bg-primary text-dark-900 font-semibold rounded-lg hover:brightness-110 transition-colors flex items-center shadow-[0_0_15px_rgba(242,227,29,0.3)]"
                                    >
                                        <Save className="w-4 h-4 mr-1.5" />
                                        Apply Changes
                                    </button>
                                </div>
                            </div>

                            {/* Impact Metrics */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-dark-900 border border-white/5 rounded-xl p-4 flex items-center shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${proposedPlan.diff.duration < 0 ? 'bg-green-500/10 text-green-400' : proposedPlan.diff.duration > 0 ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 font-medium">Timeline Impact</div>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold text-white">
                                                {proposedPlan.diff.duration > 0 ? '+' : ''}{proposedPlan.diff.duration} days
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-dark-900 border border-white/5 rounded-xl p-4 flex items-center shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${proposedPlan.diff.cost > 0 ? 'bg-red-500/10 text-red-400' : proposedPlan.diff.cost < 0 ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 font-medium">Cost Impact</div>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold text-white">
                                                {proposedPlan.diff.cost > 0 ? '+' : ''}₹{Math.abs(proposedPlan.diff.cost).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Before/After Phase Preview */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Phase Adjustments</h4>

                                {plan.phases.slice(0, 3).map((originalPhase: any, idx: number) => {
                                    const newPhase = proposedPlan.phases[idx];
                                    if (!newPhase) return null;

                                    const originalDuration = originalPhase.tasks.reduce((sum: number, t: any) => sum + t.duration_days, 0);
                                    const newDuration = newPhase.tasks.reduce((sum: number, t: any) => sum + t.duration_days, 0);

                                    if (originalDuration === newDuration) return null;

                                    return (
                                        <div key={idx} className="flex items-center gap-4 bg-dark-900/50 rounded-lg p-4 border border-white/5">
                                            <div className="w-1/3 truncate font-medium text-gray-300">
                                                {originalPhase.name}
                                            </div>

                                            <div className="flex items-center gap-3 flex-grow justify-center">
                                                <div className="px-3 py-1 bg-dark-800 rounded text-gray-400 text-sm">
                                                    {originalDuration}d
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-600" />
                                                <div className={`px-3 py-1 rounded text-sm font-medium ${newDuration < originalDuration ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                    {newDuration}d
                                                </div>
                                            </div>

                                            <div className="w-1/3 text-right text-xs text-gray-500">
                                                {Math.abs(newDuration - originalDuration)} days {newDuration < originalDuration ? 'saved' : 'added'}
                                            </div>
                                        </div>
                                    );
                                })}

                                {plan.phases.length > 3 && (
                                    <div className="text-center text-sm text-gray-500 pt-2 border-t border-white/5">
                                        And other minor downstream adjustments...
                                    </div>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="bg-dark-800/50 rounded-xl border border-white/5 p-12 h-full flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-dark-900 border border-white/10 flex items-center justify-center mb-6">
                                <RefreshCw className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400 mb-2">Awaiting Instructions</h3>
                            <p className="text-gray-500 max-w-sm">
                                Enter a constraint on the left to see how it affects your project timeline, costs, and critical path.
                            </p>
                        </div>
                    )
                    }
                </div >
            </div >
        </div >
    );
}
