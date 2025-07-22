import api from '../../utils/api';
import { Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
export function CustomCheckbox({ submission, t, setUsers }) {
  const [isChecked, setIsChecked] = useState(submission.isCheck);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const previous = isChecked;
    const newStatus = !isChecked;

    setIsChecked(newStatus); // تحديث مؤقت
    setLoading(true);

    try {
      const response = await api.patch(`/form-submissions/${submission.id}`, {
        isCheck: newStatus,
      });

      // ✅ تحقق من الاستجابة
      if (!response || response?.status !== 200) {
        setIsChecked(previous);
        toast.error(t('errorUpdatingStatus'));
        return;
      }

      // ✅ تحديث المستخدمين محليًا (في الأب)
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          formSubmissions: user.formSubmissions?.map((sub) =>
            sub.id === submission.id ? { ...sub, isCheck: newStatus } : sub
          ),
        }))
      );
    } catch (error) {
      setIsChecked(previous);
      toast.error(error?.response?.data?.message || t('errorUpdatingStatus'));
    } finally {
      setLoading(false);
    }
  };
  return (
    <label className='relative inline-flex items-center cursor-pointer group'>
      <input type='checkbox' checked={isChecked} onChange={handleToggle} disabled={loading} className='sr-only peer' />
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
        ${isChecked ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300 group-hover:border-yellow-400'}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {isChecked && <Check className='w-3 h-3 text-white' />}
      </div>
      <span
        className={`ml-2 text-xs font-medium transition-colors duration-150
        ${isChecked ? 'text-green-800' : 'text-yellow-800'}`}>
        {isChecked ? t('reviewed') : t('pending')}
      </span>
    </label>
  );
}
