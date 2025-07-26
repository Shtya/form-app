import React, { useRef, useState } from 'react';
import { FaUser } from 'react-icons/fa6';
import { FiPlus, FiEdit2, FiEye, FiEyeOff, FiShare2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SkeletonLoader } from '../../app/dashboard/page';
import * as XLSX from 'xlsx';
import { FiDownload, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../../utils/api';

const UsersTab = ({handleGeneratePassword , projects, t, setUsers, users = [], isLoading = {}, visiblePasswords = {}, handleShowPassword, setShowNewUserModal, setEditingUser, resetUserForm, setShowEditUserModal, setShowDeleteModal, setShowShareModal, setViewSubmission, currentUserPage = 1, setCurrentUserPage, totalUserPages = 1 }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUsers, setUploadedUsers] = useState([]);

  const handleDownloadTemplate = async () => {
    try {
      const wsData = [
        ['National ID', 'Password', 'Role', 'Project Name'],
        ['1234567890', 'password123', 'user', 'new project2'], // Empty field for dropdown selection
      ];

      // Prepare project sheet data
      const projectSheetData = [['ID', 'Project Name']];
      projects.forEach(project => {
        projectSheetData.push([project.id, project.name]);
      });

      // Create Excel file
      const wb = XLSX.utils.book_new();

      const userSheet = XLSX.utils.aoa_to_sheet(wsData);
      const projectSheet = XLSX.utils.aoa_to_sheet(projectSheetData);

      // Add validation (Dropdown in D2)
      userSheet['!dataValidation'] = [
        {
          type: 'list',
          allowBlank: true,
          showInputMessage: true,
          showErrorMessage: true,
          sqref: 'D2:D100', // Column D from row 2 to 100
          formula1: `'Projects'!$A$2:$A$${projects.length + 1}`, // Points to A2:A[n]
        },
      ];

      // Append sheets
      XLSX.utils.book_append_sheet(wb, userSheet, 'Users');
      XLSX.utils.book_append_sheet(wb, projectSheet, 'Projects');

      // Export file
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
        const rowNumber = index + 2; // Row 1 is headers
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
        password: String( row['Password']) ,
        role: row['Role'],
        projectName: row['Project Name'],
      }));

      // Store the uploaded users data for display
      setUploadedUsers(usersToUpload);

      // Simulate API call (replace with your actual API call)
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
    } catch (err) {
      toast.error('Failed to read file or upload data');
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset file input
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
              {users.length} {t('registeredUsers')}
            </p>
          </div>

          <div className='flex gap-3 flex-wrap'>
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

            {/* New User Button */}
            <button onClick={() => {setShowNewUserModal(true) ; handleGeneratePassword()}} className='flex gap-2 items-center cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300'>
              <FiPlus className='w-4 h-4  ' />
              <span>{t('newUser')}</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
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

        {/* Regular Users Table */}
        {!isUploading && (
          <div className='p-4'>
            {isLoading.users ? (
              <SkeletonLoader count={5} />
            ) : users.length > 0 ? (
              <>
                <div className='overflow-x-auto scrollbar-custom'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th scope='col' className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t('national_id')}
                        </th>
                        <th scope='col' className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t('password')}
                        </th>
                        <th scope='col' className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t('role')}
                        </th>
                        <th scope='col' className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t('joinedAt')}
                        </th>
                        <th scope='col' className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t('submissions')}
                        </th>
                        <th scope='col' className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {t('actions')}
                        </th>
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
                              <div className=''>
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
                <div dir='ltr' className='flex items-center justify-center mt-8 space-x-1'>
                  <button onClick={() => setCurrentUserPage(prev => Math.max(prev - 1, 1))} disabled={currentUserPage === 1} className='p-2 border border-gray-300 !rounded-full w-[30px] h-[30px] flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'>
                    <FiChevronLeft className='h-4 w-4' />
                  </button>

                  {Array.from({ length: Math.min(5, totalUserPages) }, (_, i) => {
                    let pageNum;
                    if (totalUserPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentUserPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentUserPage >= totalUserPages - 2) {
                      pageNum = totalUserPages - 4 + i;
                    } else {
                      pageNum = currentUserPage - 2 + i;
                    }

                    return (
                      <button key={pageNum} onClick={() => setCurrentUserPage(pageNum)} className={`px-3 py-1 !rounded-full w-[30px] h-[30px] flex items-center justify-center text-sm ${currentUserPage === pageNum ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                        {pageNum}
                      </button>
                    );
                  })}

                  <button onClick={() => setCurrentUserPage(prev => Math.min(prev + 1, totalUserPages))} disabled={currentUserPage === totalUserPages} className='p-2 border border-gray-300 !rounded-full w-[30px] h-[30px] flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'>
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
    </div>
  );
};

export default UsersTab;
