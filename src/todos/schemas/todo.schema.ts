import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export type TodoDocument = HydratedDocument<Todo>;
export type TodoModel = Model<TodoDocument>;

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({
  timestamps: true,
  collection: 'todos',
  toJSON: {
    virtuals: true,
    transform: (doc, ret: Record<string, any>) => {
      ret.id = ret._id ? ret._id.toString() : undefined;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Todo {
  @ApiProperty({
    example: '60d5ec49f1b2c8b1f8e4e1a1',
    description: 'Unique MongoDB ObjectId of the Todo',
  })
  id?: string;

  @ApiProperty({
    example: 'Complete NestJS MongoDB Setup',
    description: 'Title of the todo item',
  })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiPropertyOptional({
    example: 'Implement CRUD operations and connect to MongoDB Atlas',
    description: 'Detailed description of the todo item',
  })
  @Prop({ trim: true, default: '' })
  description?: string;

  @ApiProperty({
    example: false,
    description: 'Completion status of the todo',
    default: false,
  })
  @Prop({ default: false, index: true })
  isCompleted: boolean;

  @ApiProperty({
    enum: TodoPriority,
    example: TodoPriority.MEDIUM,
    description: 'Priority level of the todo',
    default: TodoPriority.MEDIUM,
  })
  @Prop({
    type: String,
    enum: Object.values(TodoPriority),
    default: TodoPriority.MEDIUM,
    index: true,
  })
  priority: TodoPriority;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Optional due date for the todo item',
  })
  @Prop({ type: Date, default: null })
  dueDate?: Date;

  @ApiPropertyOptional({
    example: ['backend', 'nestjs', 'database'],
    description: 'List of tags associated with the todo item',
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  tags?: string[];

  @ApiProperty({
    example: '2026-10-16T14:00:00.000Z',
    description: 'Timestamp when the todo was created',
  })
  createdAt?: Date;

  @ApiProperty({
    example: '2026-10-16T14:30:00.000Z',
    description: 'Timestamp when the todo was last updated',
  })
  updatedAt?: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);

// Apply Mongoose Paginate Plugin (supports both default and CJS exports without TypeScript errors)
TodoSchema.plugin((mongoosePaginate as any).default || mongoosePaginate);

// Index text fields for fast keyword searching
TodoSchema.index({ title: 'text', description: 'text' });
