import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { useRouter } from "next/router";
import MainHeader from "../../components/mainheader";
import { getAuthUserInfo } from "../../lib/api";
import { ChatFeedList } from "../../components/message/chat-feed";
import { graphql } from "../../lib/client";

const Message = ({ authUser, chats }) => {
  const router = useRouter();
  return (
    <>
      <MainHeader title={"Messages"} onBackClick={router.back} />
      <section className="feed">
        <ChatFeedList authUserId={authUser.id} chats={chats || []} />
      </section>
    </>
  );
};

export const queryChatsWithFirstMessage = async (idToken) => {
  return await graphql(
    `
      query {
        enduser_chats {
          created_by
          enduser {
            id
            slug
            profile_image_url
          }
          created_by_enduser {
            id
            slug
            profile_image_url
          }
          enduser_messages(sort: { created_at: desc }) {
            message
          }
        }
      }
    `,
    null,
    idToken
  );
};

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  whenAuthed: AuthAction.RENDER,
})(async ({ AuthUser, params, req }) => {
  const token = await AuthUser.getIdToken();
  const authUserInfo = token ? await getAuthUserInfo(token) : null;
  const chatResponse = await queryChatsWithFirstMessage(token);
  return {
    props: {
      authUser: authUserInfo,
      chats: chatResponse.data["enduser_chats"],
    },
  };
});

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Message);
