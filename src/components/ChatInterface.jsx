import React, { useState, useEffect, useRef } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);

  // Direct raw URL from GitHub - using the exact file path
  const EVENT_RECORDER_IMAGE_URL = 'https://raw.githubusercontent.com/willmcinnis/chatbot-backend/main/train-images/Event-Recorder/Event-Recorder.jpg';

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle special commands - intercept image requests before sending to backend
  const handleSpecialCommands = (userInput) => {
    const lowercaseInput = userInput.toLowerCase();
    
    // Check if this is a request for an event recorder image
    if (
      lowercaseInput.includes('event recorder') && 
      (lowercaseInput.includes('show me') || 
       lowercaseInput.includes('display') || 
       lowercaseInput.includes('image') || 
       lowercaseInput.includes('picture') ||
       lowercaseInput.includes('can i see'))
    ) {
      console.log("Event recorder image requested, using URL:", EVENT_RECORDER_IMAGE_URL);
      
      // Create response with image
      const assistantMessage = {
        role: 'assistant',
        content: 'Event Recorder device used to record train operations data',
        isImage: true,
        image: {
          url: EVENT_RECORDER_IMAGE_URL,
          alt: 'Event Recorder',
          displayName: 'Event Recorder'
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      return true;
    }
    
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check for special commands before sending to backend
    const isSpecialCommand = handleSpecialCommands(input);
    
    if (isSpecialCommand) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://chatbot-backend-kucx.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          threadId: threadId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setThreadId(data.threadId);
      
      const assistantMessage = {
        role: 'assistant',
        content: data.message,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Detailed error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-screen p-4 flex flex-col bg-gray-900 text-gray-100">
      <header className="py-3 px-4 mb-4 bg-gray-800 rounded-lg shadow-md flex items-center">
        <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
        <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          LISA
        </h1>
      </header>
      
      <div className="flex-grow overflow-auto p-4 mb-4 bg-gray-800 rounded-lg shadow-md scrollbar-thin scrollbar-thumb-gray-600">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              <p>Start a conversation with the AI assistant</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-700 text-gray-100 rounded-tl-none'
                }`}
              >
                {message.content}
                
                {message.isImage && message.image && (
                  <div className="mt-3 rounded-md overflow-hidden">
                    <img
                      src={message.image.url}
                      alt={message.image.alt}
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error("Image failed to load:", message.image.url);
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300/333/fff?text=Image+Not+Found';
                      }}
                    />
                    <div className="bg-gray-800 text-xs p-2 text-gray-300">
                      {message.image.displayName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-700 text-gray-100 rounded-tl-none shadow-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-100"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium shadow-md ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-cyan-600 hover:to-blue-700'
          }`}
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
