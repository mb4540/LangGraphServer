import React from 'react';

export interface IconProps {
  className?: string;
}

export const IconBranch: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="3" x2="6" y2="15"></line>
      <circle cx="18" cy="6" r="3"></circle>
      <circle cx="6" cy="18" r="3"></circle>
      <path d="M18 9a9 9 0 0 1-9 9"></path>
    </svg>
  );
};

export const IconSwitch: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 4 19 4 19 8"></polyline>
      <line x1="14.75" y1="9.25" x2="19" y2="4"></line>
      <line x1="5" y1="19" x2="9" y2="15"></line>
      <polyline points="15 19 19 19 19 15"></polyline>
      <line x1="5" y1="5" x2="19" y2="19"></line>
    </svg>
  );
};
