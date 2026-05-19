"use client";

import { useState, useMemo, useEffect } from "react";
import { ReusableTable } from "@/components/tables/ReusableTable";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

export interface ProxyData {
  id: string;
  ip: string;
  flag: string;
  user: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  port: string;
  type: string;
  note: string;
  online: "YES" | "NO";
  status: "Active" | "Expired";
  bought: string;
  price: string;
  connectionString: string;
  domain: string;
  org: string;
  isp: string;
  zone: string;
  added: string;
  ping: string;
  speed: string;
  dns: string;
}

interface ProxyFilters {
  ip: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  port: string;
  note: string;
  type: string;
  status: string;
}

const TYPE_OPTIONS = [
  "ISP/MOB", "ISP", "MOB", "DCH", "COM",
  "GOV", "ORG", "EDU", "LIB", "CDN", "MIL", "SES", "-",
];

// The input IS the header — transparent, no border, emerald color matches
// the surrounding TableHead text. Placeholder = column label.
const headerInputCls = [
  "w-full min-w-[60px] bg-transparent border-none outline-none",
  "text-c-emerald-500 placeholder-emerald-500",
  "focus:placeholder-emerald-700 focus:text-white",
  "text-[12px] font-semibold",
  "cursor-pointer focus:cursor-text",
  "transition-colors duration-150",
].join(" ");

