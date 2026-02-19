import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(dto: CreateTaskDto, userId: string): Promise<TaskDocument> {
    const task = new this.taskModel({
      ...dto,
      createdBy: userId,
    });
    return task.save();
  }

  async findByWorkspace(workspaceId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({ workspace: workspaceId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(id: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findById(id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .exec();

    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    if (task.createdBy.toString() !== userId) {
      throw new ForbiddenException('Sem permissão para editar esta tarefa');
    }

    return this.taskModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .populate('assignedTo', 'name email')
      .exec();
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    if (task.createdBy.toString() !== userId) {
      throw new ForbiddenException('Sem permissão para deletar esta tarefa');
    }

    await this.taskModel.findByIdAndDelete(id);
  }

  async getDashboardMetrics(workspaceId: string) {
    const statusCounts = await this.taskModel.aggregate([
      { $match: { workspace: new Types.ObjectId(workspaceId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    const overdue = await this.taskModel.countDocuments({
      workspace: workspaceId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    });

    return { statusCounts, overdue };
  }
}
