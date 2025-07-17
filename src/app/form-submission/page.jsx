'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api, { baseImg } from '../../utils/api';
import { FiEdit2, FiTrash2, FiUpload, FiLogOut, FiCheckCircle, FiXCircle, FiFile, FiImage, FiPlus, FiX, FiFileText, FiList, FiUser, FiGlobe } from 'react-icons/fi';
import { HiOutlineLogout } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa6';
import Modal from '../../components/atoms/Modal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { motion } from 'framer-motion';
import { LanguageToggle } from '../../components/atoms/SwitchLang';
import { LogoutButton } from '../../components/atoms/LogoutButton';

// Translation objects
const translations = {
  en: {
    header: {
      title: 'Form Submission',
      welcome: 'Welcome',
      logout: 'Logout',
    },
    form: {
      noActiveForm: 'No Active Form',
      noActiveFormDesc: 'There are currently no active forms available for submission.',
      submissionForm: 'Submission Form',
      mySubmission: 'My Submission',
      submit: 'Submit Form',
      update: 'Update Submission',
      processing: 'Processing...',
      requiredField: '*',
      clickToUpload: 'Click to upload',
      orDragDrop: 'or drag and drop',
      uploadDesc: 'Images or documents up to 5MB',
      changeFile: 'Change File',
    },
    submissions: {
      title: 'Your Submissions',
      desc: 'View and manage your previous form submissions',
      submissionDate: 'Submission Date',
      status: 'Status',
      actions: 'Actions',
      verified: 'Verified',
      pending: 'Pending',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this submission?',
    },
    assets: {
      selectFile: 'Select or Upload File',
      yourFiles: 'Your Uploaded Files',
      upload: 'Upload',
    },
  },
  ar: {
    header: {
      title: 'نموذج التقديم',
      welcome: 'مرحباً',
      logout: 'تسجيل الخروج',
    },
    form: {
      noActiveForm: 'لا يوجد نموذج نشط',
      noActiveFormDesc: 'لا يوجد حالياً أي نماذج نشطة متاحة للتقديم.',
      submissionForm: 'نموذج التقديم',
      mySubmission: 'تقديمي',
      submit: 'تقديم النموذج',
      update: 'تحديث التقديم',
      processing: 'جاري المعالجة...',
      requiredField: '*',
      clickToUpload: 'انقر للرفع',
      orDragDrop: 'أو اسحب وأفلت',
      uploadDesc: 'صور أو مستندات حتى 5MB',
      changeFile: 'تغيير الملف',
    },
    submissions: {
      title: 'تقديماتك',
      desc: 'عرض وإدارة التقديمات السابقة',
      submissionDate: 'تاريخ التقديم',
      status: 'الحالة',
      actions: 'الإجراءات',
      verified: 'تم التحقق',
      pending: 'قيد الانتظار',
      edit: 'تعديل',
      delete: 'حذف',
      deleteConfirm: 'هل أنت متأكد أنك تريد حذف هذا التقديم؟',
    },
    assets: {
      selectFile: 'اختيار أو رفع ملف',
      yourFiles: 'الملفات المرفوعة',
      upload: 'رفع',
    },
  },
};

