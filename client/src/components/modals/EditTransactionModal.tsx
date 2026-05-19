import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TransactionRecord } from "../admin/pages/transactions/TransactionsTable";



interface EditTransactionModalProps {
  transaction: TransactionRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionModal({ transaction, open, onOpenChange }: EditTransactionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-c-bg-700 border-c-slate-800 text-c-slate-200 sm:max-w-[650px] p-6 shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-semibold tracking-wide">
            You are editing transaction no #{transaction?.id || "277"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 py-2">
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-c-slate-200 font-medium text-sm">Username</Label>
            <Input 
              id="username" 
              defaultValue={transaction?.username} 
              className="bg-c-bg-400 border-transparent focus-visible:ring-1 focus-visible:ring-c-emerald-500 text-c-slate-200 h-10" 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="txid" className="text-c-slate-200 font-medium text-sm">TXID</Label>
            <Input 
              id="txid" 
              defaultValue={transaction?.txId} 
              className="bg-c-bg-400 border-transparent focus-visible:ring-1 focus-visible:ring-c-emerald-500 text-c-slate-200 h-10" 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="wallet-address" className="text-c-slate-200 font-medium text-sm">Wallet Address</Label>
            <Input 
              id="wallet-address" 
              defaultValue={transaction?.walletAddress} 
              className="bg-c-bg-400 border-transparent focus-visible:ring-1 focus-visible:ring-c-emerald-500 text-c-slate-200 h-10" 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="wallet-name" className="text-c-slate-200 font-medium text-sm">Wallet Name</Label>
            <Input 
              id="wallet-name" 
              defaultValue={transaction?.wallet} 
              className="bg-c-bg-400 border-transparent focus-visible:ring-1 focus-visible:ring-c-emerald-500 text-c-slate-200 h-10" 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-c-slate-200 font-medium text-sm">Amount</Label>
            <Input 
              id="amount" 
              type="number"
              defaultValue={Number(transaction?.amount)} 
              className="bg-c-bg-400 border-transparent focus-visible:ring-1 focus-visible:ring-c-emerald-500 text-c-slate-200 h-10" 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status" className="text-c-slate-200 font-medium text-sm">Status</Label>
            <Select defaultValue={transaction?.status || "Confirmed"}>
              <SelectTrigger className="bg-c-bg-400 w-full border-transparent focus:ring-1 focus:ring-c-emerald-500 text-c-slate-200 h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-c-bg-400 border-c-slate-700 text-c-slate-200">
                <SelectItem 
                  value="Confirmed" 
                  className=" focus:text-white cursor-pointer hover:bg-white/10!"
                >
                  Confirmed
                </SelectItem>
                <SelectItem 
                  value="Awaiting" 
                  className=" focus:text-white cursor-pointer hover:bg-white/10!"
                >
                  Awaiting
                </SelectItem>
                <SelectItem 
                  value="Failed" 
                  className=" focus:text-white cursor-pointer hover:bg-white/10!"
                >
                  Failed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4 sm:justify-end">
          <Button 
            className="bg-c-green-500 hover:bg-c-green-500 text-white px-6 font-semibold" 
            onClick={() => onOpenChange(false)}
          >
            Save
          </Button>
          <Button 
            className="bg-c-red-300 hover:bg-c-red-400 text-white px-6 font-semibold" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}