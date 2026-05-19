"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { ReusableTable } from "@/components/tables/ReusableTable";
import { ColumnDef } from "@tanstack/react-table";

export interface PortData {
  port: string;
  location: string;
  carrier: string;
  redialInterval: string;
  currentLeases: string;
  rentedFor: string;
}

// Dummy data based on your requirements
const portDummyData: PortData[] = Array(8).fill({
  port: "50034",
  location: "NJ",
  carrier: "T-Mobile",
  redialInterval: "10",
  currentLeases: "0",
  rentedFor: "-",
});

interface SwapPortModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  targetPort?: string | null; // Used as the ID to know which port is being swapped
}

export const SwapPortModal = ({
  isOpen,
  setIsOpen,
  targetPort,
}: SwapPortModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Local filtering based on your pattern
  const filteredData = useMemo(() => {
    return portDummyData.filter((item) => item.port.includes(searchQuery));
  }, [searchQuery]);

  // Column definitions using your pattern
  const columns: ColumnDef<PortData>[] = [
    {
      accessorKey: "port",
      header: "Port",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "carrier",
      header: "Carrier",
    },
    {
      accessorKey: "redialInterval",
      header: "Redial Interval",
    },
    {
      accessorKey: "currentLeases",
      header: "Current leases",
    },
    {
      accessorKey: "rentedFor",
      header: "Rented for",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button
          size="sm"
          className="bg-c-red-300 hover:bg-c-red-400 text-white font-medium"
        >
          Swap Port
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[96vw] sm:max-w-[900px] shadow-lg shadow-white/10 p-4 border border-white/20 bg-c-bg-700 [&>button]:hidden overflow-hidden">
        {/* Header with Close Button */}
        <div className="absolute right-4 top-4">
          <DialogClose asChild>
            <button className="text-c-green-600 hover:opacity-80 transition-opacity rounded-full bg-white/10 p-1 cursor-pointer">
              <X
                className="h-6 w-6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            </button>
          </DialogClose>
        </div>

        <h2 className="text-18-medium-inter text-white">
          Please choose another port to replace{" "}
          <span className="text-c-red-300">{targetPort || "..."}</span> with
        </h2>
        {/* Search Input */}
        <div className="relative w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-c-gray-400" />
          <Input
            placeholder="Search swap able port"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-c-bg-200 border-none text-white placeholder:text-c-gray-300 rounded-full focus-visible:ring-1 focus-visible:ring-c-green-600"
          />
        </div>

        {/* Reusable Table Implementation */}
        <div className=" max-h-[50vh] overflow-auto hide-scrollbar">
          <ReusableTable
            columns={columns}
            data={filteredData}
            currentPage={page}
            setCurrentPage={setPage}
            itemsPerPage={10}
            // totalItems={filteredData.length}
            totalItems={100}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
