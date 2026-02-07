'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { LanguageToggle } from '../../components/atoms/SwitchLang';

const schema = yup.object().shape({
  email: yup.string().required('Email is required'),
  password: yup.string().required('Password is required'),
});

// Translation objects
const translations = {
  en: {
    identity_document: 'ID or Residence Number',
    enter_identity_document: 'Enter your ID or Residence Number',
    welcome: 'Welcome Back',
    welcomeSubtitle: 'Secure Access Portal',
    signInPrompt: 'Sign in to access your dashboard',
    username: 'User',
    usernamePlaceholder: 'Enter your ID number',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    loginSuccess: 'Login successful!',
    loginFailed: 'Login failed. Please try again.',
    secureLogin: 'Secure Login',
  },
  ar: {
    identity_document: 'رقم الهوية أو الإقامة',
    enter_identity_document: 'أدخل رقم الهوية أو الإقامة',
    welcome: 'مرحباً بعودتك',
    welcomeSubtitle: 'بوابة الدخول الآمنة',
    signInPrompt: 'قم بتسجيل الدخول للوصول إلى لوحة التحكم',
    username: 'المستخدم',
    usernamePlaceholder: 'أدخل رقم الهوية',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    signIn: 'تسجيل الدخول',
    signingIn: 'جاري تسجيل الدخول...',
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    loginFailed: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    secureLogin: 'تسجيل دخول آمن',
  },
};

export default function Page() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async data => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success(translations[lang].loginSuccess);
    } catch (err) {
      toast.error(err || translations[lang].loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      dir={lang === 'ar' ? 'rtl' : 'ltr'} 
      className='min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12'
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob' />
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000' />
        <div className='absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000' />
      </div>

      {/* Language Switcher */}
      <div className='absolute top-6 right-6 z-50'>
        <LanguageToggle currentLang={lang} onToggle={toggleLanguage} languages={translations} />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='w-full max-w-md relative z-10'
      >
        {/* Main Card */}
        <div className='bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20'>
          {/* Header Section */}
          <div className='relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-8 pb-12'>
            {/* Decorative Elements */}
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16' />
            <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12' />
            
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='relative z-10 flex justify-center mb-4'
            >
              <div className='w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl border border-white/30'>
                <FiShield className='w-10 h-10 text-white' strokeWidth={2} />
              </div>
            </motion.div>

            {/* Title */}
            <div className='relative z-10 text-center'>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='text-3xl font-black text-white mb-2'
              >
                {translations[lang].welcome}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='text-indigo-100 text-sm font-medium'
              >
                {translations[lang].welcomeSubtitle}
              </motion.p>
            </div>
          </div>

          {/* Form Section */}
          <div className='p-8 -mt-6 relative z-10'>
            {/* Subtitle Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='flex items-center justify-center gap-2 mb-8'
            >
              <div className='h-px w-12 bg-gradient-to-r from-transparent to-gray-300' />
              <span className='text-sm font-semibold text-gray-600 px-4 py-2 bg-gray-100 rounded-full'>
                {translations[lang].signInPrompt}
              </span>
              <div className='h-px w-12 bg-gradient-to-l from-transparent to-gray-300' />
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              {/* Email/ID Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  {translations[lang].identity_document}
                </label>
                <div className='relative group'>
                  <div className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-10`}>
                    <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center group-focus-within:from-indigo-500 group-focus-within:to-indigo-600 transition-all'>
                      <FiUser className='w-5 h-5 text-indigo-600 group-focus-within:text-white transition-colors' />
                    </div>
                  </div>
                  <input
                    {...register('email')}
                    type='text'
                    placeholder={translations[lang].enter_identity_document}
                    className={`w-full ${lang === 'ar' ? 'pr-16 pl-4' : 'pl-16 pr-4'} py-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-gray-800 font-medium ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mt-2 text-sm text-red-600 font-medium flex items-center gap-1'
                  >
                    <span className='w-1 h-1 rounded-full bg-red-600' />
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className='block text-sm font-bold text-gray-700 mb-2'>
                  {translations[lang].password}
                </label>
                <div className='relative group'>
                  <div className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-10`}>
                    <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-focus-within:from-purple-500 group-focus-within:to-purple-600 transition-all'>
                      <FiLock className='w-5 h-5 text-purple-600 group-focus-within:text-white transition-colors' />
                    </div>
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={translations[lang].passwordPlaceholder}
                    className={`w-full ${lang === 'ar' ? 'pr-16 pl-14' : 'pl-16 pr-14'} py-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-gray-800 font-medium ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${lang === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors`}
                  >
                    {showPassword ? (
                      <FiEyeOff className='w-5 h-5' />
                    ) : (
                      <FiEye className='w-5 h-5' />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mt-2 text-sm text-red-600 font-medium flex items-center gap-1'
                  >
                    <span className='w-1 h-1 rounded-full bg-red-600' />
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                type='submit'
                disabled={isLoading}
                className={`relative w-full py-4 rounded-xl text-white font-bold text-base transition-all overflow-hidden group ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl shadow-indigo-300'
                }`}
              >
                {/* Button Background Animation */}
                {!isLoading && (
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity' />
                )}
                
                {/* Button Content */}
                <span className='relative z-10 flex items-center justify-center gap-2'>
                  {isLoading ? (
                    <>
                      <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                      <span>{translations[lang].signingIn}</span>
                    </>
                  ) : (
                    <>
                      <FiShield className='w-5 h-5' />
                      <span>{translations[lang].signIn}</span>
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Footer Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className='mt-8 flex items-center justify-center gap-2 text-xs text-gray-500'
            >
              <FiShield className='w-3.5 h-3.5 text-green-500' />
              <span className='font-medium'>{translations[lang].secureLogin}</span>
            </motion.div>
          </div>
        </div>
 
      </motion.div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}