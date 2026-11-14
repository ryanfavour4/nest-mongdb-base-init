import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TodoPriority } from '../schemas/todo.schema';

export class CreateTodoDto {
  @ApiProperty({
    example: 'Build NestJS API with MongoDB Atlas',
    description: 'The title of the task',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({
    example: 'Implement schema, controller, service, and DTOs following clean modular architecture',
    description: 'Detailed description of the todo task',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Initial completion status of the todo',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({
    enum: TodoPriority,
    example: TodoPriority.HIGH,
    description: 'Priority of the todo',
    default: TodoPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @ApiPropertyOptional({
    example: '2026-10-31T23:59:59.000Z',
    description: 'Optional due date formatted as ISO-8601 string',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    example: ['backend', 'mongodb', 'atlas'],
    description: 'Tags for categorizing the todo',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
