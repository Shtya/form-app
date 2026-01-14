import { useEffect, useMemo, useState } from 'react';
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
import Modal from '../atoms/Modal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';

export default function EmployeeRequestsContent({ user, language, translations }) {
	const [forms, setForms] = useState([]);
	const [activeForm, setActiveForm] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

    const [isEmployeeActive, setIsEmployeeActive] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

	const [uploading, setUploading] = useState(false);
	const [userAssets, setUserAssets] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const [showAssetModal, setShowAssetModal] = useState(false);
	const [currentFieldKey, setCurrentFieldKey] = useState('');

	const [activeTab, setActiveTab] = useState('list'); // list, form, submissions

	const t = translations[language] || translations['en'];

    useEffect(() => {
        const checkStatus = async () => {
             // If user is admin/admin-like we might want to skip or auto-approve?
             if (!user || user.role === 'admin') {
                
                 setCheckingStatus(false);
                 if (user?.role === 'admin') setIsEmployeeActive(true);
                 return;
             }
             
            if (!user?.name) {
                setCheckingStatus(false);
                return;
            }

            try {
                setCheckingStatus(true);
                // Using the proxy endpoint we created in the backend: /users/employee-status/:email
                // This avoids CORS issues and ensures we use the correct server-side environment variables.
                const res = await api.get(`${process.env.NEST_PUBLIC_BASE_URL_2}/employees/by-email/${user.name}`, {
                    headers: {
                      Authorization: `Bearer ${process.env.TOKENJWT_SECRET}`
                    }
                }); 
                console.log('Employee status:', res.data);
                
                if (res.data && (res.data.isActive === true || res.data.isActive === 'true')) {
                    setIsEmployeeActive(true);
                } else {
                    console.warn('Employee not active:', res.data);
                    setIsEmployeeActive(false);
                }
            } catch (error) {
                console.error('Failed to check status:', error);
                setIsEmployeeActive(false);
            } finally {
                setCheckingStatus(false);
            }
        };
        
        checkStatus();
    }, [user]);



	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [formsRes, submissionsRes, assetsRes] = await Promise.all([
				api.get('/forms?type=employee_request&limit=100'),
				api.get('/form-submissions?type=employee_request'), 
				api.get('/assets'),
			]);

            // Filter submissions that belong to employee request forms
            // Assuming formsRes.data.data contains the list
            const formsList = formsRes.data.data || formsRes.data || [];
			const subs = submissionsRes.data?.data || submissionsRes.data || [];

			setForms(formsList);
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
		if (user && isEmployeeActive) fetchData();
	}, [user, isEmployeeActive]);

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
			default:
				return (
					<input
						{...register(field.key)}
						type='text'
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
						disabled={isSubmitting}
						dir={language === 'ar' ? 'rtl' : 'ltr'}
					/>
				);
		}
	};

	if (checkingStatus) {
		return <div className="flex justify-center py-20"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600" /></div>;
    }

    if (!isEmployeeActive) {
        return (
            <div className="flex justify-center items-center py-20 px-4">
                 <div className='bg-red-50 rounded-lg border border-red-100 p-8 text-center max-w-lg'>
                        <FiXCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
                         <h3 className="text-xl font-bold text-red-800 mb-2">
                            {language === 'ar' ? 'حساب الموظف غير نشط' : 'Employee Account Not Active'}
                        </h3>
                        <p className="text-lg text-red-600 mb-2">
                             {language === 'ar' ? 'لم يتم التفعيل من الموارد البشرية بعد' : 'Not activated yet from HR'}
                        </p>
                      
                    </div>
            </div>
        )
    }

	if (isLoading) return <div className="flex justify-center py-20"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600" /></div>;

	return (
		<div className='space-y-6'>
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
                    {forms.length === 0 ? (
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
