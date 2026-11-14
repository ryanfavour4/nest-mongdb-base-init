import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { TodoPriority } from '../schemas/todo.schema';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryTodoDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by completion status (true or false)',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === '1' || value === 1) return true;
    if (value === 'false' || value === false || value === '0' || value === 0) return false;
    return value;
  })
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by priority level',
    enum: TodoPriority,
    example: TodoPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @ApiPropertyOptional({
    description: 'Filter by specific tag',
    example: 'backend',
  })
  @IsOptional()
  @IsString()
  tag?: string;
}
