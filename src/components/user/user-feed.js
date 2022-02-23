import Link from "next/link";
import getConfig from "next/config";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";

const userFeedNumPerPage = 15;

export const UserFeedList = ({
  enduserSlug,
  enduserFollows,
  setEndUserFollows,
  getMoreUserFollows,
  enduserKey = "enduser",
}) => {
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(
    enduserFollows.length === userFeedNumPerPage
  );

  const getNextPage = async () => {
    if (hasMore && page > 1) {
      const moreFeeds = await getMoreUserFollows(enduserSlug, page);
      if (!moreFeeds || !moreFeeds.data || !moreFeeds.data.enduser_follows)
        return;
      setEndUserFollows((prev) => {
        return [...prev, ...moreFeeds.data.enduser_follows];
      });
      setPage((prev) => prev + 1);
      if (moreFeeds.data.enduser_follows.length < userFeedNumPerPage)
        setHasMore(false);
    }
  };

  return (
    <ul className="feed-list">
      <InfiniteScroll
        dataLength={enduserFollows.length}
        next={getNextPage}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<h4>No more user</h4>}
      >
        {enduserFollows.map((enduserFollow, i) => (
          <UserFeed key={i} enduser={enduserFollow[enduserKey]} />
        ))}
      </InfiniteScroll>
    </ul>
  );
};

export const UserFeed = ({ enduser }) => {
  const { publicRuntimeConfig } = getConfig();
  const defaultUserImage = publicRuntimeConfig.DEFAULT_USER_IMAGE_URL;
  return (
    <li className="feed-item">
      <article className="tweet-item" style={{ padding: "10px 15px" }}>
        <Link href={`/user/${encodeURIComponent(enduser.slug)}`}>
          <a className="profile-image">
            <img
              src={enduser.profile_image_url || defaultUserImage}
              alt={enduser.username}
            />
          </a>
        </Link>
        <header className="tweet-item-info u-flex">
          <Link href={`/user/${encodeURIComponent(enduser.slug)}`}>
            <a className="tweet-item-info-user">
              <span className="common-title">{enduser.username}</span>
              <span className="usercode">
                @{enduser.slug ? enduser.slug : "slug"}
              </span>
            </a>
          </Link>
        </header>
        {enduser.bio}
      </article>
    </li>
  );
};
