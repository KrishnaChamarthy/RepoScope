import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllConversations } from '../utils/conversationStorage';

const ConversationContext = createContext();

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

export const ConversationProvider = ({ children }) => {
  const [allConversations, setAllConversations] = useState({});

  useEffect(() => {
    setAllConversations(getAllConversations());
  }, []);

  const refreshConversations = () => {
    setAllConversations(getAllConversations());
  };

  return (
    <ConversationContext.Provider value={{ 
      allConversations, 
      refreshConversations 
    }}>
      {children}
    </ConversationContext.Provider>
  );
};