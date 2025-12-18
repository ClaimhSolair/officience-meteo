import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Sparkles, QrCode } from 'lucide-react';
import { Deal } from '../types';
import { chatWithGlobalAssistant } from '../services/gemini';

interface AIAssistantProps {
  deals: Deal[];
}

interface Message {
  role: 'user' | 'model';
  text?: string;
  image?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ deals }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi! I'm Otty, your Project Meteo Strategist. I have access to all ${deals.length} deals in your pipeline. How can I help?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
     if(deals.length > 0 && messages.length === 1) {
         setMessages([{ role: 'model', text: `Hi! I'm Otty, your Project Meteo Strategist. I have access to all ${deals.length} deals in your pipeline. How can I help?` }]);
     }
  }, [deals.length]);


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    const history = messages
      .filter(m => m.text)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    const response = await chatWithGlobalAssistant(deals, userMsg, history);
    
    setMessages(prev => [...prev, { role: 'model', text: response.text || "Sorry, I couldn't process that." }]);
    setIsTyping(false);
  };

  const handleShowQR = () => {
      setMessages(prev => [
          ...prev, 
          { role: 'user', text: 'Show me the mobile access QR code.' },
          { role: 'model', text: 'Here is the QR code to access the application on your mobile device.', image: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://project-meteo-1075906469480.us-west1.run.app' }
      ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to parse and format text with bolding and bullet points
  const formatMessage = (text: string) => {
    // Helper to parse **bold**
    const parseBold = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for list item markers (*, -, or 1.)
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ') || trimmedLine.match(/^\d+\.\s/)) {
        // Remove the marker
        const content = trimmedLine.replace(/^[\*\-]\s|^\d+\.\s/, '');
        currentList.push(
          <li key={`li-${index}`} className="flex items-start gap-2 mb-1">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FFCE00] shrink-0 shadow-[0_0_5px_#FFCE00]"></span>
            <span className="flex-1">{parseBold(content)}</span>
          </li>
        );
      } else {
        // If we have accumulated list items, push them now
        if (currentList.length > 0) {
          elements.push(
            <ul key={`ul-${index}`} className="mb-3 pl-1">
              {currentList}
            </ul>
          );
          currentList = [];
        }
        
        // Render regular paragraph if not empty
        if (trimmedLine) {
          elements.push(
            <p key={`p-${index}`} className="mb-2 last:mb-0">
              {parseBold(trimmedLine)}
            </p>
          );
        }
      }
    });

    // Flush any remaining list items at the end
    if (currentList.length > 0) {
      elements.push(
        <ul key="ul-last" className="mb-0 pl-1">
          {currentList}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border flex flex-col h-full overflow-hidden relative">
      
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between bg-card min-h-[100px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#1F49BF] opacity-5 dark:opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-14 w-14 bg-gradient-to-br from-[#1F49BF] to-[#0F1219] p-0.5 rounded-full flex items-center justify-center shadow-lg">
            <div className="h-full w-full bg-card rounded-full flex items-center justify-center">
               <Bot size={28} className="text-[#1F49BF]" />
            </div>
          </div>
          <div>
             <h3 className="font-bold text-lg text-primary font-heading">Otty Strategist</h3>
             <p className="text-xs text-[#4ADE80] flex items-center gap-2 font-medium tracking-wide">
               <span className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_8px_#4ADE80]"></span> 
               ONLINE
             </p>
          </div>
        </div>
        
        {/* Mobile QR Action */}
        <button 
            onClick={handleShowQR}
            className="relative z-10 p-2 text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
            title="Get Mobile QR Code"
        >
            <QrCode size={20} />
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-app">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                  msg.role === 'user' 
                    ? 'bg-[#1F49BF] text-white rounded-br-none shadow-[0_4px_15px_-3px_rgba(31,73,191,0.4)]' 
                    : 'bg-card text-secondary border border-border rounded-bl-none'
                }`}>
                  {msg.role === 'model' && <Sparkles size={14} className="absolute -top-2 -left-2 text-[#FFCE00]" />}
                  
                  {/* Text Content */}
                  {msg.text && formatMessage(msg.text)}

                  {/* Image Content (QR) */}
                  {msg.image && (
                      <div className="mt-3 p-3 bg-white rounded-xl w-fit mx-auto">
                          <img src={msg.image} alt="QR Code" className="w-40 h-40 mix-blend-multiply" />
                      </div>
                  )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-border bg-card">
        <div className="flex items-center gap-3 bg-app rounded-2xl px-4 py-3 border border-border focus-within:border-[#1F49BF] transition-colors">
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-primary placeholder-secondary"
            placeholder="Ask Otty about your pipeline..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button 
            onClick={handleSend} 
            disabled={isTyping || !input.trim()}
            className="text-[#1F49BF] hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;