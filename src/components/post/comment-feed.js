import { useState } from "react";
import { FeedHeader, CommentButton, LikeButton, ShareButton } from "./feed";
import { authUserInfoContext } from "../../lib/context";
import { graphqlWithIdToken } from "../../lib/client";
import InfiniteScroll from "react-infinite-scroll-component";

const postCommentNumPerPage = 5;

const queryPostCommentsAuthed = async (postId, page) => {
  return await graphqlWithIdToken(
    `
      query postComments(
        $post_id: Int!
        $authuser_id: Int!
        $comment_offset: Int!
        $comment_limit: Int!
      ) {
        post_comments(
          where: { post_id: { eq: $post_id } }
          sort: { created_at: asc }
          limit: $comment_limit
          offset: $comment_offset
        ) {
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
          post_comment_replies_aggregate {
            count
          }
        }
      }
    `,
    {
      post_id: postId,
      comment_limit: postCommentNumPerPage,
      comment_offset: postCommentNumPerPage * (page - 1),
    }
  );
};

const queryPostComments = async (postId, page) => {
  return await graphqlWithIdToken(
    `
      query postComments(
        $post_id: Int!
        $comment_offset: Int!
        $comment_limit: Int!
      ) {
        post_comments(
          where: { post_id: { eq: $post_id } }
          sort: { created_at: asc }
          limit: $comment_limit
          offset: $comment_offset) {
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
            post_comment_replies_aggregate {
              count
            }
          }
      }
    `,
    {
      post_id: postId,
      comment_limit: postCommentNumPerPage,
      comment_offset: postCommentNumPerPage * (page - 1),
    }
  );
};

const getMorePostComments = async (isAuthed, postId, page) => {
  return isAuthed
    ? await queryPostCommentsAuthed(postId, page)
    : await queryPostComments(postId, page);
};

export const CommentFeedList = ({
  isAuthed,
  postId,
  comments = [],
  setComments,
  setCommentId,
  setCommentReplyModalShown,
  setRegisterModalShown,
}) => {
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(
    comments.length === postCommentNumPerPage
  );

  const getNextPage = async () => {
    if (hasMore && page > 1) {
      const moreFeeds = await getMorePostComments(isAuthed, postId, page);
      if (!moreFeeds || !moreFeeds.data || !moreFeeds.data.post_comments)
        return;
      setComments((prev) => {
        return [...prev, ...moreFeeds.data.post_comments];
      });
      setPage((prev) => prev + 1);
      if (moreFeeds.data.post_comments.length < postCommentNumPerPage)
        setHasMore(false);
    }
  };

  return (
    <ul className="feed-list">
      <InfiniteScroll
        dataLength={comments.length}
        next={getNextPage}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<h4>End of comments</h4>}
      >
        {comments.map((comment) => (
          <CommentFeed
            comment={comment}
            setCommentId={setCommentId}
            setCommentReplyModalShown={setCommentReplyModalShown}
            setRegisterModalShown={setRegisterModalShown}
          />
        ))}
      </InfiniteScroll>
    </ul>
  );
};

const createPostCommentLike = async (postCommentId) => {
  const q = `mutation createCommentLikeMutation($postCommentId: Int!) {
  createPostCommentLike(post_comment_id: $postCommentId) { created_by post_comment_id }}`;
  return await graphqlWithIdToken(q, { postCommentId });
};

const deletePostCommentLike = async (postCommentId) => {
  const q = `mutation deletePostCommentLikeMutation($pk_columns: PostCommentLikePkColumns!) {
  deletePostCommentLike(pk_columns: $pk_columns) { result }}`;
  const pk_columns = { post_comment_id: postCommentId, created_by: 0 };
  return await graphqlWithIdToken(q, { pk_columns });
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
      {comment.post_comment_replies_aggregate.count &&
        comment.post_comment_replies_aggregate.count > 0 && (
          <CommentReplyFeedList
            commentId={comment.id}
            setCommentId={setCommentId}
            setCommentReplyModalShown={setCommentReplyModalShown}
          />
        )}
    </>
  );
};

const queryCommentReplies = async (comment_id) => {
  const q = `query queryCommentReplies($comment_id: Int!) {
  post_comment_replies(where: {comment_id:{eq: $comment_id}}, sort: {id: asc})
  { 
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
  }}`;
  return await graphqlWithIdToken(q, { comment_id });
};

const queryCommentRepliesAuthed = async (comment_id) => {
  const q = `query queryCommentReplies($authuser_id: Int!, $comment_id: Int!) {
  post_comment_replies(where: {comment_id:{eq: $comment_id}}, sort: {id: asc})
  { 
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
    post_comment_reply_likes(where: { created_by: { eq: $authuser_id }}) {
      post_comment_reply_id
    }
  }}`;
  return await graphqlWithIdToken(q, { comment_id });
};

const CommentReplyFeedList = ({
  commentId,
  setCommentId,
  setCommentReplyModalShown,
  setRegisterModalShown,
}) => {
  const authUserInfo = authUserInfoContext();
  const [replyFeeds, setReplyFeeds] = useState(null);

  const onShowMoreClick = async (_e) => {
    const res = authUserInfo
      ? await queryCommentRepliesAuthed(commentId)
      : await queryCommentReplies(commentId);
    setReplyFeeds(res.data.post_comment_replies);
  };
  return (
    <ul className="feed-list">
      {replyFeeds ? (
        replyFeeds.map((reply) => (
          <CommentReplyFeed
            reply={reply}
            commentId={commentId}
            setCommentId={setCommentId}
            setCommentReplyModalShown={setCommentReplyModalShown}
          />
        ))
      ) : (
        <article
          className="tweet-item"
          style={{ padding: "10px 15px 10px 48px" }}
        >
          <div className="common-content">
            <p onClick={onShowMoreClick}>Show more replies</p>
          </div>
        </article>
      )}
    </ul>
  );
};

const createPostCommentReplyLike = async (postCommentReplyId) => {
  const q = `mutation createCommentReplyLikeMutation($postCommentReplyId: Int!) {
  createPostCommentReplyLike(post_comment_reply_id: $postCommentReplyId) { created_by post_comment_reply_id }}`;
  return await graphqlWithIdToken(q, { postCommentReplyId });
};

const deletePostCommentReplyLike = async (postCommentReplyId) => {
  const q = `mutation deletePostCommentReplyLikeMutation($pk_columns: PostCommentReplyLikePkColumns!) {
  deletePostCommentReplyLike(pk_columns: $pk_columns) { result }}`;
  const pk_columns = {
    post_comment_reply_id: postCommentReplyId,
    created_by: 0,
  };
  return await graphqlWithIdToken(q, { pk_columns });
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
