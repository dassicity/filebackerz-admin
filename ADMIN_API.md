# Filebackerz Platform Admin API

> **Base URL:** `https://api.filebackerz.com/api` (production) or `http://localhost:3000/api` (local)
>
> **All admin routes require authentication.** Send the JWT token in the `Authorization` header:
> ```
> Authorization: Bearer <token>
> ```
> The authenticated user must have `role: "admin"` or `role: "superadmin"`. Any other role returns `403`.
>
> **Admin credentials (development):**
> - Email: `admin@filebackerz.com`
> - Password: `Admin@123456`
> - Role: `superadmin`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [User Management](#3-user-management)
4. [Organization Management](#4-organization-management)
5. [Storage & BYOS](#5-storage--byos)
6. [Security & Audit](#6-security--audit)
7. [Content Moderation](#7-content-moderation)
8. [Plans & Billing](#8-plans--billing)
9. [System Configuration](#9-system-configuration)
10. [Error Responses](#10-error-responses)

---

## 1. Authentication

### Sign In

**`POST /api/auth/signin`**

```json
// Request body
{
  "email": "admin@filebackerz.com",
  "password": "Admin@123456"
}
```

```json
// 200 Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "feb6f318-649f-4f24-9907-1a57ced307e3",
    "name": "Filebackerz Admin",
    "email": "admin@filebackerz.com",
    "role": "superadmin",
    "status": "active",
    "isEmailVerified": true
  }
}
```

> Store the `token` and send it as `Authorization: Bearer <token>` on all subsequent admin requests.

---

## 2. Dashboard

### 2.1 Platform Overview

**`GET /api/admin/dashboard/overview`**

Returns top-level KPIs for the entire platform. No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "users": {
      "total": 9,
      "active": 8,
      "inactive": 0,
      "pending": 1,
      "admins": 1,
      "newToday": 1,
      "newThisWeek": 1,
      "newThisMonth": 1,
      "byAuthProvider": {
        "local": 5,
        "google": 1,
        "microsoft": 0
      }
    },
    "organizations": {
      "total": 14,
      "byPlan": {
        "free": 14,
        "pro": 0,
        "enterprise": 0
      },
      "byType": {
        "team": 8,
        "personal": 6
      },
      "byStatus": {
        "active": 14,
        "trial": 0,
        "suspended": 0,
        "deleted": 0
      },
      "newToday": 0,
      "newThisWeek": 0,
      "newThisMonth": 0
    },
    "files": {
      "total": 206,
      "averageSize": 0,
      "uploadedToday": 0,
      "uploadedThisWeek": 0,
      "uploadedThisMonth": 0,
      "topMimeTypes": [
        { "mimeType": "application/pdf", "count": 45 },
        { "mimeType": "image/png", "count": 30 }
      ]
    },
    "storage": {
      "totalUsed": 85189863,
      "totalQuota": 75161927680,
      "utilizationPercent": 0.11,
      "byosConnectionsByProvider": {
        "s3": 6,
        "azure": 0,
        "gcs": 0,
        "google-drive": 0
      }
    },
    "sharing": {
      "activeShareLinks": 15,
      "totalShareLinkAccesses": 7,
      "activeFileRequests": 5
    },
    "security": {
      "total": 9,
      "twoFaEnabled": 2,
      "twoFaDisabled": 7,
      "adoptionPercent": 22.22,
      "byMethod": {
        "totp": 2
      }
    },
    "generatedAt": "2026-04-12T18:30:00.000Z"
  }
}
```

---

### 2.2 Growth Over Time

**`GET /api/admin/dashboard/growth`**

| Query Parameter | Type | Default | Options | Description |
|---|---|---|---|---|
| `granularity` | string | `"day"` | `"day"`, `"week"`, `"month"` | Time bucket size |
| `periods` | number | `30` | 1–365 | Number of periods to return |

```json
// 200 Response — GET /api/admin/dashboard/growth?granularity=month&periods=6
{
  "success": true,
  "data": {
    "granularity": "month",
    "periods": 6,
    "users": [
      { "period": "2025-11", "count": 1 },
      { "period": "2025-12", "count": 5 },
      { "period": "2026-01", "count": 2 },
      { "period": "2026-04", "count": 1 }
    ],
    "organizations": [
      { "period": "2025-11", "count": 4 },
      { "period": "2025-12", "count": 8 },
      { "period": "2026-01", "count": 2 }
    ],
    "files": [
      { "period": "2025-11", "count": 159, "totalSize": 0 },
      { "period": "2025-12", "count": 33, "totalSize": 0 },
      { "period": "2026-01", "count": 12, "totalSize": 0 }
    ]
  }
}
```

> **Period format:** `"day"` → `"YYYY-MM-DD"`, `"week"` → `"YYYY-WNN"`, `"month"` → `"YYYY-MM"`.
> Only periods where data exists are returned — periods with zero activity are omitted.

---

### 2.3 Storage Breakdown

**`GET /api/admin/dashboard/storage`**

| Query Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `topN` | number | `10` | `50` | Number of top consuming orgs to return |

```json
// 200 Response
{
  "success": true,
  "data": {
    "topConsumers": [
      {
        "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
        "name": "Filebackerz",
        "plan": "trial",
        "storageQuota": 5368709120,
        "storageUsed": 84609240,
        "utilizationPercent": 1.5759699046611786
      }
    ],
    "byPlan": [
      {
        "plan": "trial",
        "orgCount": 14,
        "totalUsed": 85189863,
        "totalQuota": 75161927680
      }
    ],
    "byosConnections": {
      "byProvider": {
        "s3": 6
      },
      "byStatus": {
        "active": 6,
        "error": 0,
        "testing": 0,
        "disconnected": 0
      },
      "errorConnections": []
    }
  }
}
```

> `errorConnections` is an array of up to 20 connections with `status: "error"`, each containing `{ organizationId, name, provider, status, lastHealthCheck }`.

---

### 2.4 Activity Feed

**`GET /api/admin/dashboard/activity`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `50` | Records per page (max 200) |
| `severity` | string | — | Filter: `"INFO"`, `"WARNING"`, `"ERROR"`, `"CRITICAL"` |
| `category` | string | — | Filter: `"AUTH"`, `"FILE"`, `"FOLDER"`, `"ORGANIZATION"`, `"PERMISSION"`, `"GROUP"`, `"SETTINGS"`, `"SECURITY"`, `"API"`, `"ACTIVITY"`, `"STORAGE"` |
| `startDate` | ISO date | — | e.g. `"2026-01-01T00:00:00.000Z"` |
| `endDate` | ISO date | — | e.g. `"2026-04-12T23:59:59.000Z"` |

```json
// 200 Response
{
  "success": true,
  "logs": [
    {
      "_id": "c7be9f03-d95c-4591-ab56-72cc49edb60c",
      "eventType": "auth.login.failure",
      "category": "AUTH",
      "severity": "WARNING",
      "action": "Failed login attempt for Filebackerz Admin",
      "userId": "feb6f318-649f-4f24-9907-1a57ced307e3",
      "userEmail": "admin@filebackerz.com",
      "organizationId": "unknown",
      "resourceType": null,
      "resourceName": null,
      "status": "failure",
      "timestamp": "2026-04-12T18:32:51.111Z",
      "ipAddress": "::1"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 608,
    "pages": 13
  },
  "summary": {
    "topEventTypes": [
      { "eventType": "auth.login.success", "count": 120 },
      { "eventType": "file.upload", "count": 95 }
    ],
    "statusBreakdown": {
      "success": 590,
      "failure": 18
    },
    "failureRate": 2.96
  }
}
```

> Note: the top-level key is `logs` (not `data`) for this endpoint.

---

## 3. User Management

### 3.1 List All Users

**`GET /api/admin/users`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Records per page (max 100) |
| `search` | string | — | Name or email substring match (case-insensitive) |
| `status` | string | — | `"active"`, `"inactive"`, `"pending"` |
| `role` | string | — | `"user"`, `"admin"`, `"superadmin"` |
| `authProvider` | string | — | `"local"`, `"google"`, `"microsoft"` |
| `startDate` | ISO date | — | Filter by `createdAt` >= date |
| `endDate` | ISO date | — | Filter by `createdAt` <= date |
| `sortBy` | string | `"createdAt"` | `"createdAt"`, `"updatedAt"`, `"name"`, `"email"`, `"lastLogin"`, `"status"` |
| `sortOrder` | string | `"desc"` | `"asc"`, `"desc"` |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "name": "Nil D",
      "email": "dassic@outlook.com",
      "authProvider": "local",
      "role": "user",
      "status": "active",
      "isEmailVerified": true,
      "lastLogin": "2026-03-02T16:26:33.566Z",
      "failedLoginAttempts": 0,
      "lockUntil": null,
      "defaultOrganizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "twoFactorAuth": {
        "enabled": false,
        "method": "totp"
      },
      "devices": [
        {
          "deviceId": "76d6421f-53fd-4c0a-b79c-2a698212ad27",
          "browser": "Chrome 145",
          "os": "macOS 10.15.7",
          "deviceType": "desktop",
          "ip": "49.206.130.55",
          "location": {
            "city": "Bengaluru",
            "country": "IN"
          },
          "lastActive": "2026-03-02T16:26:33.575Z",
          "userAgent": "Mozilla/5.0 ..."
        }
      ],
      "createdAt": "2026-01-28T22:18:17.732Z",
      "updatedAt": "2026-04-12T18:34:03.735Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 9,
    "pages": 1
  }
}
```

> Sensitive fields excluded: `password`, `emailVerificationToken`, `resetPasswordToken`, `twoFactorAuth.secret`, `twoFactorAuth.backupCodes`, `twoFactorAuth.pending2FA`.

---

### 3.2 Get Single User

**`GET /api/admin/users/:userId`**

No request body or query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "name": "Nil D",
    "email": "dassic@outlook.com",
    "authProvider": "local",
    "role": "user",
    "status": "active",
    "isEmailVerified": true,
    "lastLogin": "2026-03-02T16:26:33.566Z",
    "failedLoginAttempts": 0,
    "lockUntil": null,
    "defaultOrganizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "twoFactorAuth": {
      "enabled": false,
      "method": "totp",
      "emailOtp": { "attempts": 0 },
      "pending2FA": { "backupCodes": [] }
    },
    "devices": [ /* same as 3.1 */ ],
    "createdAt": "2026-01-28T22:18:17.732Z",
    "updatedAt": "2026-04-12T18:34:03.735Z",
    "organizationMemberships": [
      {
        "_id": "abc123...",
        "organizationId": {
          "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
          "name": "Filebackerz",
          "slug": "filebackerz",
          "plan": "trial",
          "status": "active",
          "type": "team"
        },
        "role": "member",
        "status": "active",
        "joinedAt": "2026-01-28T22:20:00.000Z"
      }
    ]
  }
}
```

```json
// 404 Response
{
  "success": false,
  "error": "User not found"
}
```

---

### 3.3 Update User Status

**`PUT /api/admin/users/:userId/status`**

```json
// Request body
{
  "status": "inactive"
}
```

> Allowed values: `"active"`, `"inactive"`, `"pending"`

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "name": "Nil D",
    "email": "dassic@outlook.com",
    "role": "user",
    "status": "inactive",
    "twoFactorAuth": { "enabled": false, "method": "totp" },
    "createdAt": "2026-01-28T22:18:17.732Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

```json
// 400 Response — invalid value
{
  "success": false,
  "error": "status must be one of: active, inactive, pending"
}
```

---

### 3.4 Update User Role

**`PUT /api/admin/users/:userId/role`**

```json
// Request body
{
  "role": "admin"
}
```

> Allowed values: `"user"`, `"admin"`, `"superadmin"`
> Promoting to `"superadmin"` requires the requesting user to also be a `superadmin`.
> You **cannot** change your own role.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "name": "Nil D",
    "email": "dassic@outlook.com",
    "role": "admin",
    "status": "active",
    "twoFactorAuth": { "enabled": false, "method": "totp" },
    "createdAt": "2026-01-28T22:18:17.732Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

```json
// 400 Response — self-role change
{
  "success": false,
  "error": "You cannot change your own platform role"
}
```

```json
// 403 Response — non-superadmin trying to promote to superadmin
{
  "success": false,
  "error": "Only superadmins can promote users to superadmin"
}
```

---

### 3.5 Force Password Reset

**`POST /api/admin/users/:userId/reset-password`**

No request body. Sends a password reset email to the user.

> Only works for users with `authProvider: "local"`.

```json
// 200 Response
{
  "success": true,
  "message": "Password reset email sent to user@example.com"
}
```

```json
// 400 Response — OAuth user
{
  "success": false,
  "error": "User authenticates via google and has no local password"
}
```

---

### 3.6 Force Verify Email

**`POST /api/admin/users/:userId/verify-email`**

No request body. Sets `isEmailVerified: true` and `status: "active"` immediately.

```json
// 200 Response
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "_id": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "name": "Nil D",
    "email": "dassic@outlook.com",
    "role": "user",
    "status": "active",
    "isEmailVerified": true,
    "twoFactorAuth": { "enabled": false, "method": "totp" },
    "createdAt": "2026-01-28T22:18:17.732Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

---

### 3.7 Disable 2FA

**`DELETE /api/admin/users/:userId/2fa`**

No request body. Immediately disables 2FA and clears all 2FA secrets.

```json
// 200 Response
{
  "success": true,
  "message": "2FA disabled successfully",
  "data": {
    "_id": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "name": "Nil D",
    "email": "dassic@outlook.com",
    "role": "user",
    "status": "active",
    "twoFactorAuth": {
      "enabled": false,
      "method": "totp"
    },
    "createdAt": "2026-01-28T22:18:17.732Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

---

### 3.8 Get User Sessions

**`GET /api/admin/users/:userId/sessions`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "userId": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "name": "Nil D",
    "email": "dassic@outlook.com",
    "sessionCount": 1,
    "sessions": [
      {
        "deviceId": "76d6421f-53fd-4c0a-b79c-2a698212ad27",
        "browser": "Chrome 145",
        "os": "macOS 10.15.7",
        "deviceType": "desktop",
        "ip": "49.206.130.55",
        "location": {
          "city": "Bengaluru",
          "country": "IN"
        },
        "lastActive": "2026-03-02T16:26:33.575Z",
        "userAgent": "Mozilla/5.0 ..."
      }
    ]
  }
}
```

---

### 3.9 Revoke All User Sessions

**`DELETE /api/admin/users/:userId/sessions`**

No request body. Clears all connected devices — the user will need to log in again on all devices.

```json
// 200 Response
{
  "success": true,
  "message": "All sessions revoked successfully"
}
```

---

### 3.10 Get User's Organizations

**`GET /api/admin/users/:userId/organizations`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "user": {
      "_id": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "name": "Nil D",
      "email": "dassic@outlook.com"
    },
    "organizations": [
      {
        "membership": {
          "_id": "abc123...",
          "role": "member",
          "status": "active",
          "joinedAt": "2026-01-28T22:20:00.000Z"
        },
        "organization": {
          "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
          "name": "Filebackerz",
          "slug": "filebackerz",
          "plan": "trial",
          "status": "active",
          "type": "team",
          "storageUsed": 84609240,
          "storageQuota": 5368709120,
          "createdAt": "2025-11-01T00:00:00.000Z"
        }
      }
    ]
  }
}
```

---

### 3.11 Get User Audit Logs

**`GET /api/admin/users/:userId/audit-logs`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `50` | Records per page (max 200) |
| `category` | string | — | One of the audit categories |
| `severity` | string | — | `"INFO"`, `"WARNING"`, `"ERROR"`, `"CRITICAL"` |
| `startDate` | ISO date | — | |
| `endDate` | ISO date | — | |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "e0088db9-d39f-4975-a13a-d1f3a3a9e1ea",
      "eventType": "auth.login.success",
      "category": "AUTH",
      "severity": "INFO",
      "action": "User Nil D logged in successfully",
      "userId": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "userEmail": "dassic@outlook.com",
      "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "status": "success",
      "timestamp": "2026-03-02T16:26:33.566Z",
      "ipAddress": "49.206.130.55"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "pages": 1
  }
}
```

---

## 4. Organization Management

### 4.1 List All Organizations

**`GET /api/admin/organizations`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Records per page (max 100) |
| `search` | string | — | Matches `name`, `slug`, or `subdomain` (case-insensitive) |
| `plan` | string | — | `"trial"`, `"paid"` |
| `status` | string | — | `"active"`, `"trial"`, `"expired"`, `"suspended"`, `"deleted"` |
| `type` | string | — | `"personal"`, `"team"` |
| `sortBy` | string | `"createdAt"` | `"createdAt"`, `"updatedAt"`, `"name"`, `"storageUsed"`, `"plan"`, `"status"` |
| `sortOrder` | string | `"desc"` | `"asc"`, `"desc"` |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "name": "Filebackerz",
      "slug": "filebackerz",
      "subdomain": "filebackerz",
      "subdomainStatus": "active",
      "type": "team",
      "ownerId": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "plan": "trial",
      "storageQuota": 5368709120,
      "storageUsed": 84609240,
      "status": "active",
      "settings": {
        "allowPublicSharing": true,
        "requireEmailVerification": true,
        "sessionTimeout": 24,
        "maxFileVersions": 10,
        "allowedDomains": []
      },
      "trashSettings": {
        "retentionDays": 30,
        "autoEmptyTrash": true,
        "allowUserRestore": true,
        "allowUserPermanentDelete": false
      },
      "storageConfig": {
        "defaultConnectionId": null,
        "allowBYOS": true,
        "maxConnections": 5
      },
      "billing": {
        "stripeCustomerId": null,
        "subscriptionId": null,
        "currentPeriodEnd": null
      },
      "createdAt": "2025-11-01T00:00:00.000Z",
      "updatedAt": "2026-04-12T18:30:00.000Z",
      "memberCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 14,
    "pages": 1
  }
}
```

> `memberCount` is the count of members with `status: "active"` — injected on each org object.

---

### 4.2 Get Single Organization

**`GET /api/admin/organizations/:orgId`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "name": "Filebackerz",
    "slug": "filebackerz",
    "subdomain": "filebackerz",
    "subdomainStatus": "active",
    "customDomain": null,
    "customDomainStatus": "pending_verification",
    "type": "team",
    "ownerId": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "plan": "trial",
    "storageQuota": 5368709120,
    "storageUsed": 84609240,
    "status": "active",
    "settings": {
      "allowPublicSharing": true,
      "requireEmailVerification": true,
      "sessionTimeout": 24,
      "maxFileVersions": 10,
      "allowedDomains": []
    },
    "trashSettings": {
      "retentionDays": 30,
      "autoEmptyTrash": true,
      "allowUserRestore": true,
      "allowUserPermanentDelete": false
    },
    "storageConfig": {
      "defaultConnectionId": null,
      "allowBYOS": true,
      "maxConnections": 5
    },
    "branding": {
      "logo": { "url": null, "s3Key": null, "uploadedAt": null },
      "favicon": { "url": null, "s3Key": null, "uploadedAt": null },
      "colors": {
        "primary": "#1a73e8",
        "secondary": "#34a853",
        "accent": "#fbbc04",
        "background": "#ffffff",
        "text": "#202124"
      },
      "companyName": null,
      "tagline": null,
      "emailBranding": {
        "enabled": false,
        "footerText": null,
        "supportEmail": null
      },
      "customLinks": {
        "termsOfService": null,
        "privacyPolicy": null,
        "supportUrl": null
      }
    },
    "billing": {
      "stripeCustomerId": null,
      "subscriptionId": null,
      "currentPeriodEnd": null
    },
    "metadata": {
      "industry": null,
      "teamSize": null,
      "website": null
    },
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2026-04-12T18:30:00.000Z",
    "computed": {
      "memberCount": 2,
      "fileCount": 206,
      "folderCount": 15,
      "activeShareLinks": 10
    }
  }
}
```

