import { useState } from "react";
import { useRouter } from "next/router";
import MainHeader from "../../components/mainheader";
import { CommentFeedList } from "../../components/post/comment-feed";
import FeedCommentModal from "../../components/post/comment-modal";
import { PostFeed } from "../../components/post/post-feed";
import CommentReplyModal from "../../components/post/comment-reply-modal";
import { queryPostDetails } from "../../lib/graphql";
import { AuthAction, withAuthUserTokenSSR } from "next-firebase-auth";
import { getAuthUserInfo } from "../../lib/api";
import RegisterModal from "../../components/register-modal";

export default function PostPage({ authUserInfo, post }) {
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
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ params, AuthUser, req }) => {
  const token = await AuthUser.getIdToken();
  const authUserInfo = token ? await getAuthUserInfo(token) : null;
  const res = authUserInfo
    ? await queryPostDetails(params.id, authUserInfo.id)
    : await queryPostDetails(params.id);
  return {
    props: {
      authUserInfo: authUserInfo || null,
      post: res.data["posts"].length > 0 ? res.data["posts"][0] : {},
    },
  };
});
