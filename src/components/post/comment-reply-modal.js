import React, { useEffect, useRef, useState } from "react";
import { graphqlWithIdToken } from "../../lib/client";
import ReactDOM from "react-dom";

const CommentReplyModal = ({ show, commentId, onClose, afterSubmit }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const createPostCommentReply = async (comment_id, reply) => {
    const q = `mutation createPostCommentReplyMutation($comment_id: Int!, $reply: String!) {
  createPostCommentReply(comment_id: $comment_id, reply: $reply) { id }}`;
    return await graphqlWithIdToken(q, {
      comment_id,
      reply,
    });
  };

  const submitComment = async (e) => {
    e.preventDefault();
    await createPostCommentReply(commentId, e.target.reply.value);
    if (typeof afterSubmit === "function") {
      afterSubmit(commentId);
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
            <input id="reply" name="reply" type="textarea" rows="10" required />
            <button className="big-green-button" type="submit">
              Reply
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

export default CommentReplyModal;
