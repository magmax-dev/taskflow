import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/workspace.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  create(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.workspacesService.create(dto, userId);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: string) {
    return this.workspacesService.findUserWorkspaces(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspacesService.findById(id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') workspaceId: string,
    @Body('memberId') memberId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.workspacesService.addMember(workspaceId, memberId, userId);
  }
}