export default function FormSubmissionPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeForm, setActiveForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [userAssets, setUserAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [currentFieldKey, setCurrentFieldKey] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  const [gridView, setGridView] = useState(2);
  const [language, setLanguage] = useState('en');

  // Set language from localStorage on initial load
  useEffect(() => {
    const savedLang = localStorage.getItem('formLang') || 'en';
    setLanguage(savedLang);
  }, []);

  // Handle language switch
  const switchLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    localStorage.setItem('formLang', newLang);
  };

  const t = translations[language];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user?.role === 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user?.role === 'user') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [activeFormRes, submissionsRes, assetsRes] = await Promise.all([api.get('/forms/active'), api.get('/form-submissions'), api.get('/assets')]);

      // Sort fields by order value
      const sortedFields = activeFormRes.data?.fields?.sort((a, b) => a.order - b.order) || [];
      setActiveForm({ ...activeFormRes.data, fields: sortedFields });

      setSubmissions(submissionsRes.data);
      setUserAssets(assetsRes.data?.data || []);

      // If user has submissions, pre-fill the form with latest submission
      if (submissionsRes.data.length > 0) {
        const latestSubmission = submissionsRes.data[0];
        const values = { ...latestSubmission.answers };
        sortedFields.forEach(field => {
          if (field.type === 'file' && values[field.key]) {
            const asset = (assetsRes.data?.data || []).find(a => a.url === values[field.key]);
            if (asset) {
              values[`${field.key}_asset`] = asset;
            }
          }
        });
        reset(values);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamically create validation schema based on form fields
  const schema = yup.object().shape(
    activeForm?.fields?.reduce((acc, field) => {
      if (field.required) {
        if (field.type === 'file') {
          acc[field.key] = yup.mixed().test('file', `${field.label} is required`, value => {
            return value instanceof File || typeof value === 'string';
          });
        } else if (field.type === 'checklist') {
          acc[field.key] = yup.array().of(yup.string()).required(`${field.label} is required`);
        } else {
          acc[field.key] = yup.string().required(`${field.label} is required`);
        }
      }
      return acc;
    }, {}) || {},
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: activeForm ? yupResolver(schema) : undefined,
  });

   const openAssetModal = fieldKey => {
    setCurrentFieldKey(fieldKey);
    setShowAssetModal(true);
  };

  const selectAsset = assetUrl => {
    setValue(currentFieldKey, assetUrl);
    setShowAssetModal(false);
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUserAssets(prev => [...prev, response.data]);
      setValue(currentFieldKey, response.data.url);
      toast.success('File uploaded successfully');
      setShowAssetModal(false);
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async data => {
    try {
      if (submissions.length > 0) {
        // Update existing submission
        await api.patch(`/form-submissions/${submissions[0].id}`, {
          answers: data,
          form_id : activeForm?.id ,
          isCheck: false, // Reset verification status when editing
        });
        toast.success('Submission updated successfully');
      } else {
        // Create new submission
        await api.post('/form-submissions', {
          form_id: activeForm.id,
          answers: data,
        });
        toast.success('Submission created successfully');
      }
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
      console.error('Submission failed:', error);
    }
  };

  const handleDelete = async submissionId => {
    if (!confirm(t.submissions.deleteConfirm)) return;

    try {
      await api.delete(`/form-submissions/${submissionId}`);
      toast.success('Submission deleted successfully');
      await fetchData();
    } catch (error) {
      toast.error('Failed to delete submission');
      console.error('Failed to delete submission:', error);
    }
  };

  const renderFieldInput = field => {
    const fieldValue = watch(field.key);
    const error = errors[field.key];

    // Get translated label and placeholder if available
    const label = language === 'ar' && field.label_ar ? field.label_ar : field.label;
    const placeholder = language === 'ar' && field.placeholder_ar ? field.placeholder_ar : field.placeholder;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'email':
        return <input {...register(field.key)} type={field.type} className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} placeholder={placeholder || ''} disabled={isSubmitting} dir={language === 'ar' ? 'rtl' : 'ltr'} />;

      case 'date':
        return (
          <Flatpickr
            value={fieldValue}
            onChange={([date]) => setValue(field.key, date)}
            options={{
              dateFormat: 'Y-m-d',
              allowInput: true,
              locale:
                language === 'ar'
                  ? {
                      firstDayOfWeek: 6, // Saturday
                      weekdays: {
                        shorthand: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
                        longhand: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                      },
                      months: {
                        shorthand: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
                        longhand: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
                      },
                    }
                  : undefined,
            }}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            placeholder={placeholder || 'Select date'}
            disabled={isSubmitting}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
        );

      case 'textarea':
        return <textarea {...register(field.key)} rows={4} className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} placeholder={placeholder || ''} disabled={isSubmitting} dir={language === 'ar' ? 'rtl' : 'ltr'} />;

      case 'select':
        return (
          <select {...register(field.key)} className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} disabled={isSubmitting} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <option value=''>{placeholder || 'Select an option'}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className='space-y-3' dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {field.options?.map(option => (
              <div key={option} className='flex items-center'>
                <input type='radio' id={`${field.key}-${option}`} value={option} {...register(field.key)} className='h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300' disabled={isSubmitting} />
                <label htmlFor={`${field.key}-${option}`} className={`block text-sm font-medium text-gray-700 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className='flex items-center gap-2 '>
            <input type='checkbox' id={field.key} {...register(field.key)} className=' !rounded-md h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300  ' disabled={isSubmitting} />
            <label htmlFor={field.key} className='block text-sm font-medium text-gray-700'>
              {field.label}
            </label>
          </div>
        );
      case 'checklist':
        return (
          <div className='space-y-3'>
            {field.options?.map(option => (
              <div key={option} className='flex items-center'>
                <input
                  type='checkbox'
                  id={`${field.key}-${option}`}
                  value={option}
                  {...register(field.key)} // Ensure the value is being handled as an array
                  className='h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                  disabled={isSubmitting}
                />
                <label htmlFor={`${field.key}-${option}`} className={`block text-sm font-medium text-gray-700 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className='space-y-3'>
            {fieldValue ? (
              <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm'>
                {/* File preview */}
                <div className='flex-shrink-0'>
                  {fieldValue.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                    <img src={baseImg + fieldValue} alt='Uploaded preview' className='h-24 w-24 object-contain border-gray-200 p-1 bg-white shadow-inner rounded-md border' />
                  ) : (
                    <div className='h-24 w-24 flex items-center justify-center bg-gray-100 rounded-md border'>
                      <FiFile className='h-8 w-8 text-gray-400' />
                    </div>
                  )}
                </div>

                {/* Change file button only */}
                <div>
                  <button type='button' onClick={() => openAssetModal(field.key)} className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    <FiEdit2 className='h-5 w-5' />
                    {t.form.changeFile}
                  </button>
                </div>
              </div>
            ) : (
              // Upload prompt when no file is selected
              <button type='button' onClick={() => openAssetModal(field.key)} className='flex justify-center items-center w-full px-6 py-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition text-center'>
                <div className='space-y-2'>
                  <FiUpload className='mx-auto h-10 w-10 text-gray-400' />
                  <p className='text-sm font-medium text-gray-600'>
                    <span className='text-indigo-600'>{t.form.clickToUpload}</span> {t.form.orDragDrop}
                  </p>
                  <p className='text-xs text-gray-500'>{placeholder || t.form.uploadDesc}</p>
                </div>
              </button>
            )}
          </div>
        );

        case 'number':
        return (
           <input {...register(field.key)} type='number' className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} placeholder={placeholder || ''} disabled={isSubmitting} dir={language === 'ar' ? 'rtl' : 'ltr'} />
        );
        case 'email':
        return (
           <input {...register(field.key)} type='email' className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} placeholder={placeholder || ''} disabled={isSubmitting} dir={language === 'ar' ? 'rtl' : 'ltr'} />
        );

      default:
        return <input {...register(field.key)} type='text' className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`} placeholder={placeholder || ''} disabled={isSubmitting} dir={language === 'ar' ? 'rtl' : 'ltr'} />;
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50' dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header Skeleton */}
        <div className='bg-white shadow-sm sticky top-0 z-40'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
            <div className='flex flex-col items-start gap-2'>
              <div className='h-8 w-48 bg-gray-200 rounded animate-pulse'></div>
              <div className='h-4 w-64 bg-gray-200 rounded animate-pulse'></div>
            </div>
            <div className='h-10 w-24 bg-gray-200 rounded-md animate-pulse'></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className='max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8'>
          {/* Tabs Skeleton */}
          <div className='flex items-center justify-between mb-6 border-b border-gray-200'>
            <div className='flex space-x-8'>
              <div className='h-10 w-32 bg-gray-200 rounded-md animate-pulse'></div>
              <div className='h-10 w-32 bg-gray-200 rounded-md animate-pulse'></div>
            </div>
            <div className='h-8 w-24 bg-gray-200 rounded-md animate-pulse'></div>
          </div>

          {/* Form Skeleton */}
          <div className='bg-white shadow overflow-hidden rounded-lg'>
            <div className='px-6 py-5 border-b border-gray-200 bg-gray-50'>
              <div className='h-6 w-1/3 bg-gray-200 rounded animate-pulse'></div>
              <div className='mt-2 h-4 w-2/3 bg-gray-200 rounded animate-pulse'></div>
            </div>

            <div className='px-6 py-5 space-y-6'>
              {/* Form Fields */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className='space-y-3'>
                  <div className='h-4 w-1/4 bg-gray-200 rounded animate-pulse'></div>
                  <div className='h-12 w-full bg-gray-200 rounded-lg animate-pulse'></div>
                </div>
              ))}

              {/* Submit Button */}
              <div className='mt-8 flex justify-end'>
                <div className='h-10 w-40 bg-gray-200 rounded-md animate-pulse'></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50' dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className='bg-white shadow-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
          <div className='flex flex-col items-start gap-0 leading-tight'>
            <h1 className='text-2xl font-bold text-gray-800'>{t.header.title}</h1>
            <div className='text-xs text-gray-600 flex items-center gap-1'>
              {t.header.welcome},<span className='text-sm font-semibold text-indigo-600 capitalize'>{user?.name}</span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <LanguageToggle IsFixed={false} onToggle={switchLanguage} currentLang={language} languages={translations} />

            <LogoutButton IsFixed={false} onClick={logout} label={t.header.logout} position={{ top: '1rem', right: '5rem' }} className=' h-12 z-50' showText={false} />
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8'>
        {!activeForm ? (
          <div className='bg-white shadow rounded-lg p-8 text-center'>
            <FiXCircle className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>{t.form.noActiveForm}</h3>
            <p className='text-gray-500'>{t.form.noActiveFormDesc}</p>
          </div>
        ) : (
          <div className='space-y-8'>
            <div className='flex items-center justify-between mb-6 border-b border-gray-200' data-aos='fade-down'>
              <nav className='-mb-px flex space-x-8'>
                <button data-aos='zoom-in' data-aos-delay='200' onClick={() => setActiveTab('form')} className={`cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'form' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}>
                  <FiFileText className='h-4 w-4' />
                  <span>{t.form.submissionForm}</span>
                </button>
                {submissions.length > 0 && (
                  <button data-aos='zoom-in' data-aos-delay='200' onClick={() => setActiveTab('submissions')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'submissions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}>
                    <FiList className='h-4 w-4' />
                    <span>{t.form.mySubmission}</span>
                  </button>
                )}
              </nav>

              <div className='flex items-center gap-2'>
                {/* One column view */}
                <button onClick={() => setGridView(1)} title='One column view' className={`bg-gray-200/60 group p-2 cursor-pointer rounded transition ${gridView === 1 ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <div className='grid grid-cols-1 items-center justify-center gap-0.2 gap-0.5 w-5 h-5'>
                    {[...Array(3)].map((_, i) => (
                      <span key={i} className='h-[5px] rounded bg-current'></span>
                    ))}
                  </div>
                </button>

                {/* Two columns view */}
                <button onClick={() => setGridView(2)} title='Two columns view' className={`bg-gray-200/60 group p-2 cursor-pointer rounded transition ${gridView === 2 ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <div className='grid grid-cols-2 items-center justify-center gap-0.2 w-5 h-5'>
                    {[...Array(4)].map((_, i) => (
                      <span key={i} className='h-[8px] w-[8px] rounded bg-current'></span>
                    ))}
                  </div>
                </button>

                {/* Three columns view */}
                <button onClick={() => setGridView(3)} title='Three columns view' className={`bg-gray-200/60 group p-2 cursor-pointer rounded transition ${gridView === 3 ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <div className='grid grid-cols-3 items-center justify-center gap-0.5 w-fit h-fit'>
                    {[...Array(6)].map((_, i) => (
                      <span key={i} className='h-[8px] w-[8px] rounded bg-current'></span>
                    ))}
                  </div>
                </button>
              </div>
            </div>

            {/* Form Panel */}
            {activeTab === 'form' && (
              <div data-aos='fade-up' className='bg-white shadow overflow-hidden rounded-lg'>
                <div className='px-6 py-5 border border-gray-200 bg-gray-100 overflow-hidden rounded-t-lg'>
                  <h2 className='text-lg font-semibold text-gray-900'>{language === 'ar' && activeForm.title_ar ? activeForm.title_ar : activeForm.title}</h2>
                  <p className='mt-1 text-sm text-gray-500'>{language === 'ar' && activeForm.description_ar ? activeForm.description_ar : activeForm.description || 'Please fill out the form below'}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='px-4 py-6'>
                  <motion.div layout className={`md:space-x-4 space-y-6 items-start grid transition-all duration-500 ${gridView === 1 ? 'grid-cols-1' : gridView === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                    {activeForm.fields?.map(field => (
                      <motion.div layout key={field.id} className='space-y-2' transition={{ duration: 0.3 }}>
                        <label className='block text-sm font-medium text-gray-700'>
                          {language === 'ar' && field.label_ar ? field.label_ar : field.label}
                          {field.required && <span className='text-red-500 ml-1'>{t.form.requiredField}</span>}
                        </label>

                        {renderFieldInput(field)}

                        {errors[field.key] && <p className='mt-1 text-sm text-red-600'>{errors[field.key].message}</p>}
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className='mt-8 flex justify-end'>
                    <button type='submit' disabled={isSubmitting || uploading} className='cursor-pointer inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'>
                      {isSubmitting ? (
                        <>
                          <FaSpinner className='animate-spin -ml-1 mr-3 h-5 w-5' />
                          {t.form.processing}
                        </>
                      ) : submissions.length > 0 ? (
                        t.form.update
                      ) : (
                        t.form.submit
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Submissions Panel */}
            {activeTab === 'submissions' && submissions.length > 0 && (
              <div data-aos='fade-up' className='bg-white shadow overflow-hidden rounded-lg'>
                <div className='px-6 py-5 border border-gray-200 bg-gray-100 overflow-hidden rounded-t-lg'>
                  <h2 className='text-lg font-semibold text-gray-900'>{t.submissions.title}</h2>
                  <p className='mt-1 text-sm text-gray-500'>{t.submissions.desc}</p>
                </div>

                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th scope='col' className='px-6 py-3 text-left rtl:!text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t.submissions.submissionDate}
                        </th>
                        <th scope='col' className='px-6 py-3 text-left rtl:!text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t.submissions.status}
                        </th>
                        <th scope='col' className='px-6 py-3 text-left rtl:!text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t.submissions.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {submissions.map(submission => (
                        <tr key={submission.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {new Date(submission.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${submission.isCheck ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {submission.isCheck ? (
                                <>
                                  <FiCheckCircle className='mr-1.5' />
                                  {t.submissions.verified}
                                </>
                              ) : (
                                t.submissions.pending
                              )}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                            <div className='flex items-center space-x-3'>
                              <button
                                onClick={() => {
                                  setActiveTab('form');
                                  reset(submission.answers);
                                }}
                                className='text-indigo-600 hover:text-indigo-900 p-1.5 rounded-full hover:bg-indigo-50 transition-colors duration-200'
                                title={t.submissions.edit}>
                                <FiEdit2 className='h-5 w-5' />
                              </button>
                              <button onClick={() => handleDelete(submission.id)} className='text-red-600 hover:text-red-900 p-1.5 rounded-full hover:bg-red-50 transition-colors duration-200' title={t.submissions.delete}>
                                <FiTrash2 className='h-5 w-5' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Asset Selection Modal */}
      <Modal title={t.assets.selectFile} show={showAssetModal} onClose={() => setShowAssetModal(false)}>
        <div className='space-y-6'>
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>{t.assets.yourFiles}</h3>

            <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-60 min-h-[300px] overflow-y-auto rounded-lg p-2 bg-gray-50 border border-gray-200'>
              {/* Upload Button as First Item */}
              <label className='hover:scale-[.98] flex flex-col items-center justify-center text-center p-2 h-[130px] w-full border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition duration-300 relative'>
                <input type='file' className='sr-only' onChange={handleFileUpload} disabled={uploading} />
                <FiUpload className='h-6 w-6 text-indigo-400' />
                <span className='mt-1 text-xs text-indigo-600'>{t.assets.upload}</span>

                {uploading && (
                  <div className='absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg'>
                    <FaSpinner className='animate-spin h-5 w-5 text-indigo-500' />
                  </div>
                )}
              </label>

              {/* User Uploaded Files */}
              {userAssets.map(asset => (
                <button key={asset.id} onClick={() => selectAsset(asset.url)} className='cursor-pointer hover:scale-[.98] duration-300 h-[130px] group relative shadow-inner rounded-lg border border-gray-200 hover:border-indigo-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2 bg-white'>
                  {asset.mimeType.startsWith('image/') ? (
                    <img src={baseImg + asset.url} alt={asset.filename} className='h-[80px] mx-auto w-[100px] object-contain' />
                  ) : (
                    <div className='h-[80px] w-[100px] p-2 flex items-center justify-center bg-gray-100 rounded-md'>
                      <FiFile className='h-full w-full text-gray-400' />
                    </div>
                  )}
                  <p className='mt-2 text-xs text-gray-600 text-center truncate'>{asset.filename}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
