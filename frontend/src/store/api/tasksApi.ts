import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdBy: { _id: string; name: string; email: string };
  assignedTo: { _id: string; name: string; email: string } | null;
  workspace: string;
  dueDate: string | null;
  attachments: string[];
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  workspace: string;
  assignedTo?: string;
  dueDate?: string;
}

export const tasksApi = createApi({
  reducerPath: 'tasksApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['Task'],

  endpoints: (builder) => ({
    getTasks: builder.query<Task[], string>({
      query: (workspaceId) => `/tasks?workspace=${workspaceId}`,
      providesTags: ['Task'],
    }),

    getDashboard: builder.query<any, string>({
      query: (workspaceId) => `/tasks/dashboard/${workspaceId}`,
    }),

    createTask: builder.mutation<Task, CreateTaskPayload>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: ['Task'],
    }),

    updateTask: builder.mutation<
      Task,
      { id: string; data: Partial<CreateTaskPayload & { status: string }> }
    >({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetDashboardQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;