> `computed` is injected — not stored in the database.

---

### 4.3 Update Organization Status

**`PUT /api/admin/organizations/:orgId/status`**

```json
// Request body
{
  "status": "suspended"
}
```

> Allowed values: `"active"`, `"trial"`, `"expired"`, `"suspended"`, `"deleted"`
>
> `expired` (trial over / subscription cancelled) and `suspended` (switched off by
> a platform admin) both make the org **read-only** — uploads blocked, downloads
> and existing data untouched. They are kept distinct because the customer-facing
> message differs: `expired` shows an upgrade CTA, `suspended` points to support.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "name": "Filebackerz",
    "plan": "trial",
    "status": "suspended",
    "storageUsed": 84609240,
    "storageQuota": 5368709120,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

---

### 4.4 Update Organization Plan

**`PUT /api/admin/organizations/:orgId/plan`**

```json
// Request body
{
  "plan": "paid"
}
```

> Allowed values: `"trial"`, `"paid"`

Changes **our records only** — it creates, cancels and modifies nothing in Stripe.
Use it to comp an organization onto the paid plan. If the org has a live Stripe
subscription, the nightly reconcile job will pull Stripe's view back over the top.

Side effects:
- `storageQuota` is recomputed from the plan defaults, and `billing.overQuota` with it.
- → `paid` sets `status: "active"` and clears `trialEndsAt`.
- → `trial` from `active` sets `status` to `"trial"` or `"expired"` depending on
  whether the trial window has passed, and revokes overage authorization.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "name": "Filebackerz",
    "plan": "paid",
    "status": "active",
    "storageUsed": 84609240,
    "storageQuota": 1099511627776,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2026-08-04T18:45:00.000Z"
  }
}
```

---

### 4.5 Update Storage Quota

**`PUT /api/admin/organizations/:orgId/quota`**

```json
// Request body — value in bytes
{
  "storageQuota": 10737418240
}
```

> Must be a positive number. Example: `10737418240` = 10 GB.

Recomputes `billing.overQuota`. The override survives until the next plan change
or subscription event, which recomputes the quota from plan defaults.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "name": "Filebackerz",
    "plan": "trial",
    "status": "trial",
    "storageUsed": 84609240,
    "storageQuota": 10737418240,
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2026-08-04T18:45:00.000Z"
  }
}
```

