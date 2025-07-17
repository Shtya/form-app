import { motion } from 'framer-motion';
import { HiOutlineLogout } from 'react-icons/hi';

export const LogoutButton = ({ onClick, label = 'Logout', position = { top: '1rem', right: '1rem' }, className = '', IsFixed = true, showText = true }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`${!IsFixed && '!relative !top-0 !left-0 !bottom-0 !right-0'} group fixed hover:!bg-gray-100 duration-300 !bg-gray-50 p-2 px-4 border border-gray-300 rounded-full shadow-inner transition-all flex items-center gap-3 cursor-pointer group ${className}`}
      style={{
        top: position.top,
        right: position.right,
        bottom: position.bottom,
        left: position.left,
      }}
      aria-label={label}
      whileTap={{ scale: 0.95 }}
      whileHover={{ backgroundColor: 'rgba(254, 202, 202, 0.2)' }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      {/* Logout icon with divider */}
      <div className='relative h-6 flex items-center'>
        <div className='absolute left-0 top-1/2 h-4 w-px -translate-y-1/2'></div>
        <motion.div >
          <HiOutlineLogout className=' group-hover:rotate-[10deg] duration-300 text-gray-700 text-lg group-hover:text-red-600 ' />
        </motion.div>
        <div className='absolute right-0 top-1/2 h-4 w-px -translate-y-1/2'></div>
      </div>

      {/* Logout text */}
      {showText && (
        <motion.div className='relative py-1 rounded-md group-hover:text-red-600 text-gray-800 transition-colors' initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <span className='block text-sm font-semibold'>{label}</span>
        </motion.div>
      )}
    </motion.button>
  );
};
