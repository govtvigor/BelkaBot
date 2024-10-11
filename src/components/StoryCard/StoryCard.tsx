// src/components/StoryCard/StoryCard.tsx

import React, { useState, useEffect } from 'react';
import { saveUserBet, getUserBet } from '../../client/firebaseFunctions';
import './storyCard.scss'; // Import the CSS file

interface StoryCardProps {
  story: {
    id: string;
    text: string;
    options: string[];
  };
  chatId?: string; // Make chatId optional for testing
  onSelectOption: () => void;  // Callback to trigger after user selects an option
}

const StoryCard: React.FC<StoryCardProps> = ({ story, chatId, onSelectOption }) => {
  console.log('StoryCard Props:', { story, chatId }); // Debugging

  const [betAmount, setBetAmount] = useState<number>(100); // Default bet amount
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userBet, setUserBetState] = useState<any>(null);
  const [isBetLoading, setIsBetLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserBet = async () => {
      if (!chatId) return; // Do not fetch if chatId is not available
      try {
        const bet = await getUserBet(chatId, story.id);
        setUserBetState(bet);
        console.log('Fetched User Bet:', bet); // Debugging
      } catch (error) {
        console.error('Error fetching user bet:', error);
      } finally {
        setIsBetLoading(false);
      }
    };

    fetchUserBet();
  }, [chatId, story.id]);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(Number(e.target.value));
  };

  const handleOptionClick = async (option: string) => {
    if (!chatId) {
      setErrorMessage("User not identified. Please try again.");
      return;
    }

    if (betAmount <= 0) {
      setErrorMessage("You must place a valid bet to choose.");
      return;
    }

    try {
      await saveUserBet(chatId, story.id, option, betAmount);
      alert("Your choice has been recorded. You will be notified of the result when the story ends.");
      onSelectOption();  // Redirect or proceed after selection
    } catch (error: unknown) { // Type the error as unknown
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="story-card">
      <h2>{story.text}</h2>
      {isBetLoading ? (
        <p>Loading your bet...</p>
      ) : userBet ? (
        <p>You have already placed a bet of {userBet.betAmount} NUT on option "{userBet.selectedOption}".</p>
      ) : (
        <>
          <p>Place your bet:</p>
          <input
            type="number"
            value={betAmount}
            onChange={handleBetChange}
            placeholder="Enter bet amount"
            min="1"
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
          <div className="options">
            {story.options.map((option) => (
              <div key={option} className="option-card" onClick={() => handleOptionClick(option)}>
                <p>{option}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StoryCard;
