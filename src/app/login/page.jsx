'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiGlobe } from 'react-icons/fi';
import { LanguageToggle } from '../../components/atoms/SwitchLang';

const schema = yup.object().shape({
  email: yup.string().required('Email is required'),
  password: yup.string().required('Password is required'),
});

// Translation objects
const translations = {
  en: {
    identity_document: 'ID or Residence Number',
    enter_identity_document: 'Enter ID or Residence Number',
    welcome: 'Welcome Back',
    signInPrompt: 'Please sign in to continue',
    username: 'User',
    usernamePlaceholder: 'User name',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    loginSuccess: 'Login successful!',
    loginFailed: 'Login failed. Please try again.',
  },
  ar: {
    identity_document: 'رقم الهوية أو الإقامة',
    enter_identity_document: 'أدخل رقم الهوية أو الإقامة',

    welcome: 'مرحباً بعودتك',
    signInPrompt: 'يرجى تسجيل الدخول للمتابعة',
    username: 'المستخدم',
    usernamePlaceholder: 'اسم المستخدم',
    password: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    signIn: 'تسجيل الدخول',
    signingIn: 'جاري تسجيل الدخول...',
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    loginFailed: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
  },
};

export default function Page() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState('en');

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
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className='min-h-screen gradient flex items-center justify-center px-4'>
      {/* Language switcher */}
      <LanguageToggle currentLang={lang} onToggle={toggleLanguage} languages={translations} />

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='w-full max-w-md'>
        <div className='bg-white/30 backdrop-blur-[10px] rounded-2xl shadow-2xl px-8 py-10 relative overflow-hidden'>
          {/* Background decorations */}
          <div className='absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600' />
          <div className='absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-100 opacity-30' />
          <div className='absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-100 opacity-30' />

          <div className='relative z-10'>
            <div className='text-center mb-8'>
              <FiUser className='mx-auto h-12 w-12 text-indigo-600 p-2 rounded-full bg-indigo-100' />
              <h1 className='text-3xl font-extrabold text-gray-800 mt-4'>{translations[lang].welcome}</h1>
              <p className='text-gray-500 mt-2'>{translations[lang].signInPrompt}</p>
            </div>

            <div className='space-y-6'>
              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{translations[lang].identity_document}</label>
                <div className='relative'>
                  <FiUser className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                  <input {...register('email')} type='text' placeholder={translations[lang].enter_identity_document} className={`${lang === 'ar' ? 'pr-10' : 'pl-10'} pr-4 py-2 rounded-lg border w-full focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-300'}`} />
                </div>
                {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{translations[lang].password}</label>
                <div className='relative'>
                  <FiLock className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-3 text-gray-400`} />
                  <input {...register('password')} type='password' placeholder={translations[lang].passwordPlaceholder} className={`${lang === 'ar' ? 'pr-10' : 'pl-10'} pr-4 py-2 placeholder:opacity-60 rounded-lg border w-full focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-300'}`} />
                </div>
                {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <motion.button  onClick={handleSubmit(onSubmit)}  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} className={`cursor-pointer w-full py-3 rounded-lg text-white font-medium transition-all ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}>
                {isLoading ? (
                  <span className='flex items-center justify-center'>
                    <svg className='animate-spin h-5 w-5 mr-2' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='white' strokeWidth='4' />
                      <path className='opacity-75' fill='white' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                    </svg>
                    {translations[lang].signingIn}
                  </span>
                ) : (
                  translations[lang].signIn
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
