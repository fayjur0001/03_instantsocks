"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Shuffle,
  ShoppingCart,
  Lock,
} from "lucide-react";
import { ProxySidebarProps } from "@/types/admin/socks5-proxy-ips";
import { randomStr, toFlagEmoji } from "@/lib/helpers";

const socks5Schema = z.object({
  username: z.string().min(3, "Min 3 characters"),
  password: z.string().min(6, "Min 6 characters"),
});
type Socks5Values = z.infer<typeof socks5Schema>;


function ProxySidebar({ proxy, cartCount, onShowCart }: ProxySidebarProps) {
  const [showUser, setShowUser] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  const form = useForm<Socks5Values>({
    resolver: zodResolver(socks5Schema),
    defaultValues: { username: "", password: "" },
  });

  const onSave = (data: Socks5Values) => {
    // Replace with your API call
    console.log("Socks5 auth saved:", data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRandom = () => {
    form.setValue("username", randomStr(8));
    form.setValue("password", randomStr(12));
  };

  return (
    <div className="flex flex-col h-full bg-c-bg-900 border-l border-c-slate-800/60 text-[13px]">

      {/* Cart header */}
      <div className="px-4 pt-2 pb-2 border-b border-c-slate-800/60">
        <button
          onClick={onShowCart}
          className="flex items-center gap-2 w-full text-left group"
        >
          <ShoppingCart size={13} className="text-c-slate-500 shrink-0" />
          {cartCount === 0 ? (
            <span className="text-c-slate-500 font-medium">Cart Empty</span>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-c-emerald-500 font-bold">
                Cart {cartCount} {cartCount === 1 ? "Proxy" : "Proxies"}
              </span>
              <span className="ml-auto bg-c-emerald-600 group-hover:bg-c-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors uppercase tracking-tighter">
                Show
              </span>
            </div>
          )}
        </button>
      </div>

      {!proxy ? (
        /* Empty state */
        <div className="flex-1 p-4">
          <p className="text-c-slate-500 italic">Click a proxy to view details</p>
          <div className="mt-8 border-t border-c-slate-800/40 pt-4">
            <p className="text-[11px] text-c-slate-600 mb-2">MyProxies</p>
            <div className="flex items-center gap-1.5 text-c-slate-700 text-[11px] font-mono bg-c-slate-900/30 p-2 rounded border border-c-slate-800/20">
              <Lock size={10} />
              <span>216.22.49.36:47349</span>
            </div>
          </div>
        </div>
      ) : (
        /* Proxy selected */
        <div className="flex-1 overflow-y-auto">

          {/* Info block */}
          <div className="p-4 border-b border-c-slate-800/60">
            <p className="text-[10px] text-c-emerald-500 uppercase tracking-[0.1em] font-bold mb-2">
              Info
            </p>
            <div className="space-y-1 text-c-slate-400 leading-relaxed">
              <p className="text-c-slate-100 font-bold text-[15px] flex items-center gap-1">
                {toFlagEmoji(proxy.countryCode)} {proxy.country}
              </p>
              <p className="text-[12px] opacity-80">{proxy.state}, {proxy.city}</p>

              <div className="grid grid-cols-1 gap-y-1 pt-1 border-t border-c-slate-800/40 mt-1">
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">Domain</span> <span className="text-c-slate-300 font-mono truncate ml-4">{proxy.domain}</span></p>
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">ORG</span> <span className="text-c-slate-300 truncate ml-4">{proxy.org}</span></p>
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">ISP</span> <span className="text-c-slate-300 truncate ml-4">{proxy.isp}</span></p>
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">Zone</span> <span className="text-c-slate-300 ml-4">{proxy.zone}</span></p>
              </div>

              <div className="grid grid-cols-1 gap-y-1 pt-1 border-t border-c-slate-800/40 mt-1">
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">Added</span> <span className="text-c-slate-300">{proxy.added}</span></p>
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">Type</span> <span className="text-c-emerald-500 font-semibold">{proxy.type}</span></p>
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">Ping</span> <span className="text-c-slate-300">{proxy.ping}ms</span></p>
                <p className="flex justify-between">
                  <span className="text-[11px] uppercase text-c-slate-500">Blacklisted</span>
                  <span className={proxy.blacklisted ? "text-c-red-400" : "text-c-emerald-400"}>
                    {proxy.blacklisted ? "Yes" : "No"}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-y-1 pt-1 border-t border-c-slate-800/40 mt-1">
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">IP</span> <span className="text-c-slate-300 font-mono">{proxy.ip}</span></p>
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">Speed</span> <span className="text-c-slate-300">{proxy.speed}</span></p>
                <p className="flex justify-between">
                  <span className="text-[11px] uppercase text-c-slate-500">DNS</span>
                  <span className="text-c-slate-300">{toFlagEmoji(proxy.countryCode)} {proxy.dns}</span>
                </p>
                <p className="flex justify-between"><span className="text-[11px] uppercase text-c-slate-500">Usage</span> <span className="text-c-slate-300">{proxy.usage}</span></p>
              </div>
            </div>
          </div>

          {/* Connection string */}
          <div className="p-4 border-b border-c-slate-800/60 bg-emerald-950/5">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart size={11} className="text-c-slate-500" />
              <span className="text-[11px] text-c-slate-500">MyProxies</span>
            </div>
            <div className="flex items-center gap-1.5 text-c-slate-500 bg-c-slate-900/60 rounded px-2 py-1.5">
              <Lock size={11} className="shrink-0" />
              <span className="font-mono text-[11px] break-all">
                {proxy.connectionString}
              </span>
            </div>
          </div>

          {/* ── Socks5 Auth Form (Zod + React Hook Form) ── */}
          <div className="p-4">
            <p className="text-[10px] text-c-emerald-500 uppercase tracking-[0.1em] font-bold mb-2">
              Socks5 Auth
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSave)}
                className="space-y-3"
              >
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <p className="text-[11px] text-c-slate-500 mb-1 font-medium">
                        Username
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showUser ? "text" : "password"}
                            placeholder="••••••••••••••"
                            className="bg-c-slate-900 border-c-slate-700/80 text-c-slate-200 text-[12px] h-8 pr-8 placeholder:text-c-slate-600 focus:border-c-emerald-700"
                          />
                          <button
                            type="button"
                            onClick={() => setShowUser((p) => !p)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-c-slate-500 hover:text-c-slate-300 transition-colors"
                          >
                            {showUser ? (
                              <EyeOff size={13} />
                            ) : (
                              <Eye size={13} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px] text-c-red-400" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <p className="text-[11px] text-c-slate-500 mb-1 font-medium">
                        Password
                      </p>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPass ? "text" : "password"}
                            placeholder="••••••••••••••"
                            className="bg-c-slate-900 border-c-slate-700/80 text-c-slate-200 text-[12px] h-8 pr-8 placeholder:text-c-slate-600 focus:border-c-emerald-700"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((p) => !p)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-c-slate-500 hover:text-c-slate-300 transition-colors"
                          >
                            {showPass ? (
                              <EyeOff size={13} />
                            ) : (
                              <Eye size={13} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px] text-c-red-400" />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRandom}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-c-slate-800/50 hover:bg-c-slate-800 text-c-slate-300 rounded-md transition-colors font-medium border border-c-slate-700/50"
                  >
                    <Shuffle size={11} />
                    Random
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-1.5 text-[12px] bg-c-emerald-600 hover:bg-c-emerald-500 text-white rounded-md transition-colors font-semibold"
                  >
                    {saved ? "Saved ✓" : "Save"}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProxySidebar