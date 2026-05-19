"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, Eye, EyeOff, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetPasswordPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  const currentYear = new Date().getFullYear();

  const togglePasswordVisibility = (): void => setShowPassword((p) => !p);
  const toggleConfirmPasswordVisibility = (): void =>
    setShowConfirmPassword((p) => !p);

  // Simple strength check
  const getStrength = (
    pwd: string
  ): { label: string; color: string; width: string } => {
    if (pwd.length === 0)
      return { label: "", color: "bg-zinc-700", width: "w-0" };
    if (pwd.length < 6)
      return { label: "Too short", color: "bg-red-500", width: "w-1/4" };
    if (pwd.length < 8)
      return { label: "Weak", color: "bg-c-orange-500", width: "w-2/4" };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
      return { label: "Fair", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-c-green-400", width: "w-full" };
  };

  const strength = getStrength(password);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setSubmitted(true);
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
            Fresh Start
          </div>
          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Back in control.
          </h2>
          <p className="text-lg xl:text-xl text-zinc-600 font-medium">
            Your account is secured and ready to go with your new credentials.
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
          <div className="bg-[#121214] border border-white/10 p-4 lg:p-6 sm:p-8 rounded-2xl shadow-2xl w-full backdrop-blur-xl">
            
            {!submitted ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2">
                    Create a new password
                  </h1>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Your new password must be different from your previous
                    passwords. Choose something strong and memorable — you&apos;ll
                    need it every time you sign in.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      New Password
                    </Label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-5 h-5 text-zinc-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-12 pr-10 bg-black/50 border-white/10 focus-visible:ring-1 focus-visible:ring-c-green-400 text-white h-12 rounded-xl transition-all"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {password.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                          />
                        </div>
                        <p className="text-xs text-zinc-500">
                          Strength:{" "}
                          <span
                            className={`font-medium ${
                              strength.label === "Strong"
                                ? "text-c-green-400"
                                : strength.label === "Fair"
                                ? "text-yellow-400"
                                : strength.label === "Weak"
                                ? "text-c-orange-500"
                                : "text-red-500"
                            }`}
                          >
                            {strength.label}
                          </span>
                          {strength.label !== "Strong" && (
                            <span className="ml-1 text-zinc-600">
                              — use 8+ chars, uppercase & numbers
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      Confirm New Password
                    </Label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-5 h-5 text-zinc-500" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-12 pr-10 bg-black/50 border-white/10 focus-visible:ring-1 focus-visible:ring-c-green-400 text-white h-12 rounded-xl transition-all"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {/* Match indicator */}
                    {confirmPassword.length > 0 && (
                      <p
                        className={`text-xs font-medium pt-1 ${
                          password === confirmPassword
                            ? "text-c-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {password === confirmPassword
                          ? "✓ Passwords match"
                          : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  {/* Inline error */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-sm font-medium text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 space-y-5">
                    <Button
                      type="submit"
                      className="w-full bg-c-green-400 hover:bg-c-green-500 text-[#09090b] font-bold text-base h-12 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] transition-all duration-300"
                    >
                      Set New Password
                    </Button>

                    <div className="flex items-center justify-center">
                      <Link
                        href="/login"
                        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                      </Link>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center w-full py-6">
                <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-c-green-400/10 border border-c-green-400/30 mx-auto shadow-[0_0_30px_rgba(74,222,128,0.15)]">
                  <CheckCircle2 className="w-8 h-8 text-c-green-400" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-3">
                  Password updated!
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                  Your password has been reset successfully. You can now sign in
                  to your RepeatSMS account with your new password.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 max-w-md mx-auto">
                  <p className="text-zinc-300 text-xs leading-relaxed">
                    <strong className="text-white">Security Note:</strong> For your protection, all other active sessions across your devices have been securely signed out.
                  </p>
                </div>
                <Link href="/login" className="block w-full max-w-sm mx-auto">
                  <Button className="w-full bg-c-green-400 hover:bg-c-green-500 text-[#09090b] font-bold text-base h-12 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] transition-all duration-300">
                    Continue to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}