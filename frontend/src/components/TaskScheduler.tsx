import React, { useState, useMemo, memo } from "react";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { useAppStore } from "../store";

const GanttRow = memo(({ task, viewStartDay, DAYS_PER_VIEW, DAY_WIDTH }: any) => {
    const startX = Math.max(0, (task.startDay - viewStartDay) * DAY_WIDTH);
    const endX = Math.min(DAYS_PER_VIEW * DAY_WIDTH, (task.endDay - viewStartDay) * DAY_WIDTH);
    const width = Math.max(0, endX - startX);
    const isVisible = width > 0;

    return (
        <div className="flex hover:bg-white/[0.02] transition-colors group">
            {/* Task Info Column */}
            <div className="w-1/3 min-w-[300px] max-w-[400px] border-r border-white/10 p-3 flex items-center gap-3 shrink-0 z-10 bg-dark-800 group-hover:bg-dark-700 transition-colors">
                {task.isPhase ? (
                    <div className="font-bold text-white text-sm w-full truncate">{task.title}</div>
                ) : (
                    <>
                        <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 ml-4">
                            {task.status === "delayed" ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            ) : task.progress === 100 ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                                <Play className="w-3 h-3 text-primary" />
                            )}
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="text-sm text-gray-300 truncate font-medium">
                                {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-1.5 flex-grow bg-dark-900 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${task.status === "delayed" ? "bg-red-500" : "bg-primary"}`}
                                        style={{ width: `${task.progress}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-500 w-6 shrink-0">{task.progress}%</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Task Bar Column */}
            <div className="flex-grow relative h-[60px] bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')] bg-repeat" style={{ backgroundSize: `${DAY_WIDTH}px 100%` }}>
                {isVisible && (
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-md shadow-lg flex items-center px-2 overflow-hidden ${task.isPhase
                            ? "bg-white/20 border border-white/30 text-white font-semibold text-xs"
                            : task.is_critical_path
                                ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-200"
                                : "bg-primary/20 border border-primary/40 text-primary-light"
                            }`}
                        style={{
                            left: `${startX}px`,
                            width: `${width}px`,
                            boxShadow: task.isPhase ? 'none' : '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                    >
                        {!task.isPhase && (
                            <div
                                className={`absolute left-0 top-0 bottom-0 opacity-20 ${task.status === "delayed" ? "bg-red-400" : "bg-primary"}`}
                                style={{ width: `${task.progress}%` }}
                            />
                        )}
                        {width > 60 && (
                            <span className="text-[10px] truncate relative z-10 whitespace-nowrap">
                                {task.duration}d
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

export default function TaskScheduler() {
    const { plan } = useAppStore();
    const [currentMonth, setCurrentMonth] = useState(0);

    // Flatten tasks and calculate start/end days
    const scheduledTasks = useMemo(() => {
        if (!plan) return [];

        let currentDay = 0;
        const tasks: any[] = [];

        plan.phases.forEach((phase, pIdx) => {
            const phaseStartDay = currentDay;
            let phaseEndDay = currentDay;

            const phaseTasks = phase.tasks.map((task, tIdx) => {
                // Simplified sequential scheduling for the mock
                const startDay = currentDay;
                const endDay = currentDay + task.duration_days;
                currentDay = endDay;
                phaseEndDay = Math.max(phaseEndDay, endDay);

                return {
                    ...task,
                    id: `t-${pIdx}-${tIdx}`,
                    phaseName: phase.name,
                    startDay,
                    endDay,
                    duration: task.duration_days,
                    progress: Math.floor(Math.random() * 100), // Mock progress
                    status: Math.random() > 0.8 ? "delayed" : "on-track",
                };
            });

            tasks.push({
                isPhase: true,
                id: `p-${pIdx}`,
                title: phase.name,
                startDay: phaseStartDay,
                endDay: phaseEndDay,
                duration: phaseEndDay - phaseStartDay,
                progress: Math.floor(Math.random() * 100),
            });

            tasks.push(...phaseTasks);
        });

        return tasks;
    }, [plan]);

    if (!plan) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No Plan Yet</h2>
                <p className="text-gray-500">Generate a construction plan first to see the schedule.</p>
            </div>
        );
    }

    // Gantt chart configurations
    const DAYS_PER_VIEW = 30; // 1 month view
    const DAY_WIDTH = 24; // pixels per day
    const TOTAL_DAYS = scheduledTasks.length > 0 ? Math.max(...scheduledTasks.map(t => t.endDay)) : 0;
    const TOTAL_MONTHS = Math.ceil(TOTAL_DAYS / DAYS_PER_VIEW);

    const viewStartDay = currentMonth * DAYS_PER_VIEW;
    const viewEndDay = viewStartDay + DAYS_PER_VIEW;

    // Filter tasks visible in current month
    const visibleTasks = scheduledTasks.filter(
        (t) => t.startDay < viewEndDay && t.endDay > viewStartDay
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold">
                        <Calendar className="inline w-8 h-8 text-primary mr-2 -mt-1" />
                        Task Scheduler
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Interactive Gantt chart and progress tracking</p>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg p-1">
                    <button
                        onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))}
                        disabled={currentMonth === 0}
                        className="p-2 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold px-4 min-w-[120px] text-center">
                        Month {currentMonth + 1} of {TOTAL_MONTHS}
                    </span>
                    <button
                        onClick={() => setCurrentMonth(Math.min(TOTAL_MONTHS - 1, currentMonth + 1))}
                        disabled={currentMonth >= TOTAL_MONTHS - 1}
                        className="p-2 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-dark-800 overflow-hidden shadow-2xl">
                {/* Timeline Header */}
                <div className="flex border-b border-white/10 bg-dark-900 overflow-hidden">
                    <div className="w-1/3 min-w-[300px] max-w-[400px] border-r border-white/10 p-4 font-semibold text-gray-300 z-10 bg-dark-900 shrink-0">
                        Task Name
                    </div>
                    <div className="flex-grow flex relative overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')] bg-repeat" style={{ backgroundSize: `${DAY_WIDTH}px 100%` }}>
                        {/* Day Headers */}
                        {Array.from({ length: DAYS_PER_VIEW }).map((_, i) => {
                            const dayNum = viewStartDay + i + 1;
                            return (
                                <div
                                    key={i}
                                    className="shrink-0 flex flex-col items-center justify-center border-r border-white/5 py-2 text-xs"
                                    style={{ width: `${DAY_WIDTH}px` }}
                                >
                                    <span className="text-gray-500 font-mono">{dayNum}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Gantt Rows */}
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto overflow-x-hidden">
                    {visibleTasks.map((task) => (
                        <GanttRow
                            key={task.id}
                            task={task}
                            viewStartDay={viewStartDay}
                            DAYS_PER_VIEW={DAYS_PER_VIEW}
                            DAY_WIDTH={DAY_WIDTH}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary/20 border border-primary/40 rounded shadow"></div>
                    <span>Standard Task</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50 rounded shadow"></div>
                    <span>Critical Path</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Delayed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/20 border border-white/30 rounded"></div>
                    <span>Phase</span>
                </div>
            </div>
        </div>
    );
}
