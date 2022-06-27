# Situated Problem for [Phrag](https://github.com/ykskb/phrag) : SNS Project (Frontend)

This project is frontend (Next JS) of a situated problem for project: [Phrag](https://github.com/ykskb/phrag) to inspect its concept & validate the practicality.

Backend sits [here](https://github.com/ykskb/situated-sns-backend).

### Supported Features

- Signup & login with Email
- Create SNS posts with images
- Bookmark posts
- Like posts
- Comment on posts
- Like comments
- Reply on post comments
- Like replies
- Follow users
- Message users

\*Authentication uses Firebase with JS SDK and [next-firebase-auth](https://github.com/gladly-team/next-firebase-auth)

\*Comments and replies are 2-level structure like YouTube where subsequent replies follow each post comment.

### Run

Set env vars according to `.env.template` and run:

```sh
yarn install
npm run dev
```

Tests are not written for this project as it is merely for concept validation. Any help is welcomed though.
