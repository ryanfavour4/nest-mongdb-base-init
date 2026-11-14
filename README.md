# NestJS MongoDB Todo CRUD API

A production-ready NestJS REST API using MongoDB Atlas with Mongoose. Built with a clean, document-oriented architecture featuring schemas, lightweight `nestjs-paginate` style global pagination, query syntaxes (sorting & keyword search), DTO validations, and interactive Swagger documentation.

---

## 📁 Project Structure

```
├── 📁 public
│   └── 📁 uploads
│       └── ⚙️ .gitkeep
├── 📁 src
│   ├── 📁 common
│   │   ├── 📁 dto
│   │   │   └── 📄 pagination-query.dto.ts
│   │   └── 📁 pagination
│   │       ├── 📄 paginate.ts
│   │       └── 📄 pagination.types.ts
│   ├── 📁 config
│   │   └── 📄 database.config.ts
│   ├── 📁 todos
│   │   ├── 📁 dto
│   │   │   ├── 📄 create-todo.dto.ts
│   │   │   ├── 📄 update-todo.dto.ts
│   │   │   └── 📄 query-todo.dto.ts
│   │   ├── 📁 schemas
│   │   │   └── 📄 todo.schema.ts
│   │   ├── 📄 todos.controller.ts
│   │   ├── 📄 todos.module.ts
│   │   └── 📄 todos.service.ts
│   ├── 📁 utils
│   │   ├── 📄 convert.ts
│   │   └── 📄 date.ts
│   ├── 📄 app.controller.ts
│   ├── 📄 app.module.ts
│   ├── 📄 app.service.ts
│   └── 📄 main.ts
├── ⚙️ .env
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── ⚙️ .prettierrc
├── 🐳 Dockerfile
├── 📝 README.md
├── 📄 eslint.config.mjs
├── ⚙️ nest-cli.json
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
└── ⚙️ tsconfig.json
```

---

## ⚙️ Environment Configuration

Set up your `.env` file from `.env.example`:

```bash
cp .env.example .env
```

### MongoDB Atlas Setup

Configure your connection string in `.env`. Replace `<db_password>` with your database user password:

```env
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1

MONGODB_URI=mongodb+srv://mrcharles:<db_password>@cluster0.0i6agvs.mongodb.net/test-db?retryWrites=true&w=majority
MONGODB_DB_NAME=test-db
```

> **Note:** If your password contains special characters (e.g. `@`, `:`, `/`, `#`), ensure it is URL-encoded.

---

## 🚀 Getting Started

### 1. Install Dependencies

Using `pnpm`:

```bash
pnpm install
```

### 2. Start Application

Development mode with hot reload:

```bash
pnpm run start:dev
```

Production build:

```bash
pnpm run build
pnpm run start:prod
```

---

## 📖 Interactive Swagger Documentation

Swagger is built directly into the application, providing interactive testing for all endpoints and queries:

- **Swagger UI:** [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)
- **Health Check:** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

## 🌐 Global Standardized Pagination (`nestjs-paginate` Style)

Pagination works uniformly across the entire project. It accepts standard query syntaxes and returns a clean, predictable response structure with `data`, `meta`, and `links`.

### Response Structure:

```json
{
  "data": [
    {
      "id": "67104b2c86e0df0012ab34cd",
      "title": "Complete NestJS Setup",
      "description": "Clean Mongoose schema with nestjs-paginate style pagination",
      "isCompleted": false,
      "priority": "high",
      "tags": ["backend", "mongodb"],
      "createdAt": "2026-10-16T14:00:00.000Z",
      "updatedAt": "2026-10-16T14:30:00.000Z"
    }
  ],
  "meta": {
    "itemsPerPage": 10,
    "totalItems": 44,
    "currentPage": 1,
    "totalPages": 5,
    "sortBy": [
      [
        "createdAt",
        "DESC"
      ]
    ]
  },
  "links": {
    "current": "http://localhost:3000/api/v1/todos?page=1&limit=10&sortBy=createdAt:DESC",
    "next": "http://localhost:3000/api/v1/todos?page=2&limit=10&sortBy=createdAt:DESC",
    "last": "http://localhost:3000/api/v1/todos?page=5&limit=10&sortBy=createdAt:DESC"
  }
}
```

### Supported Query Syntaxes:
- `page`: Page number (default: `1`, min: `1`)
- `limit`: Items per page (default: `10`, min: `1`, max: `100`)
- `sortBy`: Sort expression (e.g. `createdAt:desc`, `title:asc`, `-createdAt`)
- `search`: Keyword search matching title and description

### How to use across any new resource in 2 simple steps:

1. **In your Query DTO:** Extend `PaginationQueryDto`:
   ```typescript
   import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

   export class QueryMyResourceDto extends PaginationQueryDto {
     // only add resource-specific filters here!
   }
   ```

2. **In your Service:** Call the global `paginate()` helper:
   ```typescript
   import { paginate } from '../common/pagination/paginate';

   async findAll(queryDto: QueryMyResourceDto, req?: Request) {
     const filter: Record<string, any> = {};
     // add your filters...

     return paginate<MyModel>(this.myModel, queryDto, {
       searchableFields: ['title', 'description'],
       defaultSortBy: ['createdAt', 'DESC'],
       filter,
     }, req);
   }
   ```

---

## 📬 API Endpoints (Todos CRUD)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/todos` | Create a new todo |
| `GET` | `/api/v1/todos` | List todos with pagination, sort query, keyword search, priority & status filters |
| `GET` | `/api/v1/todos/:id` | Retrieve a single todo by MongoDB ObjectId |
| `PATCH` | `/api/v1/todos/:id` | Update a todo by ID |
| `PATCH` | `/api/v1/todos/:id/toggle` | Toggle `isCompleted` status |
| `DELETE` | `/api/v1/todos/:id` | Delete a todo by ID |

---

## 🐳 Docker Deployment

Build and run using Docker:

```bash
docker build -t nest-todo-api .
docker run -p 3000:3000 --env-file .env nest-todo-api
```
