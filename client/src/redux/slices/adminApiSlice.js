import { apiSlice } from './apiSlice';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDbStats: builder.query({
      query: () => ({
        url: '/api/admin/db/stats',
        method: 'GET',
      }),
      providesTags: ['User', 'Blog'], // Refetches stats if users/blogs change
    }),
    backupDb: builder.mutation({
      query: () => ({
        url: '/api/admin/db/backup',
        method: 'GET',
      }),
    }),
    restoreDb: builder.mutation({
      query: (data) => ({
        url: '/api/admin/db/restore',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Blog'],
    }),
    getCollectionDocuments: builder.query({
      query: ({ collectionName, search, page, limit }) => ({
        url: `/api/admin/db/collections/${collectionName}`,
        method: 'GET',
        params: { search, page, limit },
      }),
      providesTags: (result, error, { collectionName }) => [{ type: 'DBDoc', id: collectionName }],
    }),
    createCollectionDocument: builder.mutation({
      query: ({ collectionName, data }) => ({
        url: `/api/admin/db/collections/${collectionName}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { collectionName }) => [
        { type: 'DBDoc', id: collectionName },
        'User',
        'Blog'
      ],
    }),
    updateCollectionDocument: builder.mutation({
      query: ({ collectionName, id, data }) => ({
        url: `/api/admin/db/collections/${collectionName}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { collectionName }) => [
        { type: 'DBDoc', id: collectionName },
        'User',
        'Blog'
      ],
    }),
    deleteCollectionDocument: builder.mutation({
      query: ({ collectionName, id }) => ({
        url: `/api/admin/db/collections/${collectionName}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { collectionName }) => [
        { type: 'DBDoc', id: collectionName },
        'User',
        'Blog'
      ],
    }),
  }),
});

export const {
  useGetDbStatsQuery,
  useBackupDbMutation,
  useRestoreDbMutation,
  useGetCollectionDocumentsQuery,
  useCreateCollectionDocumentMutation,
  useUpdateCollectionDocumentMutation,
  useDeleteCollectionDocumentMutation
} = adminApiSlice;
