import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaUser } from 'react-icons/fa6';
import { FiPlus, FiEdit2, FiEye, FiEyeOff, FiShare2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SkeletonLoader } from '../../app/dashboard/page';
import * as XLSX from 'xlsx';
import { FiDownload, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const DEBOUNCE_MS = 400;

const UsersTab = ({ handleGeneratePassword, projects, t, setUsers, users = [], isLoading = {}, visiblePasswords = {}, handleShowPassword, setShowNewUserModal, setEditingUser, resetUserForm, setShowEditUserModal, setShowDeleteModal, setShowShareModal, setViewSubmission, currentUserPage = 1, setCurrentUserPage, totalUserPages = 1 }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUsers, setUploadedUsers] = useState([]);

  // NEW: search + export modal states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listLimit, setListLimit] = useState(10); // page size used for list
  const [totalCount, setTotalCount] = useState(null);
  const [loadingList, setLoadingList] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLimit, setExportLimit] = useState(1000); // default CSV limit

  const localTotalPages = useMemo(() => {
    if (!totalCount) return totalUserPages || 1;
    return Math.max(1, Math.ceil(totalCount / listLimit));
  }, [totalCount, listLimit, totalUserPages]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingList(true);
      try {
        const { data } = await api.get('/users', {
          params: {
            page: currentUserPage,
            limit: listLimit,
            search: debouncedSearch || undefined,
          },
        });
        // Expect { data: User[], total, page, limit }
        setUsers(data.data || []);
        setTotalCount(data.total ?? null);
      } catch (e) {
        toast.error(t?.('failedToLoadUsers') || 'Failed to load users');
      } finally {
        setLoadingList(false);
      }
    };
    fetchUsers();
  }, [currentUserPage, debouncedSearch, listLimit, setUsers]);

  const handleDownloadTemplate = async () => {
    try {
      const wsData = [
        ['National ID', 'Password', 'Role', 'Project Name'],
        ['1234567890', 'password123', 'user', 'new project2'],
      ];

      const projectSheetData = [['ID', 'Project Name']];
      projects.forEach(project => {
        projectSheetData.push([project.id, project.name]);
      });

      const wb = XLSX.utils.book_new();
      const userSheet = XLSX.utils.aoa_to_sheet(wsData);
      const projectSheet = XLSX.utils.aoa_to_sheet(projectSheetData);

      userSheet['!dataValidation'] = [
        {
          type: 'list',
          allowBlank: true,
          showInputMessage: true,
          showErrorMessage: true,
          sqref: 'D2:D100',
          formula1: `'Projects'!$A$2:$A$${projects.length + 1}`,
        },
      ];

      XLSX.utils.book_append_sheet(wb, userSheet, 'Users');
      XLSX.utils.book_append_sheet(wb, projectSheet, 'Projects');
      XLSX.writeFile(wb, 'users_template.xlsx');
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to download user template');
    }
  };

  const handleUploadExcel = async event => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedUsers([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets['Users'];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const errors = [];
      jsonData.forEach((row, index) => {
        const rowNumber = index + 2;
        if (!row['National ID']) errors.push(`Missing National ID in row ${rowNumber}`);
        if (!row['Password']) errors.push(`Missing Password in row ${rowNumber}`);
        if (!row['Role']) errors.push(`Missing Role in row ${rowNumber}`);
        if (!row['Project Name']) errors.push(`Missing Project Name in row ${rowNumber}`);
      });

      if (errors.length > 0) {
        errors.forEach(err => toast.error(err));
        setIsUploading(false);
        return;
      }

      const usersToUpload = jsonData.map(row => ({
        email: row['National ID'],
        password: String(row['Password']),
        role: row['Role'],
        projectName: row['Project Name'],
      }));

      setUploadedUsers(usersToUpload);

      const response = await api.post(`/auth/create-users-bulk`, { users: usersToUpload });
      const { results } = response.data;

      results.forEach(result => {
        if (result.status === 'failed') {
          toast.error(`${result.reason}`);
        } else {
          toast.success(`✅Email ${result.email} created successfully`);
        }
      });

      setUsers(prev => [...response.data.results, ...prev]);
      // refresh count after import
      setTotalCount(prev => (typeof prev === 'number' ? prev + response.data.results.length : prev));
    } catch (err) {
      toast.error('Failed to read file or upload data');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  // NEW: Export logic (CSV)
  const handleExportCSV = async () => {
    try {
      if (!exportLimit || exportLimit < 1) {
        toast.error(t?.('enterValidLimit') || 'Please enter a valid limit');
        return;
      }

      const params = {
        limit: exportLimit,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get('/users/export', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Try to parse filename from header, else fallback
      const cd = res.headers['content-disposition'] || '';
      const match = /filename="?([^"]+)"?/.exec(cd);
      const fallback = `users_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
      a.download = match?.[1] || fallback;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
      toast.success(t?.('exportStarted') || 'Export completed');
    } catch (e) {
      toast.error(t?.('exportFailed') || 'Export failed');
    }
  };

  return (
    <div className=''>
      <div className='bg-white rounded-xl shadow-md overflow-hidden'>
        <div className='p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4'>
          <div>
            <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
              <FaUser className='text-indigo-500' />
              {t('users')}
            </h2>
            <p className='text-sm text-gray-500 mt-1'>
              {typeof totalCount === 'number' ? totalCount : users.length} {t('registeredUsers')}
            </p>
          </div>

          <div className='flex items-center gap-3 flex-wrap w-full'>
            {/* NEW: Search box */}
            <div className='relative flex-1 max-w-[300px] '>
              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  // reset to first page on a new search
                  if (currentUserPage !== 1) setCurrentUserPage(1);
                }}
                placeholder={t?.('searchUsers') || 'Search users...'}
                className='w-full  rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300'
              />
              {!!debouncedSearch && (
                <button onClick={() => setSearch('')} className='absolute rtl:left-2 ltr:right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs hover:text-gray-600'>
                  ✕
                </button>
              )}
            </div>
            <select
              value={listLimit}
              onChange={e => {
                const v = Number(e.target.value) || 10;
                setListLimit(v);
                if (currentUserPage !== 1) setCurrentUserPage(1);
              }}
              className='truncate !w-[150px] border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'>
              {[10, 20, 30, 40, 50, 100, 200].map(limit => (
                <option key={limit} value={limit}>
                  {limit} {t('perPage')}
                </option>
              ))}
            </select>

						{/* New User Button */}
            <button
              onClick={() => {
                setShowNewUserModal(true);
                handleGeneratePassword();
              }}
              className='flex gap-2 items-center cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300'>
              <FiPlus className='w-4 h-4' />
              <span>{t('newUser')}</span>
            </button>

            {/* Download Template Button */}
            <button onClick={handleDownloadTemplate} className='flex items-center cursor-pointer gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-100'>
              <FiDownload className='w-4 h-4 text-gray-600' />
              {t('downloadTemplate')}
            </button>

            {/* Import Users Button */}
            <button onClick={() => fileInputRef.current.click()} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-100 ${isUploading ? 'bg-green-100 text-green-800 cursor-not-allowed' : 'bg-white border border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300'}`} disabled={isUploading}>
              {isUploading ? (
                <>
                  <svg className='animate-spin h-4 w-4 text-green-600' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  {t('uploading')}...
                </>
              ) : (
                <>
                  <FiUpload className='w-4 h-4 text-green-600' />
                  {t('importUsers')}
                </>
              )}
            </button>
            <input type='file' ref={fileInputRef} accept='.xlsx,.xls' className='hidden' onChange={handleUploadExcel} disabled={isUploading} />

            

            {/* NEW: Export Button -> opens popup */}
            <button onClick={() => setShowExportModal(true)} className='flex-none flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer disabled:opacity-50'>
              <FiDownload className='h-4 w-4' />
              <span>{t('exportExcel') || 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Upload spinner */}
        {isUploading && (
          <div className='p-8 flex flex-col items-center justify-center relative w-fit mx-auto'>
            <div className='relative w-14 h-14'>
              <div className='animate-spin rounded-full h-full w-full border-4 border-gray-200 border-t-indigo-500'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <svg className='w-5 h-5 text-indigo-500 animate-ping' fill='currentColor' viewBox='0 0 20 20'>
                  <circle cx='10' cy='10' r='5' />
                </svg>
              </div>
            </div>
            <p className='text-gray-600 mt-4 animate-pulse'>Processing your file...</p>
          </div>
        )}

        {/* Users table */}
        {!isUploading && (
          <div className='p-4'>
            {isLoading.users || loadingList ? (
              <SkeletonLoader count={5} />
            ) : users.length > 0 ? (
              <>
                <div className='overflow-x-auto scrollbar-custom'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('national_id')}</th>
                        <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('password')}</th>
                        <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('role')}</th>
                        <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('joinedAt')}</th>
                        <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('submissions')}</th>
                        <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {users.map(user => (
                        <tr key={user.id} className='hover:bg-gray-50'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center gap-2 '>
                              <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium uppercase '>
                                {String(user.email || '')
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className='text-sm font-medium text-gray-900'>{user.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <div className='flex items-center space-x-2'>
                              {visiblePasswords[user.id] ? <span>{visiblePasswords[user.id]}</span> : <span className='text-gray-400 italic'>{t('hidden')}</span>}
                              <button onClick={() => handleShowPassword(user.id)} className='cursor-pointer hover:scale-[1.1] duration-300 text-blue-500 hover:text-blue-700' title={visiblePasswords[user.id] ? t('hidePassword') : t('showPassword')}>
                                {visiblePasswords[user.id] ? <FiEyeOff className='w-4 h-4' /> : <FiEye className='w-4 h-4' />}
                              </button>
                            </div>
                          </td>

                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{t(user.role)}</span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            {user.formSubmissions?.length > 0 ? (
                              <button onClick={() => setViewSubmission(user.formSubmissions[0])} className='text-indigo-600 hover:text-indigo-900 text-sm cursor-pointer'>
                                {t('viewSubmission')}
                              </button>
                            ) : (
                              <span className='text-sm text-gray-500'>{t('noSubmissionsUser')}</span>
                            )}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2'>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                resetUserForm({
                                  name: user.email,
                                  email: user.email,
                                  role: user.role,
                                });
                                setShowEditUserModal(true);
                              }}
                              className='text-indigo-600 hover:text-indigo-900 cursor-pointer'
                              title={t('edit')}>
                              <FiEdit2 className='h-4 w-4' />
                            </button>
                            <button onClick={() => setShowShareModal(user)} className='text-green-600 hover:text-green-900 cursor-pointer' title={t('shareCredentials')}>
                              <FiShare2 className='h-4 w-4' />
                            </button>
                            <button onClick={() => setShowDeleteModal({ show: true, id: user.id, type: 'user' })} className='text-red-600 hover:text-red-900 cursor-pointer' title={t('delete')}>
                              <FiTrash2 className='h-4 w-4' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div dir='ltr' className='flex items-center justify-center mt-8 space-x-1'>
                  <button onClick={() => setCurrentUserPage(prev => Math.max(prev - 1, 1))} disabled={currentUserPage === 1} className='p-2 border border-gray-300 !rounded-full w-[30px] h-[30px] flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'>
                    <FiChevronLeft className='h-4 w-4' />
                  </button>

                  {Array.from({ length: Math.min(5, localTotalPages) }, (_, i) => {
                    let pageNum;
                    if (localTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentUserPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentUserPage >= localTotalPages - 2) {
                      pageNum = localTotalPages - 4 + i;
                    } else {
                      pageNum = currentUserPage - 2 + i;
                    }
                    return (
                      <button key={pageNum} onClick={() => setCurrentUserPage(pageNum)} className={`px-3 py-1 !rounded-full w-[30px] h-[30px] flex items-center justify-center text-sm ${currentUserPage === pageNum ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                        {pageNum}
                      </button>
                    );
                  })}

                  <button onClick={() => setCurrentUserPage(prev => Math.min(prev + 1, localTotalPages))} disabled={currentUserPage === localTotalPages} className='p-2 border border-gray-300 !rounded-full w-[30px] h-[30px] flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'>
                    <FiChevronRight className='h-4 w-4' />
                  </button>
                </div>
              </>
            ) : (
              <div className='text-center py-8 text-gray-500'>{t('noUsers')}</div>
            )}
          </div>
        )}
      </div>

      {/* NEW: Export Modal */}
      {showExportModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-6'>
            <h3 className='text-lg font-semibold mb-2'>{t('exportExcel') || 'Export CSV'}</h3>
            <p className='text-sm text-gray-500 mb-4'>{t?.('exportHint') || 'Set how many users to include. Current filters (search) will be applied.'}</p>

            <div className='space-y-3'>
              <label className='block text-sm font-medium text-gray-700'>{t?.('limit') || 'Limit'}</label>
              <input type='number' min={1} value={exportLimit} onChange={e => setExportLimit(Math.max(1, Number(e.target.value) || 1))} className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300' />

              <div className='text-xs text-gray-500'>
                {t?.('currentSearch') || 'Current search'}: <span className='font-mono'>{debouncedSearch || t?.('none') || 'none'}</span>
              </div>
            </div>

            <div className='mt-6 flex items-center justify-end gap-2'>
              <button onClick={() => setShowExportModal(false)} className='px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50'>
                {t?.('cancel') || 'Cancel'}
              </button>
              <button onClick={handleExportCSV} className='px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700'>
                {t?.('export') || 'Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
