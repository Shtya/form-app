import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiEye, FiDownload, FiFile, FiTrash2, FiClock } from 'react-icons/fi';
import api, { baseImg } from '../../utils/api';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { format } from 'date-fns';

export default function EmployeeRequestsTab({ language, t }) {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [viewSubmission, setViewSubmission] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/form-submissions?type=employee_request&page=${page}&limit=10`);
            setSubmissions(res.data.data || []);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch employee requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleApprove = async (id) => {
        try {
            await api.patch(`/form-submissions/${id}/approve`);
            toast.success(t('approved') || 'Approved successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt(language === 'ar' ? 'سبب الرفض:' : 'Reason for rejection:');
        if (reason === null) return;
        try {
            await api.patch(`/form-submissions/${id}/reject`, { reason });
            toast.success(t('rejected') || 'Rejected successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('deleteConfirm') || 'Are you sure?')) return;
        try {
            await api.delete(`/form-submissions/${id}`);
            toast.success(t('submissionDeleted'));
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            pending_hr: 'bg-purple-100 text-purple-800',
            pending_supervisor: 'bg-orange-100 text-orange-800',
            pending: 'bg-yellow-100 text-yellow-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
                {t(status) || status}
            </span>
        );
    };

    if (isLoading) return <div className="flex justify-center py-20"><FiClock className="animate-spin h-8 w-8 text-indigo-600" /></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiFile className="text-indigo-500" />
                    {t('employeeRequests')}
                </h2>
                <div className="text-sm text-gray-500">{total} {t('totalSubmissions')}</div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('national_id')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('form')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('submittedAt')}</th>
                            <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {submissions.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">{t('noSubmissions')}</td></tr>
                        ) : (
                            submissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(sub.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.user?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.user?.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-[inter]">{sub.form_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(sub.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-2 rtl:space-x-reverse">
                                        <button onClick={() => setViewSubmission(sub)} className="text-indigo-600 hover:text-indigo-900 px-2" title={t('view')}><FiEye size={18} /></button>
                                        
                                        {(sub.status.startsWith('pending')) && (
                                            <>
                                                <button onClick={() => handleApprove(sub.id)} className="text-green-600 hover:text-green-900 px-2" title={t('approve')}><FiCheckCircle size={18} /></button>
                                                <button onClick={() => handleReject(sub.id)} className="text-red-600 hover:text-red-900 px-2" title={t('reject')}><FiXCircle size={18} /></button>
                                            </>
                                        )}
                                        
                                        <button onClick={() => handleDelete(sub.id)} className="text-gray-400 hover:text-red-600 px-2" title={t('delete')}><FiTrash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            {total > 10 && (
                <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                     <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                     <span className="px-3 py-1">{page}</span>
                     <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
            )}

            {/* View Modal */}
            <Modal title={t('submissionDetails')} show={!!viewSubmission} onClose={() => setViewSubmission(null)}>
                {viewSubmission && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-bold text-gray-700">{t('name')}:</span> {viewSubmission.user?.name}</div>
                            <div><span className="font-bold text-gray-700">{t('national_id')}:</span> {viewSubmission.user?.email}</div>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-bold mb-2">{t('answers')}</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.entries(viewSubmission.answers).filter(([k]) => !k.endsWith('_asset')).map(([k, v]) => (
                                    <div key={k} className="flex justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-gray-600 font-medium">{k}:</span>
                                        <span className="text-gray-900">{typeof v === 'string' && v.startsWith('uploads') ? (
                                            <a href={baseImg + v} target="_blank" rel="noreferrer" className="text-indigo-600 flex items-center gap-1"><FiDownload /> {t('viewFile')}</a>
                                        ) : String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
