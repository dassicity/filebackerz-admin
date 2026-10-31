"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Link2,
  Upload,
  FileInput,
  Ban,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationBar } from "@/components/common/pagination-bar";
import { StatusBadge } from "@/components/common/status-badges";
import { ShareLinkDetailDialog } from "@/components/moderation/share-link-detail-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useShareLinks,
  useFileRequests,
  useAnonymousUploads,
  useDeactivateFileRequest,
} from "@/lib/hooks/use-content";
import type {
  AdminShareLink,
  AdminFileRequest,
  AdminAnonymousUpload,
  ListShareLinksParams,
  ListFileRequestsParams,
  ListAnonymousUploadsParams,
} from "@/lib/api/content";
import { formatBytes, formatNumber, formatRelative } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Moderation"
        description="Review and take action on public share links, file requests, and anonymous uploads."
      />
      <Tabs defaultValue="share-links">
        <TabsList>
          <TabsTrigger value="share-links">
            <Link2 className="w-3.5 h-3.5 mr-1.5" />
            Share links
          </TabsTrigger>
          <TabsTrigger value="file-requests">
            <FileInput className="w-3.5 h-3.5 mr-1.5" />
            File requests
          </TabsTrigger>
          <TabsTrigger value="anonymous">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Anonymous uploads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="share-links" className="mt-4">
          <ShareLinksTab />
        </TabsContent>
        <TabsContent value="file-requests" className="mt-4">
          <FileRequestsTab />
        </TabsContent>
        <TabsContent value="anonymous" className="mt-4">
          <AnonymousUploadsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ShareLinksTab() {
  const [page, setPage] = useState(1);
  const [isActive, setIsActive] = useState<string>(ALL);
  const [resourceType, setResourceType] = useState<string>(ALL);
  const [detailId, setDetailId] = useState<string | null>(null);

  const params: ListShareLinksParams = {
    page,
    limit: 20,
    isActive:
      isActive === ALL ? undefined : (isActive as "true" | "false"),
    resourceType:
      resourceType === ALL ? undefined : (resourceType as "file" | "folder"),
  };

  const { data, isLoading, error, refetch, isFetching } = useShareLinks(params);

  const columns: Column<AdminShareLink>[] = [
    {
      key: "token",
      header: "Token",
      cell: (l) => (
        <span className="font-mono text-xs text-muted-foreground">
          {l.token.slice(0, 12)}…
        </span>
      ),
    },
    {
      key: "resource",
      header: "Resource",
      cell: (l) => (
        <Badge variant="outline" className="text-[10px] uppercase">
          {l.resourceType}
        </Badge>
      ),
    },
    {
      key: "org",
      header: "Organization",
      cell: (l) =>
        l.organization ? (
          <Link
            href={`/organizations/${l.organization._id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-foreground hover:text-primary truncate max-w-[180px] inline-block"
          >
            {l.organization.name}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "preset",
      header: "Preset",
      cell: (l) => (
        <span className="text-xs text-muted-foreground capitalize">
          {l.permissionPreset}
        </span>
      ),
    },
    {
      key: "accesses",
      header: "Accesses",
      cell: (l) => (
        <span className="text-xs text-muted-foreground">
          {l.accessCount}
          {l.maxAccessCount ? ` / ${l.maxAccessCount}` : ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (l) => (
        <StatusBadge status={l.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "expires",
      header: "Expires",
      cell: (l) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {l.expiresAt ? formatRelative(l.expiresAt) : "Never"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      cell: (l) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(l.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-2">
            <Select
              value={isActive}
              onValueChange={(v) => {
                setIsActive(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[140px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={resourceType}
              onValueChange={(v) => {
                setResourceType(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[140px] text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All resources</SelectItem>
                <SelectItem value="file">Files</SelectItem>
                <SelectItem value="folder">Folders</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              rows={data?.data}
              loading={isLoading}
              error={error}
              onRetry={refetch}
              rowKey={(l) => l._id}
              onRowClick={(l) => setDetailId(l._id)}
              emptyState={
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                    <Link2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No share links match.
                  </p>
                </div>
              }
            />
            <PaginationBar
              pagination={data?.pagination}
              onPageChange={setPage}
              loading={isFetching}
              label="share links"
            />
          </CardContent>
        </Card>
      </div>

      <ShareLinkDetailDialog
        linkId={detailId}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}

function FileRequestsTab() {
  const [page, setPage] = useState(1);
  const [isActive, setIsActive] = useState<string>(ALL);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const params: ListFileRequestsParams = {
    page,
    limit: 20,
    isActive: isActive === ALL ? undefined : (isActive as "true" | "false"),
  };

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFileRequests(params);
  const deactivate = useDeactivateFileRequest();

  const columns: Column<AdminFileRequest>[] = [
    {
      key: "title",
      header: "Title",
      cell: (r) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate max-w-[280px]">
            {r.title}
          </span>
          {r.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[280px]">
              {r.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "org",
      header: "Organization",
      cell: (r) =>
        r.organization ? (
          <Link
            href={`/organizations/${r.organization._id}`}
            className="text-sm text-foreground hover:text-primary"
          >
            {r.organization.name}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "uploads",
      header: "Uploads",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {formatNumber(r.stats.uploadCount)}
          {r.settings.maxUploads ? ` / ${r.settings.maxUploads}` : ""}
        </span>
      ),
    },
    {
      key: "maxSize",
      header: "Max size",
      cell: (r) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatBytes(r.settings.maxSize)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <StatusBadge status={r.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "lastUpload",
      header: "Last upload",
      cell: (r) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {r.stats.lastUploadAt ? formatRelative(r.stats.lastUploadAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) =>
        r.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeactivatingId(r._id);
            }}
          >
            <Ban className="w-3.5 h-3.5 mr-1" />
            Deactivate
          </Button>
        ) : null,
    },
  ];

  const targetRequest = data?.data.find((r) => r._id === deactivatingId);

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <Select
              value={isActive}
              onValueChange={(v) => {
                setIsActive(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[140px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              rows={data?.data}
              loading={isLoading}
              error={error}
              onRetry={refetch}
              rowKey={(r) => r._id}
              emptyState={
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                    <FileInput className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No file requests.
                  </p>
                </div>
              }
            />
            <PaginationBar
              pagination={data?.pagination}
              onPageChange={setPage}
              loading={isFetching}
              label="file requests"
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!deactivatingId}
        onOpenChange={(o) => !o && setDeactivatingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deactivate file request{targetRequest ? ` "${targetRequest.title}"` : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The upload URL will stop accepting new files. Existing uploads are preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={() => {
                if (!deactivatingId) return;
                deactivate.mutate(deactivatingId, {
                  onSuccess: () => setDeactivatingId(null),
                });
              }}
              disabled={deactivate.isPending}
            >
              {deactivate.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
              {deactivate.isPending ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AnonymousUploadsTab() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>(ALL);

  const params: ListAnonymousUploadsParams = {
    page,
    limit: 20,
    status:
      status === ALL
        ? undefined
        : (status as "pending" | "approved" | "rejected"),
  };

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAnonymousUploads(params);

  const columns: Column<AdminAnonymousUpload>[] = [
    {
      key: "file",
      header: "File",
      cell: (u) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate max-w-[260px]">
            {u.fileName}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {u.mimeType}
          </span>
        </div>
      ),
    },
    {
      key: "size",
      header: "Size",
      cell: (u) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatBytes(u.fileSize)}
        </span>
      ),
    },
    {
      key: "uploader",
      header: "Uploader",
      cell: (u) => (
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-foreground truncate max-w-[200px]">
            {u.uploaderName || u.uploaderEmail || "Anonymous"}
          </span>
          {u.uploaderEmail && u.uploaderName && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {u.uploaderEmail}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "org",
      header: "Organization",
      cell: (u) =>
        u.organization ? (
          <Link
            href={`/organizations/${u.organization._id}`}
            className="text-sm text-foreground hover:text-primary"
          >
            {u.organization.name}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: "ip",
      header: "IP",
      cell: (u) => (
        <span className="text-xs font-mono text-muted-foreground">
          {u.ipAddress ?? "—"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Uploaded",
      cell: (u) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(u.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-[140px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            rows={data?.data}
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rowKey={(u) => u._id}
            emptyState={
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No anonymous uploads.
                </p>
              </div>
            }
          />
          <PaginationBar
            pagination={data?.pagination}
            onPageChange={setPage}
            loading={isFetching}
            label="uploads"
          />
        </CardContent>
      </Card>
    </div>
  );
}
