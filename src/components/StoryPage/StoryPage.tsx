// src/components/StoryPage/StoryPage.tsx

import React from 'react';
import StoryCard from '../StoryCard/StoryCard';
import Menu from '../Menu/Menu'; // Import Menu
import './storyPage.scss'; // Optional: Create this file for StoryPage-specific styles

interface StoryPageProps {
  story: {
    id: string;
    text: string;
    options: string[];
  };
  chatId: string;
  onBetPlaced: () => void; // Callback to handle redirection after bet
  onMenuClick: (screen: "game" | "profile" | "social") => void; // Pass down the handler
}

const StoryPage: React.FC<StoryPageProps> = ({ story, chatId, onBetPlaced, onMenuClick }) => {
  return (
    <div className="story-page">
      <StoryCard
        story={story}
        chatId={chatId}
        onSelectOption={onBetPlaced} // Trigger redirection after bet
      />
      <Menu onMenuClick={onMenuClick} />
    </div>
  );
};

export default StoryPage;
