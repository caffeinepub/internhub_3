import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Star, UserPlus, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function SignupPage() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();
  const [_username, setUsername] = useState("");
  const [_email, setEmail] = useState("");
  const [_password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const perks = [
    "Browse 500+ internship listings",
    "Bookmark and track applications",
    "Get deadline alerts",
    "Free for students",
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left Panel (form) ──────────────────────────────── */}
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
                Create your account
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Join thousands of students finding their dream internships
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
                for secure, password-free authentication. Click "Create Account"
                to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="yourname"
                  value={_username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10"
                  autoComplete="username"
                  data-ocid="signup.username_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  value={_email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  autoComplete="email"
                  data-ocid="signup.email_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a strong password"
                  value={_password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                  autoComplete="new-password"
                  data-ocid="signup.password_input"
                />
              </div>

              {isLoginError && loginError && (
                <div
                  className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
                  data-ocid="signup.error_state"
                >
                  {loginError.message || "Sign up failed. Please try again."}
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
                data-ocid="signup.submit_button"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline underline-offset-4"
                data-ocid="signup.login_link"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel (decorative) ─────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-intern-gradient p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-amber-300 blur-3xl" />
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
        <div className="relative z-10 space-y-6">
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Your career journey
            <br />
            starts <span className="text-amber-300">here</span>.
          </h1>
          <div className="space-y-3">
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-300/20 border border-amber-300/40">
                  <Star
                    className="h-3 w-3 text-amber-300"
                    fill="currentColor"
                  />
                </div>
                <span className="text-white/80 text-sm">{perk}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-white/50 text-sm">
            Powered by Internet Computer Protocol — your data, your control.
          </p>
        </div>
      </div>
    </div>
  );
}
