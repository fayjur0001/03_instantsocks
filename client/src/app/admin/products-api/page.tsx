"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

// --- Interfaces & Types ---

export interface ActionButtonsProps {
  onReset?: () => void;
  onSave?: () => void;
}

export interface SettingsCardProps extends ActionButtonsProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export interface FormRowProps {
  label?: string;
  children: React.ReactNode;
  alignItems?: "center" | "start";
}

// --- Reusable UI Components ---

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  children,
  onReset,
  onSave,
  className = "",
}) => (
  <div
    className={`bg-c-bg-700 border border-c-slate-800/60 rounded-lg overflow-hidden flex flex-col ${className}`}
  >
    {title && (
      <div className="px-4 py-2 border-b border-c-slate-800/60 bg-c-bg-700">
        <h3 className="text-c-slate-200 text-sm font-medium tracking-wide">
          {title}
        </h3>
      </div>
    )}
    <div className="p-4 flex-1 space-y-4">{children}</div>
    {(onReset || onSave) && (
      <div className="px-4 py-3 border-t border-c-slate-800/60 bg-c-bg-700 flex justify-end gap-3">
        {onReset && (
          <Button
            onClick={onReset}
            variant="secondary"
            className="bg-c-red-500 hover:bg-c-red-400 text-white px-5 h-8 text-sm transition-colors"
          >
            Reset
          </Button>
        )}
        {onSave && (
          <Button
            onClick={onSave}
            className="bg-c-green-500 hover:bg-c-green-600 text-white px-5 h-8 text-sm transition-colors"
          >
            Save
          </Button>
        )}
      </div>
    )}
  </div>
);

const FormRow: React.FC<FormRowProps> = ({
  label,
  children,
  alignItems = "center",
}) => (
  <div
    className={`flex flex-col sm:flex-row sm:items-${alignItems} gap-2 sm:gap-4 w-full`}
  >
    {label && (
      <div className="w-full sm:w-28 shrink-0">
        <label className="text-sm font-medium text-c-slate-400">{label}</label>
      </div>
    )}
    <div className="flex-1 w-full">{children}</div>
  </div>
);

const PasswordInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative w-full">
      <Input
        {...props}
        type={show ? "text" : "password"}
        className="bg-c-bg-800 border-c-slate-700/50 text-c-slate-200 focus-visible:ring-c-emerald-500/50 pr-10 h-9 w-full text-sm"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-c-slate-500 hover:text-c-slate-300 transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
};

const CopyableInput = ({
  value,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        {...props}
        value={value}
        readOnly
        className="bg-c-bg-800 border-c-slate-700/50 text-c-slate-200 pr-10 h-9 w-full font-mono text-sm"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-c-slate-500 hover:text-c-emerald-400 transition-colors"
      >
        {copied ? (
          <Check size={14} className="text-c-emerald-500" />
        ) : (
          <Copy size={14} />
        )}
      </button>
    </div>
  );
};

const StyledInput = ({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <Input
    {...props}
    className={`bg-c-bg-800 border-c-slate-700/50 text-c-slate-200 focus-visible:ring-c-emerald-500/50 h-9 w-full text-sm ${className}`}
  />
);

// --- Main Page Component ---

export default function ConfigurationPage() {
  return (
    <div className="w-full bg-c-bg-900 p-3 md:p-4 font-sans rounded-[12px]">
      <div className="space-y-6">
        {/* Main Tabs Container */}
        <div className="w-full">
          <SettingsCard
            title="Socks5 Proxy"
            onReset={() => {}}
            onSave={() => {}}
          >
            <div className="space-y-3">
              <FormRow label="API Key">
                <PasswordInput defaultValue="socks5apikey123" />
              </FormRow>
              <FormRow label="Commission">
                <div className="w-full sm:w-24">
                  <StyledInput defaultValue="100" type="number" />
                </div>
              </FormRow>
            </div>
          </SettingsCard>
        </div>

        {/* Global/Bottom Section: Callback (Always visible below tabs) */}
        <div className="pt-6 mt-6 border-t border-c-slate-800/80">
          <SettingsCard title="Callback" onReset={() => {}} onSave={() => {}}>
            <div className="space-y-3">
              <FormRow label="Callback Secret">
                <StyledInput defaultValue="rsms" />
              </FormRow>
              <FormRow label="Callback URL">
                <CopyableInput value="https://acc.repeatsms.com/tools/callback?secret=rsms" />
              </FormRow>
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
