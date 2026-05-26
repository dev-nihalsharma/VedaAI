import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Assignment, QuestionPaper, AuthUser, QuestionTypeSpec } from '@shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = window.localStorage.getItem('token');
        if (token) headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Assignment', 'Paper'],
  endpoints: (b) => ({
    login: b.mutation<{ token: string; user: AuthUser }, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    me: b.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
    listAssignments: b.query<Assignment[], void>({
      query: () => '/assignments',
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Assignment' as const, id: a._id })),
              { type: 'Assignment', id: 'LIST' },
            ]
          : [{ type: 'Assignment', id: 'LIST' }],
    }),
    getAssignment: b.query<Assignment, string>({
      query: (id) => `/assignments/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Assignment', id }],
    }),
    createAssignment: b.mutation<
      Assignment,
      {
        title: string;
        dueDate: string;
        questionTypes: QuestionTypeSpec[];
        additionalInstructions?: string;
        fileMeta?: { name: string; sizeBytes: number; mimeType: string };
      }
    >({
      query: (body) => ({ url: '/assignments', method: 'POST', body }),
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),
    deleteAssignment: b.mutation<{ ok: true }, string>({
      query: (id) => ({ url: `/assignments/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),
    regenerate: b.mutation<Assignment, string>({
      query: (id) => ({ url: `/assignments/${id}/regenerate`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Assignment', id },
        { type: 'Paper', id },
      ],
    }),
    getPaper: b.query<QuestionPaper & { assignment: Assignment; cached: boolean }, string>({
      query: (id) => `/assignments/${id}/paper`,
      providesTags: (_r, _e, id) => [{ type: 'Paper', id }],
    }),
  }),
});

export const {
  useLoginMutation,
  useMeQuery,
  useListAssignmentsQuery,
  useGetAssignmentQuery,
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useRegenerateMutation,
  useGetPaperQuery,
} = api;
