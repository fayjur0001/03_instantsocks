"use client";

import { useState } from "react";
import { ReusableTable } from "@/components/tables/ReusableTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Copy } from "lucide-react"; // Added Copy icon
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import WalletModal from "@/components/modals/WalletModal";

// --- 1. UPDATED DATA TYPES & DUMMY DATA ---

export interface Transaction {
    id: string;
    date: string;
    wallet: "PayPal" | "Stripe" | "Crypto";
    walletAddress: string;
    transactionId: string;
    timeLeft: string;
    amount: number;
    status: "Completed" | "Awaiting" | "Confirming" | "Cancelled";
}

export const transactionDummyData: Transaction[] = [
    {
        id: "1",
        date: "26-12-2025",
        wallet: "PayPal",
        walletAddress: "0x742dffadf3545dCc...954df56fffg632",
        transactionId: "0x742dffadf3545dCc...954df56fffg632",
        amount: 105.0,
        timeLeft: "119:59",
        status: "Completed",
    },
    {
        id: "2",
        date: "26-12-2025",
        wallet: "Stripe",
        walletAddress: "0x742dffadf3545dCc...954df56fffg632",
        transactionId: "0x742dffadf3545dCc...954df56fffg632",
        amount: 105.0,
        timeLeft: "119:59",
        status: "Awaiting",
    },
    {
        id: "3",
        date: "26-12-2025",
        wallet: "PayPal",
        walletAddress: "0x742dffadf3545dCc...954df56fffg632",
        transactionId: "0x742dffadf3545dCc...954df56fffg632",
        amount: 105.0,
        timeLeft: "119:59",
        status: "Confirming",
    },
    {
        id: "4",
        date: "25-12-2025",
        wallet: "Crypto",
        walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        transactionId: "a1075db55d416d3ca199f55b6084e211529345523",
        amount: 250.0,
        timeLeft: "119:59",
        status: "Completed",
    },
    {
        id: "5",
        date: "24-12-2025",
        wallet: "Stripe",
        walletAddress: "0x742dffadf3545dCc...954df56fffg632",
        transactionId: "0x742dffadf3545dCc...954df56fffg632",
        amount: 105.0,
        timeLeft: "119:59",
        status: "Cancelled",
    },
];

// --- 2. MAIN PAGE COMPONENT ---

export default function BillingPage() {
    const [walletModalOpen, setWalletModalOpen] = useState(false);

    // -- Table Logic --
    const [page, setPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState("all");

    const filteredData =
        selectedTag === "all"
            ? transactionDummyData
            : transactionDummyData.filter(
                (item) => item.wallet.toLowerCase() === selectedTag.toLowerCase()
            );

    // Status Styles matching the image colors
    const statusStyles = {
        Completed: "bg-green/10 text-green border-green/20 hover:bg-green/20",
        Awaiting: "bg-red/10 text-red border-red/20 hover:bg-red/20",
        Confirming:
            "bg-c-orange-500/10 text-c-orange-400 border-c-orange-500/20 hover:bg-c-orange-500/20",
        Cancelled: "bg-white/5 text-c-slate-400 border-white/10 hover:bg-white/10",
    };

    const transactionColumns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-c-slate-400 font-medium">{row.original.date}</span>
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
                <div className="flex items-center gap-2 text-c-slate-500">
                    <span className="truncate max-w-[200px]">
                        {row.original.walletAddress}
                    </span>
                    <Copy className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
                </div>
            ),
        },
        {
            accessorKey: "transactionId",
            header: "Transaction ID",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-c-slate-500">
                    <span className="truncate max-w-[200px]">
                        {row.original.transactionId}
                    </span>
                    <Copy className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
                </div>
            ),
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ getValue }) => (
                <span className="font-bold text-white">
                    ${getValue<number>().toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: "timeLeft",
            header: "Time Left",
            cell: ({ getValue }) => (
                <span className="font-bold text-white">{getValue<string>()}</span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue<Transaction["status"]>();
                return (
                    <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-0.5 border font-medium ${statusStyles[status]}`}
                    >
                        {status}
                    </Badge>
                );
            },
        },
    ];

    return (
        <div>
            <div className="space-y-6 ">
                {/* --- TOP SECTION: Payment Methods --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* PayPal Card */}
                    <div className={`relative p-5 bg-black rounded-[12px] border transition-all cursor-pointer border-white/10 hover:border-white/20`}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-bold text-green">
                                PayPal
                            </span>
                        </div>

                        <p className="text-sm text-c-slate-400 mb-6 leading-relaxed">
                            Input deposit amount and click on pay now. You will be redirected
                            to payment page.
                        </p>

                        <div className="flex gap-2 mt-auto">
                            <Input placeholder="Enter Amount Here..." />
                            <Button>Pay Now</Button>
                        </div>
                    </div>

                    {/* Stripe Card */}
                    <div
                        className={`relative p-5 bg-black rounded-[12px] border transition-all cursor-pointer border-white/10 hover:border-white/20`}>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-bold text-green">stripe</span>
                        </div>

                        <p className="text-sm text-c-slate-400 mb-6 leading-relaxed">
                            Generate wallet address by tapping get wallet button.
                        </p>

                        <div className="flex gap-2 mt-auto">
                            <Input
                                placeholder="Enter Amount Here..."
                            />
                            <Button>Pay Now</Button>
                        </div>
                    </div>

                    {/* Crypto Payment Card */}
                    <div className={`relative p-5 bg-black rounded-[12px] border transition-all cursor-pointer border-white/10 hover:border-white/20`}>
                        <h3 className="font-semibold text-green mb-4">
                            Crypto Payment
                        </h3>

                        <div className="space-y-3">
                            <Select>
                                <SelectTrigger className="bg-black/20 border-white/10 focus:ring-c-green-400 w-full text-white">
                                    <SelectValue placeholder="Select a Coin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Enter amount..."
                            />

                            <Button
                                onClick={() => setWalletModalOpen(true)}
                                className="w-full "
                            >
                                Get Wallet Address
                            </Button>
                        </div>
                    </div>

                    {/* Caution Card */}
                    <div className="p-5 bg-black rounded-[12px] border border-white/10 flex flex-col items-center text-center justify-center">
                        <h3 className="font-bold text-red mb-3">Caution!</h3>
                        <p className="text-sm text-c-slate-400 leading-relaxed">
                            If you have any issues with payment, open a support ticket please.
                            We are here 24/7. After opening a ticket wait for our reply. We
                            will get back to you as soon as possible.
                        </p>
                    </div>
                </div>

                <Separator className="bg-white/5" />

                {/* --- BOTTOM SECTION: Transaction History (Using Your Table) --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white/90">
                            Transaction History
                        </h2>

                        <div className="flex items-center gap-2">
                            <h6 className="text-sm text-c-slate-400">Payment Method:</h6>
                            <Select
                                defaultValue="all"
                                onValueChange={(value) => setSelectedTag(value)}
                            >
                                <SelectTrigger className="w-[140px] h-9 text-xs font-medium border-white/10 bg-black/20 text-white">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="stripe">Stripe</SelectItem>
                                    <SelectItem value="crypto">Crypto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/*  Table  */}
                    <ReusableTable
                        columns={transactionColumns}
                        data={filteredData}
                        currentPage={page}
                        setCurrentPage={setPage}
                        itemsPerPage={5}
                        totalItems={50}
                    />

                    {/* Wallet Modal  */}

                    <WalletModal walletModalOpen={walletModalOpen} setWalletModalOpen={setWalletModalOpen} />
                </div>
            </div>
        </div>
    );
}
