import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Prioridade inválida: low | medium | high' })
  priority?: TaskPriority;

  @IsMongoId({ message: 'workspace inválido' })
  workspace: string;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status inválido: todo | in_progress | done' })
  status?: TaskStatus;
}
