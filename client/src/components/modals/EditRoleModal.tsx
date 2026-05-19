"use client";

import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserData } from "@/app/admin/users/page";

interface RoleModalProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoleModal({ user, open, onOpenChange }: RoleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-c-bg-600 border-c-slate-700 text-c-slate-200 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-normal">
            Change <span className="text-c-emerald-400">{user?.username}&apos;s</span> Role
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select defaultValue={user?.role.toLowerCase()}>
            <SelectTrigger className="bg-c-bg-750 border-c-slate-700 w-full">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent className="bg-c-bg-600 border-c-slate-700 text-c-slate-200">
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            className="bg-c-emerald-500 hover:bg-c-emerald-600 text-white min-w-[80px]"
            onClick={() => onOpenChange(false)}
          >
            Save
          </Button>
          <Button 
            variant="destructive" 
            className="bg-c-orange-600 hover:bg-c-orange-700 min-w-[80px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}