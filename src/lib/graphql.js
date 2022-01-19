import { graphql, graphqlWithIdToken } from "./client";

// Frontend (uses frontend firebase SDK token)

export const createPost = async (postImageId, postTypeId, title, content) => {
  const q = `mutation createPostMutation($postTypeId: Int!, $title: String!, $content: String!, $postImageId: Int!) {
			createPost(post_type_id: $postTypeId, title: $title, content: $content, post_image_id: $postImageId) { id } }`;
  return await graphqlWithIdToken(q, {
    postTypeId,
    title,
    content,
    postImageId,
  });
};

export const createPostComment = async (postId, comment) => {
  const q = `mutation createPostCommentMutation($comment: String!, $postId: Int!) {
  createPostComment(comment: $comment, post_id: $postId) {id}}`;
  return await graphqlWithIdToken(q, {
    postId,
    comment,
  });
};

export const createPostCommentReply = async (commentId, reply) => {
  const q = `mutation createPostCommentReplyMutation($commentId: Int!, $reply: String!) {
  createPostCommentReply(comment_id: $commentId, reply: $reply) { id }}`;
  return await graphqlWithIdToken(q, {
    commentId,
    reply,
  });
};

export const createPostLike = async (postId) => {
  const q = `mutation createPostLikeMutation($postId: Int!) {
  createPostLike(post_id: $postId) { created_by post_id }}`;
  return await graphqlWithIdToken(q, { postId });
};

export const createPostCommentLike = async (postCommentId) => {
  const q = `mutation createCommentLikeMutation($postCommentId: Int!) {
  createPostCommentLike(post_comment_id: $postCommentId) { created_by post_comment_id }}`;
  return await graphqlWithIdToken(q, { postCommentId });
};

export const createPostCommentReplyLike = async (postCommentReplyId) => {
  const q = `mutation createCommentReplyLikeMutation($postCommentReplyId: Int!) {
  createPostCommentReplyLike(post_comment_reply_id: $postCommentReplyId) { created_by post_comment_reply_id }}`;
  return await graphqlWithIdToken(q, { postCommentReplyId });
};

export const deletePostLike = async (postId) => {
  const q = `mutation deletePostLikeMutation($pkColumns: PostLikePkColumns!) {
  deletePostLike(pk_columns: $pkColumns) { result }}`;
  const pkColumns = { post_id: postId, created_by: 0 };
  return await graphqlWithIdToken(q, { pkColumns });
};

export const deletePostCommentLike = async (postCommentId) => {
  const q = `mutation deletePostCommentLikeMutation($pkColumns: PostCommentLikePkColumns!) {
  deletePostCommentLike(pk_columns: $pkColumns) { result }}`;
  const pkColumns = { post_comment_id: postCommentId, created_by: 0 };
  return await graphqlWithIdToken(q, { pkColumns });
};

export const deletePostCommentReplyLike = async (postCommentReplyId) => {
  const q = `mutation deletePostCommentReplyLikeMutation($pkColumns: PostCommentReplyLikePkColumns!) {
  deletePostCommentReplyLike(pk_columns: $pkColumns) { result }}`;
  const pkColumns = {
    post_comment_reply_id: postCommentReplyId,
    created_by: 0,
  };
  return await graphqlWithIdToken(q, { pkColumns });
};

export const updateEndUser = async (slug, username, bio) => {
  const q = `mutation updateEnduserMutation($pk_columns: EnduserPkColumns!, $slug: String!, $username: String!, $bio: String!) {
  updateEnduser(pk_columns: $pk_columns, slug: $slug, username: $username, bio: $bio) { result }}`;
  const vars = {
    pk_columns: { id: 0 },
    slug: slug,
    username: username,
    bio: bio,
  };
  return await graphqlWithIdToken(q, vars);
};

export const createUserFollow = async (userId) => {
  const q = `mutation createEnduserFollowMutation($created_by: Int!, $enduser_id: Int!) {
  createEnduserFollow(created_by: $created_by, enduser_id: $enduser_id) { created_by enduser_id }}`;
  return await graphqlWithIdToken(q, {
    created_by: 0,
    enduser_id: userId,
  });
};

