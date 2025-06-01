import React from 'react';
import styled, { css } from 'styled-components';

// Base button styles
const BaseButton = styled.button`
  align-items: center;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  justify-content: center;
  line-height: 1.5;
  padding: 0.5rem 1rem;
  position: relative;
  text-align: center;
  transition: all 0.2s ease-in-out;
  user-select: none;
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
  }
`;

// Primary button
const PrimaryButton = styled(BaseButton)`
  background-color: var(--primary-color);
  border: 1px solid var(--primary-color);
  color: white;

  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
    border-color: var(--primary-dark);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

// Secondary button
const SecondaryButton = styled(BaseButton)`
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);

  &:hover:not(:disabled) {
    background-color: var(--secondary-color);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

// Outline button
const OutlineButton = styled(BaseButton)`
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);

  &:hover:not(:disabled) {
    background-color: rgba(74, 0, 224, 0.05);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

// Text button
const TextButton = styled(BaseButton)`
  background-color: transparent;
  border: none;
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;

  &:hover:not(:disabled) {
    background-color: rgba(74, 0, 224, 0.05);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

// Size variations
const sizeStyles = {
  small: css`
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
  `,
  medium: css`
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  `,
  large: css`
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  `,
};

// Button component
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  ...props 
}) => {
  // Select the appropriate button component based on variant
  let ButtonComponent;
  switch (variant) {
    case 'secondary':
      ButtonComponent = SecondaryButton;
      break;
    case 'outline':
      ButtonComponent = OutlineButton;
      break;
    case 'text':
      ButtonComponent = TextButton;
      break;
    case 'primary':
    default:
      ButtonComponent = PrimaryButton;
      break;
  }

  return (
    <ButtonComponent
      css={[
        sizeStyles[size],
        fullWidth && css`width: 100%;`
      ]}
      {...props}
    >
      {children}
    </ButtonComponent>
  );
};

export default Button;
