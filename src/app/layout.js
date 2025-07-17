import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';
import { Poppins , Noto_Sans_Arabic , Cairo  } from 'next/font/google';

const openSans = Poppins({
  subsets: ['latin'],
  variable: '--font-open-sans',
  weight: ['400', '600', '700'], // adjust as needed
  display: 'swap',
});
const Font_Arabic = Cairo({
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
  weight: ['400', '600', '700'], // adjust as needed
  display: 'swap',
});

export const metadata = {
  title: 'FormFlow | Smart Form Management System',
  description: 'Streamline your form creation, submission, and management with our intuitive platform. Perfect for businesses and individuals alike.',
  keywords: ['form builder', 'form management', 'data collection', 'survey tool', 'admin dashboard'],

  openGraph: {
    title: 'FormFlow | Smart Form Management System',
    description: 'Create, manage, and analyze forms with our powerful platform',
    url: 'https://yourdomain.com',
    siteName: 'FormFlow',
    images: [
      {
        url: 'https://yourdomain.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FormFlow Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'FormFlow | Smart Form Management System',
    description: 'Create, manage, and analyze forms with our powerful platform',
    images: ['https://yourdomain.com/images/twitter-card.jpg'],
    creator: '@formflow',
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  themeColor: '#6366F1', // Indigo-500
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={` ${Font_Arabic.variable} ${openSans.variable}`}>
      <head>
        {/* Preconnect to important origins */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />

        {/* Font imports */}
        <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' rel='stylesheet' />
      </head>

      <body className='font-inter antialiased bg-gray-50 text-gray-900'>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position='top-center' />
      </body>
    </html>
  );
}
