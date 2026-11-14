"use client";
/* eslint-disable @next/next/no-img-element */

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
} from "lucide-react";

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your administrator email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Please enter a valid email address (for example, name@studio.com).";
  }
  return null;
}

function AdminLoginWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextHref = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.session?.email) {
          setSignedInEmail(data.session.email);
          setEmail(data.session.email);
        } else if (data?.devEmailHint) {
          setEmail(data.devEmailHint);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailErr = validateEmail(email);
    const passwordErr = !password.trim()
      ? "Please enter your administrator password."
      : null;

    if (emailErr || passwordErr) {
      setFieldErrors({
        email: emailErr ?? undefined,
        password: passwordErr ?? undefined,
      });
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErrorMessage(
          data?.error ||
            "Invalid administrator credentials. Please verify your email and password."
        );
        return;
      }
      router.push(nextHref.startsWith("/admin") ? nextHref : "/admin");
      router.refresh();
    } catch {
      setErrorMessage(
        "Unable to reach the authentication service. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOutCurrent = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setSignedInEmail(null);
    setPassword("");
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] flex flex-col lg:flex-row">
      {/* Left Architectural Editorial Visual Panel */}
      <div className="relative h-60 sm:h-72 lg:h-auto lg:w-[45%] lg:min-h-screen shrink-0 overflow-hidden bg-[#2C2521]">
        <img
          src="/images/atelier/admin-login-studio-arch.jpg"
          alt="Warm sunlit Venetian plaster arch framing a hand-crafted botanical mineral wall mural inside ATELIER — WALL STORY"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(24,19,17,0.88) 0%, rgba(24,19,17,0.36) 52%, rgba(24,19,17,0.12) 100%)",
          }}
        />

        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-[#FFFDF9]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FFFDF9]/25 bg-[#1A1A1A]/35 backdrop-blur-sm px-3.5 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#FFFDF9]">
              Mumbai Architectural Studio
            </span>
          </div>

          <div className="max-w-md">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E6C7BA]">
              ATELIER — WALL STORY
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.08] tracking-[-0.02em] text-[#FFFDF9]">
              Welcome to the{" "}
              <span className="italic text-[#F2EAE1]">ATELIER Studio.</span>
            </h1>
            <p className="hidden sm:block mt-3 font-sans text-sm leading-relaxed text-[#FFFDF9]/82">
              Curate wall designs, portfolio installations, editorial stories,
              page content, and client enquiries from one serene workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Right Login Card Container */}
      <div className="flex-1 flex flex-col justify-between px-4 sm:px-8 lg:px-14 py-8 sm:py-12">
        <div className="hidden lg:flex items-center justify-end">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[#746B64] hover:text-[#9B1C1C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </Link>
        </div>

        <div className="my-auto w-full max-w-[440px] mx-auto">
          <div className="rounded-[24px] border border-[#DFD0C0] bg-[#FFFDF9] p-6 sm:p-9 shadow-[0_18px_48px_rgba(32,28,26,0.06)]">
            <div className="pb-6 border-b border-[#E8DED3]">
              <BrandLogo variant="primary" size="md" priority />
            </div>

            <div className="mt-6">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
                Studio Administration
              </p>
              <h2 className="mt-1.5 font-serif text-3xl font-normal tracking-[-0.02em] text-[#1A1A1A]">
                Welcome Back.
              </h2>
              <p className="mt-1.5 font-sans text-sm text-[#746B64]">
                Sign in with your administrator account to continue.
              </p>
            </div>

            {signedInEmail ? (
              <div className="mt-6 rounded-2xl border border-[#C9DBC9] bg-[#E9F0EA]/65 p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-[#264E32]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-sans text-xs font-semibold">
                      Active Session: {signedInEmail}
                    </p>
                    <p className="mt-0.5 font-sans text-xs text-[#385E42]">
                      Your administrator session is currently active.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href={nextHref.startsWith("/admin") ? nextHref : "/admin"}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#9B1C1C] px-4 py-2 font-sans text-xs font-medium text-[#FFFDF9] hover:bg-[#801619] transition-colors"
                  >
                    <span>Open Studio Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOutCurrent}
                    className="inline-flex items-center rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3.5 py-2 font-sans text-xs font-medium text-[#574F49] hover:text-[#1A1A1A] cursor-pointer transition-colors"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            ) : null}

            {errorMessage ? (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-[#9B1C1C]/30 bg-[#9B1C1C]/[0.07] p-4"
              >
                <div className="flex items-start gap-2.5 text-[#9B1C1C]">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-xs font-semibold">
                      Unable to Sign In
                    </p>
                    <p className="mt-0.5 font-sans text-xs leading-relaxed text-[#7A1818]">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <form
              noValidate
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="admin-email"
                  className="block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#746B64] mb-2"
                >
                  Email Address
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "admin-email-error" : undefined
                  }
                  placeholder="studio@atelierwallstory.com"
                  className={`w-full h-12 rounded-xl border px-4 font-sans text-sm text-[#1A1A1A] placeholder:text-[#746B64]/65 transition-colors focus:outline-none ${
                    fieldErrors.email
                      ? "border-[#9B1C1C] bg-[#FFF5F5]"
                      : "border-[#DFD0C0] bg-[#F6F1EA] hover:border-[#CDB8A4] focus:border-[#9B1C1C] focus:bg-[#FFFDF9]"
                  }`}
                />
                {fieldErrors.email ? (
                  <p
                    id="admin-email-error"
                    role="alert"
                    className="mt-1.5 font-sans text-xs text-[#9B1C1C]"
                  >
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#746B64] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? "admin-password-error" : undefined
                    }
                    placeholder="Enter studio password"
                    className={`w-full h-12 rounded-xl border pl-4 pr-11 font-sans text-sm text-[#1A1A1A] placeholder:text-[#746B64]/65 transition-colors focus:outline-none ${
                      fieldErrors.password
                        ? "border-[#9B1C1C] bg-[#FFF5F5]"
                        : "border-[#DFD0C0] bg-[#F6F1EA] hover:border-[#CDB8A4] focus:border-[#9B1C1C] focus:bg-[#FFFDF9]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#746B64] hover:text-[#1A1A1A] hover:bg-[#EFE6DC] cursor-pointer transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p
                    id="admin-password-error"
                    role="alert"
                    className="mt-1.5 font-sans text-xs text-[#9B1C1C]"
                  >
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#9B1C1C] hover:bg-[#801619] text-[#FFFDF9] font-sans text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_6px_18px_rgba(155,28,28,0.2)]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 text-center lg:text-left flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[440px] mx-auto w-full font-sans text-xs text-[#746B64]">
          <span>Protected by ATELIER Studio session cookies</span>
          <Link
            href="/"
            className="lg:hidden inline-flex items-center gap-1.5 font-medium text-[#9B1C1C] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center font-sans text-sm text-[#746B64]">
          Loading studio sign-in…
        </div>
      }
    >
      <AdminLoginWorkspace />
    </Suspense>
  );
}
