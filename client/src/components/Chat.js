import React, { useState, useEffect } from 'react';
import { w3cwebsocket as Socket } from 'websocket';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import emojiData from 'emoji-datasource/emoji.json';

const client = new Socket('ws://127.0.0.1:8000');

// Function to create a mapping from emoji shortcodes to emoji characters
const createEmojiMap = () => {
  const emojiMap = {};
  emojiData.forEach((emoji) => {
    emoji.short_names.forEach((shortName) => {
      emojiMap[shortName] = String.fromCodePoint(
        ...emoji.unified.split('-').map((code) => parseInt(code, 16))
      );
    });
  });
  return emojiMap;
};

const emojiMap = createEmojiMap();

// Chat component
const Chat = ({ userName }) => {
  const [myMessage, setMyMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Effect hook to handle WebSocket events
  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setMessages((messages) => [
        ...messages,
        {
          message: data.message,
          userName: data.userName,
        },
      ]);
    };
  }, []);

  // Function to send message to server
  const onSend = () => {
    if (myMessage.trim() !== '') {
      client.send(
        JSON.stringify({
          type: 'message',
          message: myMessage, // Send user's message to server
          userName,
        }),
      );
      setMyMessage(''); // Clear message input field
    }
  };

  // Function to handle emoji click and append to message
  const handleEmojiClick = (emoji) => {
    const newMessage = myMessage + emoji.native;
    setMyMessage(newMessage); // Append emoji to message
  };

  // Function to replace emoji shortcodes with emoji characters in message
  const parseEmojiCodes = (text) => {
    const emojiPattern = /:([a-zA-Z0-9_+-]+):/g;

    return text.replace(emojiPattern, (match, emojiCode) => {
      return emojiMap[emojiCode] || match;
    });
  };

  // Function to handle input change and parse emoji shortcodes
  const handleInputChange = (e) => {
    const parsedText = parseEmojiCodes(e.target.value);
    setMyMessage(parsedText); // Update message state with parsed text
  };

  // Rendering chat UI
  return (
    <>
      <div className="title">Socket Chat: {userName}</div>
      <div className="chat-container">
        <aside className="reminder">
          <h2 className="reminder__title">Steps to complete setup:</h2>
          <ul className="reset">
            <li>1️⃣ Enter message and send it</li>
            <li>2️⃣ Go to the second browser's tab or window and enter the chatroom with another random username if you haven't done it yet.</li>
            <li>3️⃣ As second user reply with another message</li>
          </ul>
          <h3>Implement emoji feature according to the task ✅</h3>
        </aside>
        {/* Chat messages section */}
        <section className="chat">
          <div className="messages">
            {messages.map((message, key) => (
              <div
                key={key}
                className={`message ${
                  userName === message.userName
                    ? 'message--outgoing'
                    : 'message--incoming'
                }`}
              >
                {/* Avatar/username */}
                <div className="avatar">
                  {message.userName[0].toUpperCase()}
                </div>
                <div>
                  {/* Username and message content */}
                  <h4>{message.userName + ':'}</h4>
                  <p>{message.message}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Message input, emoji-picker and send button */}
          <section className="send">
            <input
              type="text"
              className="input send__input"
              value={myMessage}
              onChange={handleInputChange}
              onKeyUp={(e) => e.key === 'Enter' && onSend()}
              placeholder="Message"
            />
            <button
              className="button emoji-button"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              >
              😊
            </button>
            <button className="button send__button" onClick={onSend}>
              Send
            </button>
          </section>
          {/* Emoji picker component */}
          {isEmojiPickerOpen && (
            <Picker
              data={data}
              onEmojiSelect={handleEmojiClick}
              theme="dark"
              previewPosition="top"
              maxFrequentRows="2"
              perLine="7"
              className="emoji-picker"
            />
          )}
        </section>
      </div>
    </>
  );
};

export default Chat;
