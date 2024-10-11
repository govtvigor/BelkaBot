// src/client/GameArea.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import Squirrel from "../components/sprites/Squirrel/Squirrel";
import Branch from "../components/Branch/Branch";
import Score from "../components/Score/Score";
import Lives from "../components/Lives/Lives";
import Menu from "../components/Menu/Menu";
import Profile from "../components/Profile/Profile";
import groundTreeImage from "../assets/groundTree.png";
import startText from "../assets/startText.png";
import { useGameLogic } from "../hooks/useGameLogic";
import { Branch as BranchType } from "../reducers/gameReducer";
import Timer from "../components/Timer/Timer";
import './App.css';
import { resetGame, setGameOver, startGame } from "../actions/gameActions";
import snowBiomeImage from '../assets/snow-biome.png';
import forestBgImage from '../assets/forest-bg-2.png';
import transitionBiomeImage from '../assets/transitionForestToSnow.png';
import SocialTasks from "../components/SocialTasks/SocialTasks";
import loadingBackgroundImage from "../assets/loadingBackground.png";
import telegramIcon from "../assets/telegramIcon.svg";
import twitterIcon from "../assets/x.svg";
import { 
  getUserData, 
  updateUserTutorialCompleted, 
  getActiveStory, 
  processStoryBets 
} from "../client/firebaseFunctions";
import Tutorial from "../components/Tutorial/Tutorial";
import StoryPage from "../components/StoryPage/StoryPage"; // Import StoryPage

