import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
} from '../../store/api/workspacesApi';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: workspaces, isLoading } = useGetWorkspacesQuery();
  const [createWorkspace] = useCreateWorkspaceMutation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWorkspace(form).unwrap();
      setForm({ name: '', description: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>TaskFlow</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>Olá, {user?.name}</span>
          <button onClick={logout} style={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.titleRow}>
          <h2 style={styles.pageTitle}>Meus Workspaces</h2>
          <button
            onClick={() => setShowForm(true)}
            style={styles.createBtn}
          >
            + Novo Workspace
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={styles.form}>
            <input
              placeholder="Nome do workspace"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              style={styles.input}
              required
            />
            <input
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              style={styles.input}
            />
            <div style={styles.formActions}>
              <button type="submit" style={styles.createBtn}>
                Criar
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
        )}

        {isLoading && <p>Carregando...</p>}

        <div style={styles.grid}>
          {workspaces?.map((ws) => (
            <div
              key={ws._id}
              style={styles.workspaceCard}
              onClick={() => navigate(`/workspace/${ws._id}`)}
            >
              <h3 style={styles.wsName}>{ws.name}</h3>
              <p style={styles.wsDesc}>{ws.description || 'Sem descrição'}</p>
              <p style={styles.wsMeta}>
                👥 {ws.members.length} membro(s)
              </p>
            </div>
          ))}
        </div>

        {workspaces?.length === 0 && !isLoading && (
          <p style={styles.empty}>
            Nenhum workspace ainda. Crie o primeiro!
          </p>
        )}
      </main>
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
  logo: { color: '#6366f1', fontSize: '1.5rem', fontWeight: 700 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userName: { color: '#374151', fontSize: '0.875rem' },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  main: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  pageTitle: { fontSize: '1.5rem', fontWeight: 700, color: '#111827' },
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
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  form: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  formActions: { display: 'flex', gap: '0.75rem' },
  input: {
    padding: '0.625rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  workspaceCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    borderLeft: '4px solid #6366f1',
  },
  wsName: { fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' },
  wsDesc: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' },
  wsMeta: { color: '#9ca3af', fontSize: '0.75rem' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: '3rem' },
};