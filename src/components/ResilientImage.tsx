import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E4EAE3] to-[#D4DDD3] p-6 text-center text-[#2F5D46] dark:from-[#1B2821] dark:to-[#131C17] dark:text-[#9FC0AD] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Leaf className="h-7 w-7 opacity-75" />
        <span className="mt-2 text-xs font-medium opacity-85">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
