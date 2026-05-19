import { apiSlice } from './apiSlice';

export const blogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: () => '/api/blogs',
      providesTags: ['Blog'],
    }),
    getBlogDetails: builder.query({
      query: (blogId) => `/api/blogs/${blogId}`,
      providesTags: ['Blog'],
    }),
    // Dedicated top writers — fresh socialLinks from User collection
    getTopWriters: builder.query({
      query: () => '/api/writers/top',
      providesTags: ['User', 'Blog'],
    }),
    createBlog: builder.mutation({
      query: (data) => ({
        url: '/api/blogs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Blog'],
    }),
    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/blogs/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Blog'],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/api/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogDetailsQuery,
  useGetTopWritersQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogsApiSlice;
