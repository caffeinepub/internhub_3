import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Internship, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ── Query Keys ────────────────────────────────────────────────────
export const QUERY_KEYS = {
  internships: ["internships"] as const,
  bookmarks: ["bookmarks"] as const,
  applications: ["applications"] as const,
  alerts: ["alerts"] as const,
  userProfile: ["userProfile"] as const,
};

// ── Internships ───────────────────────────────────────────────────
export function useInternships() {
  const { actor, isFetching } = useActor();
  return useQuery<Internship[]>({
    queryKey: QUERY_KEYS.internships,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInternships();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Bookmarks ─────────────────────────────────────────────────────
export function useBookmarks() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: QUERY_KEYS.bookmarks,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookmarks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (internshipId: string) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.addBookmark(internshipId);
    },
    onMutate: async (internshipId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.bookmarks });
      const previous = queryClient.getQueryData<string[]>(QUERY_KEYS.bookmarks);
      queryClient.setQueryData<string[]>(QUERY_KEYS.bookmarks, (old = []) => [
        ...old.filter((id) => id !== internshipId),
        internshipId,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.bookmarks, context.previous);
      }
      toast.error("Failed to bookmark. Please try again.");
    },
    onSuccess: () => {
      toast.success("Internship bookmarked!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks });
    },
  });
}

export function useRemoveBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (internshipId: string) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.removeBookmark(internshipId);
    },
    onMutate: async (internshipId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.bookmarks });
      const previous = queryClient.getQueryData<string[]>(QUERY_KEYS.bookmarks);
      queryClient.setQueryData<string[]>(QUERY_KEYS.bookmarks, (old = []) =>
        old.filter((id) => id !== internshipId),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.bookmarks, context.previous);
      }
      toast.error("Failed to remove bookmark. Please try again.");
    },
    onSuccess: () => {
      toast.success("Bookmark removed.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks });
    },
  });
}

// ── Applications ──────────────────────────────────────────────────
export function useApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: QUERY_KEYS.applications,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyToInternship() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      internshipId,
      applyUrl,
    }: {
      internshipId: string;
      applyUrl: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.applyToInternship(internshipId);
      window.open(applyUrl, "_blank", "noopener,noreferrer");
    },
    onMutate: async ({ internshipId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.applications });
      const previous = queryClient.getQueryData<string[]>(
        QUERY_KEYS.applications,
      );
      queryClient.setQueryData<string[]>(
        QUERY_KEYS.applications,
        (old = []) => [
          ...old.filter((id) => id !== internshipId),
          internshipId,
        ],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.applications, context.previous);
      }
      toast.error("Failed to record application. Please try again.");
    },
    onSuccess: () => {
      toast.success("Application recorded! Opening link...");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications });
    },
  });
}

// ── Alerts ────────────────────────────────────────────────────────
export function useAlerts() {
  const { actor, isFetching } = useActor();
  return useQuery<Internship[]>({
    queryKey: QUERY_KEYS.alerts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── User Profile ──────────────────────────────────────────────────
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: QUERY_KEYS.userProfile,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(QUERY_KEYS.userProfile, variables);
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile. Please try again.");
    },
  });
}