export const deleteUserFollow = async (userId) => {
  const q = `mutation deleteEnduserFollowMutation($pk_columns: EnduserFollowPkColumns!) {
  deleteEnduserFollow(pk_columns: $pk_columns) { result }}`;
  return await graphqlWithIdToken(q, {
    pk_columns: { created_by: 0, enduser_id: userId },
  });
};

// No auth

export const queryEndUser = async (slug) => {
  return await graphql(
    `
      query {
        endusers (where: {slug: {eq: "${slug}"}}) {
	  id
          email
          username
	  slug
	  profile_image_url
        }
      }
    `,
    {},
    null
  );
};

export const queryEndUserWithPosts = async (slug, authUserId = null) => {
  const postLikeFilter = authUserId
    ? `(where: { created_by: { eq: ${authUserId} } })`
    : "";
  const isFollowingFilter = authUserId
    ? `(where: { created_by: { eq: ${authUserId} } })`
    : "";
  const isFollowedFilter = authUserId
    ? `(where: { enduser_id: { eq: ${authUserId} } })`
    : "";

  return await graphql(
    `
      query {
        endusers (where: {slug: {eq: "${slug}"}}) {
	  id
          email
          username
	  slug
	  profile_image_url
	  bio
	  enduser_follows_on_enduser_id_aggregate { count }
	  enduser_follows_on_enduser_id${isFollowingFilter} {
	    created_by 
	  }
	  enduser_follows_on_created_by_aggregate {count}
  	  enduser_follows_on_created_by${isFollowedFilter} {
	    enduser_id 
	  }
	  posts(sort: { created_at: desc }) {
            id
            title
            content
            created_at
            comment_count
            like_count
            repost_count
            post_type {
              id
              name
            }
            post_image {
              id
              name
              url
            }
            created_by_enduser {
              id
              username
	      slug
              profile_image_url
            }
            post_likes${postLikeFilter} {
              created_by_enduser {
                id
              }
            }
          }
        }
      }
    `,
    {},
    null
  );
};

export const createEndUser = async (token) => {
  return await graphql(
    `
      mutation createEnduserMutation($email: String!, $username: String!) {
        createEnduser(email: $email, username: $username) {
          id
        }
      }
    `,
    { email: "", username: "" },
    token
  );
};

export const queryPostTypes = async () => {
  return await graphql(
    `
      query {
        post_types {
          id
          name
        }
      }
    `,
    {},
    null
  );
};

export const queryPostList = async (
  authUserId = null,
  createdByUserId = null
) => {
  const postLikeFilter = authUserId
    ? `(where: { created_by: { eq: ${authUserId} } })`
    : "";
  const postFilter = createdByUserId
    ? `where: { created_by: { eq: ${createdByUserId} }}`
    : "";
  return await graphql(
    `
      query {
        posts(sort: { created_at: desc } ${postFilter}) {
          id
          title
          content
          created_at
          comment_count
          like_count
          repost_count
          post_type {
            id
            name
          }
          post_image {
            id
            name
            url
          }
          created_by_enduser {
            id
            username
	    slug
            profile_image_url
          }
          post_likes${postLikeFilter} {
            created_by_enduser {
              id
            }
          }
        }
      }
    `,
    {},
    null
  );
};

export const queryPostDetails = async (postId, userId = null) => {
  const createdByFilter = userId
    ? `(where: { created_by: { eq: ${userId} } })`
    : "";
  return await graphql(
    `
      query {
        posts(where: { id: { eq: ${postId} } }) {
          id
          title
          content
          post_image {
            url
          }
          comment_count
          like_count
          repost_count
          created_at
          created_by_enduser {
            id
            username
	    slug
            profile_image_url
          }
	  post_likes${createdByFilter} {
            created_by_enduser {
              id
            }
          }
          post_comments(sort: { created_at: asc }) {
            id
            comment
	    like_count
            created_at
            created_by_enduser {
              id
              username
	      slug
              profile_image_url
            }
	    post_comment_likes${createdByFilter} {
        	post_comment_id
	    }
            post_comment_replies(sort: { created_at: asc }) {
              id
              reply
	      like_count
              created_at
              created_by_enduser {
                id
                username
		slug
                profile_image_url
              }
	      post_comment_reply_likes${createdByFilter} {
          	post_comment_reply_id
              }
            }
          }
        }
      }
    `,
    {},
    null
  );
};
