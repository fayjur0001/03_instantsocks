"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Search,
  RotateCcw,
  UserCog,
  UserPen,
  Lock,
  Ban,
  Play,
} from "lucide-react";
import { DateRange } from "react-day-picker";

// UI Components (Assuming standard shadcn/ui paths)
import { ReusableTable } from "@/components/tables/ReusableTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditRoleModal } from "@/components/modals/EditRoleModal";
import { EditUserModal } from "@/components/modals/EditUserModal";
import { EditPasswordModal } from "@/components/modals/EditPasswordModal";
import { BanUserModal } from "@/components/modals/BanUserModal";

// --- Interfaces ---
export interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  activity: string;
  status: "online" | "offline" | "banned" | "suspended";
  totalTopUp: number;
  currentBalance: number;
  lastLoginIp: string;
}

export interface FilterState {
  username: string;
  email: string;
  role: string;
  dateRange: DateRange | undefined;
  status: "all" | "online" | "banned" | "suspended";
}

// --- Dummy Data ---
const oneTimeDummyData: UserData[] = [
  {
    id: "1",
    username: "DannyRay",
    email: "dannyray@gmail.com",
    role: "Admin",
    activity: "2025-09-20 05:02:47",
    status: "online",
    totalTopUp: 5000,
    currentBalance: 1250.75,
    lastLoginIp: "192.168.1.101",
  },
  {
    id: "2",
    username: "JohnDoe",
    email: "johndoe@gmail.com",
    role: "User",
    activity: "2025-09-19 12:45:00",
    status: "offline",
    totalTopUp: 200,
    currentBalance: 45.0,
    lastLoginIp: "10.0.0.52",
  },
  {
    id: "3",
    username: "SarahConnor",
    email: "sarahconnor@gmail.com",
    role: "Moderator",
    activity: "2025-09-18 08:30:15",
    status: "suspended",
    totalTopUp: 1500,
    currentBalance: 300.5,
    lastLoginIp: "172.16.0.23",
  },
  {
    id: "4",
    username: "MikeRoss",
    email: "mikeross@gmail.com",
    role: "User",
    activity: "2025-09-17 22:10:05",
    status: "banned",
    totalTopUp: 750,
    currentBalance: 0,
    lastLoginIp: "203.0.113.99",
  },
];

