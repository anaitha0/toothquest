 
import { FaTooth } from 'react-icons/fa';
import Link from 'next/link';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
  withText?: boolean;
  className?: string;
  animate?: boolean;
}

export default function Logo({
  size = 'medium',
  variant = 'dark',
  withText = true,
  className = '',
  animate = true
}: LogoProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-3xl'
  };
  
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div className={`text-turquoise ${animate ? 'animate-tooth-bounce' : ''}`}>
        <FaTooth className={sizeClasses[size]} />
      </div>
      {withText && (
        <span className={`ml-2 ${textSizeClasses[size]} font-bold font-bw-mitga ${variant === 'light' ? 'text-white' : 'text-oxford'}`}>
          ToothQuest<span className="text-turquoise">.</span>
        </span>
      )}
    </Link>
  );
}