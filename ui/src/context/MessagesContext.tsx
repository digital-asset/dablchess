import React, { useState, useEffect } from 'react';

import { Snackbar, Typography, Box, IconButton } from '@material-ui/core';

import { Edit, Close } from '@material-ui/icons';

type Message = {
  header?: string;
  message?: string;
  list?: string[];
};

enum MessageType {
  ERROR = 'error',
  SUCCESS = 'success',
}

type MessagesState = {
  displayErrorMessage: (message: Message) => void;
  displaySuccessMessage: (message: Message) => void;
};

const MessagesStateContext = React.createContext<MessagesState>({
  displayErrorMessage: () => {},
  displaySuccessMessage: () => {},
});

const MessagesProvider: React.FC = ({ children }) => {
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState<MessageType>();
  const [message, setMessage] = useState<Message>();

  function displayErrorMessage(message: Message) {
    setMessageType(MessageType.ERROR);
    handleNewMessage(message);
  }

  function displaySuccessMessage(message: Message) {
    setMessageType(MessageType.SUCCESS);
    handleNewMessage(message);
  }

  function handleNewMessage(message: Message) {
    setShowMessage(true);
    setMessage(message);
  }

  useEffect(() => {
    if (showMessage) {
      const timer = setInterval(() => {
        setShowMessage(false);
        setMessage(undefined);
        setMessageType(undefined);
      }, 9000);
      return () => clearInterval(timer);
    }
  }, [showMessage]);

  return (
    <MessagesStateContext.Provider value={{ displayErrorMessage, displaySuccessMessage }}>
      {children}
      <Snackbar
        open={showMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setShowMessage(false)}
        className={messageType}
      >
        <Box>
          <div className="heading">
            <Typography variant="h5">{message?.header || messageType}</Typography>
            <IconButton onClick={() => setShowMessage(false)}>
              <Close />
            </IconButton>
          </div>
          <p>{message?.list || message?.message}</p>
        </Box>
      </Snackbar>
    </MessagesStateContext.Provider>
  );
};

function useDisplayErrorMessage() {
  const context = React.useContext<MessagesState>(MessagesStateContext);
  if (context === undefined) {
    throw new Error('useDisplayErrorMessage must be used within a MessagesContext');
  }
  return context.displayErrorMessage;
}

export { MessagesProvider, useDisplayErrorMessage };
