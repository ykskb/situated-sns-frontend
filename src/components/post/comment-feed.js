import { useState } from "react";
import { FeedHeader, CommentButton, LikeButton, ShareButton } from "./feed";
import { authUserInfoContext } from "../../lib/context";
import { graphqlWithIdToken } from "../../lib/client";

export const CommentFeedList = ({
  data,
  setCommentId,
  setCommentReplyModalShown,
  setRegisterModalShown,
}) => {
  return (
    <ul className="feed-list">
      {data.map((comment) => (
        <CommentFeed
          comment={comment}
          setCommentId={setCommentId}
          setCommentReplyModalShown={setCommentReplyModalShown}
          setRegisterModalShown={setRegisterModalShown}
        />
      ))}
    </ul>
  );
};

const createPostCommentLike = async (postCommentId) => {
  const q = `mutation createCommentLikeMutation($postCommentId: Int!) {
  createPostCommentLike(post_comment_id: $postCommentId) { created_by post_comment_id }}`;
  return await graphqlWithIdToken(q, { postCommentId });
};

const deletePostCommentLike = async (postCommentId) => {
  const q = `mutation deletePostCommentLikeMutation($pkColumns: PostCommentLikePkColumns!) {
  deletePostCommentLike(pk_columns: $pkColumns) { result }}`;
  const pkColumns = { post_comment_id: postCommentId, created_by: 0 };
  return await graphqlWithIdToken(q, { pkColumns });
};

const CommentFeed = ({
  comment,
  setCommentId,
  setCommentReplyModalShown,
  setRegisterModalShown,
}) => {
  const [liked, setLiked] = useState(comment.post_comment_likes.length > 0);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const authUserInfo = authUserInfoContext();
  const isValidUser = authUserInfo && authUserInfo.is_valid;

  const commentButtonClicked = async (e) => {
    e.preventDefault();
    if (!isValidUser) {
      setRegisterModalShown(true);
    } else {
      await setCommentId(comment.id);
      setCommentReplyModalShown(true);
    }
  };
  const likeButtonClicked = async (e) => {
    e.preventDefault();
    if (!isValidUser) {
      setRegisterModalShown(true);
    } else {
      if (liked) {
        await deletePostCommentLike(comment.id);
        setLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        await createPostCommentLike(comment.id);
        setLiked(true);
        setLikeCount(likeCount + 1);
      }
    }
  };
  return (
    <>
      <li className="feed-item">
        <article className="tweet-item" style={{ padding: "10px 15px" }}>
          <FeedHeader
            enduser={comment.created_by_enduser}
            createdAt={comment.created_at}
          />
          <div className="common-content">
            <p>{comment.comment}</p>
          </div>
          <CommentEngage
            liked={liked}
            likeCount={likeCount}
            commentButtonClicked={commentButtonClicked}
            likeButtonClicked={likeButtonClicked}
          />
        </article>
      </li>
      <CommentReplyFeedList
        replies={comment.post_comment_replies}
        commentId={comment.id}
        setCommentId={setCommentId}
        setCommentReplyModalShown={setCommentReplyModalShown}
      />
    </>
  );
};

const CommentReplyFeedList = ({
  replies = [],
  commentId,
  setCommentId,
  setCommentReplyModalShown,
  setRegisterModalShown,
}) => {
  return (
    <ul className="feed-list">
      {replies.map((reply) => (
        <CommentReplyFeed
          reply={reply}
          commentId={commentId}
          setCommentId={setCommentId}
          setCommentReplyModalShown={setCommentReplyModalShown}
        />
      ))}
    </ul>
  );
};

const createPostCommentReplyLike = async (postCommentReplyId) => {
  const q = `mutation createCommentReplyLikeMutation($postCommentReplyId: Int!) {
  createPostCommentReplyLike(post_comment_reply_id: $postCommentReplyId) { created_by post_comment_reply_id }}`;
  return await graphqlWithIdToken(q, { postCommentReplyId });
};

const deletePostCommentReplyLike = async (postCommentReplyId) => {
  const q = `mutation deletePostCommentReplyLikeMutation($pkColumns: PostCommentReplyLikePkColumns!) {
  deletePostCommentReplyLike(pk_columns: $pkColumns) { result }}`;
  const pkColumns = {
    post_comment_reply_id: postCommentReplyId,
    created_by: 0,
  };
  return await graphqlWithIdToken(q, { pkColumns });
};

const CommentReplyFeed = ({
  reply,
  commentId,
  setCommentId,
  setCommentReplyModalShown,
  setRegisterModalShown,
}) => {
  const authUserInfo = authUserInfoContext();
  const isValidUser = authUserInfo && authUserInfo.is_valid;
  const [liked, setLiked] = useState(reply.post_comment_reply_likes.length > 0);
  const [likeCount, setLikeCount] = useState(reply.like_count);

  const commentButtonClicked = async (e) => {
    e.preventDefault();
    if (!isValidUser) {
      setRegisterModalShown(true);
    } else {
      await setCommentId(commentId);
      setCommentReplyModalShown(true);
    }
  };
  const likeButtonClicked = async (e) => {
    e.preventDefault();
    if (!isValidUser) {
      setRegisterModalShown(true);
    } else {
      if (liked) {
        await deletePostCommentReplyLike(reply.id);
        setLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        await createPostCommentReplyLike(reply.id);
        setLiked(true);
        setLikeCount(likeCount + 1);
      }
    }
  };
  return (
    <li className="feed-item">
      <article
        className="tweet-item"
        style={{ padding: "10px 15px 10px 48px" }}
      >
        <FeedHeader
          enduser={reply.created_by_enduser}
          createdAt={reply.created_at}
        />
        <div className="common-content">
          <p>{reply.reply}</p>
        </div>
        <CommentEngage
          liked={liked}
          likeCount={likeCount}
          likeButtonClicked={likeButtonClicked}
          commentButtonClicked={commentButtonClicked}
        />
      </article>
    </li>
  );
};

const CommentEngage = ({
  likeCount,
  commentButtonClicked,
  likeButtonClicked,
  liked = false,
}) => {
  return (
    <ul className="message-options u-flex u-space-between">
      <CommentButton
        commentButtonClicked={commentButtonClicked}
        showCount={false}
      />
      <LikeButton
        likeButtonClicked={likeButtonClicked}
        likeCount={likeCount}
        liked={liked}
      />
      <ShareButton />
    </ul>
  );
};
