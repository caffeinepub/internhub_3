import type { Internship } from "../backend.d";

// ── Deadline helpers ──────────────────────────────────────────────
export function deadlineToMs(deadline: bigint): number {
  return Number(deadline / 1_000_000n);
}

export function deadlineToDate(deadline: bigint): Date {
  return new Date(deadlineToMs(deadline));
}

export function formatDeadline(deadline: bigint): string {
  const date = deadlineToDate(deadline);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntilDeadline(deadline: bigint): number {
  const now = Date.now();
  const deadlineMs = deadlineToMs(deadline);
  return Math.ceil((deadlineMs - now) / 86_400_000);
}

export function isClosingSoon(deadline: bigint, days = 7): boolean {
  const daysLeft = daysUntilDeadline(deadline);
  return daysLeft >= 0 && daysLeft <= days;
}

export function isExpired(deadline: bigint): boolean {
  return daysUntilDeadline(deadline) < 0;
}

// ── Stipend formatting ────────────────────────────────────────────
export function formatStipend(stipend: bigint): string {
  if (stipend === 0n) return "Unpaid";
  const amount = Number(stipend);
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k/mo`;
  }
  return `₹${amount}/mo`;
}

export function getStipendRange(
  stipend: bigint,
): "unpaid" | "0-5k" | "5-15k" | "15k+" {
  const amount = Number(stipend);
  if (amount === 0) return "unpaid";
  if (amount <= 5000) return "0-5k";
  if (amount <= 15000) return "5-15k";
  return "15k+";
}

// ── Duplicate detection ───────────────────────────────────────────
export function deduplicateInternships(
  internships: Internship[],
): Internship[] {
  const seen = new Map<string, Internship>();
  for (const internship of internships) {
    const key = `${internship.company.toLowerCase().trim()}|${internship.role.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.set(key, internship);
    }
  }
  return Array.from(seen.values());
}

// ── Filter helpers ────────────────────────────────────────────────
export interface FilterState {
  search: string;
  domain: string;
  skills: string;
  location: string;
  stipend: string;
  source: string;
}

export function filterInternships(
  internships: Internship[],
  filters: FilterState,
): Internship[] {
  return internships.filter((intern) => {
    // Search by role or company
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !intern.role.toLowerCase().includes(q) &&
        !intern.company.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    // Domain filter
    if (filters.domain && filters.domain !== "all") {
      if (intern.domain.toLowerCase() !== filters.domain.toLowerCase()) {
        return false;
      }
    }

    // Skills filter
    if (filters.skills) {
      const skillQuery = filters.skills.toLowerCase();
      if (!intern.skills.some((s) => s.toLowerCase().includes(skillQuery))) {
        return false;
      }
    }

    // Location filter
    if (filters.location && filters.location !== "all") {
      if (
        !intern.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
    }

    // Stipend filter
    if (filters.stipend && filters.stipend !== "all") {
      const range = getStipendRange(intern.stipend);
      if (range !== filters.stipend) return false;
    }

    // Source filter
    if (filters.source && filters.source !== "all") {
      if (intern.source.toLowerCase() !== filters.source.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

// ── Unique values ─────────────────────────────────────────────────
export function getUniqueDomains(internships: Internship[]): string[] {
  return Array.from(new Set(internships.map((i) => i.domain))).sort();
}

export function getUniqueLocations(internships: Internship[]): string[] {
  return Array.from(new Set(internships.map((i) => i.location))).sort();
}
