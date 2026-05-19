"use client";

import { useState } from "react";
import { ReusableTable } from "@/components/tables/ReusableTable";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export interface ProxyData {
  ip: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  port: string;
  type: string;
  note: string;
  online: boolean;
  status: "Active" | "Expired";
  bought: string;
  price: string;
}

const dummyData: ProxyData[] = [
  {
    ip: "73.187.34.228",
    country: "US",
    state: "PA",
    city: "Lebanon",
    zip: "17046",
    port: "47349",
    type: "ISP",
    note: "-",
    online: true,
    status: "Expired",
    bought: "2026-03-01 11:43 PM",
    price: "$ 2.48",
  },
  {
    ip: "104.129.52.14",
    country: "US",
    state: "TX",
    city: "Austin",
    zip: "73301",
    port: "8080",
    type: "MOB",
    note: "fast",
    online: true,
    status: "Active",
    bought: "2026-04-01 09:12 AM",
    price: "$ 3.10",
  },
  {
    ip: "45.155.68.89",
    country: "GB",
    state: "ENG",
    city: "London",
    zip: "EC1A",
    port: "3128",
    type: "ISP",
    note: "slow",
    online: true,
    status: "Active",
    bought: "2026-03-20 07:45 AM",
    price: "$ 2.75",
  },
  {
    ip: "185.220.101.45",
    country: "DE",
    state: "BE",
    city: "Berlin",
    zip: "10115",
    port: "9050",
    type: "DCH",
    note: "-",
    online: false,
    status: "Expired",
    bought: "2026-02-14 03:00 PM",
    price: "$ 1.95",
  },
  {
    ip: "203.78.145.200",
    country: "JP",
    state: "TK",
    city: "Tokyo",
    zip: "100-0001",
    port: "10800",
    type: "ISP/MOB",
    note: "VIP",
    online: true,
    status: "Active",
    bought: "2026-03-28 11:00 AM",
    price: "$ 5.50",
  },
  {
    ip: "51.159.44.77",
    country: "FR",
    state: "IDF",
    city: "Paris",
    zip: "75001",
    port: "5050",
    type: "SES",
    note: "-",
    online: true,
    status: "Active",
    bought: "2026-04-08 08:00 AM",
    price: "$ 3.30",
  },
];

export default function ProxyTable() {
  const [page, setPage] = useState(1);

  const columns: ColumnDef<ProxyData>[] = [
    {
      accessorKey: "ip",
      header: "IP",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image
            src={"/flag-argentina.png"}
            width={20}
            height={14}
            alt={"argentina flag"}
          />
          <span className="text-c-slate-200">{row.original.ip}</span>
        </div>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <span className="text-c-slate-200">{row.original.country}</span>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => (
        <span className="text-c-slate-200">{row.original.state}</span>
      ),
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span className="text-c-slate-200">{row.original.city}</span>
      ),
    },
    {
      accessorKey: "zip",
      header: "ZIP",
      cell: ({ row }) => (
        <span className="text-c-slate-200">{row.original.zip}</span>
      ),
    },
    {
      accessorKey: "port",
      header: "Port",
      cell: ({ row }) => (
        <span className="text-c-slate-200">{row.original.port}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-c-slate-200">{row.original.type}</span>
      ),
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => (
        <span className="text-c-slate-400">{row.original.note}</span>
      ),
    },
    {
      accessorKey: "online",
      header: "Online",
      cell: ({ row }) => (
        <span
          className={
            row.original.online ? "text-green-400" : "text-c-slate-400"
          }
        >
          {row.original.online ? "YES" : "NO"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "Active" ? "text-green-400" : "text-red-400"
          }
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "bought",
      header: "Bought",
      cell: ({ row }) => (
        <span className="text-c-slate-200">{row.original.bought}</span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="text-c-slate-200">{row.original.price}</span>
      ),
    },
  ];

  return (
    <ReusableTable
      columns={columns}
      data={dummyData}
      currentPage={page}
      setCurrentPage={setPage}
      itemsPerPage={10}
      totalItems={dummyData.length}
    />
  );
}
