import React from 'react';

const Spinner = ({ size = 'md', center = false }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' };
  const spinner = (
    <div className={`animate-spin rounded-full ${sizes[size]} border-4 border-blue-200 border-t-blue-600`} />
  );
  if (center) {
    return <div className="flex justify-center items-center py-10">{spinner}</div>;
  }
  return spinner;
};

export default Spinner;
