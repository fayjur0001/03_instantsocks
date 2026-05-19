"use client";

import { useState, useMemo } from "react";
import { Info, Calendar as CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Interfaces ---
export interface ChartDataPoint {
  date: string;
  turnover: number;
  deposit: number;
  value: number;
  name?: string;
  deviceName?: string;
  duration?: string;
  serviceName?: string;
  period?: string;
  proxyLocation?: string;
}

export interface CoinDataPoint {
  name: string;
  fullName: string;
  percentage: number;
  amount: number;
  color: string;
  tag?: string;
}

export interface SummaryBoxData {
  label: string;
  value: string | number;
  subValue?: string;
  highlight?: boolean;
}

export type TabContext =
  | "transactions"
  | "remote-devices"
  | "numbers"
  | "proxy";

export type SummaryPeriod = "today" | "3days" | "weekly" | "monthly";

// --- Summary box data per period per tab ---
const SUMMARY_DATA: Record<TabContext, Record<SummaryPeriod, SummaryBoxData[]>> = {
  transactions: {
    today: [
      { label: "Transaction Amount", value: "$1,240", highlight: true },
      { label: "Top User", value: "Alice J.", highlight: true },
      { label: "Failed Transactions", value: "3", highlight: true },
      { label: "Pending Transactions", value: "8" },
      { label: "Completed Transactions", value: "54" },
      { label: "Avg Txn Value", value: "$22.96" },
    ],
    "3days": [
      { label: "Transaction Amount", value: "$4,870", highlight: true },
      { label: "Top User", value: "Brian L.", highlight: true },
      { label: "Failed Transactions", value: "11", highlight: true },
      { label: "Pending Transactions", value: "19" },
      { label: "Completed Transactions", value: "178" },
      { label: "Avg Txn Value", value: "$27.36" },
    ],
    weekly: [
      { label: "Transaction Amount", value: "$12,340", highlight: true },
      { label: "Top User", value: "Cassandra W.", highlight: true },
      { label: "Failed Transactions", value: "29", highlight: true },
      { label: "Pending Transactions", value: "45" },
      { label: "Completed Transactions", value: "421" },
      { label: "Avg Txn Value", value: "$29.31" },
    ],
    monthly: [
      { label: "Transaction Amount", value: "$45,231", highlight: true },
      { label: "Top User", value: "Devon R.", highlight: true },
      { label: "Failed Transactions", value: "104", highlight: true },
      { label: "Pending Transactions", value: "213" },
      { label: "Completed Transactions", value: "1,780" },
      { label: "Avg Txn Value", value: "$25.41" },
    ],
  },
  "remote-devices": {
    today: [
      { label: "Available", value: "3", highlight: true },
      { label: "Rented", value: "7", highlight: true },
      { label: "Expired", value: "1", highlight: true },
      { label: "Total Rent", value: "$49.98" },
      { label: "Top User", value: "Elena S." },
      { label: "Avg Rent Value", value: "$7.14" },
    ],
    "3days": [
      { label: "Available", value: "3", highlight: true },
      { label: "Rented", value: "12", highlight: true },
      { label: "Expired", value: "4", highlight: true },
      { label: "Total Rent", value: "$149.94" },
      { label: "Top User", value: "Frank M." },
      { label: "Avg Rent Value", value: "$12.50" },
    ],
    weekly: [
      { label: "Available", value: "3", highlight: true },
      { label: "Rented", value: "28", highlight: true },
      { label: "Expired", value: "9", highlight: true },
      { label: "Total Rent", value: "$349.86" },
      { label: "Top User", value: "Gianna S." },
      { label: "Avg Rent Value", value: "$12.50" },
    ],
    monthly: [
      { label: "Available", value: "3", highlight: true },
      { label: "Rented", value: "110", highlight: true },
      { label: "Expired", value: "32", highlight: true },
      { label: "Total Rent", value: "$1,399.44" },
      { label: "Top User", value: "Alice J." },
      { label: "Avg Rent Value", value: "$12.72" },
    ],
  },
  numbers: {
    today: [
      { label: "Top Services", value: "PayPal", highlight: true },
      { label: "Expired", value: "2", highlight: true },
      { label: "One Time Rent", value: "14", highlight: true },
      { label: "3 Days Rent", value: "5" },
      { label: "Monthly Rent", value: "3" },
      { label: "Weekly Rent", value: "4" },
      { label: "Unlimited Rent", value: "1" },
    ],
    "3days": [
      { label: "Top Services", value: "Stripe", highlight: true },
      { label: "Expired", value: "7", highlight: true },
      { label: "One Time Rent", value: "42", highlight: true },
      { label: "3 Days Rent", value: "18" },
      { label: "Monthly Rent", value: "9" },
      { label: "Weekly Rent", value: "11" },
      { label: "Unlimited Rent", value: "3" },
    ],
    weekly: [
      { label: "Top Services", value: "Venmo", highlight: true },
      { label: "Expired", value: "19", highlight: true },
      { label: "One Time Rent", value: "130", highlight: true },
      { label: "3 Days Rent", value: "47" },
      { label: "Monthly Rent", value: "22" },
      { label: "Weekly Rent", value: "38" },
      { label: "Unlimited Rent", value: "9" },
    ],
    monthly: [
      { label: "Top Services", value: "OnePay", highlight: true },
      { label: "Expired", value: "74", highlight: true },
      { label: "One Time Rent", value: "512", highlight: true },
      { label: "3 Days Rent", value: "188" },
      { label: "Monthly Rent", value: "96" },
      { label: "Weekly Rent", value: "143" },
      { label: "Unlimited Rent", value: "37" },
    ],
  },
  proxy: {
    today: [
      { label: "Available", value: "500", highlight: true },
      { label: "Rented", value: "24", highlight: true },
      { label: "Day Rented", value: "10", highlight: true },
      { label: "Weekly Rented", value: "8" },
      { label: "Top User", value: "Brian L." },
      { label: "Top Services", value: "US/NY" },
      { label: "Avg Rent Value", value: "$3.20" },
    ],
    "3days": [
      { label: "Available", value: "500", highlight: true },
      { label: "Rented", value: "71", highlight: true },
      { label: "Day Rented", value: "30", highlight: true },
      { label: "Weekly Rented", value: "25" },
      { label: "Top User", value: "Cassandra W." },
      { label: "Top Services", value: "DE/Berlin" },
      { label: "Avg Rent Value", value: "$3.45" },
    ],
    weekly: [
      { label: "Available", value: "500", highlight: true },
      { label: "Rented", value: "163", highlight: true },
      { label: "Day Rented", value: "70", highlight: true },
      { label: "Weekly Rented", value: "59" },
      { label: "Top User", value: "Devon R." },
      { label: "Top Services", value: "UK/London" },
      { label: "Avg Rent Value", value: "$3.60" },
    ],
    monthly: [
      { label: "Available", value: "500", highlight: true },
      { label: "Rented", value: "680", highlight: true },
      { label: "Day Rented", value: "290", highlight: true },
      { label: "Weekly Rented", value: "240" },
      { label: "Top User", value: "Elena S." },
      { label: "Top Services", value: "SG/Singapore" },
      { label: "Avg Rent Value", value: "$3.78" },
    ],
  },
};

// --- Dummy Data ---
const TOP_USER_NAMES = [
  "Alice Johnson",
  "Brian Lee",
  "Cassandra Wu",
  "Devon Reyes",
  "Elena Scott",
  "Frank Mills",
  "Gianna Smith",
];

const DEVICE_NAMES = ["NJF-72", "AXP-14", "KLM-33", "ZRT-88", "BVQ-51"];
const DURATIONS = ["daily", "weekly", "monthly"];
const SERVICE_NAMES = ["OnePay", "PayPal", "Stripe", "Venmo", "CashApp"];
const PERIODS = ["3 days", "30 days", "Unlimited"];
const PROXY_LOCATIONS = ["US/New York", "DE/Berlin", "UK/London", "FR/Paris", "SG/Singapore"];

const generateChartData = (
  days: number,
  baseValue: number,
  includeNames: boolean,
  tabContext: TabContext,
): ChartDataPoint[] => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const turnover = Math.floor(Math.random() * baseValue) + baseValue / 2;
    return {
      date: format(date, "MMM dd, yyyy"),
      turnover,
      deposit: Math.floor(Math.random() * 20) + 1,
      value: turnover,
      ...(includeNames && { name: TOP_USER_NAMES[i % TOP_USER_NAMES.length] }),
      ...(tabContext === "remote-devices" && {
        deviceName: DEVICE_NAMES[i % DEVICE_NAMES.length],
        duration: DURATIONS[i % DURATIONS.length],
      }),
      ...(tabContext === "numbers" && {
        serviceName: SERVICE_NAMES[i % SERVICE_NAMES.length],
        period: PERIODS[i % PERIODS.length],
      }),
      ...(tabContext === "proxy" && {
        proxyLocation: PROXY_LOCATIONS[i % PROXY_LOCATIONS.length],
      }),
    };
  });
};