// Helper component for debounced header inputs to prevent focus loss and allow continuous typing
const FilterHeaderInput = ({ 
  placeholder, 
  value, 
  onChange 
}: { 
  placeholder: string; 
  value: string; 
  onChange: (val: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local state when parent value changes externally (e.g., clear all filters)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the update to the parent state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 1500); // 2000ms delay
    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  return (
    <input
      className={headerInputCls}
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

const mockProxyData: ProxyData[] = [
  {
    id: "proxy-1", ip: "73.187.34.228", flag: "🇺🇸", user: "Support",
    country: "US", state: "PA", city: "Lebanon", zip: "17046", port: "47349",
    type: "ISP", note: "-", online: "YES", status: "Expired",
    bought: "2026-03-01 11:43 PM", price: "$ 2.48",
    connectionString: "kz3zay1:1hb52me@216.22.49.36:47349",
    domain: "c-73-187-34-228.hsd1.pa.comcast.net", org: "Comcast Cable",
    isp: "Comcast Cable", zone: "America/New_York", added: "40 days ago",
    ping: "52 ms", speed: "3.35M", dns: "🇺🇸 69.252.71.237",
  },
  {
    id: "proxy-2", ip: "104.129.52.14", flag: "🇺🇸", user: "Admin",
    country: "US", state: "TX", city: "Austin", zip: "73301", port: "8080",
    type: "MOB", note: "fast", online: "YES", status: "Active",
    bought: "2026-04-01 09:12 AM", price: "$ 3.10",
    connectionString: "tx4abc:pass123@104.129.52.14:8080",
    domain: "mob-104-129-52-14.att.net", org: "AT&T Mobility",
    isp: "AT&T", zone: "America/Chicago", added: "11 days ago",
    ping: "21 ms", speed: "8.12M", dns: "🇺🇸 8.8.8.8",
  },
  {
    id: "proxy-3", ip: "45.155.68.89", flag: "🇬🇧", user: "Support",
    country: "GB", state: "ENG", city: "London", zip: "EC1A", port: "3128",
    type: "ISP", note: "slow", online: "YES", status: "Active",
    bought: "2026-03-20 07:45 AM", price: "$ 2.75",
    connectionString: "gbuser:gbpass@45.155.68.89:3128",
    domain: "lon-45-155-68-89.bt.net", org: "British Telecom",
    isp: "BT", zone: "Europe/London", added: "23 days ago",
    ping: "68 ms", speed: "2.40M", dns: "🇬🇧 8.8.4.4",
  },
  {
    id: "proxy-4", ip: "185.220.101.45", flag: "🇩🇪", user: "Client1",
    country: "DE", state: "BE", city: "Berlin", zip: "10115", port: "9050",
    type: "DCH", note: "-", online: "NO", status: "Expired",
    bought: "2026-02-14 03:00 PM", price: "$ 1.95",
    connectionString: "de1:de1pass@185.220.101.45:9050",
    domain: "tor-exit.185.220.101.45.de", org: "Hetzner Online",
    isp: "Hetzner", zone: "Europe/Berlin", added: "57 days ago",
    ping: "120 ms", speed: "1.02M", dns: "🇩🇪 1.1.1.1",
  },
  {
    id: "proxy-5", ip: "203.78.145.200", flag: "🇯🇵", user: "Support",
    country: "JP", state: "TK", city: "Tokyo", zip: "100-0001", port: "10800",
    type: "ISP/MOB", note: "VIP", online: "YES", status: "Active",
    bought: "2026-03-28 11:00 AM", price: "$ 5.50",
    connectionString: "jpvip:jppass@203.78.145.200:10800",
    domain: "tky-203-78-145-200.ntt.net", org: "NTT Communications",
    isp: "NTT", zone: "Asia/Tokyo", added: "15 days ago",
    ping: "15 ms", speed: "12.00M", dns: "🇯🇵 103.2.57.5",
  },
  {
    id: "proxy-6", ip: "51.159.44.77", flag: "🇫🇷", user: "Client3",
    country: "FR", state: "IDF", city: "Paris", zip: "75001", port: "5050",
    type: "SES", note: "-", online: "YES", status: "Active",
    bought: "2026-04-08 08:00 AM", price: "$ 3.30",
    connectionString: "frses:frpass@51.159.44.77:5050",
    domain: "par-51-159-44-77.scaleway.com", org: "Scaleway",
    isp: "Online SAS", zone: "Europe/Paris", added: "4 days ago",
    ping: "45 ms", speed: "6.70M", dns: "🇫🇷 80.67.169.12",
  },
];

export default function ProxyDashboard() {
  const [page, setPage] = useState(1);
  const [selectedProxy, setSelectedProxy] = useState<ProxyData | null>(null);
  const [filters, setFilters] = useState<ProxyFilters>({
    ip: "", country: "", state: "", city: "",
    zip: "", port: "", note: "", type: "", status: "",
  });

  const setFilter = (key: keyof ProxyFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const filteredData = useMemo(() => {
    return mockProxyData.filter((p) => {
      const m = (val: string, f: string) =>
        !f || val.toLowerCase().includes(f.toLowerCase());
      return (
        m(p.ip,      filters.ip)      &&
        m(p.country, filters.country) &&
        m(p.state,   filters.state)   &&
        m(p.city,    filters.city)    &&
        m(p.zip,     filters.zip)     &&
        m(p.port,    filters.port)    &&
        m(p.note,    filters.note)    &&
        (!filters.type   || p.type   === filters.type)   &&
        (!filters.status || p.status === filters.status)
      );
    });
  }, [filters]);

  const columns = useMemo<ColumnDef<ProxyData, unknown>[]>(() => [
    {
      accessorKey: "ip",
      header: () => (
        <FilterHeaderInput
          placeholder="IP"
          value={filters.ip}
          onChange={(val) => setFilter("ip", val)}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-mono">
          <Image src={"/flag-argentina.png"} width={20} height={14} alt={"argentina flag"} />
          <span>{row.original.ip}</span>
        </div>
      ),
    },
    {
      accessorKey: "country",
      header: () => (
        <FilterHeaderInput
          placeholder="COUNTRY"
          value={filters.country}
          onChange={(val) => setFilter("country", val)}
        />
      ),
    },
    {
      accessorKey: "state",
      header: () => (
        <FilterHeaderInput
          placeholder="STATE"
          value={filters.state}
          onChange={(val) => setFilter("state", val)}
        />
      ),
    },
    {
      accessorKey: "city",
      header: () => (
        <FilterHeaderInput
          placeholder="CITY"
          value={filters.city}
          onChange={(val) => setFilter("city", val)}
        />
      ),
    },
    {
      accessorKey: "zip",
      header: () => (
        <FilterHeaderInput
          placeholder="ZIP"
          value={filters.zip}
          onChange={(val) => setFilter("zip", val)}
        />
      ),
    },
    {
      accessorKey: "port",
      header: () => (
        <FilterHeaderInput
          placeholder="PORT"
          value={filters.port}
          onChange={(val) => setFilter("port", val)}
        />
      ),
    },
    {
      accessorKey: "type",
      header: () => (
        <Select
          value={filters.type || "all"}
          onValueChange={(val) => setFilter("type", val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-transparent border-none p-0 h-auto text-c-emerald-500 text-[12px] font-semibold hover:bg-transparent shadow-none focus:ring-0 [&>svg]:w-3 [&>svg]:h-3">
            <SelectValue placeholder="TYPE" />
          </SelectTrigger>
          <SelectContent className="bg-c-bg-850 border-c-emerald-900/30 text-c-slate-200">
            <SelectItem value="all">TYPE</SelectItem>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "note",
      header: () => (
        <FilterHeaderInput
          placeholder="NOTE"
          value={filters.note}
          onChange={(val) => setFilter("note", val)}
        />
      ),
    },
    {
      accessorKey: "online",
      header: "ONLINE", // plain — no filter
    },
    {
      accessorKey: "status",
      header: () => (
        <Select
          value={filters.status || "all"}
          onValueChange={(val) => setFilter("status", val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full bg-transparent border-none p-0 h-auto text-c-emerald-500 text-[12px] font-semibold hover:bg-transparent shadow-none focus:ring-0 [&>svg]:w-3 [&>svg]:h-3">
            <SelectValue placeholder="STATUS" />
          </SelectTrigger>
          <SelectContent className="bg-c-bg-850 border-c-emerald-900/30 text-c-slate-200">
            <SelectItem value="all">STATUS</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "bought",
      header: "BOUGHT", // plain — no filter
    },
    {
      accessorKey: "price",
      header: "PRICE", // plain — no filter
    },
  ], [filters]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-black rounded-[16px] min-h-[80dvh] text-c-slate-300">

      {/* LEFT: Table */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg
              width="36" height="36" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              className="text-c-emerald-900"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p className="text-sm font-medium text-c-slate-400">
              No proxies match your filters
            </p>
            <p className="text-xs text-c-slate-600">
              Try adjusting the filter inputs in the table header
            </p>
            <button
              onClick={() =>
                setFilters({
                  ip: "", country: "", state: "", city: "",
                  zip: "", port: "", note: "", type: "", status: "",
                })
              }
              className="mt-1 text-xs text-c-emerald-500 underline hover:text-c-emerald-400"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <ReusableTable
            columns={columns}
            data={filteredData}
            currentPage={page}
            setCurrentPage={setPage}
            itemsPerPage={10}
            totalItems={filteredData.length}
            onRowClick={(row) => setSelectedProxy(row)}
            selectedRowId={selectedProxy?.id}
            getRowId={(row) => row.id}
          />
        )}
      </div>

      {/* RIGHT: Detail Sidebar */}
      <div className="w-full lg:w-[250px] shrink-0 bg-c-bg-750 border border-c-slate-800 rounded-xl flex flex-col overflow-hidden">
        {!selectedProxy ? (
          <div className="p-4 text-sm text-c-slate-400">
            Click Proxy to view info.
          </div>
        ) : (
          <div className="p-5 flex flex-col h-full">
            <h3 className="text-sm text-c-slate-400 font-semibold tracking-wider mb-4">
              SOCKS5 PROXY
            </h3>
            <div className="flex flex-col gap-4 text-sm">
              <div className="font-mono text-c-slate-200 wrap-break-word">
                {selectedProxy.connectionString}
              </div>
              <div className="text-c-slate-300">
                {selectedProxy.flag} {selectedProxy.country},{" "}
                {selectedProxy.ip} {selectedProxy.state},{" "}
                {selectedProxy.city}, {selectedProxy.zip}
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <p><span className="text-c-slate-500 mr-2 uppercase">Domain:</span>{selectedProxy.domain}</p>
                <p><span className="text-c-slate-500 mr-2 uppercase">Org:</span>{selectedProxy.org}</p>
                <p><span className="text-c-slate-500 mr-2 uppercase">ISP:</span>{selectedProxy.isp}</p>
                <p><span className="text-c-slate-500 mr-2 uppercase">Zone:</span>{selectedProxy.zone}</p>
              </div>
              <div className="flex flex-col gap-1.5 mt-4">
                <p><span className="text-c-slate-500 mr-2 uppercase">Added:</span>{selectedProxy.added}</p>
                <p><span className="text-c-slate-500 mr-2 uppercase">Type:</span>{selectedProxy.type}</p>
                <p><span className="text-c-slate-500 mr-2 uppercase">Ping:</span>{selectedProxy.ping}</p>
                <p><span className="text-c-slate-500 mr-2 uppercase">Speed:</span>{selectedProxy.speed}</p>
                <p><span className="text-c-slate-500 mr-2 uppercase">DNS:</span>{selectedProxy.dns}</p>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <Button
                variant="default"
                className="bg-c-emerald-600 hover:bg-c-emerald-700 text-white font-semibold"
              >
                Renew
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}