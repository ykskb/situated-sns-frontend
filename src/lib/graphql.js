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

export const createUserChat = async (userId) => {
  const q = `mutation createEnduserChatMutation($created_by: Int!, $enduser_id: Int!) {
  createEnduserChat(created_by: $created_by, enduser_id: $enduser_id) { id }}`;
  return await graphqlWithIdToken(q, {
    created_by: 0,
    enduser_id: userId,
  });
};

export const createEndUserMessage = async (chatId, msg) => {
  return await graphqlWithIdToken(
    `mutation createEnduserMessageMutation($chat_id: Int!, $message: String!) {
  createEnduserMessage(chat_id: $chat_id, message: $message, enduser_id: 0, created_by: 0) { chat_id created_at created_by }}`,
    { chat_id: chatId, message: msg }
  );
};

// Token required (frontend/backend)

export const queryChatsWithFirstMessage = async (idToken) => {
  return await graphql(
    `
      query {
        enduser_chats {
          created_by
          enduser {
            id
            slug
            profile_image_url
          }
          created_by_enduser {
            id
            slug
            profile_image_url
          }
          enduser_messages(sort: { created_at: desc }) {
            message
          }
        }
      }
    `,
    null,
    idToken
  );
};

export const queryChatWithMessages = async (chatUserId, idToken) => {
  return await graphql(
    `
      query queryEnduserChats($enduser_id: Int!) {
        enduser_chats(
          where: {
            or: [
              { enduser_id: { eq: $enduser_id } }
              { created_by: { eq: $enduser_id } }
            ]
          }
        ) {
          id
          created_by
          enduser {
            slug
            profile_image_url
          }
          created_by_enduser {
            slug
            profile_image_url
          }
          enduser_messages(sort: { created_at: desc }) {
            message
            created_by
            created_at
          }
        }
      }
    `,
    { enduser_id: chatUserId },
    idToken
  );
};

// No auth (frontend/backend)

export const queryEndUser = async (slug) => {
  return await graphql(
    `
      query endUser($slug: String!) {
        query: endusers(where: { slug: { eq: $slug } }) {
          id
          username
          slug
          profile_image_url
        }
      }
    `,
    { slug },
    null
  );
};

export const queryEndUserWithFollowers = async (slug) => {
  return await graphql(
    `
      query endUserWithFollowers($slug: String!) {
        endusers(where: { slug: { eq: $slug } }) {
          slug
          username
          bio
          enduser_follows_on_enduser_id_aggregate {
            count
          }
          enduser_follows_on_enduser_id {
            enduser_id
            created_by_enduser {
              slug
              username
              bio
              profile_image_url
            }
          }
        }
      }
    `,
    { slug },
    null
  );
};

export const queryEndUserWithFollowing = async (slug) => {
  return await graphql(
    `
      query endUserWithFollowing($slug: String!) {
        endusers(where: { slug: { eq: $slug } }) {
          slug
          username
          bio
          enduser_follows_on_created_by_aggregate {
            count
          }
          enduser_follows_on_created_by {
            enduser_id
            enduser {
              slug
              username
              bio
              profile_image_url
            }
          }
        }
      }
    `,
    { slug },
    null
  );
};

export const queryEndUserWithPostsAuthed = async (slug, authUserId) => {
  return await graphql(
    `
      query endUserWithPosts($slug: String!, $auth_user_id: Int!) {
        endusers(where: { slug: { eq: $slug } }) {
          id
          email
          username
          slug
          profile_image_url
          bio
          enduser_follows_on_enduser_id_aggregate {
            count
          }
          enduser_follows_on_enduser_id(
            where: { created_by: { eq: $auth_user_id } }
          ) {
            created_by
          }
          enduser_follows_on_created_by_aggregate {
            count
          }
          enduser_follows_on_created_by(
            where: { enduser_id: { eq: $auth_user_id } }
          ) {
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
            post_likes(where: { created_by: { eq: $auth_user_id } }) {
              created_by_enduser {
                id
              }
            }
          }
        }
      }
    `,
    { slug, auth_user_id: authUserId },
    null
  );
};

export const queryEndUserWithPosts = async (slug) => {
  return await graphql(
    `
      query endUserWithPosts($slug: String!) {
        endusers(where: { slug: { eq: $slug } }) {
          id
          email
          username
          slug
          profile_image_url
          bio
          enduser_follows_on_enduser_id_aggregate {
            count
          }
          enduser_follows_on_created_by_aggregate {
            count
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
          }
        }
      }
    `,
    { slug },
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

export const queryPostListAuthed = async (authUserId) => {
  return await graphql(
    `
      query postList($auth_user_id: Int!) {
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
          post_likes(where: { created_by: { eq: $auth_user_id } }) {
            created_by_enduser {
              id
            }
          }
        }
      }
    `,
    { auth_user_id: authUserId },
    null
  );
};

export const queryPostList = async () => {
  return await graphql(
    `
      query {
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
          post_likes {
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

export const queryPostDetails = async (postId) => {
  return await graphql(
    `
      query postDeails($post_id: Int!) {
        posts(where: { id: { eq: $post_id } }) {
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
          post_likes {
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
            post_comment_likes {
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
              post_comment_reply_likes {
                post_comment_reply_id
              }
            }
          }
        }
      }
    `,
    { post_id: postId },
    null
  );
};

export const queryPostDetailsAuthed = async (postId, userId) => {
  return await graphql(
    `
      query postDeails($post_id: Int!, $auth_user_id: Int!) {
        posts(where: { id: { eq: $post_id } }) {
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
          post_likes(where: { created_by: { eq: $auth_user_id } }) {
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
            post_comment_likes(where: { created_by: { eq: $auth_user_id } }) {
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
              post_comment_reply_likes(
                where: { created_by: { eq: $auth_user_id } }
              ) {
                post_comment_reply_id
              }
            }
          }
        }
      }
    `,
    { post_id: postId, auth_user_id: userId },
    null
  );
};
