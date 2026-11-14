
# Complete Codebase Tutorial: NestJS MongoDB Todo API

Welcome! I'll walk you through this entire codebase step by step, explaining what each component does and how they work together.

## 🏗️ **Project Overview**

This is a **NestJS REST API** that provides a complete **Todo Management System** using **MongoDB Atlas** as the database. It follows clean architecture principles with:

- **Modular Design** - Separation of concerns
- **Global Pagination** - Standardized across all endpoints
- **DTO Validation** - Input validation and transformation
- **Swagger Documentation** - Interactive API docs
- **MongoDB Mongoose** - Object modeling for MongoDB

---

## 📁 **File Structure Breakdown**

### **Root Level Files**

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `nest-cli.json` - NestJS CLI configuration
- `.env.example` - Environment variables template
- `Dockerfile` - Container deployment setup

---

## 🚀 **Application Entry Point**

### **`src/main.ts`** - The Bootstrap File

This is where your application starts:

```typescript
// 1. Configure global pagination defaults
configureGlobalPagination();

// 2. Create NestJS application
const app = await NestFactory.create(AppModule);

// 3. Set up global configurations
app.enableCors(); // Enable cross-origin requests
app.setGlobalPrefix('api/v1'); // API versioning
app.useGlobalPipes(new ValidationPipe()); // Input validation

// 4. Set up Swagger documentation
const swaggerConfig = new DocumentBuilder()
  .setTitle('Todo CRUD API')
  .setDescription('Clean architecture NestJS REST API')
  .build();

const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api/v1/docs', app, document);

// 5. Start the server
await app.listen(port);
```

**Key Features:**

- **Global CORS** for cross-origin requests
- **Global API prefix** (`api/v1`) for versioning
- **Global validation** with `ValidationPipe`
- **Swagger docs** at `/api/v1/docs`

---

## 🧩 **Core Application Module**

### **`src/app.module.ts`** - Application Configuration

This is the root module that brings everything together:

```typescript
@Module({
  imports: [
    // 1. Configuration Module (loads environment variables)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env'],
    }),

    // 2. MongoDB Connection (async configuration)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.dbName'),
        retryAttempts: 3,
        retryDelay: 1000,
      }),
    }),

    // 3. Feature Modules
    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**What it does:**

- **Loads environment variables** from `.env` file
- **Connects to MongoDB Atlas** with retry logic
- **Imports feature modules** (Todos in this case)

---

## 🏥 **Health Check & Root Controller**

### **`src/app.controller.ts`** - Basic Health Endpoints

Simple controller for health checks:

```typescript
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // Root endpoint: GET /
  getRoot() {
    return this.appService.getHealth();
  }

  @Get('health') // Health check: GET /health
  getHealth() {
    return this.appService.getHealth();
  }
}
```

### **`src/app.service.ts`** - Health Service

Provides basic application health status:

```typescript
@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'online',
      service: 'NestJS MongoDB Todo CRUD API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## 📝 **Todo Management Feature**

### **`src/todos/todos.module.ts`** - Todo Feature Module

This module contains all todo-related functionality:

```typescript
@Module({
  imports: [
    // Mongoose schema registration
    MongooseModule.forFeature([
      {
        name: Todo.name,
        schema: TodoSchema,
      },
    ]),
  ],
  controllers: [TodosController],
  providers: [TodosService],
  exports: [TodosService], // Export for use in other modules
})
export class TodosModule {}
```

---

## 📊 **Todo Schema (Data Model)**

### **`src/todos/schemas/todo.schema.ts`** - MongoDB Schema

This defines the Todo data structure:

```typescript
@Schema({
  timestamps: true, // Automatically adds createdAt/updatedAt
  collection: 'todos',
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString(); // Convert _id to id
      delete ret._id; // Remove _id from JSON
      delete ret.__v; // Remove version field
      return ret;
    },
  },
})
export class Todo {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description?: string;

  @Prop({ default: false, index: true })
  isCompleted: boolean;

  @Prop({
    type: String,
    enum: Object.values(TodoPriority),
    default: TodoPriority.MEDIUM,
    index: true,
  })
  priority: TodoPriority;

  @Prop({ type: Date, default: null })
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}

// Apply global pagination plugin
TodoSchema.plugin(paginatePlugin);

// Create text index for searching
TodoSchema.index({ title: 'text', description: 'text' });
```

