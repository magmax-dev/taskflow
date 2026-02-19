import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { CreateWorkspaceDto } from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async create(
    dto: CreateWorkspaceDto,
    ownerId: string,
  ): Promise<WorkspaceDocument> {
    const workspace = new this.workspaceModel({
      name: dto.name,
      description: dto.description ?? '',
      owner: ownerId,
      members: [ownerId],
    });

    return workspace.save();
  }

  async findUserWorkspaces(userId: string): Promise<WorkspaceDocument[]> {
    return this.workspaceModel
      .find({ members: { $in: [userId] } })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceModel
      .findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email avatar')
      .exec();

    if (!workspace) throw new NotFoundException('Workspace não encontrado');
    return workspace;
  }

  async addMember(
    workspaceId: string,
    memberId: string,
    requesterId: string,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceModel.findById(workspaceId);

    if (!workspace) throw new NotFoundException('Workspace não encontrado');

    if (workspace.owner.toString() !== requesterId) {
      throw new ForbiddenException('Apenas o dono pode adicionar membros');
    }

    return this.workspaceModel
      .findByIdAndUpdate(
        workspaceId,
        { $addToSet: { members: memberId } },
        { new: true },
      )
      .exec();
  }
}
