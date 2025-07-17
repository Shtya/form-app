import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe } from 'react-icons/fi';

export const LanguageToggle = ({IsFixed = true , currentLang, onToggle, languages, position = { top: '1rem', right: '1rem' }, className = '' }) => {
  const otherLang = Object.keys(languages).find(lang => lang !== currentLang) || '';

  return (
    <motion.button
      onClick={onToggle}
      className={` ${!IsFixed && " !relative !top-0 !left-0 !bottom-0 !right-0 " } fixed hover:!bg-gray-100 duration-300 !bg-gray-50 p-2 px-4 border border-gray-300 rounded-full    shadow-inner transition-all flex items-center gap-3 cursor-pointer group ${className}`}
      style={{
        top: position.top,
        right: position.right,
        bottom: position.bottom,
        left: position.left,
      }}
      aria-label='Toggle language' 
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>

      {/* Globe icon with divider */}
      <div className='relative h-6 flex items-center'>
        <div className='absolute left-0 top-1/2 h-4 w-px   -translate-y-1/2'></div>
        <motion.div animate={{ rotate: currentLang === Object.keys(languages)[0] ? 0 : 360 }} transition={{ duration: 0.5 }} >
          <FiGlobe className='text-gray-700 text-lg group-hover:text-indigo-600 transition-colors' />
        </motion.div>
        <div className='absolute right-0 top-1/2 h-4 w-px   -translate-y-1/2'></div>
      </div>

      {/* Language to switch to */}
      <motion.div className='relative  py-1 rounded-md group-hover:text-indigo-600 text-gray-800 transition-colors' >
        <AnimatePresence mode='wait'>
          <motion.span key={`target-${otherLang}`} className=' uppercase block text-sm font-semibold ' initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.15 }}>
            {otherLang}
          </motion.span>
        </AnimatePresence>
      </motion.div>


    </motion.button>
  );
};