```json
// 400 Response
{
  "success": false,
  "error": "storageQuota must be a positive number (bytes)"
}
```

---

### 4.5a Extend a Trial

**`PUT /api/admin/organizations/:orgId/trial`**

Grants an organization extra free time. This is the "give them an extra free
period" control.

```json
// Request body — one of:
{ "extendDays": 30 }
{ "trialEndsAt": "2026-12-31T23:59:59.000Z" }
```

Behaviour:
- `extendDays` counts from the **later** of now and the current end date, so
  granting 30 days to an org that expired last month gives a real 30 days rather
  than a date already in the past.
- An `expired` organization is **revived** — `plan` and `status` return to `trial`
  and uploads resume immediately.
- The reminder ledger is cleared, so the 14/7/3/1-day countdown emails fire again
  for the new window.
- An organization that is actively paying (`status: "active"`) is never demoted.
- The owner is emailed that their trial was extended.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "plan": "trial",
    "status": "trial",
    "billing": {
      "trialStartedAt": "2026-06-01T00:00:00.000Z",
      "trialEndsAt": "2026-09-03T00:00:00.000Z",
      "trialExtendedDays": 30,
      "trialRemindersSent": []
    }
  }
}
```

```json
// 400 Response
{
  "success": false,
  "error": "Provide either extendDays (number) or trialEndsAt (ISO date)"
}
```

---

### 4.5b Override Overage Authorization

**`PUT /api/admin/organizations/:orgId/overage`**

Force the storage-overage authorization on or off — e.g. to unblock a customer
mid-migration who cannot reach the checkbox themselves.

```json
// Request body
{ "authorized": true }
```

Enabling it means the organization **will be charged** for storage above its
allowance on its next invoice. Logged as a `WARNING`-severity audit event with
`setByPlatformAdmin: true`.

```json
// 200 Response
{ "success": true, "data": { "...organization": "..." } }
```

---

### 4.5c Override Fair-Use Seat Cap

**`PUT /api/admin/organizations/:orgId/seat-cap`**

```json
// Request body
{ "softSeatCap": 500 }   // or null to restore the platform default
```

An **alerting threshold only** — it never blocks an invite, because both plans
include unlimited users. Crossing it raises an audit event and emails the platform
admin, so an organization whose seat count makes the flat $49.99 price
unprofitable becomes visible.

```json
// 200 Response
{ "success": true, "data": { "...organization": "..." } }
```

---

### 4.5d Storage History

**`GET /api/admin/organizations/:orgId/storage-history?days=90`**

Daily usage snapshots — the evidence behind a disputed overage charge. `days`
defaults to 90, maximum 365.

```json
// 200 Response
{
  "success": true,
  "data": {
    "organization": {
      "id": "org_abc123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "plan": "paid",
      "storageQuota": 1099511627776,
      "storageUsed": 1369965379584,
      "periodPeakStorageUsed": 1369965379584
    },
    "days": 90,
    "snapshots": [
      {
        "organizationId": "org_abc123",
        "date": "2026-08-01T00:00:00.000Z",
        "bytesUsed": 1288490188800,
        "quotaBytes": 1099511627776,
        "overageBlocks": 2,
        "plan": "paid"
      }
    ]
  }
}
```

Written daily at 05:00 UTC by the `snapshotStorageUsage` cron.

---


### 4.6 Update Organization Settings

**`PUT /api/admin/organizations/:orgId/settings`**

All fields are optional. Only provide the sections and fields you want to update.

```json
// Request body
{
  "settings": {
    "allowPublicSharing": false,
    "requireEmailVerification": true,
    "sessionTimeout": 48,
    "maxFileVersions": 20,
    "allowedDomains": ["company.com"]
  },
  "trashSettings": {
    "retentionDays": 60,
    "autoEmptyTrash": true,
    "allowUserRestore": true,
    "allowUserPermanentDelete": false
  },
  "storageConfig": {
    "allowBYOS": true,
    "maxConnections": 10
  }
}
```

> `trashSettings.retentionDays` must be one of: `7`, `15`, `30`, `60`, `90`

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "name": "Filebackerz",
    "plan": "trial",
    "status": "active",
    "settings": {
      "allowPublicSharing": false,
      "requireEmailVerification": true,
      "sessionTimeout": 48,
      "maxFileVersions": 20,
      "allowedDomains": ["company.com"]
    },
    "trashSettings": {
      "retentionDays": 60,
      "autoEmptyTrash": true,
      "allowUserRestore": true,
      "allowUserPermanentDelete": false
    },
    "storageConfig": {
      "allowBYOS": true,
      "maxConnections": 10,
      "defaultConnectionId": null
    },
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

```json
// 400 Response — no valid fields
{
  "success": false,
  "error": "No valid settings fields provided"
}
```

---

### 4.7 Get Organization Members

**`GET /api/admin/organizations/:orgId/members`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `50` | Records per page (max 200) |
| `status` | string | — | `"active"`, `"invited"`, `"suspended"` |
| `role` | string | — | `"owner"`, `"admin"`, `"member"` |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "mem-abc123",
      "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "userId": {
        "_id": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
        "name": "Nil D",
        "email": "dassic@outlook.com",
        "status": "active",
        "authProvider": "local",
        "lastLogin": "2026-03-02T16:26:33.566Z"
      },
      "email": "dassic@outlook.com",
      "role": "owner",
      "status": "active",
      "permissions": {
        "canInviteMembers": false,
        "canManageBilling": false,
        "canManageSettings": false
      },
      "joinedAt": "2025-11-01T00:00:00.000Z",
      "createdAt": "2025-11-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "pages": 1
  }
}
```

