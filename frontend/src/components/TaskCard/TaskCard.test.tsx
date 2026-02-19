import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TaskCard } from './TaskCard';
import { tasksApi } from '../../store/api/tasksApi';
import authReducer from '../../store/slices/authSlice';

// Mock das mutations do RTK Query
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();

jest.mock('../../store/api/tasksApi', () => ({
  ...jest.requireActual('../../store/api/tasksApi'),
  useUpdateTaskMutation: () => [mockUpdateTask],
  useDeleteTaskMutation: () => [mockDeleteTask],
}));

function renderTaskCard(task: any) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [tasksApi.reducerPath]: tasksApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(tasksApi.middleware),
  });

  return render(
    <Provider store={store}>
      <TaskCard task={task} />
    </Provider>,
  );
}

// Task base para reutilizar nos testes
const baseTask = {
  _id: 'task-1',
  title: 'Implementar login',
  description: 'Usar JWT com NestJS',
  status: 'todo' as const,
  priority: 'high' as const,
  createdBy: { _id: 'u1', name: 'Dev', email: 'dev@test.com' },
  assignedTo: null,
  workspace: 'ws-1',
  dueDate: null,
  attachments: [],
  createdAt: new Date().toISOString(),
};

describe('TaskCard', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Renderização', () => {
    it('deve exibir o título da tarefa', () => {
      renderTaskCard(baseTask);
      expect(screen.getByTestId('task-title')).toHaveTextContent(
        'Implementar login',
      );
    });

    it('deve exibir badge de prioridade ALTA', () => {
      renderTaskCard(baseTask);
      expect(screen.getByTestId('priority-badge')).toHaveTextContent('Alta');
    });

    it('deve exibir badge BAIXA para prioridade low', () => {
      renderTaskCard({ ...baseTask, priority: 'low' });
      expect(screen.getByTestId('priority-badge')).toHaveTextContent('Baixa');
    });

    it('deve exibir descrição quando existe', () => {
      renderTaskCard(baseTask);
      expect(screen.getByTestId('task-description')).toBeInTheDocument();
    });

    it('NÃO deve exibir descrição quando está vazia', () => {
      renderTaskCard({ ...baseTask, description: '' });
      expect(
        screen.queryByTestId('task-description'),
      ).not.toBeInTheDocument();
    });

    it('deve exibir responsável quando assignedTo existe', () => {
      const task = {
        ...baseTask,
        assignedTo: { _id: 'u2', name: 'Maria', email: 'm@test.com', avatar: '' },
      };
      renderTaskCard(task);
      expect(screen.getByTestId('assigned-to')).toHaveTextContent('Maria');
    });

    it('NÃO deve exibir responsável quando assignedTo é null', () => {
      renderTaskCard(baseTask);
      expect(screen.queryByTestId('assigned-to')).not.toBeInTheDocument();
    });

    it('deve exibir aviso de atraso em tarefa atrasada', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      const task = { ...baseTask, dueDate: pastDate.toISOString() };

      renderTaskCard(task);
      expect(screen.getByTestId('due-date')).toHaveTextContent('Atrasada');
    });

    it('NÃO deve exibir aviso de atraso em tarefa concluída', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      const task = {
        ...baseTask,
        status: 'done' as const,
        dueDate: pastDate.toISOString(),
      };

      renderTaskCard(task);
      expect(screen.queryByText(/Atrasada/)).not.toBeInTheDocument();
    });
  });

  describe('Botões de ação', () => {
    it('deve exibir botão "Iniciar" para status todo', () => {
      renderTaskCard(baseTask);
      expect(screen.getByTestId('btn-advance')).toHaveTextContent('Iniciar');
    });

    it('deve exibir botão "Concluir" para status in_progress', () => {
      renderTaskCard({ ...baseTask, status: 'in_progress' });
      expect(screen.getByTestId('btn-advance')).toHaveTextContent('Concluir');
    });

    it('NÃO deve exibir botão de avançar para status done', () => {
      renderTaskCard({ ...baseTask, status: 'done' });
      expect(screen.queryByTestId('btn-advance')).not.toBeInTheDocument();
    });

    it('deve chamar updateTask ao clicar em Iniciar', async () => {
      mockUpdateTask.mockResolvedValue({});
      renderTaskCard(baseTask);

      await userEvent.click(screen.getByTestId('btn-advance'));

      expect(mockUpdateTask).toHaveBeenCalledWith({
        id: 'task-1',
        data: { status: 'in_progress' },
      });
    });

    it('deve chamar deleteTask ao confirmar exclusão', async () => {
      mockDeleteTask.mockResolvedValue({});
      window.confirm = jest.fn().mockReturnValue(true);

      renderTaskCard(baseTask);
      await userEvent.click(screen.getByTestId('btn-delete'));

      expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
    });

    it('NÃO deve chamar deleteTask ao cancelar exclusão', async () => {
      window.confirm = jest.fn().mockReturnValue(false);

      renderTaskCard(baseTask);
      await userEvent.click(screen.getByTestId('btn-delete'));

      expect(mockDeleteTask).not.toHaveBeenCalled();
    });
  });
});