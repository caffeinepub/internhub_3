import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { InternshipCard } from "../components/InternshipCard";
import {
  useAddBookmark,
  useApplications,
  useApplyToInternship,
  useBookmarks,
  useInternships,
  useRemoveBookmark,
} from "../hooks/useQueries";

export function ApplicationsPage() {
  const { data: allInternships = [], isLoading: internshipsLoading } =
    useInternships();
  const { data: bookmarkIds = [] } = useBookmarks();
  const { data: applicationIds = [], isLoading: applicationsLoading } =
    useApplications();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const applyMutation = useApplyToInternship();

  const bookmarkSet = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);
  const applicationSet = useMemo(
    () => new Set(applicationIds),
    [applicationIds],
  );

  const appliedInternships = useMemo(
    () => allInternships.filter((i) => applicationSet.has(i.id)),
    [allInternships, applicationSet],
  );

  const isLoading = internshipsLoading || applicationsLoading;

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
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                My Applications
              </h1>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : `${appliedInternships.length} applied`}
              </p>
            </div>
          </div>

          {/* Stats banner */}
          {!isLoading && appliedInternships.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Total Applied", value: appliedInternships.length },
                {
                  label: "This Week",
                  value: appliedInternships.length,
                },
                { label: "Success Rate", value: "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-card rounded-xl border p-3 text-center"
                >
                  <div className="font-display text-lg font-bold text-foreground">
                    {value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-5">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(["s1", "s2", "s3"] as const).map((k) => (
              <div key={k} className="bg-card rounded-xl border p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : appliedInternships.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="applications.empty_state"
          >
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No applications yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Start applying to internships from the dashboard. All your
              applications will appear here.
            </p>
          </motion.div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            data-ocid="applications.list"
          >
            {appliedInternships.map((internship, index) => (
              <div
                key={internship.id}
                data-ocid={`applications.item.${index + 1}`}
              >
                <InternshipCard
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