---

### 4.8 Get Organization Storage Details

**`GET /api/admin/organizations/:orgId/storage`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "organization": {
      "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "name": "Filebackerz",
      "plan": "trial"
    },
    "storageUsed": 84609240,
    "storageQuota": 5368709120,
    "utilizationPercent": 1.58,
    "fileStats": {
      "totalSize": 84609240,
      "fileCount": 206,
      "averageSize": 410724
    },
    "topFilesBySize": [
      {
        "_id": "b6c49bfa-319c-4910-ac2a-6736347ca3b0",
        "name": "gui_fast.py",
        "currentVersion": {
          "size": 5242880,
          "mimeType": "text/x-python"
        },
        "createdAt": "2025-11-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.9 Get Organization BYOS Connections

**`GET /api/admin/organizations/:orgId/storage-connections`**

No query parameters. Returns all BYOS connections for the org.

```json
// 200 Response
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "b86126b7-9acd-40e6-8fdc-a02b4548426b",
      "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "name": "My S3",
      "provider": "s3",
      "isDefault": true,
      "status": "active",
      "config": {
        "accessKeyId": "AKIATX3PHYVL...",
        "region": "us-east-1",
        "bucket": "filebackerz"
      },
      "lastHealthCheck": "2026-04-12T18:38:51.574Z",
      "lastError": null,
      "createdBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2026-04-12T18:38:51.574Z"
    }
  ]
}
```

> Sensitive fields excluded from `config`: `secretAccessKey`, `accountKey`, `sasToken`, `serviceAccountKey`, `googleAccessToken`, `googleRefreshToken`, `connectionString`.

---

### 4.10 Get Organization Audit Logs

**`GET /api/admin/organizations/:orgId/audit-logs`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `50` | Records per page (max 200) |
| `category` | string | — | Audit category filter |
| `severity` | string | — | `"INFO"`, `"WARNING"`, `"ERROR"`, `"CRITICAL"` |
| `userId` | string | — | Filter to a specific user within the org |
| `startDate` | ISO date | — | |
| `endDate` | ISO date | — | |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "abc123",
      "eventType": "auth.login.success",
      "category": "AUTH",
      "severity": "INFO",
      "action": "User logged in successfully",
      "userId": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "userEmail": "dassic@outlook.com",
      "userName": "Nil D",
      "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "status": "success",
      "timestamp": "2026-04-01T13:10:12.171Z",
      "ipAddress": "111.92.91.100",
      "geoLocation": {
        "country": "IN",
        "city": "Bengaluru"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 498,
    "pages": 10
  }
}
```

---

### 4.11 Update Organization Subdomain

**`PUT /api/admin/organizations/:orgId/subdomain`**

```json
// Request body
{
  "subdomain": "new-subdomain"
}
```

> Must be 3–63 chars, start with a lowercase letter, alphanumeric + hyphens only. Reserved names are rejected.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "name": "Filebackerz",
    "subdomain": "new-subdomain",
    "subdomainStatus": "active",
    "plan": "trial",
    "status": "active",
    "createdAt": "2025-11-01T00:00:00.000Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

```json
// 409 Response
{
  "success": false,
  "error": "Subdomain is already taken or reserved"
}
```

---

### 4.12 Delete Organization (Hard Delete)

**`DELETE /api/admin/organizations/:orgId`**

**Irreversible.** Deletes the organization and all associated Files, Folders, Members, StorageConnections, ShareLinks, and AuditLogs.

```json
// Request body — confirmation required
{
  "confirm": true
}
```

```json
// 200 Response
{
  "success": true,
  "message": "Organization \"Filebackerz\" (43505fa2-602d-4f25-99ad-6a30debde74d) and all associated data have been permanently deleted"
}
```

```json
// 400 Response — missing confirmation
{
  "success": false,
  "error": "Set { \"confirm\": true } in the request body to confirm hard deletion"
}
```

---

## 5. Storage & BYOS

### 5.1 Storage Overview

**`GET /api/admin/storage/overview`**

| Query Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `topN` | number | `10` | `50` | Top consuming orgs to include |

> Returns the same structure as [Dashboard Storage Breakdown (2.3)](#23-storage-breakdown).

```json
// 200 Response
{
  "success": true,
  "data": {
    "topConsumers": [ /* array of org objects with utilizationPercent */ ],
    "byPlan": [
      {
        "plan": "trial",
        "orgCount": 14,
        "totalUsed": 85189863,
        "totalQuota": 75161927680
      }
    ],
    "byosConnections": {
      "byProvider": { "s3": 6 },
      "byStatus": { "active": 6 },
      "errorConnections": []
    }
  }
}
```

---

### 5.2 List All BYOS Connections

**`GET /api/admin/storage/connections`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Records per page (max 100) |
| `provider` | string | — | `"s3"`, `"azure"`, `"gcs"`, `"google-drive"` |
| `status` | string | — | `"active"`, `"error"`, `"testing"`, `"disconnected"` |
| `orgId` | string | — | Filter to a specific organization |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "b86126b7-9acd-40e6-8fdc-a02b4548426b",
      "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "name": "My S3",
      "provider": "s3",
      "isDefault": true,
      "status": "active",
      "config": {
        "accessKeyId": "AKIATX3PHYVL...",
        "region": "us-east-1",
        "bucket": "filebackerz"
      },
      "lastHealthCheck": "2026-04-12T18:38:51.574Z",
      "lastError": null,
      "healthCheckInterval": 3600,
      "createdBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2026-04-12T18:38:51.574Z",
      "organization": {
        "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
        "name": "Filebackerz",
        "slug": "filebackerz",
        "plan": "trial"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6,
    "pages": 1
  }
}
```

> `organization` is injected — enriches each connection with its owning org name/slug/plan. Sensitive credential fields are excluded.

---

### 5.3 Get Single BYOS Connection

**`GET /api/admin/storage/connections/:connectionId`**

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "b86126b7-9acd-40e6-8fdc-a02b4548426b",
    "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "name": "My S3",
    "provider": "s3",
    "isDefault": true,
    "status": "active",
    "config": {
      "accessKeyId": "AKIATX3PHYVL...",
      "region": "us-east-1",
      "bucket": "filebackerz",
      "driveFolderId": "root"
    },
    "lastHealthCheck": "2026-04-12T18:38:51.574Z",
    "lastError": null,
    "healthCheckInterval": 3600,
    "description": null,
    "createdBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "createdAt": "2025-12-01T00:00:00.000Z",
    "updatedAt": "2026-04-12T18:38:51.574Z",
    "organization": {
      "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "name": "Filebackerz",
      "slug": "filebackerz",
      "plan": "trial",
      "status": "active"
    }
  }
}
```

```json
// 404 Response
{
  "success": false,
  "message": "Storage connection not found"
}
```

---

### 5.4 Trigger Health Check

**`POST /api/admin/storage/connections/:connectionId/health-check`**

No request body.

```json
// 200 Response
{
  "success": true,
  "message": "Health check triggered",
  "data": {
    "connectionId": "b86126b7-9acd-40e6-8fdc-a02b4548426b",
    "provider": "s3",
    "status": "active",
    "lastHealthCheck": "2026-04-12T18:38:51.574Z"
  }
}
```

---

### 5.5 Internal Storage Usage

**`GET /api/admin/storage/internal`**

Returns orgs that have **no BYOS connections** (using Filebackerz's own S3).

```json
// 200 Response
{
  "success": true,
  "data": {
    "summary": {
      "organizationCount": 13,
      "totalUsed": 580623,
      "totalQuota": 69793218560,
      "utilizationPercent": 0.0
    },
    "organizations": [
      {
        "_id": "abc123",
        "name": "testing",
        "slug": "testing",
        "plan": "trial",
        "storageUsed": 120818,
        "storageQuota": 5368709120,
        "status": "active"
      }
    ],
    "topMimeTypes": [
      {
        "mimeType": "image/png",
        "count": 10,
        "totalSize": 512000
      }
    ]
  }
}
```

---

### 5.6 Top Storage Consumers

**`GET /api/admin/storage/top-consumers`**

| Query Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | number | `20` | `100` | Number of orgs to return |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "name": "Filebackerz",
      "slug": "filebackerz",
      "plan": "trial",
      "status": "active",
      "storageUsed": 84609240,
      "storageQuota": 5368709120,
      "utilizationPercent": 1.5759699046611786,
      "byosConnectionCount": 6
    }
  ]
}
```

