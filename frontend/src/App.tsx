import React from "react";
import {
  Bot,
  Map,
  DollarSign,
  Calendar,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "./store";
import PlanGenerator from "./components/PlanGenerator";
import PlanDisplay from "./components/PlanDisplay";
import CostEstimator from "./components/CostEstimator";
import ChatBot from "./components/ChatBot";
import { useEffect } from "react";
import TaskScheduler from "./components/TaskScheduler";
import AIReplanner from "./components/AIReplanner";
import ToastContainer from "./components/ToastContainer";
import SiteMap from "./components/SiteMap";

import { io } from "socket.io-client";

function App() {
  const { activeView, setActiveView, chatOpen, setChatOpen, plan, addToast } =
    useAppStore();

  useEffect(() => {
    const socket = io("http://127.0.0.1:8000");

    socket.on("notification", (data) => {
      addToast({
        type: data.type,
        title: data.title,
        message: data.message
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [addToast]);

  const navItems = [
    { key: "generator" as const, label: "Plan Generator", icon: Sparkles },
    { key: "sitemap" as const, label: "Site Map", icon: Map },
    { key: "costs" as const, label: "Cost Estimator", icon: DollarSign },
    { key: "scheduler" as const, label: "Task Scheduler", icon: Calendar },
    { key: "replanner" as const, label: "AI Replanner", icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#0D0D0D]/80">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-primary text-dark-900 flex items-center justify-center font-bold text-lg">
            B
          </div>
          <span className="text-xl font-bold tracking-tight">BuildWise</span>
        </div>

        {/* Feature Tabs */}
        <div className="hidden md:flex items-center space-x-1 bg-white/5 rounded-xl p-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${activeView === item.key
                ? "bg-primary text-dark-900 font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-sm font-medium hover:text-primary transition-colors">
            Log In
          </button>
          <button className="bg-primary text-dark-900 px-5 py-2 rounded-md text-sm font-semibold hover:brightness-110 transition-all">
            New Project
          </button>
        </div>
      </nav>

      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <ToastContainer />

      {/* Main Content */}
      <main className="flex-grow p-6 z-10">
        {activeView === "generator" && (
          <>
            <PlanGenerator />
            <PlanDisplay />
          </>
        )}
        {activeView === "sitemap" && <SiteMap />}
        {activeView === "costs" && <CostEstimator />}
        {activeView === "scheduler" && <TaskScheduler />}
        {activeView === "replanner" && <AIReplanner />}
      </main>

      {/* Chatbot Component */}
      <ChatBot />

      {/* Floating Chat Button */}
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setChatOpen(true)}
            className="bg-primary text-dark-900 w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            style={{ boxShadow: "0 0 20px rgba(242, 227, 29, 0.4)" }}
          >
            <Bot size={28} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
