import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogIn, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();
  const [_email, setEmail] = useState("");
  const [_password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left Panel (decorative) ─────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-intern-gradient p-10 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-amber-300 blur-3xl" />
        </div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(0.98 0 0 / 0.08) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 border border-white/30">
            <Zap className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <span className="font-display text-2xl font-bold text-white">
            InternHub
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-4">
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Land your dream
            <br />
            <span className="text-amber-300">internship</span>
            <br />
            today.
          </h1>
          <p className="text-white/70 text-lg max-w-xs">
            Browse thousands of opportunities from Internshala, LinkedIn, and
            more — all in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "500+", label: "Internships" },
            { value: "50+", label: "Companies" },
            { value: "10k+", label: "Students" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-white/10 rounded-xl p-3 border border-white/20"
            >
              <div className="font-display text-xl font-bold text-white">
                {value}
              </div>
              <div className="text-white/60 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-intern-gradient">
              <Zap className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              InternHub
            </span>
          </div>

          <div className="bg-card rounded-2xl p-8 auth-card-shadow">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Welcome back
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Sign in to access your internship dashboard
              </p>
            </div>

            {/* Internet Identity notice */}
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/10 p-3">
              <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                InternHub uses{" "}
                <span className="font-semibold text-foreground">
                  Internet Identity
                </span>{" "}
                for secure authentication. Click "Sign In" to open the secure
                login popup.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={_email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  autoComplete="email"
                  data-ocid="login.email_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={_password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                  autoComplete="current-password"
                  data-ocid="login.password_input"
                />
              </div>

              {isLoginError && loginError && (
                <div
                  className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
                  data-ocid="login.error_state"
                >
                  {loginError.message || "Login failed. Please try again."}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-10 font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.42 0.22 264), oklch(0.38 0.18 280))",
                  color: "white",
                }}
                data-ocid="login.submit_button"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-primary hover:underline underline-offset-4"
                data-ocid="login.signup_link"
              >
                Create one
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