---

## 6. Security & Audit

### 6.1 Cross-Org Audit Logs

**`GET /api/admin/security/audit-logs`**

Queries audit logs across **all organizations** (no org filter required).

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `50` | Records per page (max 200) |
| `severity` | string | — | `"INFO"`, `"WARNING"`, `"ERROR"`, `"CRITICAL"` |
| `category` | string | — | `"AUTH"`, `"FILE"`, `"FOLDER"`, `"ORGANIZATION"`, `"PERMISSION"`, `"GROUP"`, `"SETTINGS"`, `"SECURITY"`, `"API"`, `"ACTIVITY"`, `"STORAGE"` |
| `eventType` | string | — | e.g. `"auth.login.failure"`, `"file.upload"` |
| `userId` | string | — | Filter to a specific user |
| `orgId` | string | — | Filter to a specific org |
| `status` | string | — | `"success"`, `"failure"`, `"partial"` |
| `startDate` | ISO date | — | |
| `endDate` | ISO date | — | |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "c7be9f03-d95c-4591-ab56-72cc49edb60c",
      "eventType": "auth.login.failure",
      "category": "AUTH",
      "severity": "WARNING",
      "action": "Failed login attempt for Filebackerz Admin",
      "userId": "feb6f318-649f-4f24-9907-1a57ced307e3",
      "userEmail": "admin@filebackerz.com",
      "userName": null,
      "sessionId": null,
      "organizationId": "unknown",
      "ipAddress": "::1",
      "geoLocation": {
        "country": null,
        "city": null,
        "timezone": null
      },
      "userAgent": null,
      "deviceInfo": null,
      "resourceType": null,
      "resourceId": null,
      "resourceName": null,
      "metadata": {},
      "changes": [],
      "status": "failure",
      "errorMessage": null,
      "errorCode": null,
      "duration": null,
      "timestamp": "2026-04-12T18:32:51.111Z",
      "legalHold": false,
      "retentionPolicy": "forever",
      "hash": "abc123...",
      "archived": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 608,
    "pages": 13
  }
}
```

---

### 6.2 Export Audit Logs

**`GET /api/admin/security/audit-logs/export`**

Downloads audit logs as a file. Max 10,000 records per export.

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `format` | string | `"json"` | `"json"` or `"csv"` |
| `severity` | string | — | Filter by severity |
| `category` | string | — | Filter by category |
| `startDate` | ISO date | — | |
| `endDate` | ISO date | — | |

**JSON format** (`format=json`):
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="audit-logs.json"`

```json
// JSON file body
{
  "success": true,
  "count": 608,
  "data": [ /* array of full audit log objects */ ]
}
```

**CSV format** (`format=csv`):
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="audit-logs.csv"`
- Columns: `timestamp`, `eventType`, `category`, `severity`, `action`, `userId`, `userEmail`, `organizationId`, `resourceType`, `resourceName`, `status`, `ipAddress`

---

### 6.3 Security Alerts

**`GET /api/admin/security/alerts`**

Returns recent `CRITICAL` and `WARNING` severity audit log entries across all orgs.

| Query Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | number | `50` | `200` | Number of alerts to return |

```json
// 200 Response
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "c7be9f03-d95c-4591-ab56-72cc49edb60c",
      "eventType": "auth.login.failure",
      "category": "AUTH",
      "severity": "WARNING",
      "action": "Failed login attempt for Filebackerz Admin",
      "userId": "feb6f318-649f-4f24-9907-1a57ced307e3",
      "userEmail": "admin@filebackerz.com",
      "organizationId": "unknown",
      "resourceType": null,
      "resourceName": null,
      "status": "failure",
      "timestamp": "2026-04-12T18:32:51.111Z",
      "ipAddress": "::1",
      "metadata": {}
    }
  ]
}
```

---

### 6.4 Failed Logins

**`GET /api/admin/security/failed-logins`**

| Query Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | number | `100` | `500` | Number of records to return |
| `startDate` | ISO date | — | | |
| `endDate` | ISO date | — | | |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "c7be9f03-d95c-4591-ab56-72cc49edb60c",
      "userId": "feb6f318-649f-4f24-9907-1a57ced307e3",
      "userEmail": "admin@filebackerz.com",
      "ipAddress": "::1",
      "geoLocation": { "country": null, "city": null, "timezone": null },
      "timestamp": "2026-04-12T18:32:51.111Z",
      "metadata": {},
      "eventType": "auth.login.failure"
    }
  ],
  "summary": {
    "total": 12,
    "topIpAddresses": [
      { "_id": "::1", "count": 6 },
      { "_id": "99.106.36.117", "count": 4 }
    ],
    "topUsers": [
      { "_id": "admin@filebackerz.com", "count": 5 },
      { "_id": "nildassic@gmail.com", "count": 4 }
    ]
  }
}
```

---

### 6.5 Security Anomalies

**`GET /api/admin/security/anomalies`**

| Query Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | number | `50` | `200` | Max results per anomaly type |
| `startDate` | ISO date | — | | |
| `endDate` | ISO date | — | | |

```json
// 200 Response
{
  "success": true,
  "data": {
    "bruteForceAttempts": [
      {
        "ipAddress": "99.106.36.117",
        "failedAttempts": 8,
        "targetedUsers": ["nildassic@gmail.com", "chris@piggybackerz.com"],
        "windowHours": 1
      }
    ],
    "unusualDownloadVolumes": [
      {
        "userId": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
        "userEmail": "dassic@outlook.com",
        "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
        "date": "2026-04-12",
        "downloadCount": 150
      }
    ],
    "currentlyLockedAccounts": [
      {
        "_id": "abc123",
        "name": "John Doe",
        "email": "john@example.com",
        "failedLoginAttempts": 5,
        "lockUntil": "2026-04-12T20:00:00.000Z",
        "lastLogin": "2026-04-12T17:00:00.000Z"
      }
    ]
  }
}
```

> `bruteForceAttempts`: IPs with ≥5 failed auth events in the past 1 hour.
> `unusualDownloadVolumes`: Users with ≥100 file downloads/accesses in a single day.
> `currentlyLockedAccounts`: Users with `lockUntil > now`.

---

### 6.6 Active Sessions

**`GET /api/admin/security/active-sessions`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "usersWithActiveSessions": 4,
    "totalActiveSessions": 84,
    "byDeviceType": {
      "desktop": 80,
      "mobile": 4
    },
    "byOS": {
      "macOS 10.15.7": 36,
      "Unknown": 46,
      "Windows 10": 2
    }
  }
}
```

---

### 6.7 2FA Adoption Stats

**`GET /api/admin/security/2fa-stats`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "total": 9,
    "twoFaEnabled": 2,
    "twoFaDisabled": 7,
    "adoptionPercent": 22.22,
    "byMethod": {
      "totp": 2
    },
    "byAuthProvider": {
      "local": 2
    },
    "enabledLast30Days": 1
  }
}
```

---

## 7. Content Moderation

### 7.1 List Share Links

