import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { useRouter } from "next/router";
import MainHeader from "../../components/mainheader";
import { getAuthUserInfo } from "../../lib/api";
import { queryChatsWithFirstMessage } from "../../lib/graphql";
import { ChatFeedList } from "../../components/message/chat-feed";

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
