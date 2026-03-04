import type { Internship } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Database,
  Edit2,
  Loader2,
  Plus,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

// ── Seed Data ──────────────────────────────────────────────────────

const SEED_INTERNSHIPS = [
  {
    company: "Google",
    role: "Software Engineering Intern",
    domain: "Software Engineering",
    skills: ["Python", "Algorithms", "Data Structures"],
    stipend: BigInt(80000),
    location: "Bangalore",
    deadline: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl: "https://careers.google.com/jobs/results/?category=INTERNSHIP",
    source: "LinkedIn",
  },
  {
    company: "Microsoft",
    role: "Frontend Developer Intern",
    domain: "Software Engineering",
    skills: ["React", "TypeScript", "Azure"],
    stipend: BigInt(75000),
    location: "Hyderabad",
    deadline: BigInt(Date.now() + 25 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl: "https://careers.microsoft.com/students/us/en/internships",
    source: "LinkedIn",
  },
  {
    company: "Flipkart",
    role: "Product Management Intern",
    domain: "Marketing",
    skills: ["Product Strategy", "Analytics", "Communication"],
    stipend: BigInt(50000),
    location: "Bangalore",
    deadline: BigInt(Date.now() + 20 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl:
      "https://internshala.com/internships/product-management-internship-in-bangalore",
    source: "Internshala",
  },
  {
    company: "Amazon",
    role: "Data Science Intern",
    domain: "Data Science",
    skills: ["Python", "Machine Learning", "SQL"],
    stipend: BigInt(90000),
    location: "Hyderabad",
    deadline: BigInt(Date.now() + 35 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl: "https://www.amazon.jobs/en/teams/internships-for-students",
    source: "LinkedIn",
  },
  {
    company: "Swiggy",
    role: "UI/UX Design Intern",
    domain: "Design",
    skills: ["Figma", "User Research", "Prototyping"],
    stipend: BigInt(25000),
    location: "Bangalore",
    deadline: BigInt(Date.now() + 18 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl:
      "https://internshala.com/internships/ui-ux-design-internship-in-bangalore",
    source: "Internshala",
  },
  {
    company: "Zomato",
    role: "Digital Marketing Intern",
    domain: "Marketing",
    skills: ["SEO", "Google Ads", "Social Media"],
    stipend: BigInt(15000),
    location: "Delhi",
    deadline: BigInt(Date.now() + 22 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl:
      "https://internshala.com/internships/digital-marketing-internship-in-delhi",
    source: "Internshala",
  },
  {
    company: "Deloitte",
    role: "Finance Analyst Intern",
    domain: "Finance",
    skills: ["Excel", "Financial Modeling", "Accounting"],
    stipend: BigInt(30000),
    location: "Mumbai",
    deadline: BigInt(Date.now() + 28 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl:
      "https://internshala.com/internships/finance-internship-in-mumbai",
    source: "LinkedIn",
  },
  {
    company: "BYJU'S",
    role: "Content Writing Intern",
    domain: "Marketing",
    skills: ["Content Writing", "Research", "SEO"],
    stipend: BigInt(10000),
    location: "Remote",
    deadline: BigInt(Date.now() + 15 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl: "https://internshala.com/internships/content-writing-internship",
    source: "Internshala",
  },
  {
    company: "Infosys",
    role: "Machine Learning Intern",
    domain: "Data Science",
    skills: ["TensorFlow", "Python", "Deep Learning"],
    stipend: BigInt(20000),
    location: "Pune",
    deadline: BigInt(Date.now() + 40 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl: "https://www.infosys.com/careers/global/student-program.html",
    source: "LinkedIn",
  },
  {
    company: "Razorpay",
    role: "Backend Developer Intern",
    domain: "Software Engineering",
    skills: ["Node.js", "REST APIs", "PostgreSQL"],
    stipend: BigInt(40000),
    location: "Bangalore",
    deadline: BigInt(Date.now() + 12 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl:
      "https://internshala.com/internships/backend-developer-internship-in-bangalore",
    source: "Internshala",
  },
  {
    company: "Meesho",
    role: "HR Intern",
    domain: "Human Resources",
    skills: ["Recruitment", "Communication", "MS Office"],
    stipend: BigInt(12000),
    location: "Bangalore",
    deadline: BigInt(Date.now() + 16 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl: "https://internshala.com/internships/hr-internship-in-bangalore",
    source: "Internshala",
  },
  {
    company: "PhonePe",
    role: "Graphic Design Intern",
    domain: "Design",
    skills: ["Adobe Illustrator", "Canva", "Brand Design"],
    stipend: BigInt(18000),
    location: "Bangalore",
    deadline: BigInt(Date.now() + 21 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
    applyUrl:
      "https://internshala.com/internships/graphic-design-internship-in-bangalore",
    source: "Internshala",
  },
];

// ── Helpers ────────────────────────────────────────────────────────

function deadlineToDateString(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  if (!ms) return "";
  return new Date(ms).toISOString().split("T")[0];
}

function dateStringToNsBigInt(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

function formatDeadline(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Form State ─────────────────────────────────────────────────────

interface InternshipFormData {
  company: string;
  role: string;
  domain: string;
  skills: string;
  stipend: string;
  location: string;
  deadline: string;
  applyUrl: string;
  source: string;
}

const EMPTY_FORM: InternshipFormData = {
  company: "",
  role: "",
  domain: "",
  skills: "",
  stipend: "",
  location: "",
  deadline: "",
  applyUrl: "",
  source: "",
};

function internshipToForm(i: Internship): InternshipFormData {
  return {
    company: i.company,
    role: i.role,
    domain: i.domain,
    skills: i.skills.join(", "),
    stipend: i.stipend.toString(),
    location: i.location,
    deadline: deadlineToDateString(i.deadline),
    applyUrl: i.applyUrl,
    source: i.source,
  };
}

const DOMAINS = [
  "Software Engineering",
  "Data Science",
  "Design",
  "Marketing",
  "Finance",
  "Human Resources",
  "Other",
];

const SOURCES = ["LinkedIn", "Internshala", "Other"];

// ── Add/Edit Form Modal ────────────────────────────────────────────

interface InternshipFormModalProps {
  open: boolean;
  onClose: () => void;
  editTarget: Internship | null;
  onSuccess: () => void;
}

function InternshipFormModal({
  open,
  onClose,
  editTarget,
  onSuccess,
}: InternshipFormModalProps) {
  const { actor } = useActor();
  const [form, setForm] = useState<InternshipFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<InternshipFormData>>({});

  useEffect(() => {
    if (open) {
      setForm(editTarget ? internshipToForm(editTarget) : EMPTY_FORM);
      setErrors({});
    }
  }, [open, editTarget]);

  const isEdit = !!editTarget;

  const validate = (): boolean => {
    const newErrors: Partial<InternshipFormData> = {};
    if (!form.company.trim()) newErrors.company = "Required";
    if (!form.role.trim()) newErrors.role = "Required";
    if (!form.domain.trim()) newErrors.domain = "Required";
    if (!form.location.trim()) newErrors.location = "Required";
    if (!form.deadline) newErrors.deadline = "Required";
    if (!form.applyUrl.trim()) newErrors.applyUrl = "Required";
    if (!form.source.trim()) newErrors.source = "Required";
    const stipendNum = Number(form.stipend);
    if (Number.isNaN(stipendNum) || stipendNum < 0)
      newErrors.stipend = "Must be a non-negative number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const skills = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const stipend = BigInt(Math.round(Number(form.stipend) || 0));
      const deadline = dateStringToNsBigInt(form.deadline);
      const domainValue = form.domain === "Other" ? form.domain : form.domain;
      const sourceValue = form.source === "Other" ? form.source : form.source;

      if (isEdit && editTarget) {
        await actor.updateInternship(
          editTarget.id,
          form.company.trim(),
          form.role.trim(),
          domainValue.trim(),
          skills,
          stipend,
          form.location.trim(),
          deadline,
          form.applyUrl.trim(),
          sourceValue.trim(),
        );
      } else {
        await actor.addInternship(
          form.company.trim(),
          form.role.trim(),
          domainValue.trim(),
          skills,
          stipend,
          form.location.trim(),
          deadline,
          form.applyUrl.trim(),
          sourceValue.trim(),
        );
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Internship updated!" : "Internship added!");
      onSuccess();
      onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error(
        isEdit
          ? "Failed to update internship. Please try again."
          : "Failed to add internship. Please try again.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate();
    }
  };

  const set = (key: keyof InternshipFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="admin.add_form.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Internship" : "Add New Internship"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the internship details below."
              : "Fill in the details to add a new internship listing."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Row 1: Company + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-company">Company *</Label>
              <Input
                id="admin-company"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="e.g. Google"
                data-ocid="admin.add_form.input"
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-role">Role *</Label>
              <Input
                id="admin-role"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Row 2: Domain + Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Domain *</Label>
              <Select
                value={form.domain}
                onValueChange={(v) => set("domain", v)}
              >
                <SelectTrigger data-ocid="admin.add_form.select">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.domain && (
                <p className="text-xs text-destructive">{errors.domain}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Source *</Label>
              <Select
                value={form.source}
                onValueChange={(v) => set("source", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-xs text-destructive">{errors.source}</p>
              )}
            </div>
          </div>

          {/* Row 3: Location + Stipend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-location">Location *</Label>
              <Input
                id="admin-location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Bangalore, Remote"
              />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-stipend">Stipend (₹/month)</Label>
              <Input
                id="admin-stipend"
                type="number"
                min="0"
                value={form.stipend}
                onChange={(e) => set("stipend", e.target.value)}
                placeholder="e.g. 15000"
              />
              {errors.stipend && (
                <p className="text-xs text-destructive">{errors.stipend}</p>
              )}
            </div>
          </div>

          {/* Row 4: Deadline + Apply URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-deadline">Deadline *</Label>
              <Input
                id="admin-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
              {errors.deadline && (
                <p className="text-xs text-destructive">{errors.deadline}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-apply-url">Apply URL *</Label>
              <Input
                id="admin-apply-url"
                type="url"
                value={form.applyUrl}
                onChange={(e) => set("applyUrl", e.target.value)}
                placeholder="https://..."
              />
              {errors.applyUrl && (
                <p className="text-xs text-destructive">{errors.applyUrl}</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <Label htmlFor="admin-skills">Skills (comma-separated)</Label>
            <Input
              id="admin-skills"
              value={form.skills}
              onChange={(e) => set("skills", e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple skills with commas
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
              data-ocid="admin.add_form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-ocid="admin.add_form.submit_button"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Adding..."}
                </>
              ) : isEdit ? (
                "Update Internship"
              ) : (
                "Add Internship"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation Dialog ─────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  internshipName: string;
}

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  internshipName,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="admin.delete_confirm.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Internship
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{internshipName}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            data-ocid="admin.delete_confirm.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            data-ocid="admin.delete_confirm.confirm_button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────

export function AdminPage() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckDone, setAdminCheckDone] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Internship | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Internship | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedInternships = async () => {
    if (!actor || !isAdmin) return;
    setIsSeeding(true);
    try {
      for (const item of SEED_INTERNSHIPS) {
        await actor.addInternship(
          item.company,
          item.role,
          item.domain,
          item.skills,
          item.stipend,
          item.location,
          item.deadline,
          item.applyUrl,
          item.source,
        );
      }
      toast.success("12 internships added successfully!");
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      queryClient.invalidateQueries({ queryKey: ["admin-internships"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to seed internships. Some may have been added.");
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      queryClient.invalidateQueries({ queryKey: ["admin-internships"] });
    } finally {
      setIsSeeding(false);
    }
  };

  // Check admin status once actor is ready
  useEffect(() => {
    if (!actor || isFetching) return;
    let cancelled = false;
    actor
      .isCallerAdmin()
      .then((result) => {
        if (!cancelled) {
          setIsAdmin(result);
          setAdminCheckDone(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false);
          setAdminCheckDone(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const {
    data: internships = [],
    isLoading: internshipsLoading,
    error: internshipsError,
  } = useQuery<Internship[]>({
    queryKey: ["admin-internships"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInternships();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteInternship(id);
    },
    onSuccess: () => {
      toast.success("Internship deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-internships"] });
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete internship. Please try again.");
    },
  });

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-internships"] });
    queryClient.invalidateQueries({ queryKey: ["internships"] });
  };

  const openAddForm = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEditForm = (internship: Internship) => {
    setEditTarget(internship);
    setFormOpen(true);
  };

  // ── Loading admin check ──────────────────────────────────────────
  if (!adminCheckDone || isFetching) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          <p className="text-sm text-muted-foreground">Checking permissions…</p>
        </div>
      </div>
    );
  }

  // ── Access denied ────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-background flex items-center justify-center px-4"
        data-ocid="admin.access_denied.panel"
      >
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to view the admin panel. Please contact a
            platform administrator to request access.
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Admin panel ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 lg:top-0 z-30">
        <div className="px-4 lg:px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">
              {internshipsLoading
                ? "Loading internships…"
                : `${internships.length} total listing${internships.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={handleSeedInternships}
                disabled={isSeeding}
                className="flex items-center gap-2"
                data-ocid="admin.seed_internships_button"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Seed Internships
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={openAddForm}
              className="flex items-center gap-2"
              data-ocid="admin.add_internship_button"
            >
              <Plus className="h-4 w-4" />
              Add Internship
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-5">
        {internshipsLoading ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
            <p className="text-sm text-muted-foreground">
              Loading internships…
            </p>
          </div>
        ) : internshipsError ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="admin.error_state"
          >
            <AlertTriangle className="h-8 w-8 text-destructive/60" />
            <p className="text-sm text-muted-foreground">
              Failed to load internships. Please refresh and try again.
            </p>
          </div>
        ) : internships.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="admin.empty_state"
          >
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No internships yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              Add your first internship listing using the button above.
            </p>
            <Button onClick={openAddForm} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Internship
            </Button>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table data-ocid="admin.table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    Domain
                  </TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    Stipend
                  </TableHead>
                  <TableHead className="font-semibold hidden xl:table-cell">
                    Deadline
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    Source
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internships.map((internship, index) => (
                  <TableRow
                    key={internship.id}
                    className="group"
                    data-ocid={`admin.internship.row.${index + 1}`}
                  >
                    <TableCell className="font-medium">
                      {internship.company}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {internship.role}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                        {internship.domain}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {internship.location}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {internship.stipend > 0
                        ? `₹${Number(internship.stipend).toLocaleString("en-IN")}/mo`
                        : "Unpaid"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {formatDeadline(internship.deadline)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 ${
                          internship.source === "LinkedIn"
                            ? "badge-linkedin"
                            : "badge-internshala"
                        }`}
                      >
                        {internship.source}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openEditForm(internship)}
                          aria-label={`Edit ${internship.company} – ${internship.role}`}
                          data-ocid={`admin.internship.edit_button.${index + 1}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(internship)}
                          aria-label={`Delete ${internship.company} – ${internship.role}`}
                          data-ocid={`admin.internship.delete_button.${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add / Edit form modal */}
      <InternshipFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editTarget={editTarget}
        onSuccess={handleFormSuccess}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isPending={deleteMutation.isPending}
        internshipName={
          deleteTarget ? `${deleteTarget.company} – ${deleteTarget.role}` : ""
        }
      />
    </div>
  );
}
