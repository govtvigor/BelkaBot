import React, {useEffect, useState, createContext} from 'react';
import GameArea from './GameArea';
import './App.css';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import rootReducer from '../reducers';
import {TonConnectUIProvider} from '@tonconnect/ui-react';

const store = createStore(rootReducer);

export const ChatIdContext = createContext<string | null>(null);

const App: React.FC = () => {
    const [chatId, setChatId] = useState<string | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const chatIdFromUrl = queryParams.get('chatId');

        if (chatIdFromUrl) {
            setChatId(chatIdFromUrl);
        }
    }, []);

    return (
        <Provider store={store}>
            <TonConnectUIProvider manifestUrl="https://belka-bot.vercel.app/tonconnect-manifest.json">
                <ChatIdContext.Provider value={chatId}>
                    <div className="App">
                        <GameArea/>
                    </div>
                </ChatIdContext.Provider>
            </TonConnectUIProvider>
        </Provider>
    );
};

export default App;
