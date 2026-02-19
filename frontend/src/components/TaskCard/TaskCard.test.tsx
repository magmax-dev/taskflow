import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';

// Moca o módulo inteiro do tasksApi
// O Jest não consegue processar ES Modules do RTK Query diretamente
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();

jest.mock('../../store/api/tasksApi', () => ({
  useUpdateTaskMutation: () => [mockUpdateTask],
  useDeleteTaskMutation: () => [mockDeleteTask],
}));

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

  it('deve exibir o título da tarefa', () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.getByTestId('task-title')).toHaveTextContent('Implementar login');
  });

  it('deve exibir badge de prioridade ALTA', () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('Alta');
  });

  it('deve exibir badge BAIXA para prioridade low', () => {
    render(<TaskCard task={{ ...baseTask, priority: 'low' }} />);
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('Baixa');
  });

  it('NÃO deve exibir botão de avançar para status done', () => {
    render(<TaskCard task={{ ...baseTask, status: 'done' }} />);
    expect(screen.queryByTestId('btn-advance')).not.toBeInTheDocument();
  });

  it('deve exibir botão Iniciar para status todo', () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.getByTestId('btn-advance')).toHaveTextContent('Iniciar');
  });

  it('deve chamar updateTask ao clicar em Iniciar', async () => {
    mockUpdateTask.mockResolvedValue({});
    render(<TaskCard task={baseTask} />);
    userEvent.click(screen.getByTestId('btn-advance'));
    expect(mockUpdateTask).toHaveBeenCalledWith({
      id: 'task-1',
      data: { status: 'in_progress' },
    });
  });

  it('deve chamar deleteTask ao confirmar exclusão', async () => {
    mockDeleteTask.mockResolvedValue({});
    window.confirm = jest.fn().mockReturnValue(true);
    render(<TaskCard task={baseTask} />);
    userEvent.click(screen.getByTestId('btn-delete'));
    expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
  });
});