**Key Features:**

- **Automatic timestamps** (createdAt, updatedAt)
- **JSON transformation** (converts _id to id)
- **Database indexes** for performance
- **Text search** support on title and description
- **Pagination plugin** integration

---

## 🎮 **Todo Controller (API Endpoints)**

### **`src/todos/todos.controller.ts`** - REST API Endpoints

This defines all the HTTP endpoints for todos:

```typescript
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post() // CREATE: POST /todos
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get() // READ ALL: GET /todos
  findAll(@Query() queryDto: QueryTodoDto) {
    return this.todosService.findAll(queryDto);
  }

  @Get(':id') // READ ONE: GET /todos/:id
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Patch(':id') // UPDATE: PATCH /todos/:id
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Patch(':id/toggle') // TOGGLE: PATCH /todos/:id/toggle
  toggleComplete(@Param('id') id: string) {
    return this.todosService.toggleComplete(id);
  }

  @Delete(':id') // DELETE: DELETE /todos/:id
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
```

**Available Endpoints:**

- `POST /api/v1/todos` - Create new todo
- `GET /api/v1/todos` - List todos with pagination, search, filters
- `GET /api/v1/todos/:id` - Get specific todo
- `PATCH /api/v1/todos/:id` - Update todo
- `PATCH /api/v1/todos/:id/toggle` - Toggle completion status
- `DELETE /api/v1/todos/:id` - Delete todo

---

## 🔧 **Todo Service (Business Logic)**

### **`src/todos/todos.service.ts`** - Core Business Logic

This contains all the business logic for todo operations:

```typescript
@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private readonly todoModel: TodoModel) {}

  // CREATE: Create new todo
  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const createdTodo = new this.todoModel(createTodoDto);
    return await createdTodo.save();
  }

  // READ ALL: Find todos with pagination and filtering
  async findAll(queryDto: QueryTodoDto): Promise<PaginatedResponse<Todo>> {
    const filter: Record<string, any> = {};

    // Apply filters
    if (queryDto.isCompleted !== undefined) {
      filter.isCompleted = queryDto.isCompleted;
    }
    if (queryDto.priority) {
      filter.priority = queryDto.priority;
    }
    if (queryDto.tag) {
      filter.tags = queryDto.tag;
    }

    // Use global pagination helper
    return paginate<Todo>(this.todoModel, queryDto, filter, ['title', 'description']);
  }

  // READ ONE: Find todo by ID
  async findOne(id: string): Promise<Todo> {
    this.validateObjectId(id);
    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID '${id}' not found`);
    }
    return todo;
  }

  // UPDATE: Update existing todo
  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    this.validateObjectId(id);
    const updatedTodo = await this.todoModel
      .findByIdAndUpdate(id, { $set: updateTodoDto }, { new: true, runValidators: true })
      .exec();
    if (!updatedTodo) {
      throw new NotFoundException(`Todo with ID '${id}' not found`);
    }
    return updatedTodo;
  }

  // DELETE: Remove todo
  async remove(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    this.validateObjectId(id);
    const result = await this.todoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Todo with ID '${id}' not found`);
    }
    return {
      success: true,
      message: `Todo with ID '${id}' deleted successfully`,
      deletedId: id,
    };
  }

  // TOGGLE: Toggle completion status
  async toggleComplete(id: string): Promise<Todo> {
    this.validateObjectId(id);
    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID '${id}' not found`);
    }
    todo.isCompleted = !todo.isCompleted;
    return await todo.save();
  }

  // Helper: Validate MongoDB ObjectId
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`'${id}' is not a valid MongoDB ObjectId`);
    }
  }
}
```

---

## 📋 **Data Transfer Objects (DTOs)**

### **`src/todos/dto/create-todo.dto.ts`** - Create Todo Validation

Defines the structure and validation for creating todos:

```typescript
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
```

### **`src/todos/dto/update-todo.dto.ts`** - Update Todo Validation

Extends CreateTodoDto but makes all fields optional:

```typescript
export class UpdateTodoDto extends PartialType(CreateTodoDto) {}
```

### **`src/todos/dto/query-todo.dto.ts`** - Query Parameters

Extends base pagination with todo-specific filters:

```typescript
export class QueryTodoDto extends PaginationQueryDto {
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @IsOptional()
  @IsString()
  tag?: string;
}
```

---

## 🔄 **Global Pagination System**

### **`src/common/pagination/paginate.helper.ts`** - Pagination Logic

This is the heart of the global pagination system:

```typescript
export async function paginate<T>(
  model: PaginateModel<any>,
  query: PaginationQueryDto,
  customFilter: Record<string, any> = {},
  searchableFields: string[] = [],
): Promise<PaginatedResponse<T>> {
  const { page = 1, limit = 10, sortBy, search } = query;

  const filter: Record<string, any> = { ...customFilter };

  // Handle keyword search
  if (search && searchableFields.length > 0) {
    const cleanSearch = sanitizeSearchQuery(search);
    const searchConditions = searchableFields.map((field) => ({
      [field]: { $regex: cleanSearch, $options: 'i' },
    }));
    filter.$or = searchConditions;
  }

  const sort = parseSort(sortBy);

  const options: PaginateOptions = {
    page,
    limit,
    sort,
    customLabels: defaultPaginationCustomLabels,
  };

  const result = await model.paginate(filter, options);
  return result as unknown as PaginatedResponse<T>;
}
```

**Features:**

- **Automatic pagination** with page/limit
- **Flexible sorting** (field:asc, field:desc, -field)
- **Keyword search** across specified fields
- **Standardized response format**
- **Custom labels** for consistent API responses

### **`src/common/dto/pagination-query.dto.ts`** - Base Pagination DTO

Base class for all pagination queries:

```typescript
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
```

---

## ⚙️ **Configuration Files**

### **`src/config/database.config.ts`** - Database Configuration

Manages database connection settings:

```typescript
export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db',
  dbName: process.env.MONGODB_DB_NAME || 'test-db',
}));
```

### **`src/config/pagination.config.ts`** - Pagination Configuration

Defines global pagination settings:

```typescript
export const defaultPaginationCustomLabels = {
  docs: 'data',
  meta: 'pagination',
  totalDocs: 'totalDbRecord',
  page: 'page',
  limit: 'limit',
  totalPages: 'totalPages',
  hasNextPage: 'hasNextPage',
  hasPrevPage: 'hasPrevPage',
  nextPage: 'nextPage',
  prevPage: 'prevPage',
};

