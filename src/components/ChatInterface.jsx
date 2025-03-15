import React, { useState, useEffect, useRef } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const messagesEndRef = useRef(null);

  // GitHub repository details
  const GITHUB_USER = 'willmcinnis'; // Replace with your actual GitHub username
  const GITHUB_REPO = 'train-images';
  const GITHUB_BRANCH = 'main';

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to get direct GitHub folder URL
  const getGitHubFolderUrl = (partName) => {
    // Replace spaces in part name with hyphens or underscores for the URL
    const formattedPartName = partName.replace(/\s+/g, '-');
    return `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${formattedPartName}?ref=${GITHUB_BRANCH}`;
  };

  // Function to get direct image URL from GitHub
  const getGitHubImageUrl = (path) => {
    return `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
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
      // Check if this is a request for an image before sending to backend
      const partRequest = await checkForImageRequest(input);
      
      if (partRequest) {
        // Handle image request locally
        setMessages(prev => [...prev, partRequest]);
        setIsLoading(false);
        return;
      }
      
      // If not an image request, proceed with normal backend call
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
      
      // Handle response from backend
      if (data.isTrainPart) {
        // Backend has handled train part
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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if message is requesting an image and fetch from GitHub if available
  const checkForImageRequest = async (query) => {
    // List of component keywords to detect
    const componentKeywords = [
      'event recorder', 'crash hardened', 'multirec', 'evac2', 
      'engine', 'locomotive', 'wheels', 'cab', 'pantograph', 
      'coupling', 'caboose'
    ];
    
    // Action words that indicate the user wants to see an image
    const actionWords = [
      'show', 'display', 'see', 'view', 'picture', 'image', 
      'photo', 'what does', 'how does', 'can i see'
    ];
    
    const lowerQuery = query.toLowerCase();
    
    // Check if the query contains action words
    const hasActionWord = actionWords.some(word => lowerQuery.includes(word));
    if (!hasActionWord) return null;
    
    // Identify which component is being requested
    let requestedComponent = null;
    
    for (const component of componentKeywords) {
      if (lowerQuery.includes(component)) {
        requestedComponent = component;
        break;
      }
    }
    
    if (!requestedComponent) return null;
    
    try {
      // Format the component name to match your folder structure
      const componentFolder = requestedComponent.replace(/\s+/g, '-');
      
      // Attempt to fetch the contents of the folder to find image files
      const folderUrl = getGitHubFolderUrl(componentFolder);
      const response = await fetch(folderUrl);
      
      if (!response.ok) {
        console.warn(`Failed to fetch folder contents for ${componentFolder}`);
        return null;
      }
      
      const contents = await response.json();
      
      // Filter for image files
      const imageFiles = contents.filter(item => 
        item.type === 'file' && 
        /\.(jpg|jpeg|png|gif)$/i.test(item.name)
      );
      
      if (imageFiles.length === 0) {
        console.warn(`No image files found in ${componentFolder}`);
        return null;
      }
      
      // Use the first image found (you could enhance this to pick a specific one)
      const imageFile = imageFiles[0];
      const imageUrl = getGitHubImageUrl(imageFile.path);
      
      // Prepare a descriptive message based on the component
      let description = `Here's an image of the ${requestedComponent}.`;
      
      // Add more specific descriptions for known components
      if (requestedComponent === 'event recorder') {
        description = 'Here\'s an image of the Event Recorder. Event Recorders are devices that record train operations data, similar to an airplane\'s "black box."';
      } else if (requestedComponent === 'crash hardened') {
        description = 'Here\'s an image of the Crash Hardened Event Recorder. These devices are designed to withstand significant impact and are used to record critical train operational data.';
      }
      
      // Create the assistant message with the image
      return {
        role: 'assistant',
        content: description,
        isTrainPart: true,
        trainPart: {
          name: requestedComponent,
          displayName: requestedComponent.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          imageUrl: imageUrl,
          fileName: imageFile.name
        }
      };
    } catch (error) {
      console.error('Error checking for image request:', error);
      return null;
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
                      alt={`${message.trainPart.displayName}`}
                      className="w-full h-auto"
                      onError={(e) => {
                        // If image fails to load, show placeholder or error message
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300/333/fff?text=Image+Not+Found';
                      }}
                    />
                    <div className="bg-gray-800 text-xs p-2 text-gray-300">
                      {message.trainPart.fileName ? message.trainPart.fileName : message.trainPart.displayName}
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
