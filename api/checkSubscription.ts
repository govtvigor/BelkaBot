// /api/checkSubscription.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot from "node-telegram-bot-api";
import { TwitterApi } from "twitter-api-v2";
import { getUserAccessTokens } from "../src/client/firebaseFunctions"; // Corrected import path

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

const TASK_CHANNEL_MAP: { [key: string]: string } = {
  joinTelegramChannel: process.env.TELEGRAM_CHANNEL_USERNAME as string,
  joinAnotherChannel: process.env.TELEGRAM_ANOTHER_CHANNEL_USERNAME as string,
};

const TWITTER_TASKS: {
  [key: string]: {
    type: "follow" | "like" | "retweet";
    targetUsername?: string;
    tweetId?: string;
  };
} = {
  followTwitter: {
    type: "follow",
    targetUsername: "peysubz",
  },
  likeTweet: {
    type: "like",
    tweetId: "1833581877338509620",
  },
  retweetTweet: {
    type: "retweet",
    tweetId: "1833581877338509620",
  },
};

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN in environment variables.");
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { chatId, taskId, twitterUsername } = req.body;

  if (!chatId || !taskId) {
    res.status(400).json({ error: "Missing chatId or taskId" });
    return;
  }

  // Retrieve user-specific access tokens
  let accessToken: string;
  let refreshToken: string;
  try {
    const tokens = await getUserAccessTokens(chatId);
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  } catch (error: any) {
    console.error("Error retrieving access tokens:", error.message || error);
    res.status(500).json({ error: "Failed to retrieve access tokens." });
    return;
  }

  if (TASK_CHANNEL_MAP[taskId]) {
    // Telegram Task (Implement your Telegram verification logic here)
    // For example:
    // Check if user is a member of the specified Telegram channel
    // This requires using Telegram Bot API methods like getChatMember

    // Placeholder response
    const isMember = true; // Replace with actual verification

    if (isMember) {
      res.status(200).json({ isMember: true });
    } else {
      res.status(200).json({ isMember: false });
    }
  } else if (TWITTER_TASKS[taskId]) {
    const task = TWITTER_TASKS[taskId];
    const userTwitterUsername = twitterUsername?.trim();

    if (!userTwitterUsername) {
      res.status(400).json({ error: "Missing twitterUsername for Twitter task." });
      return;
    }

    try {
      // Initialize Twitter client with user access tokens
      const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY as string,
        appSecret: process.env.TWITTER_API_SECRET_KEY as string,
        accessToken: accessToken,
        accessSecret: refreshToken, // Assuming 'refreshToken' is actually 'accessSecret'
      });

      const userClient = twitterClient.readWrite;

      // Get user ID from Twitter handle
      const userResponse = await userClient.v2.userByUsername(userTwitterUsername, {
        "user.fields": ["id", "username"],
      });

      if (!userResponse || !userResponse.data || !userResponse.data.id) {
        res.status(400).json({ error: "Invalid Twitter username." });
        return;
      }

      const userId = userResponse.data.id;

      let isVerified = false;

      switch (task.type) {
        case "follow": {
          const targetUsername = task.targetUsername;
          if (!targetUsername) {
            res.status(500).json({ error: "Target Twitter username not configured." });
            return;
          }

          const targetUserResponse = await userClient.v2.userByUsername(targetUsername, {
            "user.fields": ["id"],
          });

          if (
            !targetUserResponse ||
            !targetUserResponse.data ||
            !targetUserResponse.data.id
          ) {
            res.status(500).json({ error: "Invalid target Twitter username." });
            return;
          }

          const targetUserId = targetUserResponse.data.id;

          const followingResponse = await userClient.v2.following(userId, {
            asPaginator: false,
          });

          if (followingResponse && followingResponse.data) {
            isVerified = followingResponse.data.some(
              (user) => user.id === targetUserId
            );
          }
          break;
        }

        case "like": {
          const tweetId = task.tweetId;
          if (!tweetId) {
            res.status(500).json({ error: "Tweet ID not configured." });
            return;
          }

          const likedTweetsResponse = await userClient.v2.userLikedTweets(userId, {
            max_results: 100,
          });

          if (
            likedTweetsResponse &&
            likedTweetsResponse.data &&
            likedTweetsResponse.data.data
          ) {
            isVerified = likedTweetsResponse.data.data.some(
              (tweet) => tweet.id === tweetId
            );
          }
          break;
        }

        case "retweet": {
          const tweetId = task.tweetId;
          if (!tweetId) {
            res.status(500).json({ error: "Tweet ID not configured." });
            return;
          }

          const retweetsResponse = await userClient.v2.get(
            `tweets/${tweetId}/retweeted_by`,
            {
              "user.fields": ["id", "username"],
              max_results: 100,
            }
          );

          if (
            retweetsResponse &&
            retweetsResponse.data &&
            retweetsResponse.data.data
          ) {
            isVerified = retweetsResponse.data.data.some(
              (user: any) =>
                user.username.toLowerCase() ===
                userTwitterUsername.toLowerCase()
            );
          }
          break;
        }

        default:
          res.status(400).json({ error: "Invalid Twitter task type." });
          return;
      }

      if (isVerified) {
        res.status(200).json({ isVerified: true });
      } else {
        res.status(200).json({ isVerified: false });
      }
    } catch (error: any) {
      console.error("Error checking Twitter verification:", error.message || error);

      if (error.code === 429) {
        res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
      } else if (error.code === 50) {
        res.status(404).json({ error: "Twitter user not found." });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } else {
    res.status(400).json({ error: "Invalid taskId" });
  }
};
