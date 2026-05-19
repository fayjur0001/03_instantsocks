"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, Eye, EyeOff, User, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LoginPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-[#09090b] selection:bg-c-green-400/30">
      {/* Left COLUMN - Light/Image Showcase Area */}
      <section className="hidden lg:flex w-full lg:w-[50%] bg-zinc-100 flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[url('/auth-bg.png')] bg-cover bg-center opacity-30 mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-c-orange-500/20 via-transparent to-transparent rounded-full blur-[100px] -translate-y-1/4 translate-x-1/4" />

        <div className="relative z-10 w-full max-w-3xl mx-auto pt-20 px-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-c-orange-500/10 text-c-orange-500 font-semibold text-sm mb-6 border border-c-orange-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-c-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-c-orange-500"></span>
            </span>
            Welcome Back
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Log in to your account.
          </h2>
          <p className="text-lg xl:text-xl text-zinc-600 font-medium">
            Access your dashboard and seamlessly manage your communications with powerful tools designed for modern teams.
          </p>
        </div>

        {/* Floating App Mockup */}
        <div className="flex-1 w-full flex items-center justify-center relative z-10 my-3 lg:my-6">
          <div className="relative w-full max-w-4xl aspect-[16/10]">
            <Image
              src="/auth-3.png"
              alt="RepeatSMS Dashboard Interface"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <footer className="relative z-10 w-full text-center text-sm font-medium text-zinc-500 pb-6">
          &copy; {currentYear} InstantSocks. All Rights Reserved.
        </footer>
      </section>

      {/* Right COLUMN - Dark Form Area with Glow */}
      <section className="relative w-full lg:w-[50%] min-h-screen flex flex-col text-zinc-100 pb-10 lg:pb-0 z-10 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-c-green-400/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/4" />

        {/* Header */}
        <header className="relative flex justify-between items-center p-3 lg:p-6 w-full z-20">
          <Link
            href="https://instantsocks.com"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.webp"
              alt="InstantSocks Logo"
              width={160}
              height={56}
              priority
              className="object-contain"
            />
          </Link>
          <Link
            href="https://instantsocks.com"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 transition-all"
          >
            <Home className="w-4 h-4 text-c-orange-500" />
            <span>Home</span>
          </Link>
        </header>

        {/* Form Card */}
        <div className="relative flex-1 flex flex-col justify-center items-center px-3 lg:px-6 w-full max-w-[700px] mx-auto z-20">
          <div className="bg-[#121214] border border-white/10 p-4 lg:p-6 rounded-2xl shadow-2xl w-full backdrop-blur-xl">
            
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2">
                Welcome Back!
              </h1>
              <p className="text-zinc-400 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-c-orange-500 hover:text-c-orange-400 font-medium hover:underline transition-all"
                >
                  Create Now
                </Link>
              </p>
            </div>

            <form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
              className="space-y-5"
            >
              {/* Email/Username */}
              <div className="space-y-2">
                <Label
                  htmlFor="identifier"
                  className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  Email/Username
                </Label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-5 h-5 text-zinc-500" />
                  <Input
                    id="identifier"
                    placeholder="Email or Username"
                    className="pl-12 bg-black/50 border-white/10 focus-visible:ring-1 focus-visible:ring-c-green-400 focus-visible:border-c-green-400 text-white h-12 rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  Password
                </Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-zinc-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-10 bg-black/50 border-white/10 focus-visible:ring-1 focus-visible:ring-c-green-400 text-white h-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Pin Code */}
              <div className="space-y-2 pt-1">
                <Label
                  htmlFor="pin"
                  className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  Secret Pin Code
                </Label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-4 w-5 h-5 text-zinc-500" />
                  <Input
                    id="pin"
                    placeholder="Enter your secret code"
                    className="pl-12 bg-black/50 border-white/10 focus-visible:ring-1 focus-visible:ring-c-green-400 text-white h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Actions & Utilities */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember"
                    className="mt-0.5 w-5 h-5 border-zinc-600 rounded bg-black/50 data-[state=checked]:bg-c-green-400 data-[state=checked]:border-c-green-400"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-300 transition-colors"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-c-orange-500 hover:text-c-orange-400 hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-c-green-400 hover:bg-c-green-500 text-[#09090b] font-bold text-base h-12 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] transition-all duration-300"
                >
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}