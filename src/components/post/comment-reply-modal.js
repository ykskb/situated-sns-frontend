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

  const submitComment = async (e) => {
    e.preventDefault();
    const q = `mutation createPostCommentReplyMutation($commentId: Int!, $reply: String!) {
  createPostCommentReply(comment_id: $commentId, reply: $reply) { id }}`;
    const reply = e.target.reply.value;
    const res = await graphqlWithIdToken(q, {
      commentId,
      reply,
    });
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
            <label htmlFor="reply">Reply</label>
            <input id="reply" name="reply" type="textarea" rows="10" required />
            <button className="big-green-button" type="submit">
              Reply {commentId}
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
