import React, { useState } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);

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
    <div className="flex flex-col w-full h-screen">
      {/* Header with Logo */}
      <div className="w-full bg-white border-b p-3">
        <div className="container mx-auto flex items-center">
          <div className="h-10 w-32 relative">
            <img 
              src="/Lisa Logo.png" 
              alt="Lisa Logo" 
              className="object-contain h-full w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Main Content Area with Sidebars */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden md:block w-1/6 bg-gray-100">
          <div className="h-full flex items-center justify-center">
            <img 
              src="/Abstract AI.jpeg" 
              alt="Abstract AI" 
              className="object-cover h-full w-full"
            />
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-grow overflow-auto">
            <div>
              {messages.length === 0 && (
                <div className="py-10 px-4 text-center text-gray-400">
                  <p>How can I help you today?</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`py-6 px-4 text-black ${
                    message.role === 'user' 
                      ? 'bg-white' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="container mx-auto max-w-3xl">
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="py-6 px-4 bg-gray-50 text-black">
                  <div className="container mx-auto max-w-3xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-4">
            <div className="container mx-auto max-w-3xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow p-3 border rounded-lg text-black"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                  disabled={isLoading}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden md:block w-1/6 bg-gray-100">
          <div className="h-full flex items-center justify-center">
            <img 
              src="/Abstract AI.jpeg" 
              alt="Abstract AI" 
              className="object-cover h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
