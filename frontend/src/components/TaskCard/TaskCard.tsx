import React from 'react';
import { Task, useUpdateTaskMutation, useDeleteTaskMutation } from '../../store/api/tasksApi';

interface TaskCardProps {
  task: Task;
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Baixa', color: '#166534', bg: '#f0fdf4' },
  medium: { label: 'Média', color: '#92400e', bg: '#fffbeb' },
  high: { label: 'Alta', color: '#991b1b', bg: '#fef2f2' },
};

const statusNext: Record<string, string> = {
  todo: 'in_progress',
  in_progress: 'done',
};

const statusActionLabel: Record<string, string> = {
  todo: 'Iniciar',
  in_progress: 'Concluir',
};

export function TaskCard({ task }: TaskCardProps) {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const priority = priorityConfig[task.priority];
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date();

  const handleAdvance = async () => {
    const next = statusNext[task.status];
    if (!next) return;
    await updateTask({ id: task._id, data: { status: next } });
  };

  const handleDelete = async () => {
    if (window.confirm('Deletar esta tarefa?')) {
      await deleteTask(task._id);
    }
  };

  return (
    <article data-testid="task-card">
      <div>
        <span data-testid="task-title">{task.title}</span>
        <span
          data-testid="priority-badge"
          style={{ color: priority.color, backgroundColor: priority.bg }}
        >
          {priority.label}
        </span>
      </div>

      {task.description && (
        <p data-testid="task-description">{task.description}</p>
      )}

      {task.dueDate && (
        <p data-testid="due-date" style={{ color: isOverdue ? '#ef4444' : '#9ca3af' }}>
          📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          {isOverdue && ' ⚠️ Atrasada'}
        </p>
      )}

      {task.assignedTo && (
        <p data-testid="assigned-to">👤 {task.assignedTo.name}</p>
      )}

      <div>
        {statusNext[task.status] && (
          <button data-testid="btn-advance" onClick={handleAdvance}>
            {statusActionLabel[task.status]}
          </button>
        )}
        <button data-testid="btn-delete" onClick={handleDelete}>
          🗑️
        </button>
      </div>
    </article>
  );
}