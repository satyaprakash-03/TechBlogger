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
    likeBlog: builder.mutation({
      query: (id) => ({
        url: `/api/blogs/${id}/like`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const userInfo = getState().auth.userInfo;
        if (!userInfo) return;
        const userId = userInfo._id;

        // 1. Optimistically update getBlogDetails
        const patchResultDetails = dispatch(
          blogsApiSlice.util.updateQueryData('getBlogDetails', id, (draft) => {
            if (draft && draft.likes) {
              const index = draft.likes.indexOf(userId);
              if (index > -1) {
                draft.likes.splice(index, 1);
              } else {
                draft.likes.push(userId);
              }
            }
          })
        );

        // 2. Optimistically update getBlogs list
        const patchResultList = dispatch(
          blogsApiSlice.util.updateQueryData('getBlogs', undefined, (draft) => {
            if (Array.isArray(draft)) {
              const blog = draft.find(b => b._id === id);
              if (blog && blog.likes) {
                const index = blog.likes.indexOf(userId);
                if (index > -1) {
                  blog.likes.splice(index, 1);
                } else {
                  blog.likes.push(userId);
                }
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResultDetails.undo();
          patchResultList.undo();
        }
      },
    }),
    subscribeNewsletter: builder.mutation({
      query: (email) => ({
        url: '/api/newsletter/subscribe',
        method: 'POST',
        body: { email },
      }),
    }),
    addComment: builder.mutation({
      query: ({ blogId, content }) => ({
        url: `/api/blogs/${blogId}/comments`,
        method: 'POST',
        body: { content },
      }),
      async onQueryStarted({ blogId, content }, { dispatch, queryFulfilled, getState }) {
        const userInfo = getState().auth.userInfo;
        if (!userInfo) return;

        const tempCommentId = 'temp-' + Date.now();
        const tempComment = {
          _id: tempCommentId,
          content: content.trim(),
          likes: [],
          createdAt: new Date().toISOString(),
          user: {
            _id: userInfo._id,
            name: userInfo.name,
            avatar: userInfo.avatar
          }
        };

        const patchResult = dispatch(
          blogsApiSlice.util.updateQueryData('getBlogDetails', blogId, (draft) => {
            if (draft && draft.comments) {
              draft.comments.push(tempComment);
            }
          })
        );

        try {
          const { data: updatedComments } = await queryFulfilled;
          dispatch(
            blogsApiSlice.util.updateQueryData('getBlogDetails', blogId, (draft) => {
              if (draft) {
                draft.comments = updatedComments;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteComment: builder.mutation({
      query: ({ blogId, commentId }) => ({
        url: `/api/blogs/${blogId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ blogId, commentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          blogsApiSlice.util.updateQueryData('getBlogDetails', blogId, (draft) => {
            if (draft && draft.comments) {
              draft.comments = draft.comments.filter(c => c._id !== commentId);
            }
          })
        );

        try {
          const { data: updatedComments } = await queryFulfilled;
          dispatch(
            blogsApiSlice.util.updateQueryData('getBlogDetails', blogId, (draft) => {
              if (draft) {
                draft.comments = updatedComments;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    likeComment: builder.mutation({
      query: ({ blogId, commentId }) => ({
        url: `/api/blogs/${blogId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      async onQueryStarted({ blogId, commentId }, { dispatch, queryFulfilled, getState }) {
        const userInfo = getState().auth.userInfo;
        if (!userInfo) return;
        const userId = userInfo._id;

        const patchResult = dispatch(
          blogsApiSlice.util.updateQueryData('getBlogDetails', blogId, (draft) => {
            if (draft && draft.comments) {
              const comment = draft.comments.find(c => c._id === commentId);
              if (comment && comment.likes) {
                const index = comment.likes.indexOf(userId);
                if (index > -1) {
                  comment.likes.splice(index, 1);
                } else {
                  comment.likes.push(userId);
                }
              }
            }
          })
        );

        try {
          const { data: updatedComments } = await queryFulfilled;
          dispatch(
            blogsApiSlice.util.updateQueryData('getBlogDetails', blogId, (draft) => {
              if (draft) {
                draft.comments = updatedComments;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
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
  useLikeBlogMutation,
  useSubscribeNewsletterMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
} = blogsApiSlice;
