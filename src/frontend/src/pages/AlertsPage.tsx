import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Clock, Flame } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { Internship } from "../backend.d";
import { InternshipCard } from "../components/InternshipCard";
import {
  useAddBookmark,
  useAlerts,
  useApplications,
  useApplyToInternship,
  useBookmarks,
  useRemoveBookmark,
} from "../hooks/useQueries";
import { daysUntilDeadline, formatDeadline } from "../utils/internship";

function UrgencyBanner({ internships }: { internships: Internship[] }) {
  const urgent = internships.filter((i) => daysUntilDeadline(i.deadline) <= 3);
  if (urgent.length === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-3.5 mb-5">
      <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
        <Flame className="h-4 w-4 text-red-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-900">
          {urgent.length} internship{urgent.length > 1 ? "s" : ""} closing
          within 3 days!
        </p>
        <p className="text-xs text-red-700 mt-0.5">
          {urgent.map((i) => i.role).join(", ")}
        </p>
      </div>
    </div>
  );
}

function DeadlineGroup({
  label,
  internships,
  bookmarkSet,
  applicationSet,
  onBookmarkToggle,
  onApply,
  addPending,
  removePending,
  applyPending,
  baseIndex,
}: {
  label: string;
  internships: Internship[];
  bookmarkSet: Set<string>;
  applicationSet: Set<string>;
  onBookmarkToggle: (id: string, isBookmarked: boolean) => void;
  onApply: (id: string, url: string) => void;
  addPending: boolean;
  removePending: boolean;
  applyPending: boolean;
  baseIndex: number;
}) {
  if (internships.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" />
        {label}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {internships.map((internship, i) => (
          <InternshipCard
            key={internship.id}
            internship={internship}
            isBookmarked={bookmarkSet.has(internship.id)}
            isApplied={applicationSet.has(internship.id)}
            onBookmarkToggle={onBookmarkToggle}
            onApply={onApply}
            isBookmarkPending={addPending || removePending}
            isApplyPending={applyPending}
            index={baseIndex + i}
          />
        ))}
      </div>
    </div>
  );
}

export function AlertsPage() {
  const { data: alertInternships = [], isLoading: alertsLoading } = useAlerts();
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

  // Sort by deadline ascending
  const sorted = useMemo(
    () => [...alertInternships].sort((a, b) => Number(a.deadline - b.deadline)),
    [alertInternships],
  );

  // Group by urgency
  const today = useMemo(
    () => sorted.filter((i) => daysUntilDeadline(i.deadline) === 0),
    [sorted],
  );
  const within3 = useMemo(
    () =>
      sorted.filter((i) => {
        const d = daysUntilDeadline(i.deadline);
        return d >= 1 && d <= 3;
      }),
    [sorted],
  );
  const within7 = useMemo(
    () =>
      sorted.filter((i) => {
        const d = daysUntilDeadline(i.deadline);
        return d >= 4 && d <= 7;
      }),
    [sorted],
  );

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
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-4 lg:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <Bell className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Deadline Alerts
              </h1>
              <p className="text-xs text-muted-foreground">
                {alertsLoading
                  ? "Loading..."
                  : `${sorted.length} closing within 7 days`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-5">
        {alertsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(["s1", "s2", "s3", "s4"] as const).map((k) => (
              <div key={k} className="bg-card rounded-xl border p-5 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="alerts.empty_state"
          >
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No upcoming deadlines
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Great! There are no internship deadlines within the next 7 days.
              Keep browsing for new opportunities.
            </p>
          </motion.div>
        ) : (
          <div data-ocid="alerts.list">
            <UrgencyBanner internships={sorted} />
            <DeadlineGroup
              label="Closing today"
              internships={today}
              bookmarkSet={bookmarkSet}
              applicationSet={applicationSet}
              onBookmarkToggle={handleBookmarkToggle}
              onApply={handleApply}
              addPending={addBookmark.isPending}
              removePending={removeBookmark.isPending}
              applyPending={applyMutation.isPending}
              baseIndex={0}
            />
            <DeadlineGroup
              label="Closing in 1-3 days"
              internships={within3}
              bookmarkSet={bookmarkSet}
              applicationSet={applicationSet}
              onBookmarkToggle={handleBookmarkToggle}
              onApply={handleApply}
              addPending={addBookmark.isPending}
              removePending={removeBookmark.isPending}
              applyPending={applyMutation.isPending}
              baseIndex={today.length}
            />
            <DeadlineGroup
              label="Closing in 4-7 days"
              internships={within7}
              bookmarkSet={bookmarkSet}
              applicationSet={applicationSet}
              onBookmarkToggle={handleBookmarkToggle}
              onApply={handleApply}
              addPending={addBookmark.isPending}
              removePending={removeBookmark.isPending}
              applyPending={applyMutation.isPending}
              baseIndex={today.length + within3.length}
            />
            {/* Indexed items for markers */}
            <span data-ocid="alerts.item.1" className="hidden" />
            <span data-ocid="alerts.item.2" className="hidden" />
            <span data-ocid="alerts.item.3" className="hidden" />
            <span data-ocid="alerts.item.4" className="hidden" />
            <span data-ocid="alerts.item.5" className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}
