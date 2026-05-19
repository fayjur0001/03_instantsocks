"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; 
import { Server, FileText, Settings } from "lucide-react";

// Define the notification item type
interface Notification {
  type: "server" | "invoice" | "system";
  title: string;
  description: string;
  time: string;
  isLink: boolean;
}

const notifications: Notification[] = [
  {
    type: "server",
    title: "Server Maintenance",
    description: "Scheduled maintenance on Dec 28, temporary downtime may occur.",
    time: "1h ago",
    isLink: true,
  },
  {
    type: "invoice",
    title: "Invoice Generated",
    description: "Your December invoice is ready. You can download it from billing.",
    time: "3h ago",
    isLink: true,
  },
  {
    type: "system",
    title: "System Maintenance",
    description: "Security updates will be applied at 2:00 AM. No action required.",
    time: "3h ago",
    isLink: false,
  },
  {
    type: "server",
    title: "Server Maintenance",
    description: "Scheduled maintenance on Dec 28, temporary downtime may occur.",
    time: "1h ago",
    isLink: false,
  },
  {
    type: "invoice",
    title: "Invoice Generated",
    description: "Your December invoice is ready. You can download it from billing.",
    time: "3h ago",
    isLink: false,
  },
  {
    type: "server",
    title: "Server Maintenance",
    description: "Scheduled maintenance on Dec 28, temporary downtime may occur.",
    time: "1h ago",
    isLink: false,
  },
  {
    type: "system",
    title: "System Maintenance",
    description: "Security updates will be applied at 2:00 AM. No action required.",
    time: "3h ago",
    isLink: false,
  },
  {
    type: "server",
    title: "Server Maintenance",
    description: "Scheduled maintenance on Dec 28, temporary downtime may occur.",
    time: "1h ago",
    isLink: false,
  },
  {
    type: "system",
    title: "System Maintenance",
    description: "Security updates will be applied at 2:00 AM. No action required.",
    time: "3h ago",
    isLink: false,
  },
  {
    type: "invoice",
    title: "Invoice Generated",
    description: "Your December invoice is ready. You can download it from billing.",
    time: "3h ago",
    isLink: false,
  },
  {
    type: "server",
    title: "Server Maintenance",
    description: "Scheduled maintenance on Dec 28, temporary downtime may occur.",
    time: "1h ago",
    isLink: false,
  },
];

const NotificationItem = ({ item }: { item: Notification }) => {
  const getIcon = () => {
    switch (item.type) {
      case "server":
        return <Server className="h-5 w-5 text-c-slate-300" />;
      case "invoice":
        return <FileText className="h-5 w-5 text-c-slate-300" />;
      case "system":
        return <Settings className="h-5 w-5 text-c-slate-300" />;
      default:
        return <Server className="h-5 w-5 text-c-slate-300" />;
    }
  };

  return (
    <div className="flex items-start gap-4 py-4 border-b border-c-slate-800/50 last:border-0 hover:bg-c-slate-800/30 transition-colors">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-c-slate-800/50 border border-c-slate-700 shadow-sm mt-1">
        {getIcon()}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          {item.isLink && (
            <span className="h-1.5 w-1.5 rounded-full bg-c-green-tw-500 block" />
          )}
          <h4 className={`text-sm font-semibold ${item.isLink ? "text-white" : "text-c-slate-200"}`}>
            {item.title}
          </h4>
        </div>
        <p className="text-sm text-c-slate-400 leading-relaxed">
          {item.description}
        </p>
      </div>
      <div className="shrink-0">
        <span className="text-xs text-c-slate-500 font-medium whitespace-nowrap">
          {item.time}
        </span>
      </div>
    </div>
  );
};

export default function NotificationCentre() {
  return (
    <div className="bg-black p-4 rounded-2xl">
      <div className="mx-auto">
        <h5 className="text-xl font-semibold text-white mb-6">
          Notification Centre
        </h5>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="all" className="w-full">
              {/* Updated TabsList to use the Pill Selector styles */}
              <div className="max-w-fit mb-2">
                <TabsList className="flex flex-wrap gap-4 bg-c-slate-900/50 p-1.5 rounded-[14px] border border-c-slate-800 h-auto w-full justify-between">
                  <TabsTrigger
                    value="all"
                    className="flex-1 bg-transparent py-2 text-sm font-semibold rounded-[10px] transition-all text-c-slate-500 data-[state=active]:bg-c-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-transparent hover:text-c-slate-300 hover:bg-transparent"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="today"
                    className="flex-1 bg-transparent py-2 text-sm font-semibold rounded-[10px] transition-all text-c-slate-500 data-[state=active]:bg-c-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-transparent hover:text-c-slate-300 hover:bg-transparent"
                  >
                    Today
                  </TabsTrigger>
                  <TabsTrigger
                    value="thisWeek"
                    className="flex-1 bg-transparent py-2 text-sm font-semibold rounded-[10px] transition-all text-c-slate-500 data-[state=active]:bg-c-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-transparent hover:text-c-slate-300 hover:bg-transparent"
                  >
                    This Week
                  </TabsTrigger>
                  <TabsTrigger
                    value="earlier"
                    className="flex-1 bg-transparent py-2 text-sm font-semibold rounded-[10px] transition-all text-c-slate-500 data-[state=active]:bg-c-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-transparent hover:text-c-slate-300 hover:bg-transparent"
                  >
                    Earlier
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="flex flex-col max-h-[73vh] min-h-[50vh] overflow-y-auto custom-scrollbar pr-3">
                  {notifications.map((notification, index) => (
                    <NotificationItem key={index} item={notification} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="today">
                <div className="py-8 text-center text-c-slate-500">No notifications for today.</div>
              </TabsContent>
              <TabsContent value="thisWeek">
                <div className="py-8 text-center text-c-slate-500">No notifications for this week.</div>
              </TabsContent>
              <TabsContent value="earlier">
                <div className="py-8 text-center text-c-slate-500">No earlier notifications.</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}