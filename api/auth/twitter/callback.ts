// /api/auth/twitter/callback.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import { TwitterApi } from "twitter-api-v2";
import { getOAuthState, storeUserTokens, updateUserData } from "../../../src/client/firebaseFunctions";
import { getEnvVariable } from "../../../src/utils/env"; // Ensure this path is correct

// Initialize Twitter client with validated environment variables
const twitterClient = new TwitterApi({
  clientId: getEnvVariable("TWITTER_CLIENT_ID"),
  clientSecret: getEnvVariable("TWITTER_CLIENT_SECRET"),
});

export default async (req: VercelRequest, res: VercelResponse) => {
  const { code, state } = req.query;

  if (!code || typeof code !== "string" || !state || typeof state !== "string") {
    res.status(400).json({ error: "Missing or invalid OAuth parameters." });
    return;
  }

  try {
    // Retrieve the chatId and codeVerifier using the state
    const oauthData = await getOAuthState(state);
    if (!oauthData) {
      res.status(400).json({ error: "Invalid state parameter." });
      return;
    }

    const { chatId, codeVerifier } = oauthData;

    // Retrieve and validate the callback URL
    const callbackUrl = getEnvVariable("TWITTER_CALLBACK_URL");

    // Exchange the authorization code for access tokens with codeVerifier
    const { client: loggedClient, accessToken, refreshToken } =
      await twitterClient.loginWithOAuth2({
        code,
        redirectUri: callbackUrl, // Now guaranteed to be a string
        codeVerifier,
      });

    // **Validate accessToken and refreshToken**
    if (!accessToken || !refreshToken) {
      throw new Error("Failed to obtain access token or refresh token.");
    }

    // Store the access tokens associated with the chatId in your database
    await storeUserTokens(chatId, accessToken, refreshToken);

    // Fetch the user's Twitter username
    const user = await loggedClient.v2.me();

    if (!user || !user.data || !user.data.username) {
      throw new Error("Unable to retrieve Twitter username.");
    }

    // Update the user's Twitter username in Firebase
    const twitterUsername = user.data.username || 'Unknown';
    await updateUserData(chatId, { twitterUsername });

    // Redirect the user back to your frontend with a success message
    res.redirect(`/your-frontend-page?twitterUsername=${encodeURIComponent(twitterUsername)}`);
  } catch (error: any) {
    console.error("Error handling Twitter OAuth callback:", error.message || error);
    res.status(500).json({ error: "Failed to handle Twitter OAuth callback." });
  }
};
