import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetWorkspaceQuery } from '../../store/api/workspacesApi';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  Task,
} from '../../store/api/tasksApi';

const statusLabel: Record<string, string> = {
  todo: 'A fazer',
  in_progress: 'Em progresso',
  done: 'Concluído',
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Baixa', color: '#166534', bg: '#f0fdf4' },
  medium: { label: 'Média', color: '#92400e', bg: '#fffbeb' },
  high: { label: 'Alta', color: '#991b1b', bg: '#fef2f2' },
};

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: workspace } = useGetWorkspaceQuery(id!);
  const { data: tasks, isLoading } = useGetTasksQuery(id!);
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        ...form,
        workspace: id!,
        priority: form.priority as any,
        dueDate: form.dueDate || undefined,
      }).unwrap();
      setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceStatus = async (task: Task) => {
    const next: Record<string, string> = {
      todo: 'in_progress',
      in_progress: 'done',
    };
    if (!next[task.status]) return;
    await updateTask({ id: task._id, data: { status: next[task.status] } });
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Deletar esta tarefa?')) {
      await deleteTask(taskId);
    }
  };

  const tasksByStatus = {
    todo: tasks?.filter((t) => t.status === 'todo') ?? [],
    in_progress: tasks?.filter((t) => t.status === 'in_progress') ?? [],
    done: tasks?.filter((t) => t.status === 'done') ?? [],
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate('/')} style={styles.backBtn}>
            ← Voltar
          </button>
          <h1 style={styles.wsTitle}>{workspace?.name}</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={styles.createBtn}>
          + Nova Task
        </button>
      </header>

      {showForm && (
        <div style={styles.formWrapper}>
          <form onSubmit={handleCreate} style={styles.form}>
            <h3 style={{ marginBottom: '1rem' }}>Nova Tarefa</h3>
            <input
              placeholder="Título da tarefa *"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              style={styles.input}
              required
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            />
            <select
              value={form.priority}
              onChange={(e) =>
                setForm((p) => ({ ...p, priority: e.target.value }))
              }
              style={styles.input}
            >
              <option value="low">Prioridade: Baixa</option>
              <option value="medium">Prioridade: Média</option>
              <option value="high">Prioridade: Alta</option>
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, dueDate: e.target.value }))
              }
              style={styles.input}
            />
            <div style={styles.formActions}>
              <button type="submit" style={styles.createBtn}>
                Criar Tarefa
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={styles.cancelBtn}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p style={{ padding: '2rem' }}>Carregando tasks...</p>
      ) : (
        <div style={styles.kanban}>
          {(['todo', 'in_progress', 'done'] as const).map((status) => (
            <div key={status} style={styles.column}>
              <h3 style={styles.columnTitle}>
                {statusLabel[status]}{' '}
                <span style={styles.count}>
                  {tasksByStatus[status].length}
                </span>
              </h3>

              <div style={styles.taskList}>
                {tasksByStatus[status].map((task) => {
                  const priority = priorityConfig[task.priority];
                  const isOverdue =
                    task.dueDate &&
                    task.status !== 'done' &&
                    new Date(task.dueDate) < new Date();

                  return (
                    <div key={task._id} style={styles.taskCard}>
                      <div style={styles.taskHeader}>
                        <span style={styles.taskTitle}>{task.title}</span>
                        <span
                          style={{
                            ...styles.badge,
                            color: priority.color,
                            backgroundColor: priority.bg,
                          }}
                        >
                          {priority.label}
                        </span>
                      </div>

                      {task.description && (
                        <p style={styles.taskDesc}>{task.description}</p>
                      )}

                      {task.dueDate && (
                        <p
                          style={{
                            ...styles.taskMeta,
                            color: isOverdue ? '#ef4444' : '#9ca3af',
                          }}
                        >
                          📅{' '}
                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                          {isOverdue && ' ⚠️'}
                        </p>
                      )}

                      {task.assignedTo && (
                        <p style={styles.taskMeta}>
                          👤 {task.assignedTo.name}
                        </p>
                      )}

                      <div style={styles.taskActions}>
                        {task.status !== 'done' && (
                          <button
                            onClick={() => handleAdvanceStatus(task)}
                            style={styles.advanceBtn}
                          >
                            {task.status === 'todo'
                              ? 'Iniciar'
                              : 'Concluir'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(task._id)}
                          style={styles.deleteBtn}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}

                {tasksByStatus[status].length === 0 && (
                  <p style={styles.emptyCol}>Nenhuma tarefa</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6366f1',
    fontWeight: 600,
  },
  wsTitle: { fontSize: '1.25rem', fontWeight: 700 },
  createBtn: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  cancelBtn: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  formWrapper: { padding: '1.5rem 2rem 0' },
  form: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxWidth: '500px',
  },
  formActions: { display: 'flex', gap: '0.75rem' },
  input: {
    padding: '0.625rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  kanban: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    padding: '1.5rem 2rem',
  },
  column: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '1rem',
    minHeight: '400px',
  },
  columnTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: '#374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    padding: '0.125rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  taskList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    borderLeft: '3px solid #6366f1',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  taskTitle: { fontWeight: 600, fontSize: '0.9375rem' },
  badge: {
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  taskDesc: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  taskMeta: { fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '0.25rem' },
  taskActions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem' },
  advanceBtn: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: 500,
  },
  deleteBtn: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#fef2f2',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
  },
  emptyCol: { color: '#d1d5db', fontSize: '0.875rem', textAlign: 'center' },
};