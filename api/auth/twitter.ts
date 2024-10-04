// /api/auth/twitter.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import { TwitterApi, BuildOAuth2RequestLinkArgs } from "twitter-api-v2";
import { v4 as uuidv4 } from "uuid";
import { setOAuthState } from "../../src/client/firebaseFunctions";
import crypto from "crypto";

// Initialize Twitter client
const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID as string,
  clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
});

// Utility function to get environment variables safely
function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined.`);
  }
  return value;
}

// Extend the existing BuildOAuth2RequestLinkArgs to include PKCE parameters
interface ExtendedBuildOAuth2RequestLinkArgs extends BuildOAuth2RequestLinkArgs {
  code_challenge: string;
  code_challenge_method: string;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const { chatId } = req.query;

  if (!chatId || typeof chatId !== "string") {
    res.status(400).json({ error: "Missing or invalid chatId" });
    return;
  }

  try {
    // Generate a unique state parameter for CSRF protection
    const state = uuidv4();

    // Generate a code verifier and challenge for PKCE
    const codeVerifier = crypto.randomBytes(32).toString("hex");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    // Store the state with associated chatId and codeVerifier in your database
    await setOAuthState(state, chatId, codeVerifier);

    // Retrieve and validate the callback URL
    const callbackUrl = getEnvVariable("TWITTER_CALLBACK_URL");

    // Generate the OAuth 2.0 authorization link with extended parameters
    const authLinkArgs: ExtendedBuildOAuth2RequestLinkArgs = {
      state,
      scope: ["tweet.read", "users.read", "follows.read", "offline.access"],
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    };

    const { url } = await twitterClient.generateOAuth2AuthLink(callbackUrl, authLinkArgs);

    // Redirect the user to Twitter's authorization page
    res.redirect(url);
  } catch (error) {
    console.error("Error initiating Twitter OAuth:", error);
    res.status(500).json({ error: "Failed to initiate Twitter OAuth." });
  }
};
