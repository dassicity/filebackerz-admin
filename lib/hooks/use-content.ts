import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listShareLinks,
  getShareLink,
  revokeShareLink,
  listFileRequests,
  deactivateFileRequest,
  listAnonymousUploads,
  type ListShareLinksParams,
  type ListFileRequestsParams,
  type ListAnonymousUploadsParams,
} from "@/lib/api/content";

function errorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string; error?: string } } })
      ?.response?.data?.message ??
    (err as { response?: { data?: { error?: string } } })?.response?.data
      ?.error ??
    "Action failed"
  );
}

export function useShareLinks(params: ListShareLinksParams) {
  return useQuery({
    queryKey: ["admin", "content", "share-links", params],
    queryFn: async () => await listShareLinks(params),
  });
}

export function useShareLink(linkId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "content", "share-link", linkId],
    queryFn: async () => {
      if (!linkId) throw new Error("linkId required");
      return (await getShareLink(linkId)).data;
    },
    enabled: !!linkId,
  });
}

export function useRevokeShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => revokeShareLink(linkId),
    onSuccess: () => {
      toast.success("Share link revoked");
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useFileRequests(params: ListFileRequestsParams) {
  return useQuery({
    queryKey: ["admin", "content", "file-requests", params],
    queryFn: async () => await listFileRequests(params),
  });
}

export function useDeactivateFileRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => deactivateFileRequest(requestId),
    onSuccess: () => {
      toast.success("File request deactivated");
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useAnonymousUploads(params: ListAnonymousUploadsParams) {
  return useQuery({
    queryKey: ["admin", "content", "anonymous-uploads", params],
    queryFn: async () => await listAnonymousUploads(params),
  });
}
