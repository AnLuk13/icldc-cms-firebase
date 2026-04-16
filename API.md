# ICLDC Backend API Summary

## Common Types

### `MultilingualContent`

| Field | Type   |
| ----- | ------ |
| `ro`  | string |
| `ru`  | string |
| `en`  | string |

### `Event`

| Field              | Type                | Required |
| ------------------ | ------------------- | -------- |
| `name`             | MultilingualContent | yes      |
| `description`      | MultilingualContent | no       |
| `location`         | string              | no       |
| `startDate`        | Date                | no       |
| `endDate`          | Date                | no       |
| `organizer`        | string              | no       |
| `registrationLink` | string              | no       |
| `bannerImage`      | string              | no       |
| `tags`             | string[]            | no       |

### `News`

| Field         | Type                | Required |
| ------------- | ------------------- | -------- |
| `name`        | MultilingualContent | yes      |
| `content`     | MultilingualContent | yes      |
| `summary`     | MultilingualContent | no       |
| `author`      | string              | no       |
| `documents`   | string[]            | no       |
| `category`    | string              | no       |
| `tags`        | string[]            | no       |
| `publishedAt` | Date                | no       |
| `bannerImage` | string              | no       |

### `Project`

| Field         | Type                                    | Required           |
| ------------- | --------------------------------------- | ------------------ |
| `name`        | MultilingualContent                     | yes                |
| `description` | MultilingualContent                     | yes                |
| `status`      | `"ongoing" \| "completed" \| "planned"` | default: `planned` |
| `startDate`   | Date                                    | no                 |
| `endDate`     | Date                                    | no                 |
| `partners`    | ObjectId[] (ref: Partner)               | no                 |
| `documents`   | string[]                                | no                 |
| `tags`        | string[]                                | no                 |

### `Partner`

| Field         | Type                      | Required |
| ------------- | ------------------------- | -------- |
| `name`        | MultilingualContent       | yes      |
| `description` | MultilingualContent       | no       |
| `logo`        | string                    | no       |
| `website`     | string                    | no       |
| `projects`    | ObjectId[] (ref: Project) | no       |

### `User`

| Field      | Type                  | Required          |
| ---------- | --------------------- | ----------------- |
| `name`     | string                | yes               |
| `email`    | string                | yes (unique)      |
| `password` | string                | yes               |
| `role`     | `"admin" \| "editor"` | default: `editor` |

---

## Endpoints

### Site (public GET only)

| Method | Path            | Description                                                  |
| ------ | --------------- | ------------------------------------------------------------ |
| GET    | `/events`       | List all events                                              |
| GET    | `/events/:id`   | Get event by ID                                              |
| GET    | `/news`         | List all news                                                |
| GET    | `/news/:id`     | Get news by ID                                               |
| GET    | `/projects`     | List all projects (optional query: `?status=` / `?partner=`) |
| GET    | `/projects/:id` | Get project by ID                                            |
| GET    | `/partners`     | List all partners                                            |
| GET    | `/partners/:id` | Get partner by ID                                            |

---

### CMS (authenticated)

> `JWT` = requires valid JWT token (editor or admin)  
> `Admin` = requires admin role

#### Auth

| Method | Path            | Guard | Description              |
| ------ | --------------- | ----- | ------------------------ |
| POST   | `/auth/login`   | —     | Login, returns JWT       |
| GET    | `/auth/profile` | JWT   | Get current user profile |

#### Users

| Method | Path         | Guard | Description       |
| ------ | ------------ | ----- | ----------------- |
| POST   | `/users`     | Admin | Create a new user |
| GET    | `/users`     | —     | List all users    |
| GET    | `/users/:id` | —     | Get user by ID    |

#### Events

| Method | Path          | Guard | Description  |
| ------ | ------------- | ----- | ------------ |
| POST   | `/events`     | JWT   | Create event |
| PUT    | `/events/:id` | JWT   | Update event |
| DELETE | `/events/:id` | Admin | Delete event |

#### News

| Method | Path        | Guard | Description |
| ------ | ----------- | ----- | ----------- |
| POST   | `/news`     | JWT   | Create news |
| PUT    | `/news/:id` | JWT   | Update news |
| DELETE | `/news/:id` | Admin | Delete news |

#### Projects

| Method | Path            | Guard | Description    |
| ------ | --------------- | ----- | -------------- |
| POST   | `/projects`     | JWT   | Create project |
| PUT    | `/projects/:id` | JWT   | Update project |
| DELETE | `/projects/:id` | Admin | Delete project |

#### Partners

| Method | Path            | Guard | Description    |
| ------ | --------------- | ----- | -------------- |
| POST   | `/partners`     | JWT   | Create partner |
| PUT    | `/partners/:id` | JWT   | Update partner |
| DELETE | `/partners/:id` | Admin | Delete partner |
