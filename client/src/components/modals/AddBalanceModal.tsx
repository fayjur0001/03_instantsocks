"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Dummy user data for the searchable dropdown
const users = [
  { value: "doctor007", label: "doctor007" },
  { value: "kuataji1", label: "kuataji1" },
  { value: "knyaz", label: "Knyaz" },
  { value: "joelucino", label: "joelucino" },
  { value: "mrdelfino", label: "MrDelfino" },
  { value: "stuxnet01", label: "stuxnet01" },
  { value: "letomarin3", label: "letomarin3" },
];

export function AddBalanceModal({ isOpen, onClose }: AddBalanceModalProps) {
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedUser("");
    setOpenCombobox(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-c-bg-700 border-c-slate-800 text-c-slate-200 sm:max-w-[500px]">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-semibold text-white">
            Manually add balance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Searchable Select (Combobox) for Username */}
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between bg-c-bg-600 border-c-slate-700 text-c-slate-200 hover:bg-c-bg-450 hover:text-white font-normal"
              >
                {selectedUser
                  ? users.find((user) => user.value === selectedUser)?.label
                  : "Search and select user..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0 bg-c-bg-700 border-c-slate-700">
              <Command className="bg-transparent">
                <CommandInput 
                  placeholder="Search username..." 
                  className="text-c-slate-200 placeholder:text-c-slate-400"
                />
                <CommandList>
                  <CommandEmpty className="py-6 text-center text-sm text-c-slate-400">
                    No user found.
                  </CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.value}
                        value={user.value}
                        onSelect={(currentValue) => {
                          setSelectedUser(
                            currentValue === selectedUser ? "" : currentValue
                          );
                          setOpenCombobox(false);
                        }}
                        className="text-c-slate-200 hover:bg-c-bg-450 aria-selected:bg-c-bg-450 aria-selected:text-c-emerald-400 cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-c-emerald-500",
                            selectedUser === user.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {user.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Standard Inputs */}
          <Input
            placeholder="TXID"
            className="bg-c-bg-600 border-c-slate-700 text-c-slate-200 focus-visible:ring-c-emerald-500/50 placeholder:text-c-slate-400"
          />
          <Input
            placeholder="Wallet Address"
            className="bg-c-bg-600 border-c-slate-700 text-c-slate-200 focus-visible:ring-c-emerald-500/50 placeholder:text-c-slate-400"
          />
          <Input
            placeholder="Wallet Name"
            className="bg-c-bg-600 border-c-slate-700 text-c-slate-200 focus-visible:ring-c-emerald-500/50 placeholder:text-c-slate-400"
          />
          <Input
            placeholder="Amount"
            type="number"
            className="bg-c-bg-600 border-c-slate-700 text-c-slate-200 focus-visible:ring-c-emerald-500/50 placeholder:text-c-slate-400"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            className="bg-c-emerald-500 hover:bg-c-emerald-600 text-white font-medium px-6"
            onClick={handleClose}
          >
            Save
          </Button>
          <Button
            className="bg-c-red-300 hover:bg-c-red-400 text-white font-medium px-6"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}