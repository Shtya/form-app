 import Image from 'next/image';
import { baseImg } from './api';

 
export function DynamicImage({ src, alt, ...props }) {
  // Handle StaticImport (Next.js static import)
  if (typeof src === 'object' && 'src' in src) {
    return <img src={baseImg + src} alt={alt} {...props} />;
  }

  // Handle object with url property
  if (typeof src === 'object' && 'url' in src) {
    return <img src={baseImg + src.url} alt={alt} {...props} />;
  }

  const normalizedSrc = typeof src === 'string' ? src.replace(/\\/g, '/') : '';
  
  return <img src={baseImg + normalizedSrc} alt={alt} {...props} />;
}

// Usage examples:
// <DynamicImage src="uploads/Fav Icon Final-b3435ae29b738c6a7c21e7bb5364df72.png" alt="Favicon" />
// <DynamicImage src={{ url: 'https://example.com/image.jpg' }} alt="Remote" />
// <DynamicImage src={require('./local.png')} alt="Local" />