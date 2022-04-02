import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { graphqlWithIdToken } from "../../lib/client";

const FeedCommentModal = ({ show, postId, onClose, afterSubmit }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const createPostComment = async (postId, comment) => {
    const q = `mutation createPostCommentMutation($comment: String!, $postId: Int!) {
  createPostComment(comment: $comment, post_id: $postId) {id}}`;
    return await graphqlWithIdToken(q, {
      postId,
      comment,
    });
  };

  const submitComment = async (e) => {
    e.preventDefault();
    await createPostComment(postId, e.target.comment.value);
    if (typeof afterSubmit === "function") {
      afterSubmit(postId);
    }
  };

  const modalContent = show ? (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <a href="#" onClick={handleCloseClick}>
            x
          </a>
        </div>
        <div className="modal-body">
          <form className="create-form" onSubmit={submitComment}>
            <input
              id="comment"
              name="comment"
              type="textarea"
              rows="10"
              required
            />
            <button className="big-green-button" type="submit">
              Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("modal-root")
    );
  } else {
    return null;
  }
};

export default FeedCommentModal;