const GameArea: React.FC = () => {
  const { 
    state, 
    dispatch, 
    handleScreenClick, 
    generateBranches, 
    maxTime, 
    setIsJumping 
  } = useGameLogic();

  // Extend currentScreen to include "story"
  const [currentScreen, setCurrentScreen] = useState<"game" | "profile" | "social" | "story">("game");
  const [isJumpingToFirstBranch, setIsJumpingToFirstBranch] = useState(false);
  const [isGroundMovingDown, setIsGroundMovingDown] = useState(false);
  const [isTreeMovingUp, setIsTreeMovingUp] = useState(false);
  const [isGroundHidden, setIsGroundHidden] = useState(false);
  const [isTreePositionAdjusted, setIsTreePositionAdjusted] = useState(false);
  const [backgroundOffsetY, setBackgroundOffsetY] = useState(0);
  const [isJumping, setIsJumpingLocal] = useState(false);
  const [currentStory, setCurrentStory] = useState<any>(null);

  const groundImageRef = useRef<HTMLImageElement | null>(null);
  const biomes = [
    { image: snowBiomeImage, points: 50 },
    { image: transitionBiomeImage, points: 40 },
    { image: forestBgImage, points: 0 },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Tutorial state
  const [isTutorialCompleted, setIsTutorialCompleted] = useState<boolean | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const setTrunkBottom = () => {
    const groundImage = groundImageRef.current;
    if (groundImage) {
      const groundHeight = groundImage.clientHeight;
      document.documentElement.style.setProperty('--tree-trunk-bottom', `${groundHeight}px`);
      document.documentElement.style.setProperty('--tree-trunk-bottom-mobile', `${groundHeight}px`);
    }
  };

  // Fetch the active story on mount
  useEffect(() => {
    const fetchCurrentStory = async () => {
      try {
        const story = await getActiveStory();
        setCurrentStory(story);
        console.log('Fetched Story:', story); // Debugging
        if (story) {
          setCurrentScreen("story"); // Navigate to StoryPage if a story is active
        }
      } catch (error) {
        console.error('Error fetching current story:', error);
      }
    };
  
    fetchCurrentStory();
  }, []);

  // Handle loading screen
  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeOutTimer);
    };
  }, []);

  // Update background offset based on scroll
  useEffect(() => {
    setBackgroundOffsetY(state.scrollOffset);
  }, [state.scrollOffset]);

  // Set trunk bottom on image load and window resize
  useEffect(() => {
    const groundImage = groundImageRef.current;
    if (groundImage) {
      const handleImageLoad = () => {
        setTrunkBottom();
      };

      if (groundImage.complete) {
        setTrunkBottom();
      } else {
        groundImage.onload = handleImageLoad;
      }

      window.addEventListener('resize', setTrunkBottom);

      return () => {
        window.removeEventListener('resize', setTrunkBottom);
      };
    }
  }, [state.gameStarted]);

  useEffect(() => {
    if (!isLoading) {
      setTrunkBottom();
    }
  }, [isLoading]);

  // Generate branches
  useEffect(() => {
    generateBranches();
  }, [generateBranches]);

  const handleMenuClick = (screen: "game" | "profile" | "social") => {
    if (screen === "game") {
      setCurrentScreen("game"); // This will show "Coming soon"
    } else {
      setCurrentScreen(screen);
    }
  };

  const handleGameStartWithJump = useCallback(() => {
    if (state.lives <= 0) {
      alert('You have no lives left. Please buy more lives in your profile.');
      return;
    }

    setIsJumpingToFirstBranch(true);
    setIsGroundMovingDown(true);
    setIsTreeMovingUp(true);

    const animationDuration = 1000;

    setTimeout(() => {
      setIsJumpingToFirstBranch(false);
      dispatch(startGame());
      setIsGroundMovingDown(false);
      setIsTreeMovingUp(false);
      setIsGroundHidden(true);
      setIsTreePositionAdjusted(true);
    }, animationDuration);
  }, [state.lives, dispatch]);

  const resetGameHandler = useCallback(() => {
    setIsJumpingToFirstBranch(false);
    setIsGroundMovingDown(false);
    setIsTreeMovingUp(false);
    setIsGroundHidden(false);
    setIsTreePositionAdjusted(false);

    dispatch(resetGame());
    dispatch(setGameOver(false, 'normal'));
    generateBranches();
  }, [dispatch, generateBranches]);

  const handleClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.closest(".menu") || target.closest(".menu-buttons button")) {
      event.stopPropagation(); 
      return;
    }
    if (!state.gameStarted) {
      handleGameStartWithJump();
    } else {
      const clickX = event.clientX;
      const screenWidth = window.innerWidth;

      if (clickX < screenWidth / 2) {
        handleScreenClick("left");
      } else {
        handleScreenClick("right");
      }
    }
  };

  useEffect(() => {
    setIsJumpingLocal(state.isJumping);
  }, [state.isJumping]);

  // Tutorial logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdParam = urlParams.get('chatId');
    if (chatIdParam) {
      setChatId(chatIdParam);
      getUserData(chatIdParam).then(userData => {
        if (userData) {
          setIsTutorialCompleted(userData.tutorialCompleted);
          if (!userData.tutorialCompleted) {
            setShowTutorial(true);
          }
        } else {
          // If user data not found, assume new user
          setIsTutorialCompleted(false);
          setShowTutorial(true);
        }
      }).catch(error => {
        console.error('Error fetching user data:', error);
        // Handle error, perhaps show an error message
      });
    } else {
      console.error('chatId not found in URL parameters.');
      // Handle missing chatId, perhaps redirect to an error page or show a message
      // For now, we'll set chatId to null and show an error
      setChatId(null);
      setIsTutorialCompleted(null);
    }
  }, []);

  const handleTutorialConfirm = () => {
    if (chatId) {
      updateUserTutorialCompleted(chatId).then(() => {
        setShowTutorial(false);
        setIsTutorialCompleted(true);
      }).catch(error => {
        console.error('Error updating tutorial completion:', error);
        // Handle error, perhaps notify the user
      });
    } else {
      setShowTutorial(false);
      setIsTutorialCompleted(true);
    }
  };

  // Function to handle when a user selects an option in StoryCard
  const handleStoryOptionSelected = () => {
    // Redirect to SocialTasks screen
    setCurrentScreen("social");
  };

  // Centralized rendering based on currentScreen
  if (isLoading || isTutorialCompleted === null) {
    return (
      <div className={`loading-screen ${fadeOut ? "fade-out" : ""}`}>
        <img
          src={loadingBackgroundImage}
          alt="Loading Background"
          className="loading-background"
        />
        <div className="loading-text">Welcome to Nutty Corporation!</div>
        <p className="loading-subtext">Get ready to collect some nuts!</p>
        
        <div className="spinner"></div>
        <div className="socials">
          <div className="socials-block">
            <a href="https://t.me/squirreala"><img src={telegramIcon} alt="telegram" /></a>
          </div>
          <div className="socials-block">
            <a href="https://twitter.com/peysubz"><img src={twitterIcon} alt="twitter" /></a> 
          </div>
        </div>
      </div>
    );
  }

  if (showTutorial) {
    return <Tutorial onConfirm={handleTutorialConfirm} />;
  }

  switch (currentScreen) {
    case "story":
      if (currentStory) {
        return (
          <div className="story-page-container">
            <StoryPage
              story={currentStory}
              chatId={chatId!} // Assuming chatId is not null here
              onBetPlaced={handleStoryOptionSelected}
              onMenuClick={handleMenuClick} // Pass the handler
            />
            {/* Menu is now inside StoryPage */}
          </div>
        );
      } else {
        return <div className="error-message">No active story available.</div>;
      }
    case "game":
      return (
        <div className="game-container">
          {/* Render the actual game */}
          <div className="game-area-wrapper">
            <div
              className="background-wrapper"
              style={{
                transform: `translateY(${backgroundOffsetY}px)`,
                transition: 'none',
                height: `${biomes.length * 200}vh`,
              }}
            >
              {biomes.map((biome, index) => (
                <div
                  key={index}
                  className="background-biome"
                  style={{
                    backgroundImage: `url(${biome.image})`,
                  }}
                ></div>
              ))}
            </div>

            <div
              className={`game-area ${state.inMenu ? "menu-mode" : "game-mode"}`}
              onClick={handleClick}
            >
              {!state.gameStarted && (
                <img className="start-text" src={startText} alt="Start Text" />
              )}

              <div className="tree-wrapper">
                {!isGroundHidden && (
                  <div className={`ground-wrapper ${isGroundMovingDown ? 'move-down' : ''}`}>
                    <img
                      src={groundTreeImage}
                      alt="Ground"
                      ref={groundImageRef}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                )}
                
                <div
                  className={`tree-trunk ${state.gameStarted ? 'fade-in' : ''} ${isTreeMovingUp ? 'move-up' : ''} ${isTreePositionAdjusted ? 'fixed-position' : ''}`}
                  style={
                    {
                      '--tree-trunk-translate-y': `${state.scrollOffset % window.innerHeight}px`,
                      transition: "transform 0.2s ease-out",
                    } as React.CSSProperties
                  }
                />
              </div>

              {state.isLivesLoading ? (
                <div>Loading lives...</div>
              ) : (
                <Lives lives={state.lives} />
              )}

              {state.gameStarted && (
                <div className="timer-score-container">
                  <Timer timeLeft={state.timeLeft} maxTime={maxTime} />
                  <Score points={state.points} />
                </div>
              )}

              {state.branches.length > 0 && (
                <div className="branches">
                  {state.branches
                    .filter((branch, index) => state.gameStarted || index !== state.branches.length - 1)
                    .map((branch: BranchType, index: number) => (
                      <Branch
                        key={index}
                        side={branch.side}
                        top={branch.top}
                        onClick={
                          state.gameStarted
                            ? (e) => {
                                e.stopPropagation();
                                handleScreenClick(branch.side);
                              }
                            : undefined 
                        }
                      />
                    ))}
                </div>
              )}

              <Squirrel
                position={state.squirrelSide}
                isInGame={state.gameStarted}
                isJumpingToFirstBranch={isJumpingToFirstBranch}
                isJumping={isJumping} 
              />
            </div>
          </div>
          {/* Include Menu alongside the game */}
          <Menu onMenuClick={handleMenuClick} />
          {/* Optionally, display "Coming Soon" message */}
          <div className="coming-soon-overlay">
            <h2>Coming Soon</h2>
            <p>The game feature is under development. Stay tuned!</p>
          </div>
        </div>
      );
    case "profile":
      return (
        <>
          <Profile onMenuClick={handleMenuClick} />
          <Menu onMenuClick={handleMenuClick} />
        </>
      );
    case "social":
      return (
        <>
          <SocialTasks onMenuClick={handleMenuClick} />
          <Menu onMenuClick={handleMenuClick} />
        </>
      );
    default:
      return (
        <div className="game-container">
          {/* Render Menu by default */}
          <Menu onMenuClick={handleMenuClick} />
        </div>
      );
  }
};

export default GameArea;
