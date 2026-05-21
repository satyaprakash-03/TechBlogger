import { apiSlice } from './apiSlice';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: '/api/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Blog', 'User'],
    }),
    uploadImage: builder.mutation({
      query: (data) => ({
        url: '/api/upload',
        method: 'POST',
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: () => ({
        url: '/api/auth/users',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/auth/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Blog'],
    }),
    updateUserByAdmin: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/auth/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { 
  useLoginMutation, 
  useLogoutMutation, 
  useRegisterMutation, 
  useUpdateUserMutation, 
  useUploadImageMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserByAdminMutation
} = usersApiSlice;
