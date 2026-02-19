/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TasksService } from './tasks.service';
import { Task } from './schemas/task.schema';

// Simula o Model do Mongoose com os métodos que o service usa
const mockTaskModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

// Dados de teste reutilizáveis
const userId = new Types.ObjectId().toString();
const workspaceId = new Types.ObjectId().toString();
const taskId = new Types.ObjectId().toString();

const mockTask = {
  _id: taskId,
  id: taskId,
  title: 'Implementar login',
  description: 'Usar JWT',
  status: 'todo',
  priority: 'high',
  createdBy: {
    toString: () => userId, // simula o ObjectId com método toString
  },
  assignedTo: null,
  workspace: workspaceId,
  attachments: [],
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          // getModelToken retorna o token de injeção do Model do Mongoose
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => jest.clearAllMocks());

  // =============================================
  // findByWorkspace
  // =============================================
  describe('findByWorkspace', () => {
    it('deve retornar lista de tasks do workspace', async () => {
      // Simula a chain de métodos do Mongoose
      // find().populate().populate().sort().lean().exec()
      mockTaskModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTask]),
      });

      const result = await service.findByWorkspace(workspaceId);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Implementar login');
      expect(mockTaskModel.find).toHaveBeenCalledWith({
        workspace: workspaceId,
      });
    });
  });

  // =============================================
  // update
  // =============================================
  describe('update', () => {
    it('deve lançar NotFoundException quando task não existe', async () => {
      mockTaskModel.findById.mockResolvedValue(null);

      await expect(
        service.update(taskId, { title: 'novo' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando usuário não é o criador', async () => {
      const outrouUserId = new Types.ObjectId().toString();

      mockTaskModel.findById.mockResolvedValue({
        ...mockTask,
        createdBy: { toString: () => outrouUserId },
      });

      await expect(
        service.update(taskId, { title: 'novo' }, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve atualizar a task com sucesso', async () => {
      mockTaskModel.findById.mockResolvedValue(mockTask);

      const taskAtualizada = { ...mockTask, title: 'Novo título' };

      mockTaskModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(taskAtualizada),
      });

      const result = await service.update(
        taskId,
        { title: 'Novo título' },
        userId,
      );

      expect(result.title).toBe('Novo título');
      expect(mockTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        taskId,
        { $set: { title: 'Novo título' } },
        { new: true },
      );
    });
  });

  // =============================================
  // remove
  // =============================================
  describe('remove', () => {
    it('deve deletar task com sucesso', async () => {
      mockTaskModel.findById.mockResolvedValue(mockTask);
      mockTaskModel.findByIdAndDelete.mockResolvedValue(mockTask);

      await expect(service.remove(taskId, userId)).resolves.not.toThrow();
      expect(mockTaskModel.findByIdAndDelete).toHaveBeenCalledWith(taskId);
    });

    it('deve lançar NotFoundException quando task não existe', async () => {
      mockTaskModel.findById.mockResolvedValue(null);

      await expect(service.remove(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException quando não é o criador', async () => {
      const outroId = new Types.ObjectId().toString();
      mockTaskModel.findById.mockResolvedValue({
        ...mockTask,
        createdBy: { toString: () => outroId },
      });

      await expect(service.remove(taskId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});