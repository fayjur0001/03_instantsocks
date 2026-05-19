"use client";

import { useState, useMemo } from "react";
import { ReusableTable } from "@/components/tables/ReusableTable";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Copy } from "lucide-react";
import { EditTransactionModal } from "@/components/modals/EditTransactionModal";

// types.ts
export interface TransactionRecord {
  id: string;
  date: string;
  username: string;
  wallet: string;
  walletAddress: string;
  txId: string;
  amount: number;
  status: "Confirmed" | "Awaiting" | "Failed";
  type: "transaction" | "manual";
}

interface TransactionsTableProps {
  searchQuery?: string;
  showDelete?: boolean; // Toggles the delete button for Manual Top Up
}

// Dummy Data
const dummyData: TransactionRecord[] = [
  {
    id: "1",
    date: "2026-04-20 11:04 PM",
    username: "doctor007",
    wallet: "LTC",
    walletAddress: "MQqQt1...ywUM1K",
    txId: "27e0a2...494173",
    amount: 11.85,
    status: "Confirmed",
    type: "transaction",
  },
  {
    id: "2",
    date: "2026-04-04 09:40 AM",
    username: "letomarin3",
    wallet: "USDTTRC20",
    walletAddress: "TCPp5Y...SHtBux",
    txId: "a05e41...08fF94",
    amount: 3.39,
    status: "Failed",
    type: "transaction",
  },
  // Add more entries as needed
];

export default function TransactionsTable({
  searchQuery,
  showDelete = false,
}: TransactionsTableProps) {
  const [page, setPage] = useState(1);
  const [transectionToEdit, setTransectionToEdit] =
    useState<TransactionRecord | null>(null);

  const filteredData = useMemo(() => {
    if (!searchQuery) return dummyData;
    return dummyData.filter(
      (item) =>
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.txId.includes(searchQuery),
    );
  }, [searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Add toast notification here
  };

  const columns: ColumnDef<TransactionRecord>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <span className="font-medium text-c-slate-400">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-c-slate-300 text-sm">{row.original.date}</span>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <span className="text-c-slate-300">{row.original.username}</span>
      ),
    },
    {
      accessorKey: "wallet",
      header: "Wallet",
      cell: ({ row }) => (
        <span className="text-c-slate-300">{row.original.wallet}</span>
      ),
    },
    {
      accessorKey: "walletAddress",
      header: "Wallet Address",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-c-slate-300">
          <span className="truncate">{row.original.walletAddress}</span>
          <Copy
            className="h-3.5 w-3.5 cursor-pointer text-c-slate-500 hover:text-c-slate-300 transition-colors"
            onClick={() => copyToClipboard(row.original.walletAddress)}
          />
        </div>
      ),
    },
    {
      accessorKey: "txId",
      header: "TxID",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-c-slate-300">
          <span className="truncate">{row.original.txId}</span>
          <Copy
            className="h-3.5 w-3.5 cursor-pointer text-c-slate-500 hover:text-c-slate-300 transition-colors"
            onClick={() => copyToClipboard(row.original.txId)}
          />
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-c-slate-300 font-medium">
          $ {row.original.amount}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isCompleted = row.original.status === "Confirmed";
        return (
          <span
            className={`font-medium ${isCompleted ? "text-c-emerald-500" : "text-c-rose-500"}`}
          >
            {row.original.status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-7 px-4 bg-c-emerald-500 hover:bg-c-emerald-600 text-white rounded text-xs"
            onClick={() => setTransectionToEdit(row.original)}
          >
            Edit
          </Button>
          {showDelete && (
            <Button
              size="sm"
              className="h-7 px-4 bg-c-red-300 hover:bg-c-red-400 text-white rounded text-xs"
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ReusableTable
        columns={columns}
        data={filteredData}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={10}
        totalItems={dummyData.length}
      />

      <EditTransactionModal
        transaction={transectionToEdit}
        open={transectionToEdit !== null}
        onOpenChange={() => setTransectionToEdit(null)}
      />
    </>
  );
}
