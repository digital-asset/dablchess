import React from 'react';
import logo from '../pages/login/logo.svg';

export const Logo = (props: { size?: 'small' }) => {
  let sizeParams = {
    width: '165px',
    height: 'inherit',
  };
  if (props.size === 'small') {
    sizeParams = {
      width: '100px',
      height: '100px',
    };
  }

  return <img src={logo} alt="logo" {...sizeParams} />;
};