**`GET /api/admin/content/share-links`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Records per page (max 100) |
| `orgId` | string | — | Filter by organization |
| `isActive` | boolean string | — | `"true"` or `"false"` |
| `resourceType` | string | — | `"file"` or `"folder"` |
| `startDate` | ISO date | — | Filter by `createdAt` |
| `endDate` | ISO date | — | Filter by `createdAt` |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "78ba04fd-499b-427d-a839-361d80b063c3",
      "token": "5a77c4c6e51c7a8f...",
      "resourceType": "folder",
      "fileId": null,
      "folderId": "folder-uuid-here",
      "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "createdBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "expiresAt": null,
      "accessCount": 0,
      "maxAccessCount": null,
      "permissionPreset": "viewer",
      "settings": {
        "allowDownload": true,
        "requireEmail": false,
        "trackAccess": true,
        "allowUpload": false,
        "allowDelete": false,
        "allowMove": false,
        "allowRename": false,
        "uploadLimits": {
          "maxFileSize": 104857600,
          "maxTotalSize": 524288000,
          "maxFileCount": 100,
          "allowedFileTypes": []
        }
      },
      "isActive": true,
      "revokedAt": null,
      "revokedBy": null,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z",
      "shareUrl": "https://api.filebackerz.com/share/5a77c4c6e51c7a8f...",
      "organization": {
        "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
        "name": "Filebackerz",
        "slug": "filebackerz"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

> `password` and `accessLog` are excluded from list responses.

---

### 7.2 Get Share Link Detail

**`GET /api/admin/content/share-links/:linkId`**

Includes full `accessLog` (up to 100 entries).

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "78ba04fd-499b-427d-a839-361d80b063c3",
    "token": "5a77c4c6e51c7a8f...",
    "resourceType": "folder",
    "fileId": null,
    "folderId": "folder-uuid-here",
    "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "createdBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "expiresAt": null,
    "accessCount": 3,
    "maxAccessCount": null,
    "permissionPreset": "viewer",
    "settings": { /* same as 7.1 */ },
    "accessLog": [
      {
        "accessedAt": "2026-02-01T10:00:00.000Z",
        "ipAddress": "203.0.113.5",
        "userAgent": "Mozilla/5.0 ...",
        "email": null
      }
    ],
    "isActive": true,
    "revokedAt": null,
    "revokedBy": null,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z",
    "shareUrl": "https://api.filebackerz.com/share/5a77c4c6e51c7a8f...",
    "organization": {
      "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "name": "Filebackerz",
      "slug": "filebackerz",
      "plan": "trial"
    }
  }
}
```

```json
// 404 Response
{
  "success": false,
  "message": "Share link not found"
}
```

---

### 7.3 Revoke Share Link

**`DELETE /api/admin/content/share-links/:linkId`**

No request body.

```json
// 200 Response
{
  "success": true,
  "message": "Share link revoked successfully",
  "data": {
    "linkId": "78ba04fd-499b-427d-a839-361d80b063c3",
    "revokedAt": "2026-04-12T18:48:59.170Z"
  }
}
```

```json
// 400 Response — already inactive
{
  "success": false,
  "message": "Share link is already inactive"
}
```

---

### 7.4 List File Requests

**`GET /api/admin/content/file-requests`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Records per page (max 100) |
| `orgId` | string | — | Filter by organization |
| `isActive` | boolean string | — | `"true"` or `"false"` |
| `startDate` | ISO date | — | Filter by `createdAt` |
| `endDate` | ISO date | — | Filter by `createdAt` |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "8c1e698b-733a-4821-8322-e28fbc6c6f7c",
      "token": "abc123xyz...",
      "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "folderId": null,
      "createdBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "title": "Q1 Budget Documents",
      "description": "Please upload your department budgets",
      "expiresAt": null,
      "isActive": true,
      "settings": {
        "maxUploads": null,
        "maxSize": 104857600,
        "requireEmail": true,
        "requireName": true
      },
      "stats": {
        "uploadCount": 3,
        "lastUploadAt": "2026-03-10T14:00:00.000Z"
      },
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-03-10T14:00:00.000Z",
      "requestUrl": "http://localhost:5000/file-request/abc123xyz...",
      "organization": {
        "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
        "name": "Filebackerz",
        "slug": "filebackerz"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

> `password` field is excluded.

---

### 7.5 Deactivate File Request

**`DELETE /api/admin/content/file-requests/:requestId`**

No request body.

```json
// 200 Response
{
  "success": true,
  "message": "File request deactivated successfully",
  "data": {
    "requestId": "8c1e698b-733a-4821-8322-e28fbc6c6f7c"
  }
}
```

```json
// 400 Response — already inactive
{
  "success": false,
  "message": "File request is already inactive"
}
```

---

### 7.6 List Anonymous Uploads

**`GET /api/admin/content/anonymous-uploads`**

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Records per page (max 100) |
| `orgId` | string | — | Filter by organization |
| `status` | string | — | `"pending"`, `"approved"`, `"rejected"` |
| `startDate` | ISO date | — | Filter by `createdAt` |
| `endDate` | ISO date | — | Filter by `createdAt` |

```json
// 200 Response
{
  "success": true,
  "data": [
    {
      "_id": "anon-abc123",
      "shareLinkId": "78ba04fd-499b-427d-a839-361d80b063c3",
      "fileId": "b6c49bfa-319c-4910-ac2a-6736347ca3b0",
      "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "uploaderEmail": "uploader@example.com",
      "uploaderName": "Anonymous",
      "ipAddress": "203.0.113.5",
      "userAgent": "Mozilla/5.0 ...",
      "fileName": "document.pdf",
      "fileSize": 204800,
      "mimeType": "application/pdf",
      "status": "approved",
      "metadata": {
        "uploadDuration": 1500,
        "originalFileName": "document.pdf"
      },
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-03-15T10:00:00.000Z",
      "organization": {
        "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
        "name": "Filebackerz",
        "slug": "filebackerz"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### 7.7 Get File Metadata

**`GET /api/admin/content/files/:fileId`**

Returns file metadata across any organization. Does **not** return S3 keys.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "b6c49bfa-319c-4910-ac2a-6736347ca3b0",
    "organizationId": "43505fa2-602d-4f25-99ad-6a30debde74d",
    "folderId": "folder-uuid-here",
    "name": "gui_fast.py",
    "currentVersion": {
      "size": 5242880,
      "mimeType": "text/x-python",
      "uploadedBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
      "createdAt": "2025-11-15T10:00:00.000Z",
      "updatedAt": "2025-11-15T10:00:00.000Z"
    },
    "versions": [
      {
        "_id": "ver-abc123",
        "versionNumber": 1,
        "size": 4194304,
        "mimeType": "text/x-python",
        "uploadedBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
        "createdAt": "2025-11-10T08:00:00.000Z"
      }
    ],
    "isStarred": false,
    "storageConnectionId": null,
    "externalPath": null,
    "lastAccessedAt": "2026-03-01T10:00:00.000Z",
    "lastAccessedBy": "bea38ecf-9d99-4d99-97af-0bc9ccf851ef",
    "isDeleted": false,
    "deletedAt": null,
    "deletedBy": null,
    "permanentDeleteAt": null,
    "metadata": null,
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2026-03-01T10:00:00.000Z",
    "organization": {
      "_id": "43505fa2-602d-4f25-99ad-6a30debde74d",
      "name": "Filebackerz",
      "slug": "filebackerz",
      "plan": "trial",
      "status": "active"
    }
  }
}
```

> `currentVersion.s3Key` and `versions[].s3Key` are excluded.

---

## 8. Plans & Billing

### 8.1 Plan Distribution

**`GET /api/admin/plans/distribution`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "total": 14,
    "byPlan": [
      {
        "plan": "trial",
        "count": 12,
        "totalStorageUsed": 85189863,
        "totalStorageQuota": 1288490188800,
        "statusBreakdown": {
          "trial": 9,
          "expired": 3
        },
        "defaults": {
          "storageQuota": 107374182400,
          "maxConnections": 2,
          "maxFileVersions": 10
        }
      },
      {
        "plan": "paid",
        "count": 2,
        "totalStorageUsed": 1181116006400,
        "totalStorageQuota": 2199023255552,
        "statusBreakdown": {
          "active": 2
        },
        "defaults": {
          "storageQuota": 1099511627776,
          "maxConnections": 20,
          "maxFileVersions": 50,
          "softSeatCap": 100,
          "overageBlockBytes": 107374182400,
          "overagePriceCents": 4000,
          "overageCapBlocks": 50
        }
      }
    ],
    "trialExpiringSoon": 0
  }
}
```

> `defaults` for each plan is pulled from the current `PlatformConfig.planDefaults`.

---

### 8.2 Get Plan Defaults

**`GET /api/admin/plans/defaults`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "trial": {
      "storageQuota": 107374182400,
      "maxConnections": 2,
      "maxFileVersions": 10
    },
    "paid": {
      "storageQuota": 1099511627776,
      "maxConnections": 20,
      "maxFileVersions": 50,
      "softSeatCap": 100,
      "overageBlockBytes": 107374182400,
      "overagePriceCents": 4000,
      "overageCapBlocks": 50
    }
  }
}
```

> Neither plan has a `maxMembers` — **users are unlimited on both**. `softSeatCap`
> is an alert threshold only; it never blocks an invite.

---

### 8.3 Update Plan Defaults

**`PUT /api/admin/plans/defaults`**

This is where the pricing knobs live. All tiers and fields are optional — provide
only what you want to change.

```json
// Request body
{
  "trial": {
    "storageQuota": 214748364800
  },
  "paid": {
    "storageQuota": 2199023255552,
    "overagePriceCents": 5000,
    "overageCapBlocks": 100
  }
}
```

**Fields**

| Tier | Field | Meaning |
|------|-------|---------|
| `trial` / `paid` | `storageQuota` | Included storage in bytes. Must be > 0. |
| `trial` / `paid` | `maxConnections` | BYOS storage connections allowed |
| `trial` / `paid` | `maxFileVersions` | Retained versions per file |
| `paid` only | `softSeatCap` | Seat count above which we raise an alert. **Never blocks.** |
| `paid` only | `overageBlockBytes` | Overage billing unit. Default 100 GB. Must be > 0. |
| `paid` only | `overagePriceCents` | Price per block. Default `4000` = $40.00. |
| `paid` only | `overageCapBlocks` | Max blocks billable per period. Default 50 = 5 TB / $2,000. |

> Overage and seat-cap fields are rejected on `trial` — trials never incur charges.

**Changes apply to new quota assignments**, i.e. the next org creation, plan
change, or subscription event. Existing orgs keep their current `storageQuota`
until one of those happens; use `PUT /api/admin/organizations/:orgId/quota` to
change one immediately. Overage price and cap changes take effect on the **next
invoice**, since the charge is computed at `invoice.created`.

Trial *length* is separate — `globalSettings.trialDays`, set via
`PUT /api/admin/system/config` (§9.2).

```json
// 400 Response — validation
{
  "success": false,
  "message": "Invalid plan updates",
  "errors": [
    "paid.storageQuota must be greater than zero",
    "trial.overagePriceCents must be a non-negative number"
  ]
}
```

```json
// 200 Response
{
  "success": true,
  "message": "Plan defaults updated successfully",
  "data": {
    "trial": { "storageQuota": 214748364800, "maxConnections": 2, "maxFileVersions": 10 },
    "paid": {
      "storageQuota": 2199023255552,
      "maxConnections": 20,
      "maxFileVersions": 50,
      "softSeatCap": 100,
      "overageBlockBytes": 107374182400,
      "overagePriceCents": 5000,
      "overageCapBlocks": 100
    }
  }
}
```

---


### 8.4 Billing Overview

**`GET /api/admin/billing/overview`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "summary": {
      "orgsWithStripeCustomer": 3,
      "orgsWithActiveSubscription": 2,
      "orgsOnTrial": 9,
      "trialExpiredUnpaid": 0,
      "orgsExpired": 3,
      "orgsOverQuota": 1,
      "orgsWithOverageAuthorized": 1,
      "byPlan": {
        "trial": 12,
        "paid": 2
      }
    },
    "trialsExpiringSoon": {
      "within7Days": 2,
      "within30Days": 5,
      "organizations": []
    },
    "recentPlanUpgrades": []
  }
}
```

