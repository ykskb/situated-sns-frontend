import { useState } from "react";
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";
import { PostFeedList } from "../components/post/post-feed";
import MainHeader from "../components/mainheader";
import FeedCommentModal from "../components/post/comment-modal";
import { useRouter } from "next/router";
import { getAuthUserInfo } from "../lib/api";
import { queryPostList, queryPostListAuthed } from "../lib/graphql";
import RegisterModal from "../components/register-modal";

const HomePage = ({ authUserInfo, feeds }) => {
  const [showCommentModal, setCommentModalShown] = useState(false);
  const [showRegisterModal, setRegisterModalShown] = useState(false);
  const [postId, setPostId] = useState(null);
  const router = useRouter();
  return (
    <>
      <MainHeader title="Home" />
      <section className="feed">
        <PostFeedList
          data={feeds}
          setPostId={setPostId}
          setCommentModalShown={setCommentModalShown}
          setRegisterModalShown={setRegisterModalShown}
        />
      </section>
      <FeedCommentModal
        show={showCommentModal}
        postId={postId}
        onClose={() => {
          setCommentModalShown(false);
        }}
        afterSubmit={(postId) => {
          router.push(`/post/${postId}`);
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

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ AuthUser, req }) => {
  let authUserInfo;
  const token = await AuthUser.getIdToken();
  authUserInfo = token ? await getAuthUserInfo(token) : null;
  const res = authUserInfo
    ? await queryPostListAuthed(authUserInfo.id)
    : await queryPostList();
  return {
    props: {
      feeds: res ? res.data["posts"] : [],
      authUserInfo: authUserInfo || null,
    },
  };
});

export default withAuthUser()(HomePage);
