import React, { useState, useEffect, useRef } from "react";
import Squirrel from "../components/sprites/Squirrel/Squirrel";
import Branch from "../components/Branch/Branch";
import Score from "../components/Score/Score";
import Lives from "../components/Lives/Lives";
import Menu from "../components/Menu/Menu";
import Profile from "../components/Profile/Profile";
import mainTreeImage from "../assets/mainTree.png";
import groundTreeImage from "../assets/groundTree.png"; // Зображення граунда
import startText from "../assets/startText.png";
import { useGameLogic } from "../hooks/useGameLogic";
import { Branch as BranchType } from "../reducers/gameReducer";
import Timer from "../components/Timer/Timer";

const GameArea: React.FC = () => {
    const { state, handleGameStart, handleScreenClick, resetGame } = useGameLogic();
    const [currentScreen, setCurrentScreen] = useState<"game" | "profile">("game");

    // Використовуємо useRef для отримання доступу до елемента groundImage
    const groundImageRef = useRef<HTMLImageElement | null>(null);

    // Використовуємо useEffect для обчислення висоти зображення після завантаження
    useEffect(() => {
        const groundImage = groundImageRef.current;
        if (groundImage) {
            // Отримуємо фактичну висоту зображення граунда
            const groundHeight = groundImage.clientHeight;

            // Встановлюємо CSS-змінну --tree-trunk-bottom на основі цієї висоти
            document.documentElement.style.setProperty('--tree-trunk-bottom', `${groundHeight}px`);
            document.documentElement.style.setProperty('--tree-trunk-bottom-mobile', `${groundHeight}px`);
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
                        <img
                            ref={groundImageRef} // Додаємо ref для доступу до елемента
                            src={groundTreeImage}
                            alt="Ground Tree"
                            className="tree-image"
                            style={{
                                transform: `translateY(${state.scrollOffset}px)`,
                                transition: "transform 2s ease-out",
                                zIndex: state.gameStarted ? -1 : 1,
                            }}
                        />
                    )}
                    {/* Відображення основного дерева */}
                    <img
                        src={mainTreeImage}
                        alt="Main Tree"
                        className="tree-image-main"
                        style={
                            {
                                '--tree-trunk-translate-y': `${state.scrollOffset % window.innerHeight}px`,
                                transition: "transform 0.2s ease-out",
                                width: 'var(--tree-trunk-width)', // Використання CSS-змінної для ширини
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
