// GameArea.tsx

import React, { useState, useEffect, useRef } from "react";
import Squirrel from "../components/sprites/Squirrel/Squirrel";
import Branch from "../components/Branch/Branch";
import Score from "../components/Score/Score";
import Lives from "../components/Lives/Lives";
import Menu from "../components/Menu/Menu";
import Profile from "../components/Profile/Profile";
import groundTreeImage from "../assets/groundTree.png"; // Зображення граунда
import startText from "../assets/startText.png"; // Зображення стартового тексту
import { useGameLogic } from "../hooks/useGameLogic";
import { Branch as BranchType } from "../reducers/gameReducer";
import Timer from "../components/Timer/Timer";
import './App.css'; // Імпорт CSS-файлу

const GameArea: React.FC = () => {
    const { state, handleGameStart, handleScreenClick, resetGame } = useGameLogic();
    const [currentScreen, setCurrentScreen] = useState<"game" | "profile">("game");

    // Використовуємо useRef для отримання доступу до елемента groundImage
    const groundImageRef = useRef<HTMLImageElement | null>(null);

    // Використовуємо useEffect для обчислення висоти зображення після завантаження
    useEffect(() => {
        const groundImage = groundImageRef.current;
        if (groundImage) {
            // Функція для встановлення висоти граунда
            const setTrunkBottom = () => {
                const groundHeight = groundImage.clientHeight;
                console.log('Ground Height:', groundHeight); // Додаємо лог для перевірки
                // Встановлюємо CSS-змінні --tree-trunk-bottom та --tree-trunk-bottom-mobile
                document.documentElement.style.setProperty('--tree-trunk-bottom', `${groundHeight}px`);
                document.documentElement.style.setProperty('--tree-trunk-bottom-mobile', `${groundHeight}px`);
            };

            // Викликаємо функцію після завантаження зображення
            if (groundImage.complete) {
                setTrunkBottom();
            } else {
                groundImage.onload = setTrunkBottom;
            }

            // Додатково слухаємо подію resize, щоб коректно змінювати висоту при зміні розміру вікна
            window.addEventListener('resize', setTrunkBottom);

            // Очищуємо слухача подій при розмонтуванні компонента
            return () => {
                window.removeEventListener('resize', setTrunkBottom);
            };
        }
    }, [state.gameStarted]); // Запуск після завантаження гри

    const handleMenuClick = (screen: "game" | "profile") => {
        setCurrentScreen(screen);
    };

    // Обробка кліка по екрану
    const handleClick = (event: React.MouseEvent) => {
        // Перевіряємо, чи почалася гра
        if (!state.gameStarted) {
            handleGameStart(); // Старт гри, якщо вона ще не почалася
        } else {
            const clickX = event.clientX;
            const screenWidth = window.innerWidth;

            if (clickX < screenWidth / 2) {
                handleScreenClick("left"); // Клік по лівій стороні
            } else {
                handleScreenClick("right"); // Клік по правій стороні
            }
        }
    };

    if (currentScreen === "profile") {
        return <Profile onMenuClick={handleMenuClick} />;
    }

    return (
        <div className="game-container">
            <div
                className={`game-area ${state.inMenu ? "menu-mode" : "game-mode"}`}
                onClick={handleClick}
            >
                {!state.gameStarted && (
                    <img className="start-text" src={startText} alt="Start Text" />
                )}

                <div className="tree-wrapper">
                    {/* Відображення groundTreeImage з рефом для обчислення його висоти */}
                    {!state.gameStarted && (
                        <div className="ground-wrapper"></div>
                    )}
                    {/* Відображення основного дерева (ствол) */}
                    <div
                        className={`tree-trunk ${state.gameStarted ? 'fade-in' : ''}`}
                        style={
                            {
                                '--tree-trunk-translate-y': `${state.scrollOffset % window.innerHeight}px`,
                                transition: "transform 0.2s ease-out",
                            } as React.CSSProperties // Приведення стилів до типу React.CSSProperties
                        }
                    />
                </div>

                {state.isLivesLoading ? (
                    <div>Loading lives...</div>
                ) : (
                    <Lives lives={state.lives} />
                )}
                <Timer timeLeft={state.timeLeft}/>
                <Score points={state.points} />

                {state.branches.length > 0 && !state.gameOver && (
                    <div className="branches">
                        {state.branches.map((branch: BranchType, index: number) => (
                            <Branch
                                key={index}
                                side={branch.side}
                                top={branch.top}
                                onClick={() => handleScreenClick(branch.side)}
                            />
                        ))}
                    </div>
                )}

                <Squirrel
                    position={state.squirrelSide}
                    isInGame={state.gameStarted}
                />
            </div>

            {state.inMenu && (
                <div>
                    <Menu onMenuClick={handleMenuClick} />
                </div>
            )}

            {state.gameOver && (
                <div className="game-over-screen">
                    <h2>Game Over</h2>
                    <p>Your Score: {state.points}</p>
                    <button onClick={resetGame}>Play Again</button>
                </div>
            )}

        </div>
    );
};

export default GameArea;
