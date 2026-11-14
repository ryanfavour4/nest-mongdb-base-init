import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Request } from 'express';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { paginate } from '../common/pagination/paginate';
import { Paginated } from '../common/pagination/pagination.types';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name)
    private readonly todoModel: Model<TodoDocument>,
  ) {}

  /**
   * Create a new Todo document in MongoDB
   */
  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const createdTodo = new this.todoModel(createTodoDto);
    return await createdTodo.save();
  }

  /**
   * Find todos with standardized nestjs-paginate style pagination, search, and filtering
   */
  async findAll(queryDto: QueryTodoDto, req?: Request): Promise<Paginated<Todo>> {
    const filter: Record<string, any> = {};

    if (queryDto.isCompleted !== undefined && queryDto.isCompleted !== null) {
      const isCompletedBool =
        typeof queryDto.isCompleted === 'string'
          ? (queryDto.isCompleted as string).toLowerCase() === 'true' || queryDto.isCompleted === '1'
          : Boolean(queryDto.isCompleted);

      // When false, match explicit false or documents without completion set
      filter.isCompleted = isCompletedBool ? true : { $ne: true };
    }

    if (queryDto.priority) {
      filter.priority = queryDto.priority;
    }

    if (queryDto.tag) {
      filter.tags = queryDto.tag;
    }

    // Global paginate helper: handles page, limit, sortBy, search, filter, and generates data, meta, links
    return paginate<Todo>(
      this.todoModel,
      queryDto,
      {
        searchableFields: ['title', 'description'],
        defaultSortBy: ['createdAt', 'DESC'],
        filter,
      },
      req,
    );
  }

  /**
   * Find a single Todo by MongoDB ObjectId
   */
  async findOne(id: string): Promise<Todo> {
    this.validateObjectId(id);

    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID '${id}' not found`);
    }

    return todo;
  }

  /**
   * Update an existing Todo by ID
   */
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

  /**
   * Delete a Todo by ID
   */
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

  /**
   * Toggle completion status
   */
  async toggleComplete(id: string): Promise<Todo> {
    this.validateObjectId(id);

    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID '${id}' not found`);
    }

    todo.isCompleted = !todo.isCompleted;
    return await todo.save();
  }

  /**
   * Internal validator for MongoDB ObjectId format
   */
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`'${id}' is not a valid MongoDB ObjectId`);
    }
  }
}
