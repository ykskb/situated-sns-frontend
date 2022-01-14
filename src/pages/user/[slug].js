import { useState } from "react";
import { useRouter } from "next/router";
import getConfig from "next/config";
import {
  withAuthUserTokenSSR,
  AuthAction,
  withAuthUser,
} from "next-firebase-auth";
import MainHeader from "../../components/mainheader";
import { PostFeedList } from "../../components/post/post-feed";
import FeedCommentModal from "../../components/post/comment-modal";
import { queryEndUser, queryPostList } from "../../lib/graphql";
import { getAuthUserInfo } from "../../lib/api";
import Link from "next/link";

const UserPage = ({ enduser, authUser, feeds }) => {
  const [showCommentModal, setCommentModalShown] = useState(false);
  const [postId, setPostId] = useState(null);
  const router = useRouter();
  const isOwnPage = authUser && enduser.slug == authUser.slug;
  return (
    <>
      <MainHeader
        title={enduser.username}
        onBackClick={(e) => {
          router.back();
        }}
      />
      <UserProfile enduser={enduser} isOwnPage={isOwnPage} />
      <section className="feed">
        <PostFeedList
          data={feeds}
          setPostId={setPostId}
          setCommentModalShown={setCommentModalShown}
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
    </>
  );
};

const UserProfile = ({ enduser, isOwnPage }) => {
  const { publicRuntimeConfig } = getConfig();
  const defaultUserImage = publicRuntimeConfig.DEFAULT_USER_IMAGE_URL;
  return (
    <article className="user-profile">
      <img
        className="profile-image"
        src={enduser.profile_image_url || defaultUserImage}
        alt={enduser.username}
      />
      <header className="user-name u-flex">
        <span className="common-title">{enduser.username}</span>
        <span className="usercode">
          @{enduser.slug ? enduser.slug : "slug"}
        </span>
      </header>
      <div className="user-bio" style={{ paddingTop: "20px" }}>
        <p>{enduser.bio}</p>
      </div>
      <ul className="user-options u-flex u-flex-end">
        {isOwnPage ? (
          <Link href="/profile">
            <a>
              <li className="message-options-item">
                <button className="big-green-button">Edit Profile</button>
              </li>
            </a>
          </Link>
        ) : (
          <>
            <li className="message-options-item">
              <button className="big-green-button">Message</button>
            </li>
            &nbsp;
            <li>
              <button className="big-green-button">Follow</button>
            </li>
          </>
        )}
      </ul>
    </article>
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.RENDER,
})(async ({ AuthUser, req, params }) => {
  const token = await AuthUser.getIdToken();
  const authUserInfo = token ? await getAuthUserInfo(token) : null;

  const userInfoRes = await queryEndUser(params.slug);
  if (
    !userInfoRes.data ||
    !userInfoRes.data["endusers"] ||
    userInfoRes.data["endusers"].length < 1
  ) {
    return { notFound: true };
  }
  const enduser = userInfoRes.data["endusers"][0];

  const postRes = authUserInfo
    ? await queryPostList(authUserInfo.id, enduser.id)
    : await queryPostList(null, enduser.id);

  return {
    props: {
      enduser: enduser,
      authUser: authUserInfo || null,
      feeds: postRes.data["posts"],
    },
  };
});

export default withAuthUser()(UserPage);