// --- Main Component ---
const OneTimeRentTable = () => {
  const [page, setPage] = useState(1);

  // Filter State Management
  const [filters, setFilters] = useState<FilterState>({
    username: "",
    email: "",
    role: "all",
    dateRange: undefined,
    status: "all",
  });

  const handleResetFilters = () => {
    setFilters({
      username: "",
      email: "",
      role: "all",
      dateRange: undefined,
      status: "all",
    });
  };

  // Local filtering for demonstration
  const filteredData = useMemo(() => {
    return oneTimeDummyData.filter((item) => {
      const matchSearch =
        item?.username
          ?.toLowerCase()
          .includes(filters.username.toLowerCase()) ||
        item?.username?.includes(filters.username);
      // Extend these conditions based on how you map dummy data to the new filters
      return matchSearch;
    });
  }, [filters]);

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [modalStates, setModalStates] = useState({
    role: false,
    edit: false,
    password: false,
  });
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banType, setBanType] = useState<"permanent" | "7days">("permanent");
  const [banTarget, setBanTarget] = useState<UserData | null>(null);

  // Example function to trigger from column icon
  const openModal = (user: UserData, type: "role" | "edit" | "password") => {
    setSelectedUser(user);
    setModalStates((prev) => ({ ...prev, [type]: true }));
  };

  const openBanModal = (user: UserData, type: "permanent" | "7days") => {
    setBanTarget(user);
    setBanType(type);
    setBanModalOpen(true);
  };

  const confirmBan = () => {
    if (banTarget) {
      console.log(
        `Banning ${banTarget.username} ${
          banType === "permanent" ? "permanently" : "for 7 days"
        }`,
      );
    }
    setBanModalOpen(false);
    setBanTarget(null);
  };

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <span className="text-c-slate-400">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <span className="font-medium text-c-slate-200">
          {row.original.username}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email Address",
      cell: ({ row }) => (
        <span className="text-c-slate-300">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="text-c-slate-300">{row.original.role}</span>
      ),
    },
    {
      accessorKey: "activity",
      header: "Activity",
      cell: ({ row }) => (
        <span className="text-c-slate-400 text-sm">{row.original.activity}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isOnline = row.original.status === "online";
        return (
          <div className="flex items-center w-full">
            <div
              className={cn(
                "w-3 h-3 rounded-full ml-4",
                isOnline
                  ? "bg-c-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" // Glowing effect for online
                  : "bg-c-slate-600",
              )}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "totalTopUp",
      header: "Total Top Up",
      cell: ({ row }) => (
        <span className="text-c-slate-300 font-mono">
          $
          {row.original.totalTopUp.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      accessorKey: "currentBalance",
      header: "Current Balance",
      cell: ({ row }) => {
        const balance = row.original.currentBalance;
        return (
          <span
            className={cn(
              "font-mono font-medium",
              balance > 0 ? "text-c-emerald-400" : "text-c-slate-500",
            )}
          >
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      accessorKey: "lastLoginIp",
      header: "Last Login IP",
      cell: ({ row }) => (
        <span className="text-c-slate-400 font-mono text-sm">
          {row.original.lastLoginIp}
        </span>
      ),
    },
    {
      id: "settings",
      header: "Settings",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-1">
            {/* Settings 1: Edit Role Modal */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-c-slate-400 hover:bg-white/10  hover:text-green"
                  onClick={() => openModal(user, "role")}
                >
                  <UserCog className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change Role</p>
              </TooltipContent>
            </Tooltip>

            {/* Settings 2: Edit User Modal */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-c-slate-400 hover:bg-white/10  hover:text-green"
                  onClick={() => openModal(user, "edit")}
                >
                  <UserPen className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit User Details</p>
              </TooltipContent>
            </Tooltip>

            {/* Settings 3: Change Password Modal */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-c-slate-400 hover:bg-white/10  hover:text-green"
                  onClick={() => openModal(user, "password")}
                >
                  <Lock className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change Password</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-1">
            {/* Action 1: Permanent Ban */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-c-slate-400 hover:bg-white/10 hover:text-c-rose-500"
                  onClick={() => openBanModal(user, "permanent")}
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ban User Permanently</p>
              </TooltipContent>
            </Tooltip>

            {/* Action 2: 7-Day Ban (Using a stylized '7' to match your image) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-c-slate-400 hover:bg-white/10 hover:text-c-orange-500"
                  onClick={() => openBanModal(user, "7days")}
                >
                  <span className="font-bold text-sm">7</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ban User for 7 Days</p>
              </TooltipContent>
            </Tooltip>

            {/* Action 3: Login as User */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-c-slate-400 hover:bg-white/10 hover:text-green"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Login as {user.username}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="bg-c-bg-700 border border-c-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col space-y-4">
          {/* Top Row: Inputs & Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Username..."
              value={filters.username}
              onChange={(e) =>
                setFilters({ ...filters, username: e.target.value })
              }
              className="bg-c-bg-800 border-c-slate-700 text-c-slate-200 placeholder:text-c-slate-500"
            />

            <Input
              placeholder="Email address..."
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              className="bg-c-bg-800 border-c-slate-700 text-c-slate-200 placeholder:text-c-slate-500"
            />

            <Select
              value={filters.role}
              onValueChange={(val) => setFilters({ ...filters, role: val })}
            >
              <SelectTrigger className="bg-c-bg-800 border-c-slate-700 text-c-slate-200 w-full">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-c-bg-700 border-c-slate-700 text-c-slate-200">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-c-bg-800 border-c-slate-700 hover:bg-c-bg-700 hover:text-c-slate-200",
                    !filters.dateRange && "text-c-slate-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>All Time</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-c-bg-700 border-c-slate-700"
                align="start"
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) =>
                    setFilters({ ...filters, dateRange: range })
                  }
                  numberOfMonths={2}
                  className="text-c-slate-200"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Bottom Row: Status Radios & Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
            <RadioGroup
              value={filters.status}
              onValueChange={(val: FilterState["status"]) =>
                setFilters({ ...filters, status: val })
              }
              className="flex flex-wrap items-center space-x-4 text-c-slate-300"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="all"
                  id="r-all"
                  className="border-c-orange-500 text-c-orange-500"
                />
                <Label htmlFor="r-all" className="cursor-pointer">
                  All
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="online"
                  id="r-online"
                  className="border-c-orange-500 text-c-orange-500"
                />
                <Label htmlFor="r-online" className="cursor-pointer">
                  Online
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="banned"
                  id="r-banned"
                  className="border-c-orange-500 text-c-orange-500"
                />
                <Label htmlFor="r-banned" className="cursor-pointer">
                  Banned
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="suspended"
                  id="r-suspended"
                  className="border-c-orange-500 text-c-orange-500"
                />
                <Label htmlFor="r-suspended" className="cursor-pointer">
                  Suspended
                </Label>
              </div>
            </RadioGroup>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Button className="flex-1 md:flex-none bg-c-emerald-500 hover:bg-c-emerald-600 text-white shadow-sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                onClick={handleResetFilters}
                variant="destructive"
                className="flex-1 md:flex-none bg-c-rose-500/10 text-c-rose-500 hover:bg-c-rose-500/20 border border-c-rose-500/20 shadow-none"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Table */}
      <ReusableTable
        columns={columns}
        data={filteredData}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={10}
        totalItems={50}
      />

      <EditRoleModal
        user={selectedUser}
        open={modalStates.role}
        onOpenChange={(val) => setModalStates((p) => ({ ...p, role: val }))}
      />
      <EditUserModal
        user={selectedUser}
        open={modalStates.edit}
        onOpenChange={(val) => setModalStates((p) => ({ ...p, edit: val }))}
      />
      <EditPasswordModal
        user={selectedUser}
        open={modalStates.password}
        onOpenChange={(val) => setModalStates((p) => ({ ...p, password: val }))}
      />

      <BanUserModal
        user={banTarget}
        open={banModalOpen}
        banType={banType}
        onOpenChange={(open) => {
          setBanModalOpen(open);
          if (!open) setBanTarget(null);
        }}
        onConfirm={confirmBan}
      />
    </div>
  );
};

export default OneTimeRentTable;
