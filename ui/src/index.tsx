import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';

import Themes from './themes';
import App from './components/App';
import { UserProvider } from './context/UserContext';
import { MessagesProvider } from './context/MessagesContext';

import './index.scss';

ReactDOM.render(
  <UserProvider>
    <ThemeProvider theme={Themes.default}>
      <MessagesProvider>
        <CssBaseline />
        <App />
      </MessagesProvider>
    </ThemeProvider>
  </UserProvider>,
  document.getElementById('root')
);
