import { UserRole } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  Bookmark,
  CheckCircle2,
  Edit3,
  Loader2,
  LogOut,
  Save,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useApplications,
  useBookmarks,
  useSaveUserProfile,
  useUserProfile,
} from "../hooks/useQueries";

export function ProfilePage() {
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: bookmarkIds = [] } = useBookmarks();
  const { data: applicationIds = [] } = useApplications();
  const saveProfile = useSaveUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isGrantingAdmin, setIsGrantingAdmin] = useState(false);
  const [adminGranted, setAdminGranted] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      setEditName(profile.name);
    }
  }, [profile]);

  useEffect(() => {
    if (!actor || isFetching) return;
    let cancelled = false;
    actor
      .isCallerAdmin()
      .then((result) => {
        if (!cancelled) setIsAdmin(result);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const handleGrantAdmin = async () => {
    if (!actor || !identity) return;
    setIsGrantingAdmin(true);
    try {
      await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.admin);
      setAdminGranted(true);
      setIsAdmin(true);
      toast.success("Admin access granted! Refresh the page.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to grant admin access.");
    } finally {
      setIsGrantingAdmin(false);
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    await saveProfile.mutateAsync({ name: editName.trim() });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditName(profile?.name ?? "");
      setIsEditing(false);
    }
  };

  const principal = identity?.getPrincipal().toString();
  const displayName = profile?.name || "Student";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-4 lg:px-6 py-5">
          <h1 className="font-display text-xl font-bold text-foreground">
            Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your account settings
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto space-y-5">
        {/* ── Avatar + Identity ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-2xl border p-6"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-display font-bold text-white flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.42 0.22 264), oklch(0.38 0.18 280))",
              }}
            >
              {profileLoading ? (
                <User className="h-7 w-7 text-white/80" />
              ) : (
                initials || <User className="h-7 w-7" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {profileLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold text-foreground truncate">
                    {displayName}
                  </h2>
                  {principal && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                      {principal.slice(0, 16)}…{principal.slice(-8)}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      <Award className="h-3 w-3" />
                      Student
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stats ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="grid grid-cols-2 gap-4"
        >
          <div
            className="bg-card rounded-2xl border p-5 flex items-center gap-4"
            data-ocid="profile.applications_count"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-foreground">
                {applicationIds.length}
              </div>
              <div className="text-xs text-muted-foreground">Applications</div>
            </div>
          </div>
          <div
            className="bg-card rounded-2xl border p-5 flex items-center gap-4"
            data-ocid="profile.bookmarks_count"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-foreground">
                {bookmarkIds.length}
              </div>
              <div className="text-xs text-muted-foreground">Saved</div>
            </div>
          </div>
        </motion.div>

        {/* ── Edit Profile ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="bg-card rounded-2xl border p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-base font-semibold text-foreground">
              Profile Settings
            </h3>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setEditName(profile?.name ?? "");
                  setIsEditing(true);
                }}
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Display Name</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your name"
                    className="h-10 flex-1"
                    autoFocus
                    data-ocid="profile.name_input"
                  />
                  <Button
                    size="sm"
                    className="h-10"
                    onClick={handleSave}
                    disabled={saveProfile.isPending || !editName.trim()}
                    data-ocid="profile.save_button"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.42 0.22 264), oklch(0.38 0.18 280))",
                      color: "white",
                    }}
                  >
                    {saveProfile.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10"
                    onClick={() => {
                      setEditName(profile?.name ?? "");
                      setIsEditing(false);
                    }}
                    data-ocid="profile.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="h-10 flex items-center px-3 rounded-lg bg-muted/50 border border-border text-sm">
                  {profileLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <span className="text-foreground">
                      {profile?.name || (
                        <span className="text-muted-foreground italic">
                          Not set
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>

            {principal && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Principal ID</Label>
                <div className="h-10 flex items-center px-3 rounded-lg bg-muted/50 border border-border text-xs font-mono text-muted-foreground overflow-hidden">
                  <span className="truncate">{principal}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Admin Access ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card rounded-2xl border p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-semibold text-foreground">
              Admin Access
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Grant yourself admin privileges to manage internship listings from
            the admin panel.
          </p>

          {isAdmin === null ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking permissions…
            </div>
          ) : isAdmin || adminGranted ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <ShieldCheck className="h-4 w-4" />
              You already have admin access.
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60"
              onClick={handleGrantAdmin}
              disabled={isGrantingAdmin || adminGranted}
              data-ocid="profile.grant_admin_button"
            >
              {isGrantingAdmin ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Granting…
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Grant Admin Access
                </>
              )}
            </Button>
          )}
        </motion.div>

        {/* ── Danger Zone ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.28 }}
          className="bg-card rounded-2xl border border-destructive/20 p-6"
        >
          <h3 className="font-display text-base font-semibold text-foreground mb-1">
            Session
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out from your current session.
          </p>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60"
            onClick={clear}
            data-ocid="profile.logout_button"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-4"
          >
            Built with ♥ using caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}