| Field | Meaning |
|-------|---------|
| `orgsOnTrial` | `status: "trial"` — inside the free window |
| `trialExpiredUnpaid` | Still `status: "trial"` but past `trialEndsAt`. **Should be 0** — a non-zero value means the 01:00 UTC `expireTrials` cron is not running. |
| `orgsExpired` | `status: "expired"` — trial over or subscription cancelled; read-only |
| `orgsOverQuota` | Paid orgs storing more than their allowance |
| `orgsWithOverageAuthorized` | Paid orgs that have ticked the overage checkbox |

> `recentPlanUpgrades` lists orgs on the `paid` plan updated in the last 30 days.

---

### 8.5 Storage Overage Overview

**`GET /api/admin/billing/overage`**

Every paid organization currently above its storage allowance, with the charge it
will incur on its next invoice. Capped at 200 organizations, largest first.

```json
// 200 Response
{
  "success": true,
  "data": {
    "pricing": {
      "blockBytes": 107374182400,
      "pricePerBlockCents": 4000,
      "maxBlocks": 50
    },
    "summary": {
      "organizationsOverQuota": 2,
      "authorized": 1,
      "blocked": 1,
      "projectedRevenueCents": 12000
    },
    "organizations": [
      {
        "organizationId": "org_abc123",
        "name": "Acme Corp",
        "slug": "acme-corp",
        "status": "active",
        "storageUsed": 1369965379584,
        "storageQuota": 1099511627776,
        "periodPeakStorageUsed": 1369965379584,
        "overageBytes": 270453751808,
        "blocks": 3,
        "uncappedBlocks": 3,
        "capReached": false,
        "overageAuthorized": true,
        "uploadsBlocked": false,
        "projectedChargeCents": 12000
      }
    ]
  }
}
```

| Field | Meaning |
|-------|---------|
| `periodPeakStorageUsed` | High-water mark this billing period. **This is what the charge is computed from**, not `storageUsed` — deleting data before the invoice does not avoid the charge. |
| `blocks` | Billable blocks after the cap is applied |
| `uncappedBlocks` | What it would be without the cap; exceeds `blocks` when `capReached` |
| `uploadsBlocked` | True when the org is over quota **without** authorizing overage — they cannot upload at all. These are the accounts worth contacting. |
| `projectedChargeCents` | `0` for unauthorized orgs; they are blocked rather than billed |

`summary.projectedRevenueCents` counts authorized orgs only.

---


## 9. System Configuration

### 9.1 Get Full Platform Config

**`GET /api/admin/system/config`**

No query parameters. Returns the full singleton `PlatformConfig` document.

```json
// 200 Response
{
  "success": true,
  "data": {
    "_id": "singleton",
    "planDefaults": {
      "free": {
        "storageQuota": 5368709120,
        "maxMembers": 5,
        "maxConnections": 1,
        "maxFileVersions": 5
      },
      "pro": {
        "storageQuota": 107374182400,
        "maxMembers": 50,
        "maxConnections": 5,
        "maxFileVersions": 25
      },
      "enterprise": {
        "storageQuota": 1099511627776,
        "maxMembers": 500,
        "maxConnections": 20,
        "maxFileVersions": 50
      }
    },
    "globalSettings": {
      "maxUploadSize": 5368709120,
      "defaultTrashRetention": 30,
      "signupEnabled": true,
      "maintenanceMode": false,
      "maintenanceMessage": ""
    },
    "featureFlags": {
      "byosEnabled": true,
      "fileRequestsEnabled": true,
      "customDomainsEnabled": true,
      "twoFactorRequired": false,
      "googleOAuthEnabled": true,
      "microsoftOAuthEnabled": true,
      "auditLogsEnabled": true,
      "shareLinkEnabled": true
    },
    "emailSettings": {
      "fromName": "Filebackerz",
      "fromEmail": "noreply@filebackerz.com",
      "sendWelcomeEmail": true,
      "sendPasswordResetEmail": true,
      "sendInvitationEmail": true,
      "sendShareNotificationEmail": true
    },
    "securitySettings": {
      "maxFailedLogins": 5,
      "lockoutDuration": 120,
      "sessionTimeout": 1440,
      "passwordMinLength": 8,
      "requireEmailVerification": true,
      "ipBlocklist": [],
      "allowedCorsOrigins": []
    },
    "createdAt": "2026-04-12T18:30:00.000Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

---

### 9.2 Update Platform Config

**`PUT /api/admin/system/config`**

Partially updates the platform config. Provide only the top-level sections you want to update — unspecified sections are untouched.

Allowed top-level sections: `planDefaults`, `globalSettings`, `featureFlags`, `emailSettings`, `securitySettings`.

```json
// Request body — update any combination of sections
{
  "globalSettings": {
    "defaultTrashRetention": 60,
    "maxUploadSize": 10737418240
  },
  "securitySettings": {
    "maxFailedLogins": 10,
    "lockoutDuration": 60
  }
}
```

```json
// 200 Response
{
  "success": true,
  "message": "Platform config updated successfully",
  "data": {
    "_id": "singleton",
    "planDefaults": { /* current planDefaults */ },
    "globalSettings": {
      "maxUploadSize": 10737418240,
      "defaultTrashRetention": 60,
      "signupEnabled": true,
      "maintenanceMode": false,
      "maintenanceMessage": ""
    },
    "featureFlags": { /* current featureFlags */ },
    "emailSettings": { /* current emailSettings */ },
    "securitySettings": {
      "maxFailedLogins": 10,
      "lockoutDuration": 60,
      "sessionTimeout": 1440,
      "passwordMinLength": 8,
      "requireEmailVerification": true,
      "ipBlocklist": [],
      "allowedCorsOrigins": []
    },
    "createdAt": "2026-04-12T18:30:00.000Z",
    "updatedAt": "2026-04-12T18:45:00.000Z"
  }
}
```

```json
// 400 Response
{
  "success": false,
  "message": "No valid config sections provided"
}
```

---

### 9.3 System Health

**`GET /api/admin/system/health`**

No query parameters. Checks database, S3, and email connectivity in parallel.

```json
// 200 Response — all healthy
{
  "success": true,
  "data": {
    "overall": "healthy",
    "checkedAt": "2026-04-12T18:48:41.511Z",
    "services": {
      "database": {
        "status": "ok",
        "latencyMs": 278
      },
      "storage": {
        "status": "ok",
        "latencyMs": 1731,
        "bucket": "filebackerz"
      },
      "email": {
        "status": "ok",
        "message": "Email service loaded (no verify method)"
      }
    }
  }
}
```

```json
// 503 Response — one or more services degraded
{
  "success": false,
  "data": {
    "overall": "degraded",
    "checkedAt": "2026-04-12T18:48:41.511Z",
    "services": {
      "database": {
        "status": "ok",
        "latencyMs": 278
      },
      "storage": {
        "status": "error",
        "error": "NoSuchBucket: The specified bucket does not exist"
      },
      "email": {
        "status": "ok",
        "message": "Email service loaded (no verify method)"
      }
    }
  }
}
```

> Possible `status` values per service: `"ok"`, `"error"`, `"unconfigured"`.

---

### 9.4 Toggle Maintenance Mode

**`POST /api/admin/system/maintenance`**

```json
// Request body
{
  "enabled": true,
  "message": "System maintenance in progress. Back in 30 minutes."
}
```

> `enabled` is required (boolean). `message` is optional (string).

```json
// 200 Response
{
  "success": true,
  "message": "Maintenance mode enabled",
  "data": {
    "maintenanceMode": true,
    "maintenanceMessage": "System maintenance in progress. Back in 30 minutes."
  }
}
```

```json
// 400 Response
{
  "success": false,
  "message": "`enabled` must be a boolean"
}
```

---

### 9.5 Get Feature Flags

**`GET /api/admin/system/feature-flags`**

No query parameters.

```json
// 200 Response
{
  "success": true,
  "data": {
    "byosEnabled": true,
    "fileRequestsEnabled": true,
    "customDomainsEnabled": true,
    "twoFactorRequired": false,
    "googleOAuthEnabled": true,
    "microsoftOAuthEnabled": true,
    "auditLogsEnabled": true,
    "shareLinkEnabled": true
  }
}
```

---

### 9.6 Update Feature Flags

**`PUT /api/admin/system/feature-flags`**

Provide any subset of flags. All values must be booleans.

```json
// Request body
{
  "fileRequestsEnabled": false,
  "twoFactorRequired": true
}
```

| Flag | Description |
|---|---|
| `byosEnabled` | Allow organizations to connect external storage |
| `fileRequestsEnabled` | Allow organizations to create file request links |
| `customDomainsEnabled` | Allow organizations to set custom domains |
| `twoFactorRequired` | Force 2FA for all users platform-wide |
| `googleOAuthEnabled` | Allow Google OAuth sign-in |
| `microsoftOAuthEnabled` | Allow Microsoft OAuth sign-in |
| `auditLogsEnabled` | Enable audit log recording |
| `shareLinkEnabled` | Allow creation of share links |

```json
// 200 Response
{
  "success": true,
  "message": "Feature flags updated successfully",
  "data": {
    "byosEnabled": true,
    "fileRequestsEnabled": false,
    "customDomainsEnabled": true,
    "twoFactorRequired": true,
    "googleOAuthEnabled": true,
    "microsoftOAuthEnabled": true,
    "auditLogsEnabled": true,
    "shareLinkEnabled": true
  }
}
```

```json
// 400 Response — non-boolean value
{
  "success": false,
  "message": "Feature flag `byosEnabled` must be a boolean"
}
```

```json
// 400 Response — no valid flags
{
  "success": false,
  "message": "No valid feature flags provided"
}
```

---

## 10. Error Responses

### 401 Unauthorized — No or invalid token

```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 403 Forbidden — Authenticated but insufficient role

