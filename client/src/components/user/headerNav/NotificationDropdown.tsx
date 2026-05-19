"use client";

import { useState } from "react";
import { Server, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BsBellFill } from "react-icons/bs";
// Shadcn Popover Imports
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

// --- Types ---
type NotificationCategory = "Today" | "This Week" | "Earlier";

interface NotificationItem {
  id: string;
  type: "maintenance" | "invoice" | "system";
  title: string;
  description: string;
  time: string;
  category: NotificationCategory;
}

// --- Dummy Data ---
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "maintenance",
    title: "Server Maintenance",
    description:
      "Scheduled maintenance on Dec 28, temporary downtime may occur.",
    time: "1h ago",
    category: "Today",
  },
  {
    id: "2",
    type: "invoice",
    title: "Invoice Generated",
    description:
      "Your December invoice is ready. You can download it from billing.",
    time: "3h ago",
    category: "Today",
  },
  {
    id: "3",
    type: "system",
    title: "System Maintenance",
    description:
      "Security updates will be applied at 2:00 AM. No action required.",
    time: "3h ago",
    category: "Today",
  },
];

const NotificationDropdown = () => {
  const [activeTab, setActiveTab] = useState<NotificationCategory>("Today");

  // Helper to render specific icons based on type
  const renderIcon = (type: NotificationItem["type"]) => {
    // Updated base class for dark mode icons
    const baseClass =
      "p-2.5 rounded-full bg-c-slate-800/50 border border-c-slate-700 shadow-sm";
    switch (type) {
      case "maintenance":
        return (
          <div className={baseClass}>
            <Server className="w-5 h-5 text-c-slate-200" />
          </div>
        );
      case "invoice":
        return (
          <div className={baseClass}>
            <FileText className="w-5 h-5 text-c-slate-200" />
          </div>
        );
      case "system":
        return (
          <div className={baseClass}>
            <Settings className="w-5 h-5 text-c-slate-200" />
          </div>
        );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative cursor-pointer p-2 rounded-[6px] border border-white/10 bg-white/5 hover:bg-white/20 hover:border-white/30 transition duration-200 outline-none">
          <BsBellFill className="w-6 h-6 text-white" />
          <span className="absolute top-3 right-3 block w-2 h-2 rounded-full bg-c-red-500 ring-2 ring-c-bg-750"></span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        // Applied your specific background #1B2028
        className="w-[343px] sm:w-[510px] lg:w-[529px] p-0 bg-c-bg-750 border border-c-slate-800 rounded-[12px] shadow-2xl z-50 overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-bold text-white">
            Notification Centre
          </h2>
          <Link href={"/user/notification"}>
            <Button
              variant="outline"
              // Adjusted button for dark mode
              className="h-8 rounded-lg text-xs font-bold text-c-slate-400 border-c-slate-700 bg-transparent hover:bg-c-slate-800 hover:text-white px-4"
            >
              See All
            </Button>
          </Link>
        </div>

        {/* Tabs Selector */}
        <div className="px-6 mb-4">
          {/* Background adjusted to be slightly lighter than base for depth */}
          <div className="flex bg-c-slate-900/50 p-1.5 rounded-[14px] border border-c-slate-800">
            {(["Today", "This Week", "Earlier"] as NotificationCategory[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all ${
                    activeTab === tab
                      ? "bg-c-slate-800 text-white shadow-sm"
                      : "text-c-slate-500 hover:text-c-slate-300"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {NOTIFICATIONS.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 px-6 py-5 group cursor-pointer hover:bg-c-slate-800/30 transition-colors ${
                index !== NOTIFICATIONS.length - 1
                  ? "border-b border-c-slate-800/50"
                  : ""
              }`}
            >
              <div className="relative">{renderIcon(item.type)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green" />
                    <h4 className="text-[15px] font-bold text-c-slate-100">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[13px] font-medium text-c-slate-500">
                    {item.time}
                  </span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-c-slate-400 font-medium line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {/* Repeating data for layout consistency */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`extra-${i}`}
              className="flex items-start gap-4 px-6 py-5 border-b border-c-slate-800/50 opacity-40 hover:bg-c-slate-800/30 transition-colors"
            >
              <div className="p-2.5 rounded-full bg-c-slate-800/50 border border-c-slate-700 shadow-sm">
                <Server className="w-5 h-5 text-c-slate-300" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green" />
                    <h4 className="text-[15px] font-bold text-c-slate-200">
                      Server Maintenance
                    </h4>
                  </div>
                  <span className="text-[13px] font-medium text-c-slate-600">
                    1h ago
                  </span>
                </div>
                <p className="text-[13.5px] text-c-slate-500 font-medium">
                  Scheduled maintenance on Dec 28, temporary downtime...
                </p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;