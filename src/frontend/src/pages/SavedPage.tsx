import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Loader2 } from "lucide-react";
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
      <div className="flex gap-1.5">
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

export function SavedPage() {
  const { data: allInternships = [], isLoading: internshipsLoading } =
    useInternships();
  const { data: bookmarkIds = [], isLoading: bookmarksLoading } =
    useBookmarks();
  const { data: applicationIds = [] } = useApplications();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const applyMutation = useApplyToInternship();

  const bookmarkSet = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);
  const applicationSet = useMemo(
    () => new Set(applicationIds),
    [applicationIds],
  );

  const savedInternships = useMemo(
    () => allInternships.filter((i) => bookmarkSet.has(i.id)),
    [allInternships, bookmarkSet],
  );

  const isLoading = internshipsLoading || bookmarksLoading;

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
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Saved Internships
              </h1>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `${savedInternships.length} saved`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-5">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(["s1", "s2", "s3"] as const).map((k) => (
              <CardSkeleton key={k} />
            ))}
          </div>
        ) : savedInternships.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="saved.empty_state"
          >
            <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No saved internships yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Browse the dashboard and click the bookmark icon to save
              internships you're interested in.
            </p>
          </motion.div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            data-ocid="saved.list"
          >
            {savedInternships.map((internship, index) => (
              <div key={internship.id} data-ocid={`saved.item.${index + 1}`}>
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
