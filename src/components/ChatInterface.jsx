import React, { useState } from 'react';
import TableFormatter from './TableFormatter';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [imagePopup, setImagePopup] = useState(null);

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

  // Function to render message content with clickable images and formatted tables
  const renderMessageContent = (content) => {
    // Check if the content might contain markdown tables
    if (content.includes('|') && content.includes('\n')) {
      return <TableFormatter content={content} />;
    }
    
    // Otherwise, use the existing image rendering
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    let lastIndex = 0;
    const parts = [];
    
    // Find all image tags in the content
    while ((match = imgRegex.exec(content)) !== null) {
      // Add the text before the image
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      // Extract the src from the image tag
      const imgSrc = match[1];
      
      // Add a clickable image
      parts.push(
        <img 
          key={match.index}
          src={imgSrc} 
          alt="Chat content"
          className="max-w-full my-2 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setImagePopup(imgSrc)}
          style={{ maxHeight: '300px' }}
        />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    // If no images were found, just return the original content
    return parts.length > 0 ? parts : content;
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
                    {renderMessageContent(message.content)}
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

      {/* Image Popup */}
      {imagePopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setImagePopup(null)}
        >
          <div className="max-w-4xl max-h-screen relative">
            <button 
              className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center text-black font-bold"
              onClick={() => setImagePopup(null)}
            >
              ×
            </button>
            <img 
              src={imagePopup} 
              alt="Enlarged view" 
              className="max-w-full max-h-screen object-contain" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
