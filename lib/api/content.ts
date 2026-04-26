import { apiClient } from "./client";
import type { Pagination } from "./dashboard";

// ---- Share links ----

export interface AdminShareLink {
  _id: string;
  token: string;
  resourceType: "file" | "folder";
  fileId: string | null;
  folderId: string | null;
  organizationId: string;
  createdBy: string;
  expiresAt: string | null;
  accessCount: number;
  maxAccessCount: number | null;
  permissionPreset: string;
  settings: {
    allowDownload: boolean;
    requireEmail: boolean;
    trackAccess: boolean;
    allowUpload: boolean;
    allowDelete: boolean;
    allowMove: boolean;
    allowRename: boolean;
    uploadLimits?: {
      maxFileSize: number;
      maxTotalSize: number;
      maxFileCount: number;
      allowedFileTypes: string[];
    };
  };
  isActive: boolean;
  revokedAt: string | null;
  revokedBy: string | null;
  createdAt: string;
  updatedAt: string;
  shareUrl?: string;
  organization?: {
    _id: string;
    name: string;
    slug: string;
    plan?: string;
  };
  accessLog?: Array<{
    accessedAt: string;
    ipAddress: string;
    userAgent: string;
    email: string | null;
  }>;
}

export interface ListShareLinksParams {
  page?: number;
  limit?: number;
  orgId?: string;
  isActive?: "true" | "false";
  resourceType?: "file" | "folder";
  startDate?: string;
  endDate?: string;
}

export interface ListShareLinksResponse {
  success: true;
  data: AdminShareLink[];
  pagination: Pagination;
}

export async function listShareLinks(
  params: ListShareLinksParams = {},
): Promise<ListShareLinksResponse> {
  const { data } = await apiClient.get<ListShareLinksResponse>(
    "/admin/content/share-links",
    { params },
  );
  return data;
}

export interface GetShareLinkResponse {
  success: true;
  data: AdminShareLink;
}

export async function getShareLink(
  linkId: string,
): Promise<GetShareLinkResponse> {
  const { data } = await apiClient.get<GetShareLinkResponse>(
    `/admin/content/share-links/${linkId}`,
  );
  return data;
}

export interface RevokeShareLinkResponse {
  success: true;
  message: string;
  data: { linkId: string; revokedAt: string };
}

export async function revokeShareLink(
  linkId: string,
): Promise<RevokeShareLinkResponse> {
  const { data } = await apiClient.delete<RevokeShareLinkResponse>(
    `/admin/content/share-links/${linkId}`,
  );
  return data;
}

// ---- File requests ----

export interface AdminFileRequest {
  _id: string;
  token: string;
  organizationId: string;
  folderId: string | null;
  createdBy: string;
  title: string;
  description: string | null;
  expiresAt: string | null;
  isActive: boolean;
  settings: {
    maxUploads: number | null;
    maxSize: number;
    requireEmail: boolean;
    requireName: boolean;
  };
  stats: {
    uploadCount: number;
    lastUploadAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
  requestUrl?: string;
  organization?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface ListFileRequestsParams {
  page?: number;
  limit?: number;
  orgId?: string;
  isActive?: "true" | "false";
  startDate?: string;
  endDate?: string;
}

export interface ListFileRequestsResponse {
  success: true;
  data: AdminFileRequest[];
  pagination: Pagination;
}

export async function listFileRequests(
  params: ListFileRequestsParams = {},
): Promise<ListFileRequestsResponse> {
  const { data } = await apiClient.get<ListFileRequestsResponse>(
    "/admin/content/file-requests",
    { params },
  );
  return data;
}

export async function deactivateFileRequest(
  requestId: string,
): Promise<{ success: true; message: string; data: { requestId: string } }> {
  const { data } = await apiClient.delete(
    `/admin/content/file-requests/${requestId}`,
  );
  return data;
}

// ---- Anonymous uploads ----

export interface AdminAnonymousUpload {
  _id: string;
  shareLinkId: string;
  fileId: string;
  organizationId: string;
  uploaderEmail: string | null;
  uploaderName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: "pending" | "approved" | "rejected" | string;
  createdAt: string;
  updatedAt: string;
  organization?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface ListAnonymousUploadsParams {
  page?: number;
  limit?: number;
  orgId?: string;
  status?: "pending" | "approved" | "rejected";
  startDate?: string;
  endDate?: string;
}

export interface ListAnonymousUploadsResponse {
  success: true;
  data: AdminAnonymousUpload[];
  pagination: Pagination;
}

export async function listAnonymousUploads(
  params: ListAnonymousUploadsParams = {},
): Promise<ListAnonymousUploadsResponse> {
  const { data } = await apiClient.get<ListAnonymousUploadsResponse>(
    "/admin/content/anonymous-uploads",
    { params },
  );
  return data;
}
