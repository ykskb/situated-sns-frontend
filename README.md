# Situated Problem for [Phrag](https://github.com/ykskb/phrag) : SNS Project (Frontend)

This project is frontend (Next JS) of a test-case scenario for project: [Phrag](https://github.com/ykskb/phrag) to inspect & validate its concept of constraint-driven transformation of RDBMS schema to GraphQL.

Backend currently sits under dev profile of Phrag project at this mement. ([Link](https://github.com/ykskb/phrag/blob/main/dev/src/dev_reitit.clj))

### Supported Features

- Signup & login with Email
- Create SNS posts with images
- Bookmark posts
- Like posts
- Comment on posts
- Reply on post comments
- Follow users
- Message users

\*Authentication uses Firebase with JS SDK and [next-firebase-auth](https://github.com/gladly-team/next-firebase-auth)

\*Comments and replies are 2-level structure like YouTube where subsequent replies follow each post comment.

### Run

Set env vars according to `.env.template` and run:

```sh
npm run dev
```

Tests are not written for this project as it is merely for concept validation. Any help is welcomed though.
