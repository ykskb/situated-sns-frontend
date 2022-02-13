import { useState } from "react";
import { useRouter } from "next/router";
import MainHeader from "../../components/mainheader";
import { CommentFeedList } from "../../components/post/comment-feed";
import FeedCommentModal from "../../components/post/comment-modal";
import { PostFeed } from "../../components/post/post-feed";
import CommentReplyModal from "../../components/post/comment-reply-modal";
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { getAuthUserInfo } from "../../lib/api";
import RegisterModal from "../../components/register-modal";
import { graphql } from "../../lib/client";

const PostPage = ({ authUserInfo, post }) => {
  const router = useRouter();
  const [showCommentModal, setCommentModalShown] = useState(false);
  const [showCommentReplyModal, setCommentReplyModalShown] = useState(false);
  const [showRegisterModal, setRegisterModalShown] = useState(false);
  const [commentId, setCommentId] = useState(null);
  return (
    <>
      <MainHeader
        title="Post"
        onBackClick={(e) => {
          router.back();
        }}
      />
      <PostFeed
        post={post}
        setPostId={null}
        setCommentModalShown={setCommentModalShown}
        setRegisterModalShown={setRegisterModalShown}
      />
      <CommentFeedList
        data={post.post_comments}
        setCommentId={setCommentId}
        setCommentReplyModalShown={setCommentReplyModalShown}
        setRegisterModalShown={setRegisterModalShown}
      />
      <FeedCommentModal
        show={showCommentModal}
        postId={post.id}
        onClose={() => {
          setCommentModalShown(false);
        }}
        afterSubmit={(postId) => {
          router.reload();
        }}
      />
      <CommentReplyModal
        show={showCommentReplyModal}
        commentId={commentId}
        onClose={() => {
          setCommentReplyModalShown(false);
        }}
        afterSubmit={(_commentId) => {
          router.reload();
        }}
      />
      <RegisterModal
        show={showRegisterModal}
        onClose={() => {
          setRegisterModalShown(false);
        }}
      />
    </>
  );
};

const queryPostDetailsAuthed = async (postId, token) => {
  return await graphql(
    `
      query postDeails($post_id: Int!, $authuser_id: Int!) {
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
          post_likes(where: { created_by: { eq: $authuser_id } }) {
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
            post_comment_likes(where: { created_by: { eq: $authuser_id } }) {
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
                where: { created_by: { eq: $authuser_id } }
              ) {
                post_comment_reply_id
              }
            }
          }
        }
      }
    `,
    { post_id: postId },
    token
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

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ params, AuthUser, req }) => {
  const token = await AuthUser.getIdToken();
  const authUserInfo = token ? await getAuthUserInfo(token) : null;
  const res = authUserInfo
    ? await queryPostDetailsAuthed(parseInt(params.id), token)
    : await queryPostDetails(parseInt(params.id));
  return {
    props: {
      authUserInfo: authUserInfo || null,
      post: res.data["posts"].length > 0 ? res.data["posts"][0] : {},
    },
  };
});

export default withAuthUser()(PostPage);
