import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { motion } from "motion/react";
import type { Internship } from "../backend.d";
import {
  daysUntilDeadline,
  formatDeadline,
  formatStipend,
  isClosingSoon,
  isExpired,
} from "../utils/internship";

interface InternshipCardProps {
  internship: Internship;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: (id: string, isCurrentlyBookmarked: boolean) => void;
  onApply: (id: string, applyUrl: string) => void;
  isBookmarkPending?: boolean;
  isApplyPending?: boolean;
  index?: number;
}

function SourceBadge({ source }: { source: string }) {
  const lower = source.toLowerCase();
  if (lower.includes("internshala")) {
    return (
      <span className="badge-internshala inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        Internshala
      </span>
    );
  }
  if (lower.includes("linkedin")) {
    return (
      <span className="badge-linkedin inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        LinkedIn
      </span>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      {source}
    </Badge>
  );
}

function DeadlineBadge({ deadline }: { deadline: bigint }) {
  const daysLeft = daysUntilDeadline(deadline);
  const expired = isExpired(deadline);
  const urgent = daysLeft <= 3 && !expired;
  const soon = isClosingSoon(deadline) && !expired;

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <Clock className="h-3 w-3" />
        Expired
      </span>
    );
  }

  if (urgent) {
    return (
      <span className="badge-urgent inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold animate-pulse-soft">
        <Clock className="h-3 w-3" />
        {daysLeft === 0 ? "Today!" : `${daysLeft}d left`}
      </span>
    );
  }

  if (soon) {
    return (
      <span className="badge-closing-soon inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
        <Clock className="h-3 w-3" />
        {daysLeft}d left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {formatDeadline(deadline)}
    </span>
  );
}

export function InternshipCard({
  internship,
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApply,
  isBookmarkPending = false,
  isApplyPending = false,
  index = 0,
}: InternshipCardProps) {
  const visibleSkills = internship.skills.slice(0, 3);
  const extraSkills = internship.skills.length - 3;
  const expired = isExpired(internship.deadline);

  const ocidIndex = index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
      data-ocid={`dashboard.internship.item.${ocidIndex}`}
    >
      <Card
        className={`group relative overflow-hidden border bg-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 ${
          expired ? "opacity-60" : ""
        } ${isClosingSoon(internship.deadline) && !expired ? "ring-1 ring-amber-300/50" : ""}`}
        style={{
          boxShadow:
            "0 1px 3px oklch(0.28 0.12 264 / 0.06), 0 4px 12px oklch(0.28 0.12 264 / 0.08)",
        }}
      >
        {/* Closing soon indicator stripe */}
        {isClosingSoon(internship.deadline) && !expired && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400" />
        )}

        <CardContent className="p-5">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <SourceBadge source={internship.source} />
                {isApplied && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Applied
                  </span>
                )}
              </div>
              <h3 className="font-display font-semibold text-base text-foreground leading-snug truncate">
                {internship.role}
              </h3>
              <p className="text-sm font-medium text-muted-foreground mt-0.5 truncate">
                {internship.company}
              </p>
            </div>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={() => onBookmarkToggle(internship.id, isBookmarked)}
              disabled={isBookmarkPending}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-150 ${
                isBookmarked
                  ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                  : "text-muted-foreground hover:text-amber-500 hover:bg-amber-50"
              } disabled:opacity-50`}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Domain badge */}
          <div className="mb-3">
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-secondary/80"
            >
              <Briefcase className="h-3 w-3 mr-1" />
              {internship.domain}
            </Badge>
          </div>

          {/* Skills */}
          {internship.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-md bg-primary/5 border border-primary/10 px-2 py-0.5 text-xs font-medium text-primary/80"
                >
                  {skill}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  +{extraSkills} more
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-4 text-sm flex-wrap">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate max-w-[120px]">
                {internship.location}
              </span>
            </span>
            <span className="font-semibold text-foreground">
              {formatStipend(internship.stipend)}
            </span>
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2">
            <DeadlineBadge deadline={internship.deadline} />

            <Button
              size="sm"
              onClick={() => onApply(internship.id, internship.applyUrl)}
              disabled={isApplyPending || expired}
              className={`flex items-center gap-1.5 text-xs font-semibold h-8 px-3 ${
                isApplied
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-intern-gradient text-white hover:opacity-90"
              }`}
              style={
                isApplied
                  ? {}
                  : {
                      background:
                        "linear-gradient(135deg, oklch(0.42 0.22 264), oklch(0.38 0.18 280))",
                    }
              }
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Applied
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </>
              ) : (
                <>
                  Apply Now
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