export function configureGlobalPagination(): void {
  const plugin = (mongoosePaginate as any).default || mongoosePaginate;
  if (plugin && plugin.paginate) {
    plugin.paginate.options = defaultPaginationOptions;
  }
}
```

---

## 🛠️ **Utility Functions**

### **`src/utils/convert.ts`** - Helper Utilities

Contains utility functions for data conversion:

```typescript
export function toBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  return false;
}

export function sanitizeSearchQuery(query?: string): string {
  if (!query) return '';
  // Escapes regex special characters
  return query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

---

## 🌐 **How to Use the API**

### **Environment Setup**

1. Copy `.env.example` to `.env`
2. Replace `<db_password>` with your MongoDB Atlas password
3. Set your preferred port and database name

### **Running the Application**

```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm run start:dev

# Build for production
pnpm run build
pnpm run start:prod
```

### **API Examples**

```bash
# Create a todo
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn NestJS", "priority": "high", "tags": ["learning", "backend"]}'

# Get todos with pagination
curl "http://localhost:3000/api/v1/todos?page=1&limit=5&sortBy=createdAt:desc&search=NestJS"

# Toggle completion status
curl -X PATCH http://localhost:3000/api/v1/todos/67104b2c86e0df0012ab34cd/toggle

# Get Swagger docs
open http://localhost:3000/api/v1/docs
```

---

## 🎯 **Key Architecture Benefits**

1. **Modular Design** - Each feature is self-contained
2. **Global Pagination** - Consistent API responses across all endpoints
3. **Type Safety** - Full TypeScript with proper validation
4. **Clean Architecture** - Separation of concerns with Controllers, Services, and DTOs
5. **Database Agnostic** - Easy to switch databases if needed
6. **Production Ready** - Includes error handling, validation, and documentation
7. **Scalable** - Easy to add new features following the same patterns

This codebase provides a solid foundation for building REST APIs with NestJS and MongoDB, following modern best practices and clean architecture principles.
