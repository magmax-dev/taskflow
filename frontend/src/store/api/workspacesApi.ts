import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  members: { _id: string; name: string; email: string }[];
  createdAt: string;
}

export const workspacesApi = createApi({
  reducerPath: 'workspacesApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Workspace'],

  endpoints: (builder) => ({
    getWorkspaces: builder.query<Workspace[], void>({
      query: () => '/workspaces',
      providesTags: ['Workspace'],
    }),

    getWorkspace: builder.query<Workspace, string>({
      query: (id) => `/workspaces/${id}`,
      providesTags: (result, error, id) => [{ type: 'Workspace', id }],
    }),

    createWorkspace: builder.mutation<
      Workspace,
      { name: string; description?: string }
    >({
      query: (body) => ({ url: '/workspaces', method: 'POST', body }),
      invalidatesTags: ['Workspace'],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
} = workspacesApi;