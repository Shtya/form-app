'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import api, { baseImg } from '../../utils/api';
import {
	FiEdit2,
	FiTrash2,
	FiUpload,
	FiCheckCircle,
	FiXCircle,
	FiFile,
	FiFileText,
	FiList,
	FiArrowLeft,
	FiArrowRight,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa6';
import Modal from '../../components/atoms/Modal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { motion } from 'framer-motion';
import { LanguageToggle } from '../../components/atoms/SwitchLang';
import { LogoutButton } from '../../components/atoms/LogoutButton';

const translations = {
	en: {
		header: { title: 'Employee Requests', welcome: 'Welcome', logout: 'Logout' },
		form: {
			noActiveForm: 'No Forms Available',
			noActiveFormDesc: 'There are currently no request forms available.',
			submissionForm: 'Submission Form',
			availableForms: 'Available Forms',
			mySubmission: 'My Submissions',
			submit: 'Submit Request',
			update: 'Update Request',
			processing: 'Processing...',
			requiredField: '*',
			clickToUpload: 'Click to upload',
			orDragDrop: 'or drag and drop',
			uploadDesc: 'Images or documents up to 5MB',
			changeFile: 'Change File',
			chooseSubmission: 'Choose Request',
			back: 'Back to Forms',
		},
		submissions: {
			title: 'Your Requests',
			desc: 'View and manage your previous requests',
			submissionDate: 'Submission Date',
			status: 'Status',
			actions: 'Actions',
			verified: 'Reviewed',
			pending: 'Pending',
			edit: 'Edit',
			delete: 'Delete',
			delete: 'Delete',
			deleteConfirm: 'Are you sure you want to delete this request?',
            hr_only: 'HR Only',
            supervisor_only: 'Supervisor Only',
            hr_then_supervisor: 'HR then Supervisor',
            supervisor_then_hr: 'Supervisor then HR',
            pending_hr: 'Pending HR',
            pending_supervisor: 'Pending Supervisor',
            approved: 'Approved',
            rejected: 'Rejected',
		},
		assets: { selectFile: 'Select or Upload File', yourFiles: 'Your Uploaded Files', upload: 'Upload' },
	},
	ar: {
		header: { title: 'طلبات الموظفين', welcome: 'مرحباً', logout: 'تسجيل الخروج' },
		form: {
			noActiveForm: 'لا توجد نماذج متاحة',
			noActiveFormDesc: 'لا توجد حالياً أي نماذج طلبات متاحة.',
			submissionForm: 'نموذج الطلب',
			availableForms: 'النماذج المتاحة',
			mySubmission: 'طلباتي',
			submit: 'تقديم الطلب',
			update: 'تحديث الطلب',
			processing: 'جاري المعالجة...',
			requiredField: '*',
			clickToUpload: 'انقر للرفع',
			orDragDrop: 'أو اسحب وأفلت',
			uploadDesc: 'صور أو مستندات حتى 5MB',
			changeFile: 'تغيير الملف',
			chooseSubmission: 'اختر الطلب',
			back: 'العودة للنماذج',
		},
		submissions: {
			title: 'طلباتك',
			desc: 'عرض وإدارة طلباتك السابقة',
			submissionDate: 'تاريخ التقديم',
			status: 'الحالة',
			actions: 'الإجراءات',
			verified: 'تمت المراجعة',
			pending: 'قيد الانتظار',
			edit: 'تعديل',
			delete: 'حذف',
			delete: 'حذف',
			deleteConfirm: 'هل أنت متأكد أنك تريد حذف هذا الطلب؟',
            hr_only: 'الموارد البشرية فقط',
            supervisor_only: 'المشرف المباشر فقط',
            hr_then_supervisor: 'الموارد البشرية ثم المشرف',
            supervisor_then_hr: 'المشرف ثم الموارد البشرية',
            pending_hr: 'بانتظار الموارد البشرية',
            pending_supervisor: 'بانتظار المشرف',
            approved: 'مقبول',
            rejected: 'مرفوض',
		},
		assets: { selectFile: 'اختيار أو رفع ملف', yourFiles: 'الملفات المرفوعة', upload: 'رفع' },
	},
};

export default function EmployeeRequestsPage() {
	const { user, loading, logout } = useAuth();
	const router = useRouter();

	const [forms, setForms] = useState([]);
	const [activeForm, setActiveForm] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

	const [uploading, setUploading] = useState(false);
	const [userAssets, setUserAssets] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const [showAssetModal, setShowAssetModal] = useState(false);
	const [currentFieldKey, setCurrentFieldKey] = useState('');

	const [activeTab, setActiveTab] = useState('list'); // list, form, submissions
	const [language, setLanguage] = useState('ar');
    const [isEmployeeActive, setIsEmployeeActive] = useState(true); // Default true until checked? Or false? false safer.
    const [checkingStatus, setCheckingStatus] = useState(true);

	useEffect(() => {
		const savedLang = localStorage.getItem('formLang') || 'en';
		setLanguage(savedLang);
	}, []);

    useEffect(() => {
        const checkStatus = async () => {
            if (!user?.email) return;
            try {
                setCheckingStatus(true);
                // Call our new backend proxy endpoint
                const res = await api.get(`/users/employee-status/${user.email}`);
                // Assuming response structure: { isActive: boolean } or similar
                // Adjust based on actual external service response. 
                // If the user said "check is active", let's assume `isActive` property.
                // If the proxy returns the whole employee object, check for isActive field.
                if (res.data && (res.data.isActive === true || res.data.isActive === 'true')) {
                    setIsEmployeeActive(true);
                } else {
                    console.warn('Employee not active:', res.data);
                    setIsEmployeeActive(false);
                }
            } catch (error) {
                console.error('Failed to check status:', error);
                // If check fails, do we block? 
                // "appear the form request to filled" -> imply strict.
                setIsEmployeeActive(false);
            } finally {
                setCheckingStatus(false);
            }
        };

        if (user) {
            checkStatus();
        }
    }, [user]);

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
			// Admin can view this too or redirect? 
			// Let's allow admin to view/test.
			// router.push('/dashboard'); 
		}
	}, [user, loading, router]);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [formsRes, submissionsRes, assetsRes] = await Promise.all([
				api.get('/forms?type=employee_request&limit=100'), // Get all requests forms
				api.get('/form-submissions?type=employee_request'), // Need backend to filter these? 
                // Currently form-submissions returns all submissions for the user?
                // Or filtered by user's access. Assuming returns user's submissions.
				api.get('/assets'),
			]);

            // Filter submissions that belong to employee request forms
            // Assuming we can identify them by form_id present in formsRes
            const employeeFormIds = new Set(formsRes.data.data.map(f => f.id));
			const subs = (submissionsRes.data.data || submissionsRes.data || []).filter(s => employeeFormIds.has(s.form_id));

			setForms(formsRes.data.data || formsRes.data || []);
			setSubmissions(subs);
			setUserAssets(assetsRes.data?.data || []);

		} catch (error) {
			console.error('Failed to fetch data:', error);
			toast.error('Failed to load data');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (user) fetchData();
	}, [user]);

	const schema = useMemo(() => {
		return yup.object().shape(
			activeForm?.fields?.reduce((acc, field) => {
				if (field.required) {
					if (field.type === 'file') {
						acc[field.key] = yup.mixed().test('file', `${field.label} is required`, value => value instanceof File || typeof value === 'string');
					} else if (field.type === 'checklist') {
						acc[field.key] = yup.array().of(yup.string()).required(`${field.label} is required`);
					} else if (field.type === 'phone') {
						acc[field.key] = yup.string().required(`${field.label} is required`).matches(/^(9665|05)[0-9]{8}$/, `${field.label} invalid format`);
					} else {
						acc[field.key] = yup.string().required(`${field.label} is required`);
					}
				}
				return acc;
			}, {}) || {}
		);
	}, [activeForm]);

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
		setValue(currentFieldKey, assetUrl, { shouldDirty: true, shouldValidate: true });
		setShowAssetModal(false);
	};

	const handleFileUpload = async e => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be less than 5MB');
			return;
		}
		try {
			setUploading(true);
			const formData = new FormData();
			formData.append('file', file);
			const response = await api.post('/assets', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			setUserAssets(prev => [...prev, response.data]);
			setValue(currentFieldKey, response.data.url, { shouldDirty: true, shouldValidate: true });
			toast.success('File uploaded');
			setShowAssetModal(false);
		} catch (error) {
			toast.error('Failed to upload file');
		} finally {
			setUploading(false);
		}
	};

	const onSubmit = async data => {
		try {
			const payload = { ...data };
			(activeForm?.fields || []).forEach(field => {
				if (field.type === 'date' && payload[field.key]) {
					const d = new Date(payload[field.key]);
					const yyyy = d.getFullYear();
					const mm = String(d.getMonth() + 1).padStart(2, '0');
					const dd = String(d.getDate()).padStart(2, '0');
					payload[field.key] = `${yyyy}-${mm}-${dd}`;
				}
			});

			const targetId = selectedSubmissionId;

			if (targetId) {
				await api.patch(`/form-submissions/${targetId}`, {
					answers: payload,
					form_id: activeForm?.id,
					isCheck: false,
				});
				toast.success(t.form.update);
			} else {
				await api.post('/form-submissions', {
					form_id: activeForm?.id,
					answers: payload,
				});
				toast.success(t.form.submit);
			}
			await fetchData();
            setActiveTab('submissions');
            setSelectedSubmissionId(null);
            setActiveForm(null);
            reset();
		} catch (error) {
			toast.error(error.response?.data?.message || 'Submission failed');
		}
	};

    const handleSelectForm = (form) => {
        setActiveForm(form);
        setSelectedSubmissionId(null);
        reset({});
        setActiveTab('form');
    };

    const handleEditSubmission = (submission) => {
        const form = forms.find(f => f.id === submission.form_id);
        if (!form) return;
        
        setActiveForm(form);
        setSelectedSubmissionId(submission.id);
        
        // Populate form
		const values = { ...(submission.answers || {}) };
		(form.fields || []).forEach(field => {
			if (field.type === 'date' && values[field.key]) {
				values[field.key] = new Date(values[field.key]);
			}
		});
		reset(values);
        
        setActiveTab('form');
    };

	const handleDelete = async submissionId => {
		if (!confirm(t.submissions.deleteConfirm)) return;
		try {
			await api.delete(`/form-submissions/${submissionId}`);
			toast.success('Submission deleted');
			await fetchData();
		} catch (error) {
			toast.error('Failed to delete');
		}
	};

    // Render Logic copied and adapted
	const renderFieldInput = field => {
		const fieldValue = watch(field.key);
		const error = errors[field.key];
		const label = language === 'ar' && field.label_ar ? field.label_ar : field.label;
		const placeholder = language === 'ar' && field.placeholder_ar ? field.placeholder_ar : field.placeholder;

		switch (field.type) {
			case 'text':
			case 'number':
			case 'email':
				return (
					<div>
						<input
							{...register(field.key)}
							type={field.type}
							maxLength={field.length}
                            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
							placeholder={placeholder || ''}
							disabled={isSubmitting}
							dir={language === 'ar' ? 'rtl' : 'ltr'}
						/>
					</div>
				);
            case 'textarea':
                return (
                    <textarea 
                        {...register(field.key)}
                        maxLength={field.length}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                        placeholder={placeholder || ''}
                        disabled={isSubmitting}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                );
            case 'select':
                return (
                    <select
                        {...register(field.key)}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                        disabled={isSubmitting}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                    >
                        <option value=''>{placeholder || 'Select'}</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'date':
                return (
                    <Flatpickr
                        value={fieldValue ? new Date(fieldValue) : null}
                        onChange={([date]) => setValue(field.key, date, { shouldDirty: true, shouldValidate: true })}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                        options={{ dateFormat: 'Y-m-d' }}
                        disabled={isSubmitting}
                    />
                );
            case 'file':
                return (
                    <div className='space-y-3'>
                        {fieldValue ? (
                            <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                                <FiFileText className='h-8 w-8 text-indigo-500' />
                                <button type='button' onClick={() => openAssetModal(field.key)} className='text-indigo-600 hover:text-indigo-800 text-sm font-medium'>
                                    {t.form.changeFile}
                                </button>
                            </div>
                        ) : (
                            <button type='button' onClick={() => openAssetModal(field.key)} className='w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition flex flex-col items-center'>
                                <FiUpload className='h-8 w-8 text-gray-400 mb-2' />
                                <span className='text-sm text-gray-600'>{t.form.clickToUpload}</span>
                            </button>
                        )}
                    </div>
                );
            // ... Add other types if needed (radio, checkbox) - keeping it simple for now
			default:
				return (
					<input
						{...register(field.key)}
						type='text'
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
					/>
				);
		}
	};

	if (isLoading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600" /></div>;

	return (
		<div className='min-h-screen bg-gray-50' dir={language === 'ar' ? 'rtl' : 'ltr'}>
			<header className='bg-white shadow-sm sticky top-0 z-40'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
					<div>
                        <h1 className='text-2xl font-bold text-gray-800'>{t.header.title}</h1>
                        <div className='text-xs text-gray-600 flex items-center gap-1'>{t.header.welcome}, <span className='text-sm font-semibold text-indigo-600 capitalize'>{user?.name}</span></div>
                    </div>
					<div className='flex items-center gap-2'>
						<LanguageToggle IsFixed={false} onToggle={switchLanguage} currentLang={language} languages={translations} />
						<LogoutButton IsFixed={false} onClick={logout} label={t.header.logout} position={{ top: '1rem', right: '5rem' }} className='h-12' showText={false} />
					</div>
				</div>
			</header>

			<main className='max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8'>
                <div className="flex border-b border-gray-200 mb-6">
                    <button onClick={() => setActiveTab('list')} className={`py-4 px-6 font-medium text-sm ${activeTab === 'list' || activeTab === 'form' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t.form.availableForms}
                    </button>
                    <button onClick={() => setActiveTab('submissions')} className={`py-4 px-6 font-medium text-sm ${activeTab === 'submissions' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t.form.mySubmission}
                    </button>
                </div>

                {activeTab === 'list' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {checkingStatus ? (
                            <div className="col-span-full py-12 flex justify-center">
                                <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
                            </div>
                        ) : !isEmployeeActive ? (
                            <div className="col-span-full text-center py-12 bg-red-50 rounded-lg border border-red-100 p-8">
                                <FiXCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
                                <h3 className="text-lg font-medium text-red-800 mb-2">
                                    {language === 'ar' ? 'حساب الموظف غير نشط' : 'Employee Account Not Active'}
                                </h3>
                                <p className="text-red-600">
                                    {language === 'ar' 
                                        ? 'يرجى التواصل مع الموارد البشرية لتفعيل ملفك الوظيفي لتتمكن من تقديم الطلبات.' 
                                        : 'Please contact HR to activate your employee profile to submit requests.'}
                                </p>
                            </div>
                        ) : forms.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                <FiFileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>{t.form.noActiveFormDesc}</p>
                            </div>
                        ) : (
                            forms.map(form => (
                                <div key={form.id} onClick={() => handleSelectForm(form)} className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition p-6 border border-transparent hover:border-indigo-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-indigo-50 rounded-lg">
                                            <FiFileText className="h-6 w-6 text-indigo-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{form.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'form' && activeForm && (
                     <div className='bg-white shadow rounded-lg p-6'>
                         <button onClick={() => setActiveTab('list')} className="mb-6 flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                             {language === 'ar' ? <FiArrowRight className="ml-1" /> : <FiArrowLeft className="mr-1" />}
                             {t.form.back}
                         </button>
                         <h2 className="text-xl font-bold mb-1">{activeForm.title}</h2>
                         <p className="text-gray-500 mb-6">{activeForm.description}</p>
                         
                         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                             {activeForm.fields?.sort((a,b)=>a.order-b.order).map(field => (
                                 <div key={field.id} className="space-y-1">
                                     <label className="block text-sm font-medium text-gray-700">
                                         {field.label} {field.required && <span className="text-red-500">*</span>}
                                     </label>
                                     {renderFieldInput(field)}
                                     {errors[field.key] && <p className="text-sm text-red-600">{errors[field.key].message}</p>}
                                 </div>
                             ))}
                             
                             <div className="pt-4 border-t">
                                 <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center">
                                     {isSubmitting ? <FaSpinner className="animate-spin" /> : (selectedSubmissionId ? t.form.update : t.form.submit)}
                                 </button>
                             </div>
                         </form>
                     </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t.submissions.submissionDate}</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t.submissions.status}</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t.submissions.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">{t.form.noActiveFormDesc}</td></tr>
                                ) : (
                                    submissions.map(sub => (
                                        <tr key={sub.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(sub.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full 
                                                    ${sub.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                      sub.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                                      sub.status === 'pending_hr' ? 'bg-purple-100 text-purple-800' :
                                                      sub.status === 'pending_supervisor' ? 'bg-orange-100 text-orange-800' :
                                                      'bg-yellow-100 text-yellow-800'}`}>
                                                    {t.submissions[sub.status] || sub.status || t.submissions.pending}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                                <button onClick={() => handleEditSubmission(sub)} className="text-indigo-600 hover:text-indigo-900"><FiEdit2 /></button>
                                                <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-900"><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
			</main>

            <Modal title={t.assets.selectFile} show={showAssetModal} onClose={() => setShowAssetModal(false)}>
                <div className="grid grid-cols-3 gap-4">
                     <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <FiUpload className="h-6 w-6 text-gray-400" />
                        <span className="text-xs mt-2">{t.assets.upload}</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                     </label>
                     {userAssets.map(asset => (
                         <div key={asset.id} onClick={() => selectAsset(asset.url)} className="border rounded-lg p-2 cursor-pointer hover:border-indigo-500">
                             <div className="h-16 bg-gray-100 rounded flex items-center justify-center mb-2">
                                 {asset.mimeType?.startsWith('image') ? <img src={baseImg + asset.url} className="h-full object-contain" /> : <FiFile />}
                             </div>
                             <p className="text-xs truncate">{asset.filename}</p>
                         </div>
                     ))}
                </div>
            </Modal>
		</div>
	);
}
