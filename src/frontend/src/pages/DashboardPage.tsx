import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { InternshipCard } from "../components/InternshipCard";
import {
  useAddBookmark,
  useApplications,
  useApplyToInternship,
  useBookmarks,
  useInternships,
  useRemoveBookmark,
} from "../hooks/useQueries";
import {
  type FilterState,
  deduplicateInternships,
  filterInternships,
  getUniqueDomains,
  getUniqueLocations,
} from "../utils/internship";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  domain: "all",
  skills: "",
  location: "all",
  stipend: "all",
  source: "all",
};

function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border p-5 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
      <div className="flex gap-1.5">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const { data: allInternships = [], isLoading: internshipsLoading } =
    useInternships();
  const { data: bookmarkIds = [] } = useBookmarks();
  const { data: applicationIds = [] } = useApplications();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const applyMutation = useApplyToInternship();

  const bookmarkSet = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);
  const applicationSet = useMemo(
    () => new Set(applicationIds),
    [applicationIds],
  );

  // Deduplicate first, then filter
  const deduped = useMemo(
    () => deduplicateInternships(allInternships),
    [allInternships],
  );

  const filtered = useMemo(
    () => filterInternships(deduped, filters),
    [deduped, filters],
  );

  const domains = useMemo(() => getUniqueDomains(deduped), [deduped]);
  const locations = useMemo(() => getUniqueLocations(deduped), [deduped]);

  const hasActiveFilters = useMemo(
    () =>
      Object.entries(filters).some(([k, v]) =>
        k === "search" ? v !== "" : v !== "all",
      ),
    [filters],
  );

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleBookmarkToggle = (id: string, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      removeBookmark.mutate(id);
    } else {
      addBookmark.mutate(id);
    }
  };

  const handleApply = (id: string, applyUrl: string) => {
    applyMutation.mutate({ internshipId: id, applyUrl });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 lg:top-0 z-30">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Internship Board
              </h1>
              <p className="text-xs text-muted-foreground">
                {internshipsLoading
                  ? "Loading..."
                  : `${filtered.length} of ${deduped.length} internships`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto flex items-center gap-2"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search by role or company..."
              className="pl-9 h-10"
              data-ocid="dashboard.search_input"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => updateFilter("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 flex flex-wrap gap-2">
                  {/* Domain */}
                  <Select
                    value={filters.domain}
                    onValueChange={(v) => updateFilter("domain", v)}
                  >
                    <SelectTrigger
                      className="h-8 w-auto min-w-[130px] text-xs"
                      data-ocid="dashboard.domain_select"
                    >
                      <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {domains.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Location */}
                  <Select
                    value={filters.location}
                    onValueChange={(v) => updateFilter("location", v)}
                  >
                    <SelectTrigger
                      className="h-8 w-auto min-w-[130px] text-xs"
                      data-ocid="dashboard.location_select"
                    >
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Stipend */}
                  <Select
                    value={filters.stipend}
                    onValueChange={(v) => updateFilter("stipend", v)}
                  >
                    <SelectTrigger
                      className="h-8 w-auto min-w-[130px] text-xs"
                      data-ocid="dashboard.stipend_select"
                    >
                      <SelectValue placeholder="Stipend" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stipends</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="0-5k">₹0 – ₹5k/mo</SelectItem>
                      <SelectItem value="5-15k">₹5k – ₹15k/mo</SelectItem>
                      <SelectItem value="15k+">₹15k+/mo</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Source */}
                  <Select
                    value={filters.source}
                    onValueChange={(v) => updateFilter("source", v)}
                  >
                    <SelectTrigger
                      className="h-8 w-auto min-w-[120px] text-xs"
                      data-ocid="dashboard.source_select"
                    >
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="Internshala">Internshala</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Skills input */}
                  <div className="relative">
                    <Input
                      value={filters.skills}
                      onChange={(e) => updateFilter("skills", e.target.value)}
                      placeholder="Filter by skill..."
                      className="h-8 w-36 text-xs"
                    />
                  </div>

                  {/* Reset */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={resetFilters}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Internship Grid ───────────────────────────────── */}
      <div className="px-4 lg:px-6 py-5">
        {internshipsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((k) => (
              <CardSkeleton key={k} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="dashboard.empty_state"
          >
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No internships found
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters or search query."
                : "No internships are available yet. Check back soon!"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1.5" />
                Clear filters
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((internship, index) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                isBookmarked={bookmarkSet.has(internship.id)}
                isApplied={applicationSet.has(internship.id)}
                onBookmarkToggle={handleBookmarkToggle}
                onApply={handleApply}
                isBookmarkPending={
                  addBookmark.isPending || removeBookmark.isPending
                }
                isApplyPending={applyMutation.isPending}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
