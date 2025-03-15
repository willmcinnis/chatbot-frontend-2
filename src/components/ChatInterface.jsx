import React, { useState, useEffect, useRef } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);

// GitHub repository details
const GITHUB_USER = 'willmcinnis'; 
const GITHUB_REPO = 'train-images';
const GITHUB_BRANCH = 'main';
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to get direct GitHub raw content URL
  const getGitHubImageUrl = (partName, viewType) => {
    return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${partName}/${viewType}.jpg`;
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
      
      // Check if response contains train part information
      if (data.isTrainPart) {
        // Create an assistant message with train part details
        const assistantMessage = {
          role: 'assistant',
          content: data.message,
          isTrainPart: true,
          trainPart: data.trainPart
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Regular assistant message
        const assistantMessage = {
          role: 'assistant',
          content: data.message,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      
      // Check if the error might be related to a train part query but backend isn't updated
      // If it contains train terminology, we can handle it on the front-end as a fallback
      if (isTrainPartQuery(input)) {
        handleTrainPartQueryFallback(input);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${error.message}`,
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback detection for train part queries when backend isn't updated yet
  const isTrainPartQuery = (query) => {
    const trainParts = ['engine', 'locomotive', 'wheels', 'cab', 'pantograph', 'coupling', 'caboose', 'event recorder'];
    const queryTerms = ['show', 'display', 'picture', 'image', 'what does', 'can i see'];
    
    query = query.toLowerCase();
    
    // Check if query contains both a train part and a query term
    return trainParts.some(part => query.includes(part)) && 
           queryTerms.some(term => query.includes(term));
  };

  // Temporary fallback for handling train part queries
  const handleTrainPartQueryFallback = (query) => {
    query = query.toLowerCase();
    
    // Simple extraction of train part from query
    const trainParts = {
      'engine': {
        name: 'Engine',
        description: 'The main power unit of the train that provides propulsion.',
        view: 'front'
      },
      'locomotive': {
        name: 'Locomotive',
        description: 'Another term for the engine, the power car of the train.',
        view: 'side'
      },
      'wheels': {
        name: 'Wheels',
        description: 'Steel wheels that run on the railway tracks.',
        view: 'standard'
      },
      'cab': {
        name: 'Engineer\'s Cab',
        description: 'The control center where the engineer operates the train.',
        view: 'controls'
      },
      'pantograph': {
        name: 'Pantograph',
        description: 'The device that collects electric current from overhead wires for electric trains.',
        view: 'extended'
      },
      'coupling': {
        name: 'Coupling',
        description: 'The mechanism used to connect train cars together.',
        view: 'standard'
      },
      'caboose': {
        name: 'Caboose',
        description: 'A car attached to the end of a freight train, primarily used in North America.',
        view: 'side'
      }
    };

    // Find which train part was mentioned
    let partFound = null;
    for (const [part, details] of Object.entries(trainParts)) {
      if (query.includes(part)) {
        partFound = {
          partName: part,
          ...details
        };
        break;
      }
    }

    if (partFound) {
      const imageUrl = getGitHubImageUrl(partFound.partName, partFound.view);
      
      const assistantMessage = {
        role: 'assistant',
        content: `Here's the ${partFound.name}. ${partFound.description}`,
        isTrainPart: true,
        trainPart: {
          name: partFound.partName,
          imageUrl: imageUrl,
          displayName: partFound.name,
          view: partFound.view
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      // If we couldn't identify a specific part
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm not sure which train part you're asking about. Could you specify which part you'd like to see?",
      }]);
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
                
                {message.isTrainPart && message.trainPart && (
                  <div className="mt-3 rounded-md overflow-hidden">
                    <img
                      src={message.trainPart.imageUrl}
                      alt={`${message.trainPart.displayName || message.trainPart.name}`}
                      className="w-full h-auto"
                      onError={(e) => {
                        // If image fails to load, show placeholder or error message
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300/333/fff?text=Image+Not+Found';
                      }}
                    />
                    <div className="bg-gray-800 text-xs p-2 text-gray-300">
                      {message.trainPart.displayName || message.trainPart.name}
                      {message.trainPart.view && message.trainPart.view !== 'default' && 
                        ` (${message.trainPart.view} view)`}
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
