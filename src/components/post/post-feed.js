import Link from "next/dist/client/link";
import {
  FeedHeader,
  CommentButton,
  RepostButton,
  LikeButton,
  ShareButton,
} from "./feed";
import { useState } from "react";
import { createPostLike, deletePostLike } from "../../lib/graphql";
import { authUserInfoContext } from "../../lib/context";

export const PostFeedList = ({
  data,
  setPostId,
  setCommentModalShown,
  setRegisterModalShown,
}) => {
  return (
    <ul className="feed-list">
      {data.map((post) => (
        <PostFeed
          key={"post-" + post.id}
          post={post}
          setPostId={setPostId}
          setCommentModalShown={setCommentModalShown}
          setRegisterModalShown={setRegisterModalShown}
        />
      ))}
      <li className="feed-item">
        <article className="tweet-item">
          <div className="common-content">
            <p>This is embedded post.</p>
            <a
              className="embed-content"
              href="https://medium.com/@elad/reverse-engineering-twitters-css-289c91040008"
              target="_blank"
            >
              <img
                className="embed-content-image"
                src="https://miro.medium.com/max/1104/1*bWhVp9YmZbYyGshS2hpNPw.jpeg"
                alt=""
              />
              <div className="embed-content-text">
                <h2 className="embed-content-title">
                  Reverse Engineering Twitter’s CSS
                </h2>
                <p className="embed-content-paragraph">
                  As someone who loves CSS and appreciates its importance in
                  this day and age, it is very unclear to me how the web
                  industry’s most…
                </p>
                <footer className="embed-content-info">
                  <span className="icon">🔗</span>
                  <span className="text">medium.com</span>
                </footer>
              </div>
            </a>
          </div>
        </article>
      </li>
    </ul>
  );
};

export const PostFeed = ({
  post,
  setPostId,
  setCommentModalShown,
  setRegisterModalShown,
}) => {
  const [liked, setLiked] = useState(
    post.post_likes && post.post_likes.length > 0
  );
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const authUserInfo = authUserInfoContext();
  const isValidUser = authUserInfo && authUserInfo.is_valid;

  const commentButtonClicked = async (e) => {
    e.preventDefault();
    if (!isValidUser) {
      setRegisterModalShown(true);
    } else {
      if (typeof setPostId === "function") {
        await setPostId(post.id);
        setCommentModalShown(true);
      } else {
        setCommentModalShown(true);
      }
    }
  };
  const likeButtonClicked = async (e) => {
    e.preventDefault();
    if (!isValidUser) {
      setRegisterModalShown(true);
    } else {
      if (liked) {
        await deletePostLike(post.id);
        setLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        await createPostLike(post.id);
        setLiked(true);
        setLikeCount(likeCount + 1);
      }
    }
  };
  return (
    <li className="feed-item">
      <article className="tweet-item" style={{ padding: "10px 15px" }}>
        <FeedHeader
          enduser={post.created_by_enduser}
          createdAt={post.created_at}
        />
        <Link href={`/post/${encodeURIComponent(post.id)}`}>
          <a>
            <div className="common-content">
              <p>{post.title}</p>
              <p>{post.content}</p>
              {post.post_image ? (
                <img
                  className="content-image"
                  src={post.post_image.url}
                  alt=""
                />
              ) : null}
            </div>
          </a>
        </Link>
        <PostEngage
          liked={liked}
          commentCount={post.comment_count}
          repostCount={post.repost_count}
          likeCount={likeCount}
          commentButtonClicked={commentButtonClicked}
          likeButtonClicked={likeButtonClicked}
        />
      </article>
    </li>
  );
};

const PostEngage = ({
  commentCount,
  repostCount,
  likeCount,
  commentButtonClicked,
  likeButtonClicked,
  liked = false,
}) => {
  return (
    <ul className="message-options u-flex u-space-between">
      <CommentButton
        commentButtonClicked={commentButtonClicked}
        commentCount={commentCount}
      />
      <RepostButton repostCount={repostCount} />
      <LikeButton
        likeButtonClicked={likeButtonClicked}
        likeCount={likeCount}
        liked={liked}
      />
      <ShareButton />
    </ul>
  );
};
