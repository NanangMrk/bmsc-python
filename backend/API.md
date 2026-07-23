# BMSC API Architecture & Documentation

All API endpoints are mounted under the `/api` prefix on the server.

Base URL:
- Development: `http://localhost:3000/api`
- Production: `https://domain-saya.com/api`

---

## Headers & Authentication

For authenticated routes, supply the JSON Web Token in the request header:
```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## API Endpoints Overview

### 1. System & Health Check
- **`GET /api/health`**
  - **Auth**: Public
  - **Description**: Returns system health status and uptime metrics.
  - **Response**:
    ```json
    {
      "status": "ok",
      "service": "BMSC API",
      "timestamp": "2026-07-23T15:18:40.000Z",
      "uptime": 1234.5
    }
    ```

---

### 2. Authentication (`/api/auth`)
- **`POST /api/auth/login`**
  - **Auth**: Public (Rate Limited: Max 15 attempts / 15 mins)
  - **Body**: `{ "email": "admin@email.com", "password": "password123" }`
  - **Response**: `{ "token": "<JWT_TOKEN>", "user": { ... } }`

- **`GET /api/auth/me`**
  - **Auth**: Bearer Token
  - **Response**: User profile object with assigned roles & permissions.

---

### 3. Role Management (`/api/roles`)
- **`GET /api/roles`**: List all user roles.
- **`POST /api/roles`**: Create a new role.
- **`PUT /api/roles/:id`**: Update an existing role.
- **`DELETE /api/roles/:id`**: Delete a role.

---

### 4. User Management (`/api/users`)
- **`GET /api/users`**: List all system users.
- **`POST /api/users`**: Create a user.
- **`PUT /api/users/:id`**: Update user profile/role.
- **`DELETE /api/users/:id`**: Delete a user.
- **`POST /api/users/:id/access`**: Manage granular user access rights.

---

### 5. Platform Management (`/api/platforms`)
- **`GET /api/platforms`**: Get active content distribution platforms.
- **`POST /api/platforms`**: Add a new platform.

---

### 6. Rate Card (`/api/ratecards`)
- **`GET /api/ratecards`**: Get pricing rate card.
- **`POST /api/ratecards`**: Create/update rate card entries.

---

### 7. Project Management (`/api/projects`)
- **`GET /api/projects`**: List projects.
- **`POST /api/projects`**: Create project.
- **`GET /api/projects/:id`**: Get project details.
- **`PUT /api/projects/:id`**: Update project details.
- **`DELETE /api/projects/:id`**: Delete project.
- **`PATCH /api/projects/:id/progress`**: Update project progress percentage/status.
- **`POST /api/projects/:id/concept`**: Save project concept details.
- **`GET /api/projects/:id/tasks`**: List production tasks (Kanban).
- **`POST /api/projects/:id/tasks`**: Create task.
- **`PUT /api/projects/:id/tasks/:taskId`**: Update task state.
- **`DELETE /api/projects/:id/tasks/:taskId`**: Delete task.
- **`GET /api/projects/:id/uploads`**: List uploaded assets.
- **`POST /api/projects/:id/uploads`**: Add uploaded link/asset.
- **`DELETE /api/projects/:id/uploads/:uploadId`**: Delete asset.
- **`GET /api/projects/:id/payments`**: List project payment records.
- **`POST /api/projects/:id/payments`**: Add payment record.
- **`PATCH /api/projects/payments/:paymentId`**: Update payment record.
- **`DELETE /api/projects/payments/:paymentId`**: Delete payment record.
- **`GET /api/projects/public-payment/:token`**: Public view for payment confirmation.
- **`GET /api/projects/oembed-proxy`**: Proxy for fetching media oEmbed metadata.

---

### 8. Scripts & Production Copy (`/api/projects/:id/scripts`)
- **`GET /api/projects/:id/scripts`**: Fetch script table rows.
- **`POST /api/projects/:id/scripts/save`**: Save script rows & word count.
- **`POST /api/projects/:id/scripts/rows/:rowId/comments`**: Add inline comment to script row.

---

### 9. File Upload Service (`/api/upload`)
- **`POST /api/upload/single`**: Single file upload (`multipart/form-data` with field `file`). Returns file metadata & static URL path `/uploads/<filename>`.
- **`POST /api/upload/multiple`**: Batch file upload.

---

### 10. Financial Management (`/api/finance`)
- **`GET /api/finance/quotations`**: List quotation documents.
- **`POST /api/finance/quotations`**: Create quotation.
- **`GET /api/finance/quotations/:id`**: Quotation detail.
- **`PATCH /api/finance/quotations/:id`**: Update quotation.
- **`DELETE /api/finance/quotations/:id`**: Delete quotation.
- **`GET /api/finance/invoices`**: List invoices.
- **`POST /api/finance/invoices`**: Create invoice.
- **`GET /api/finance/invoices/:id`**: Invoice detail.
- **`PATCH /api/finance/invoices/:id/status`**: Update invoice payment status.
- **`GET /api/finance/invoices/public/:token`**: Public link view for invoice.
- **`GET /api/finance/transactions`**: Financial transaction log.
- **`POST /api/finance/transactions`**: Record financial transaction.
- **`DELETE /api/finance/transactions/:id`**: Delete financial transaction log.

---

### 11. Brands (`/api/brands`)
- **`GET /api/brands`**: List brands.
- **`POST /api/brands`**: Add brand.

---

### 12. Payments (`/api/payments`)
- **`PATCH /api/payments/:id/status`**: Update payment status.

---

### 13. Shipments (`/api/shipments`)
- **`GET /api/shipments`**: List product shipments.
- **`POST /api/shipments`**: Create shipment tracking.
- **`PATCH /api/shipments/:id`**: Update shipment status.

---

### 14. Bank Accounts (`/api/bank-accounts`)
- **`GET /api/bank-accounts`**: List company bank accounts.
- **`POST /api/bank-accounts`**: Add bank account.
- **`PATCH /api/bank-accounts/:id`**: Update bank account details.
- **`DELETE /api/bank-accounts/:id`**: Remove bank account.

---

### 15. Chat & Discussions (`/api/chats`)
- **`GET /api/chats/:projectId`**: Get project discussion messages.
- **`POST /api/chats/:projectId`**: Post chat message or attachment.

---

### 16. Settings (`/api/settings`)
- **`GET /api/settings`**: Get application configuration settings.
- **`PATCH /api/settings`**: Update application settings.

---

### 17. Dashboard & Statistics (`/api/dashboard`)
- **`GET /api/dashboard/stats`**: Get main dashboard summary metrics.

---

### 18. Notifications (`/api/notifications`)
- **`GET /api/notifications`**: Get user notifications.
- **`PUT /api/notifications/read-all`**: Mark all notifications read.
- **`PUT /api/notifications/:id/read`**: Mark single notification read.
