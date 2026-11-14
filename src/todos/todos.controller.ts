import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { Todo } from './schemas/todo.schema';

@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The todo has been successfully created.',
    type: Todo,
  })
  @ApiBadRequestResponse({ description: 'Invalid input payload or validation error' })
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve todos with pagination, search, sorting, and filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns list of todos with meta (itemsPerPage, totalItems, currentPage, totalPages, sortBy) and links (current, next, last).',
  })
  findAll(@Query() queryDto: QueryTodoDto, @Req() req: Request) {
    return this.todosService.findAll(queryDto, req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single todo by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the todo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found todo record',
    type: Todo,
  })
  @ApiNotFoundResponse({ description: 'Todo not found' })
  @ApiBadRequestResponse({ description: 'Invalid MongoDB ObjectId' })
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing todo by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the todo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The updated todo record',
    type: Todo,
  })
  @ApiNotFoundResponse({ description: 'Todo not found' })
  @ApiBadRequestResponse({ description: 'Invalid MongoDB ObjectId or payload' })
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle completion status (completed <-> incomplete)' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the todo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The todo with toggled completion status',
    type: Todo,
  })
  @ApiNotFoundResponse({ description: 'Todo not found' })
  toggleComplete(@Param('id') id: string) {
    return this.todosService.toggleComplete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a todo by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the todo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Confirmation message of the deleted todo',
  })
  @ApiNotFoundResponse({ description: 'Todo not found' })
  @ApiBadRequestResponse({ description: 'Invalid MongoDB ObjectId' })
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
