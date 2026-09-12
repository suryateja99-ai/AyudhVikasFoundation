import React from 'react';
import logo from '../assets/images/ayudh-vikas-logo.jpg';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-11 h-11',
  alt = 'Ayudh Vikas Foundation',
}) => (
  <img
    src={logo}
    alt={alt}
    className={`${className} rounded-full object-cover bg-white shrink-0`}
  />
);