```json
{
  "success": false,
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "User not found"
}
```

or (content moderation routes use `message` instead of `error`):

```json
{
  "success": false,
  "message": "Share link not found"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "error": "status must be one of: active, inactive, pending"
}
```

### 409 Conflict

```json
{
  "success": false,
  "error": "Subdomain is already taken or reserved"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Quick Reference — All Admin Routes

| Method | Path | Description |
|---|---|---|
| **Dashboard** | | |
| `GET` | `/api/admin/dashboard/overview` | Platform KPIs |
| `GET` | `/api/admin/dashboard/growth` | Time-series growth |
| `GET` | `/api/admin/dashboard/storage` | Storage breakdown |
| `GET` | `/api/admin/dashboard/activity` | Activity feed (audit logs) |
| **Users** | | |
| `GET` | `/api/admin/users` | List all users |
| `GET` | `/api/admin/users/:userId` | Get user + org memberships |
| `PUT` | `/api/admin/users/:userId/status` | Update user status |
| `PUT` | `/api/admin/users/:userId/role` | Update platform role |
| `POST` | `/api/admin/users/:userId/reset-password` | Force password reset email |
| `POST` | `/api/admin/users/:userId/verify-email` | Force email verification |
| `DELETE` | `/api/admin/users/:userId/2fa` | Disable 2FA |
| `GET` | `/api/admin/users/:userId/sessions` | List active sessions |
| `DELETE` | `/api/admin/users/:userId/sessions` | Revoke all sessions |
| `GET` | `/api/admin/users/:userId/organizations` | List user's orgs |
| `GET` | `/api/admin/users/:userId/audit-logs` | User's audit trail |
| **Organizations** | | |
| `GET` | `/api/admin/organizations` | List all orgs |
| `GET` | `/api/admin/organizations/:orgId` | Get org details |
| `PUT` | `/api/admin/organizations/:orgId/status` | Update status |
| `PUT` | `/api/admin/organizations/:orgId/plan` | Change plan |
| `PUT` | `/api/admin/organizations/:orgId/quota` | Override storage quota |
| `PUT` | `/api/admin/organizations/:orgId/trial` | **Grant extra free trial days** |
| `PUT` | `/api/admin/organizations/:orgId/overage` | Force overage authorization on/off |
| `PUT` | `/api/admin/organizations/:orgId/seat-cap` | Per-org fair-use seat alert threshold |
| `GET` | `/api/admin/organizations/:orgId/storage-history` | Daily usage snapshots |
| `PUT` | `/api/admin/organizations/:orgId/settings` | Override org settings |
| `GET` | `/api/admin/organizations/:orgId/members` | List members |
| `GET` | `/api/admin/organizations/:orgId/storage` | Storage details |
| `GET` | `/api/admin/organizations/:orgId/storage-connections` | BYOS connections |
| `GET` | `/api/admin/organizations/:orgId/audit-logs` | Org audit trail |
| `PUT` | `/api/admin/organizations/:orgId/subdomain` | Force-change subdomain |
| `DELETE` | `/api/admin/organizations/:orgId` | Hard delete org |
| **Storage** | | |
| `GET` | `/api/admin/storage/overview` | Platform storage stats |
| `GET` | `/api/admin/storage/connections` | All BYOS connections |
| `GET` | `/api/admin/storage/connections/:connectionId` | Single connection |
| `POST` | `/api/admin/storage/connections/:connectionId/health-check` | Trigger health check |
| `GET` | `/api/admin/storage/internal` | Internal S3 usage |
| `GET` | `/api/admin/storage/top-consumers` | Top storage consumers |
| **Security** | | |
| `GET` | `/api/admin/security/audit-logs` | Cross-org audit logs |
| `GET` | `/api/admin/security/audit-logs/export` | Export logs (JSON/CSV) |
| `GET` | `/api/admin/security/alerts` | Security alerts |
| `GET` | `/api/admin/security/failed-logins` | Failed login attempts |
| `GET` | `/api/admin/security/anomalies` | Detected anomalies |
| `GET` | `/api/admin/security/active-sessions` | Session distribution |
| `GET` | `/api/admin/security/2fa-stats` | 2FA adoption stats |
| **Content** | | |
| `GET` | `/api/admin/content/share-links` | List all share links |
| `GET` | `/api/admin/content/share-links/:linkId` | Share link + access log |
| `DELETE` | `/api/admin/content/share-links/:linkId` | Revoke share link |
| `GET` | `/api/admin/content/file-requests` | List all file requests |
| `DELETE` | `/api/admin/content/file-requests/:requestId` | Deactivate file request |
| `GET` | `/api/admin/content/anonymous-uploads` | List anonymous uploads |
| `GET` | `/api/admin/content/files/:fileId` | File metadata |
| **Plans** | | |
| `GET` | `/api/admin/plans/distribution` | Orgs by plan |
| `GET` | `/api/admin/plans/defaults` | Plan quota/limit defaults |
| `PUT` | `/api/admin/plans/defaults` | Update plan defaults |
| `GET` | `/api/admin/billing/overview` | Billing summary |
| `GET` | `/api/admin/billing/overage` | Orgs over quota + projected overage revenue |
| **System** | | |
| `GET` | `/api/admin/system/config` | Full platform config |
| `PUT` | `/api/admin/system/config` | Update platform config |
| `GET` | `/api/admin/system/health` | System health check |
| `POST` | `/api/admin/system/maintenance` | Toggle maintenance mode |
| `GET` | `/api/admin/system/feature-flags` | Get feature flags |
| `PUT` | `/api/admin/system/feature-flags` | Update feature flags |

---

## Storage Units Reference

All storage values in this API are in **bytes**.

| Value | Bytes |
|---|---|
| 5 GB (free plan default) | `5368709120` |
| 10 GB | `10737418240` |
| 100 GB (pro plan default) | `107374182400` |
| 1 TB (enterprise plan default) | `1099511627776` |

---

*Generated: 2026-04-12 — Filebackerz Platform Admin API v1.0*
