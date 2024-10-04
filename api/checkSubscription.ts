// checkSubscription.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot from "node-telegram-bot-api";
import { TwitterApi } from "twitter-api-v2";

// Retrieve the Telegram bot token from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

// Mapping of task IDs to Telegram channel usernames
const TASK_CHANNEL_MAP: { [key: string]: string } = {
  joinTelegramChannel: process.env.TELEGRAM_CHANNEL_USERNAME as string, // Existing channel
  joinAnotherChannel: process.env.TELEGRAM_ANOTHER_CHANNEL_USERNAME as string, // New channel
};

// Twitter Task Definitions
const TWITTER_TASKS: {
  [key: string]: {
    type: "follow" | "like" | "retweet";
    targetUsername?: string; // For follow tasks
    tweetId?: string; // For like and retweet tasks
  };
} = {
  followTwitter: {
    type: "follow",
    targetUsername: "peysubz", // Replace with your Twitter handle
  },
  likeTweet: {
    type: "like",
    tweetId: "1833581877338509620", // Replace with your specific tweet ID
  },
  retweetTweet: {
    type: "retweet",
    tweetId: "1833581877338509620", // Replace with your specific tweet ID
  },
};

// Validate that the necessary environment variables are set
if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN in environment variables.");
}

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Export the default async function to handle the API request
export default async (req: VercelRequest, res: VercelResponse) => {
  // Allow only POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // Extract chatId, taskId, and twitterUsername from the request body
  const { chatId, taskId, twitterUsername } = req.body;

  // Validate that chatId and taskId are provided
  if (!chatId || !taskId) {
    res.status(400).json({ error: "Missing chatId or taskId" });
    return;
  }

  // Determine if the task is Telegram or Twitter
  if (TASK_CHANNEL_MAP[taskId]) {
    // Telegram Task
    const channelUsername = TASK_CHANNEL_MAP[taskId];
    try {
      // Use the Telegram bot to get the chat member status
      const member = await bot.getChatMember(`@${channelUsername}`, chatId);

      // Determine if the user is a member, administrator, or creator of the channel
      if (
        member.status === "member" ||
        member.status === "administrator" ||
        member.status === "creator"
      ) {
        res.status(200).json({ isMember: true });
      } else {
        res.status(200).json({ isMember: false });
      }
    } catch (error: any) {
      console.error("Error checking Telegram subscription:", error.message || error);

      // Handle specific Telegram API error codes
      if (error.response && error.response.statusCode === 403) {
        // Bot lacks necessary permissions
        res.status(500).json({
          error:
            "Bot is not an admin of the channel or cannot access member information.",
        });
      } else if (error.response && error.response.statusCode === 400) {
        // Bad request, possibly due to invalid chatId
        res.status(400).json({ error: "Bad Request. Possibly invalid chatId." });
      } else if (error.response && error.response.statusCode === 404) {
        // Chat not found
        res.status(404).json({ error: "Chat not found." });
      } else {
        // General server error
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } else if (TWITTER_TASKS[taskId]) {
    // Twitter Task
    const task = TWITTER_TASKS[taskId];
    const userTwitterUsername = twitterUsername?.trim();

    // Validate that twitterUsername is provided for Twitter tasks
    if (!userTwitterUsername) {
      res.status(400).json({ error: "Missing twitterUsername for Twitter task." });
      return;
    }

    try {
      // Initialize Twitter client with app credentials
      const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN as string).readOnly;

      // Get user ID from Twitter handle
      const userResponse = await twitterClient.v2.userByUsername(userTwitterUsername, {
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

          // Get target user ID
          const targetUserResponse = await twitterClient.v2.userByUsername(targetUsername, {
            "user.fields": ["id"],
          });

          if (!targetUserResponse || !targetUserResponse.data || !targetUserResponse.data.id) {
            res.status(500).json({ error: "Invalid target Twitter username." });
            return;
          }

          const targetUserId = targetUserResponse.data.id;

          // Check if user follows the target user
          const followingResponse = await twitterClient.v2.following(userId, {
            asPaginator: false,
          });

          if (followingResponse && followingResponse.data) {
            isVerified = followingResponse.data.some((user) => user.id === targetUserId);
          }
          break;
        }

        case "like": {
          const tweetId = task.tweetId;
          if (!tweetId) {
            res.status(500).json({ error: "Tweet ID not configured." });
            return;
          }

          // Check if user has liked the tweet
          const likedTweetsResponse = await twitterClient.v2.userLikedTweets(userId, {
            max_results: 100, // Adjust as needed
          });

          if (
            likedTweetsResponse &&
            likedTweetsResponse.data &&
            likedTweetsResponse.data.data
          ) {
            isVerified = likedTweetsResponse.data.data.some((tweet) => tweet.id === tweetId);
          }
          break;
        }

        case "retweet": {
          const tweetId = task.tweetId;
          if (!tweetId) {
            res.status(500).json({ error: "Tweet ID not configured." });
            return;
          }

          // Fetch recent retweets of the tweet and check if the user is among them
          const retweetsResponse = await twitterClient.v2.get(
            `tweets/${tweetId}/retweeted_by`,
            {
              "user.fields": ["id", "username"],
              max_results: 100, // Adjust as needed
            }
          );

          if (
            retweetsResponse &&
            retweetsResponse.data &&
            retweetsResponse.data.data
          ) {
            isVerified = retweetsResponse.data.data.some(
              (user: any) =>
                user.username.toLowerCase() === userTwitterUsername.toLowerCase()
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

      // Handle specific Twitter API errors
      if (error.code === 429) {
        // Rate limit exceeded
        res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
      } else if (error.code === 50) {
        // User not found
        res.status(404).json({ error: "Twitter user not found." });
      } else {
        // General server error
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } else {
    res.status(400).json({ error: "Invalid taskId" });
  }
};