const DUMMY_COINS: CoinDataPoint[] = [
  { name: "BTC", fullName: "BTC", percentage: 30, amount: 0.4411861, color: "#f59e0b" },
  { name: "ETH", fullName: "ETH", percentage: 30, amount: 0.4411861, color: "#6366f1" },
  { name: "USDT", fullName: "Thether USD (Tron)", percentage: 29, amount: 15629.577071, color: "#4ade80", tag: "TRX" },
  { name: "TRX", fullName: "TRX", percentage: 11, amount: 5053.477194, color: "#ef4444" },
];

// --- Custom Tooltip ---
const CustomTooltip = ({
  activeTab,
  tabContext,
  active,
  payload,
}: {
  activeTab: "Turnover" | "Top Users" | "Coins";
  tabContext: TabContext;
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  const renderBottomLine = () => {
    if (tabContext === "remote-devices") {
      return <p className="text-c-slate-300 text-sm">Device: {data.deviceName} · {data.duration}</p>;
    }
    if (tabContext === "numbers") {
      return <p className="text-c-slate-300 text-sm">Service: {data.serviceName} · {data.period}</p>;
    }
    if (tabContext === "proxy") {
      return <p className="text-c-slate-300 text-sm">Location: {data.proxyLocation}</p>;
    }
    return <p className="text-c-slate-300 text-sm">Deposit {data.deposit}</p>;
  };

  return (
    <div className="bg-c-bg-600 p-4 rounded-lg border border-c-slate-700 shadow-xl">
      <p className="text-c-slate-200 text-sm mb-2">{data.date}</p>
      <p className="text-c-slate-300 text-sm mb-1">
        {activeTab === "Top Users"
          ? `${data.name ?? "Unknown"} - ${data.turnover} USD`
          : `Turnover - ${data.turnover} USD`}
      </p>
      {activeTab === "Top Users"
        ? renderBottomLine()
        : <p className="text-c-slate-300 text-sm">Deposit {data.deposit}</p>
      }
    </div>
  );
};

// --- Main Component ---
export default function StatisticsArea({
  tabContext = "transactions",
}: {
  tabContext?: TabContext;
}) {
  const [activeTab, setActiveTab] = useState<"Turnover" | "Top Users" | "Coins">("Turnover");
  const [activeTime, setActiveTime] = useState<"7D" | "1M" | "3M" | "Custom">("7D");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [summaryPeriod, setSummaryPeriod] = useState<SummaryPeriod>("today");

  const summaryBoxes = SUMMARY_DATA[tabContext][summaryPeriod];

  const DUMMY_DATA = useMemo(() => ({
    Turnover: {
      "7D": generateChartData(7, 200, false, tabContext),
      "1M": generateChartData(30, 500, false, tabContext),
      "3M": generateChartData(90, 1000, false, tabContext),
    },
    "Top Users": {
      "7D": generateChartData(7, 50, true, tabContext),
      "1M": generateChartData(30, 150, true, tabContext),
      "3M": generateChartData(90, 400, true, tabContext),
    },
  }), [tabContext]);

  const currentChartData = useMemo(() => {
    if (activeTab === "Coins") return [];
    if (activeTime === "Custom") return DUMMY_DATA[activeTab]["1M"];
    return DUMMY_DATA[activeTab][activeTime];
  }, [activeTab, activeTime, DUMMY_DATA]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {/* Chart Section */}
      <div className="xl:col-span-3 bg-c-bg-750 border border-c-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-c-slate-200">Statistics</h2>
            <Info className="w-4 h-4 text-c-orange-500 cursor-pointer" />
          </div>

          {/* Chart Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Tab */}
            <div className="flex items-center text-xs bg-black rounded-md overflow-hidden border border-c-slate-800">
              {(["Turnover", "Top Users", "Coins"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "Coins") setActiveTime("7D");
                  }}
                  className={`px-3 py-1.5 transition-colors ${
                    activeTab === tab
                      ? "bg-c-green-500 text-white font-medium"
                      : "text-c-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Time Tab */}
            <div
              className={`flex items-center text-xs bg-black rounded-md border border-c-slate-800 transition-opacity ${
                activeTab === "Coins" ? "opacity-40 pointer-events-none" : "opacity-100"
              }`}
            >
              {(["7D", "1M", "3M"] as const).map((time, idx) => (
                <button
                  key={time}
                  onClick={() => {
                    setActiveTime(time);
                    setDateRange(undefined);
                  }}
                  className={`px-3 py-1.5 transition-colors ${
                    idx !== 0 ? "border-l border-c-slate-800" : ""
                  } ${
                    activeTime === time
                      ? "bg-c-green-500 text-white font-medium"
                      : "text-c-slate-400 hover:text-white"
                  }`}
                >
                  {time}
                </button>
              ))}

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => setActiveTime("Custom")}
                    className={cn(
                      "px-3 py-1.5 border-l border-c-slate-800 flex items-center justify-center transition-colors",
                      activeTime === "Custom"
                        ? "bg-c-green-500 text-white"
                        : "text-c-slate-400 hover:text-white",
                    )}
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-c-bg-700 border-c-slate-700"
                  align="end"
                >
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setActiveTime("Custom");
                    }}
                    numberOfMonths={2}
                    className="text-c-slate-200"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Dynamic Chart Area */}
        <div className="min-h-[250px] w-full flex items-center justify-center">
          {activeTab === "Coins" ? (
            <div className="flex flex-col md:flex-row items-center justify-around w-full gap-8">
              <div className="h-[220px] w-[220px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DUMMY_COINS.filter((c) => c.percentage > 0)}
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="percentage"
                      stroke="none"
                      labelLine={false}
                      label={({ cx, cy, midAngle = 0, innerRadius, outerRadius, value }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs">
                            {`${value}%`}
                          </text>
                        );
                      }}
                    >
                      {DUMMY_COINS.filter((c) => c.percentage > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-3 min-w-[250px] w-full md:w-auto overflow-x-auto">
                <p className="text-c-slate-400 text-xs mb-1">Top coins</p>
                {DUMMY_COINS.map((coin, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-sm min-w-max">
                    <div
                      className="w-32 py-1.5 px-2 text-center rounded text-white text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ backgroundColor: coin.color }}
                    >
                      {coin.fullName}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-c-slate-300">
                        {coin.amount.toFixed(coin.amount === 0 ? 2 : 6)}
                      </span>
                      <span className="font-semibold" style={{ color: coin.color }}>
                        {coin.name}
                      </span>
                      {coin.tag && (
                        <span className="bg-c-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                          {coin.tag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={currentChartData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0fa46f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0fa46f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3340" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val: number) => `$${val}`}
                />
                <RechartsTooltip
                  content={<CustomTooltip activeTab={activeTab} tabContext={tabContext} />}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0fa46f"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="xl:col-span-1 flex flex-col gap-3">
        {/* Period Filter */}
        <Select
          value={summaryPeriod}
          onValueChange={(val) => setSummaryPeriod(val as SummaryPeriod)}
        >
          <SelectTrigger className="w-full bg-c-bg-750 border-c-slate-700 text-c-slate-200 focus:ring-c-green-500 focus:ring-offset-0 focus:border-c-green-500">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="bg-c-bg-750 border-c-slate-700 text-c-slate-200">
            <SelectItem value="today" className="focus:bg-c-slate-800 focus:text-white cursor-pointer">Today</SelectItem>
            <SelectItem value="3days" className="focus:bg-c-slate-800 focus:text-white cursor-pointer">3 Days</SelectItem>
            <SelectItem value="weekly" className="focus:bg-c-slate-800 focus:text-white cursor-pointer">Weekly</SelectItem>
            <SelectItem value="monthly" className="focus:bg-c-slate-800 focus:text-white cursor-pointer">Monthly</SelectItem>
          </SelectContent>
        </Select>

        {/* Box Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-3 auto-rows-max">
          {summaryBoxes.map((box, idx) => (
            <div
              key={idx}
              className="bg-c-bg-750 border border-c-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1 hover:border-c-slate-700 transition-colors"
            >
              <span className="text-xs text-c-slate-400">{box.label}</span>
              <span className={`text-lg font-semibold ${box.highlight ? "text-c-orange-500" : "text-c-slate-200"}`}>
                {box.value}
              </span>
              {box.subValue && (
                <span className="text-xs text-c-orange-500 mt-1">{box.subValue}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}