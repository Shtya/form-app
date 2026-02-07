import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaUser } from 'react-icons/fa6';
import { FiPlus, FiEdit2, FiEye, FiEyeOff, FiShare2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SkeletonLoader } from '../../app/dashboard/page';
import * as XLSX from 'xlsx';
import { FiDownload, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const DEBOUNCE_MS = 400;

const UsersTab = ({ handleGeneratePassword, projects, forms = [], t, setUsers, users = [], isLoading = {}, visiblePasswords = {}, handleShowPassword, setShowNewUserModal, setEditingUser, resetUserForm, setShowEditUserModal, setShowDeleteModal, setShowShareModal, setViewSubmission, currentUserPage = 1, setCurrentUserPage, totalUserPages = 1 }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUsers, setUploadedUsers] = useState([]);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listLimit, setListLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(null);
  const [loadingList, setLoadingList] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLimit, setExportLimit] = useState(1000);

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
        ['National ID', 'Password', 'Role', 'Project Name', 'Form ID'],
        ['1234567890', 'password123', 'user', 'new project2', '1'],
      ];

      const projectSheetData = [['ID', 'Project Name']];
      projects.forEach(project => {
        projectSheetData.push([project.id, project.name]);
      });

      const formSheetData = [['ID', 'Form Title']];
      forms.forEach(form => {
        formSheetData.push([form.id, form.title]);
      });

      const wb = XLSX.utils.book_new();
      const userSheet = XLSX.utils.aoa_to_sheet(wsData);
      const projectSheet = XLSX.utils.aoa_to_sheet(projectSheetData);
      const formSheet = XLSX.utils.aoa_to_sheet(formSheetData);

      userSheet['!dataValidation'] = [
        {
          type: 'list',
          allowBlank: true,
          showInputMessage: true,
          showErrorMessage: true,
          sqref: 'D2:D100',
          formula1: `'Projects'!$A$2:$A$${projects.length + 1}`,
        },
        {
          type: 'list',
          allowBlank: true,
          showInputMessage: true,
          showErrorMessage: true,
          sqref: 'E2:E100',
          formula1: `'Forms'!$A$2:$A$${forms.length + 1}`,
        },
      ];

      XLSX.utils.book_append_sheet(wb, userSheet, 'Users');
      XLSX.utils.book_append_sheet(wb, projectSheet, 'Projects');
      XLSX.utils.book_append_sheet(wb, formSheet, 'Forms');
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
        formId: row['Form ID'] ? String(row['Form ID']) : undefined,
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
      setTotalCount(prev => (typeof prev === 'number' ? prev + response.data.results.length : prev));
    } catch (err) {
      toast.error('Failed to read file or upload data');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

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
      <div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
        {/* Header Section */}
        <div className='bg-white border-b border-gray-100'>
          <div className='p-6'>
            <div className='flex items-start justify-between flex-wrap gap-6'>
              {/* Title Area */}
              <div className='flex-1 min-w-[200px]'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2.5 bg-indigo-50 rounded-xl'>
                    <FaUser className='text-indigo-600 w-5 h-5' />
                  </div>
                  <h2 className='text-2xl font-bold text-gray-900'>{t('users')}</h2>
                </div>
                <div className='flex items-center gap-2 ml-14'>
                  <div className='h-1.5 w-1.5 rounded-full bg-indigo-500'></div>
                  <p className='text-sm text-gray-600 font-medium'>
                    <span className='text-indigo-600 font-semibold'>
                      {typeof totalCount === 'number' ? totalCount : users.length}
                    </span>
                    {' '}{t('registeredUsers')}
                  </p>
                </div>
              </div>

              {/* Actions Area */}
              <div className='flex flex-wrap items-center gap-3 w-full lg:w-auto'>
                {/* Search Input */}
                <div className='relative group flex-1 min-w-[270px] max-w-[350px]'>
                  <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                    <svg className='w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                  </div>
                  <input
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      if (currentUserPage !== 1) setCurrentUserPage(1);
                    }}
                    placeholder={t?.('searchUsers') || 'Search users...'}
                    className='w-full pl-10  pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400'
                  />
                  {!!debouncedSearch && (
                    <button
                      onClick={() => setSearch('')}
                      className='absolute rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Limit Filter */}
                <div className='relative'>
                  <select
                    value={listLimit}
                    onChange={e => {
                      const v = Number(e.target.value) || 10;
                      setListLimit(v);
                      if (currentUserPage !== 1) setCurrentUserPage(1);
                    }}
                    className='appearance-none min-w-[130px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer'
                  >
                    {[10, 20, 30, 40, 50, 100, 200].map(limit => (
                      <option key={limit} value={limit}>
                        {limit} {t('perPage')}
                      </option>
                    ))}
                  </select> 
                </div>

                {/* New User Button */}
                <button
                  onClick={() => {
                    setShowNewUserModal(true);
                    handleGeneratePassword();
                  }}
                  className='flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]'
                >
                  <FiPlus className='w-4 h-4' />
                  <span>{t('newUser')}</span>
                </button>

                {/* Download Template Button */}
                <button
                  onClick={handleDownloadTemplate}
                  className='flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm active:scale-[0.98]'
                >
                  <FiDownload className='w-4 h-4 text-gray-600' />
                  <span className='hidden sm:inline'>{t('downloadTemplate')}</span>
                </button>

                {/* Import Users Button */}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm active:scale-[0.98] ${
                    isUploading
                      ? 'bg-blue-50 border-2 border-blue-200 text-blue-700 cursor-not-allowed'
                      : 'bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg className='animate-spin h-4 w-4 text-blue-600' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      <span className='hidden sm:inline'>{t('uploading')}...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className='w-4 h-4 text-blue-600' />
                      <span className='hidden sm:inline'>{t('importUsers')}</span>
                    </>
                  )}
                </button>
                <input type='file' ref={fileInputRef} accept='.xlsx,.xls' className='hidden' onChange={handleUploadExcel} disabled={isUploading} />

                {/* Export Button */}
                <button
                  onClick={() => setShowExportModal(true)}
                  className='flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]'
                >
                  <FiDownload className='h-4 w-4' />
                  <span className='hidden sm:inline'>{t('exportExcel') || 'Export CSV'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Spinner */}
        {isUploading && (
          <div className='p-12 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50/50 to-white'>
            <div className='relative w-16 h-16'>
              <div className='absolute inset-0 rounded-full border-4 border-indigo-100'></div>
              <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <FiUpload className='w-6 h-6 text-indigo-600 animate-pulse' />
              </div>
            </div>
            <p className='text-gray-700 font-medium mt-6 text-lg'>Processing your file...</p>
            <p className='text-gray-500 text-sm mt-1'>Please wait while we import the users</p>
          </div>
        )}

        {/* Users Table */}
        {!isUploading && (
          <div className='p-6'>
            {isLoading.users || loadingList ? (
              <SkeletonLoader count={5} />
            ) : users.length > 0 ? (
              <>
                <div className='overflow-x-auto scrollbar-custom rounded-xl border border-gray-200'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gradient-to-r from-gray-50 to-gray-100/50'>
                      <tr>
                        <th className='px-6 py-4 rtl:text-right ltr:text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>ID</th>
                        <th className='px-6 py-4 rtl:text-right ltr:text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>{t('national_id')}</th>
                        <th className='px-6 py-4 rtl:text-right ltr:text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>{t('password')}</th>
                        <th className='px-6 py-4 rtl:text-right ltr:text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>{t('role')}</th>
                        <th className='px-6 py-4 rtl:text-right ltr:text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>{t('joinedAt')}</th>
                        <th className='px-6 py-4 rtl:text-right ltr:text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>{t('submissions')}</th>
                        <th className='px-6 py-4 rtl:text-right ltr:text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-100'>
                      {users.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white hover:bg-gray-50/50' : 'bg-gray-50/30 hover:bg-gray-50'
                          }`}
                        >
                          {/* ID Column */}
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-xs font-bold text-gray-700'>
                              {user.id}
                            </span>
                          </td>

                          {/* National ID Column */}
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center gap-3'>
                              <div className='flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md'>
                                {String(user.email || '').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className='text-sm font-semibold text-gray-900'>{user.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Password Column */}
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center gap-2.5'>
                              {visiblePasswords[user.id] ? (
                                <span className='text-sm font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-gray-800'>
                                  {visiblePasswords[user.id]}
                                </span>
                              ) : (
                                <span className='text-sm text-gray-400 italic px-3 py-1.5'>
                                  {t('hidden')}
                                </span>
                              )}
                              <button
                                onClick={() => handleShowPassword(user.id)}
                                className='p-2 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200 active:scale-95'
                                title={visiblePasswords[user.id] ? t('hidePassword') : t('showPassword')}
                              >
                                {visiblePasswords[user.id] ? <FiEyeOff className='w-4 h-4' /> : <FiEye className='w-4 h-4' />}
                              </button>
                            </div>
                          </td>

                          {/* Role Column */}
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {t(user.role)}
                            </span>
                          </td>

                          {/* Joined At Column */}
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex flex-col'>
                              <span className='text-sm font-medium text-gray-900'>
                                {new Date(user.created_at).toLocaleDateString()}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>

                          {/* Submissions Column */}
                          <td className='px-6 py-4 whitespace-nowrap'>
                            {user.formSubmissions?.length > 0 ? (
                              <button
                                onClick={() => setViewSubmission(user.formSubmissions[0])}
                                className='inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline transition-colors'
                              >
                                <FiEye className='w-3.5 h-3.5' />
                                {t('viewSubmission')}
                              </button>
                            ) : (
                              <span className='text-sm text-gray-400'>{t('noSubmissionsUser')}</span>
                            )}
                          </td>

                          {/* Actions Column */}
                           <td className='px-6 py-4 whitespace-nowrap'>
  <div className='flex items-center gap-2'>
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
      className='group relative p-2.5 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-sm hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 active:scale-95'
      title={t('edit')}
    >
      <FiEdit2 className='h-4 w-4 group-hover:rotate-12 transition-transform' />
    </button>
    <button
      onClick={() => setShowShareModal(user)}
      className='group relative p-2.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white shadow-sm hover:shadow-lg hover:shadow-emerald-200 transition-all duration-200 active:scale-95'
      title={t('shareCredentials')}
    >
      <FiShare2 className='h-4 w-4 group-hover:rotate-12 transition-transform' />
    </button>
    <button
      onClick={() => setShowDeleteModal({ show: true, id: user.id, type: 'user' })}
      className='group relative p-2.5 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white shadow-sm hover:shadow-lg hover:shadow-rose-200 transition-all duration-200 active:scale-95'
      title={t('delete')}
    >
      <FiTrash2 className='h-4 w-4 group-hover:rotate-12 transition-transform' />
    </button>
  </div>
</td>




													
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Pagination */}
                <div dir='ltr' className='flex items-center justify-center mt-8 gap-2'>
                  <button
                    onClick={() => setCurrentUserPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentUserPage === 1}
                    className='inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm active:scale-95'
                  >
                    <FiChevronLeft className='h-4 w-4' />
                  </button>

                  <div className='flex items-center gap-1.5'>
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
                        <button
                          key={pageNum}
                          onClick={() => setCurrentUserPage(pageNum)}
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm active:scale-95 ${
                            currentUserPage === pageNum
                              ? 'bg-indigo-600 text-white shadow-indigo-200'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentUserPage(prev => Math.min(prev + 1, localTotalPages))}
                    disabled={currentUserPage === localTotalPages}
                    className='inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm active:scale-95'
                  >
                    <FiChevronRight className='h-4 w-4' />
                  </button>
                </div>
              </>
            ) : (
              <div className='flex flex-col items-center justify-center py-16'>
                <div className='p-4 bg-gray-100 rounded-full mb-4'>
                  <FaUser className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-600 font-medium mb-1'>{t('noUsers')}</p>
                <p className='text-sm text-gray-400'>Create your first user to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Export Modal */}
      {showExportModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn'>
          {/* Backdrop with blur */}
          <button
            className='absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
            onClick={() => setShowExportModal(false)}
            aria-label='Close'
          />

          {/* Modal */}
          <div className='relative w-full max-w-md rounded-2xl bg-white shadow-2xl transform transition-all animate-scaleIn'>
            {/* Header with icon */}
            <div className='p-6 pb-4'>
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center'>
                  <FiDownload className='w-6 h-6 text-emerald-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-bold text-gray-900'>{t('exportExcel') || 'Export CSV'}</h3>
                  <p className='mt-2 text-sm text-gray-600 leading-relaxed'>
                    {t?.('exportHint') || 'Set how many users to include. Current filters (search) will be applied.'}
                  </p>
                </div>
              </div>

              <div className='mt-6 space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    {t?.('limit') || 'Limit'}
                  </label>
                  <input
                    type='number'
                    min={1}
                    value={exportLimit}
                    onChange={e => setExportLimit(Math.max(1, Number(e.target.value) || 1))}
                    className='w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all'
                  />
                </div>

                <div className='p-3 bg-gray-50 rounded-xl border border-gray-200'>
                  <div className='text-xs font-medium text-gray-600 mb-1'>
                    {t?.('currentSearch') || 'Current search'}:
                  </div>
                  <div className='text-sm font-mono text-gray-900'>
                    {debouncedSearch || <span className='text-gray-400 italic'>{t?.('none') || 'none'}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3'>
              <button
                onClick={() => setShowExportModal(false)}
                className='px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white border-2 border-gray-200 transition-all active:scale-95'
              >
                {t?.('cancel') || 'Cancel'}
              </button>

              <button
                onClick={handleExportCSV}
                className='px-4 py-2.5 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 min-w-[100px]'
              >
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