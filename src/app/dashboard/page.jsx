'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { baseImg } from '../../utils/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiTrash2, FiEdit2, FiPlus, FiCheck, FiEye, FiUser, FiFileText, FiList, FiDownload, FiChevronLeft, FiChevronRight, FiEdit3, FiCircle, FiMaximize } from 'react-icons/fi';
import { FaAsterisk, FaEye, FaGripVertical, FaUser } from 'react-icons/fa6';
import * as XLSX from 'xlsx';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-hot-toast';
import Modal from '../../components/atoms/Modal';
import { LanguageToggle } from '../../components/atoms/SwitchLang';
import { LogoutButton } from '../../components/atoms/LogoutButton';
import { DynamicImage } from '../../utils/DynamicImg';
import { HiEyeOff } from 'react-icons/hi';
import ProjectsTab from '../../components/atoms/ProjectsTab';
import UsersTab from '../../components/atoms/UsersTab';

// Translation objects
const translations = {
  en: {
    searchUsers: 'Search users...',
    enterValidLimit: 'Please enter a valid limit',
    exportStarted: 'Export completed',
    exportFailed: 'Export failed',
    exportHint: 'Set how many users to include. Current filters (search) will be applied.',
    limit: 'Limit',
    currentSearch: 'Current search',
    none: 'none',
    cancel: 'Cancel',
    export: 'Export',
    perPage: 'per page',
    allProjects: 'All projects',
    downloadTemplate: 'Download Template',
    uploading: 'Uploading',
    importUsers: 'Import Users',
    noProjectSelected: 'No project selected',
    projects: 'Projects',
    projectName: 'Project Name',
    createNewForm: 'Create New Project',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    usersInProject: 'Users in Project',
    noUsersFound: 'No users found',
    selectProjectToViewUsers: 'Select a project to view its users',
    status: 'Status',
    submissionDate: 'Submission Date',
    actions: 'Actions',
    view: 'View',
    reviewed: 'Reviewed',
    pending: 'Pending',
    submissionDetails: 'Submission Details',
    submittedOn: 'Submitted on',
    markAsReviewed: 'Mark as Reviewed',
    markAsPending: 'Mark as Pending',
    confirmDelete: 'Confirm Delete',
    confirmDeleteProjectMessage: 'Are you sure you want to delete this project? This action cannot be undone.',
    noProjectsFound: 'No projects found',
    noSubmissionsFound: 'No submissions found',
    selectProjectToViewDetails: 'Select a project to view details',
    users: 'Users',
    submissions: 'Submissions',
    viewFile: 'View File',
    projectDetails: 'Project details and statistics',
    loadingProjects: 'Error loading projects',
    loadingUsers: 'Error loading users',
    deletingProject: 'Error deleting project',
    renamingProject: 'Error renaming project',
    creatingProject: 'Error creating project',
    updatingSubmission: 'Error updating submission',
    updatingStatus: 'An error occurred while updating the status',
    projectDeleted: 'Project deleted successfully',
    projectRenamed: 'Project renamed successfully',
    projectCreated: 'Project created successfully',
    submissionUpdated: 'Submission updated successfully',
    updateFieldError: 'Error updating field',
    addFieldError: 'Error adding field',
    fieldUpdated: 'Field updated successfully',
    fieldAdded: 'Field added successfully',

    generate_password: 'Generate secure password',
    password: 'Password',
    generate: 'Generate',
    filterByForm: 'Filter by Form',
    allForms: 'All Forms',
    form: 'Form',
    project: 'Project',
    select_project: 'Select a project',
    project_required: 'Project is required',
    project_id_invalid: 'Project ID must be a number',
    checklist: 'Checklist',
    fieldKeyAlreadyExists: 'Cannot add field: key already exists',
    userCreated: 'User created successfully',
    userDeleted: 'User deleted successfully',
    userUpdated: 'User updated successfully',
    optionsPlaceholder: 'Select from available options',

    identity_document: 'ID or Residence Number',
    createForm: 'Create Form',
    updateField: 'Update Field',
    editField: 'Edit Field',
    addField: 'Add Field',
    createNewUser: 'Create New User',
    orCreateNewForm: 'Or Create New Form',
    selectFormDescription: 'Select Form Description',
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    logout: 'Logout',
    formsManagement: 'Forms Management',
    yourForms: 'Your Forms',
    createManageForms: 'Create and manage your data collection forms',
    newForm: 'New Form',
    formBuilder: 'Form Builder',
    editing: 'Editing',
    selectForm: 'Select a form to edit its fields',
    addNewField: 'Add New Field',
    formSubmissions: 'Form Submissions',
    totalSubmissions: 'Total Submissions',
    exportExcel: 'Export to Excel',
    exporting: 'Exporting...',
    registeredUsers: 'Registered Users',
    newUser: 'New User',
    name: 'Name',
    role: 'Role',
    joinedAt: 'Joined At',
    admin: 'Admin',
    user: 'User',
    cancel: 'Cancel',
    createUser: 'Create User',
    updateUser: 'Update User',
    editUser: 'Edit User',
    cannotUndo: 'This action cannot be undone.',
    submit: 'Submit',
    update: 'Update',
    close: 'Close',
    required: 'Required',
    optional: 'Optional',
    active: 'Active',
    inactive: 'Inactive',
    pendingReview: 'Pending Review',
    submittedAt: 'Submitted At',
    question: 'Question',
    response: 'Response',
    noResponse: 'No Response',
    markReviewed: 'Mark as Reviewed',
    noForms: 'No Forms Yet',
    createFirstForm: 'Start by creating your first form',
    noSubmissions: 'No Submissions',
    noUsers: 'No Users',
    shareCredentials: 'Share Credentials via WhatsApp',
    recipientNumber: 'Recipient WhatsApp Number',
    phonePlaceholder: 'e.g. 201234567890',
    shareWhatsApp: 'Share via WhatsApp',
    verifying: 'Verifying...',
    imagePreview: 'Image Preview',
    label: 'Label',
    key: 'Key (Unique Identifier)',
    placeholder: 'Placeholder',
    fieldType: 'Field Type',
    options: 'Options (comma separated)',
    addOptions: 'Add multiple comma separated options',
    requiredField: 'Required Field',
    textInput: 'Text Input',
    radioButtons: 'Radio Buttons',
    dropdownSelect: 'Dropdown Select',
    checkbox: 'Checkbox',
    textArea: 'Text Area',
    number: 'Number',
    phoneNumber: 'Phone Number',
    email: 'Email',
    date: 'Date',
    fileUpload: 'File Upload',
    description: 'Description',
    title: 'Title',
    showPassword: 'Show Password',
    hidePassword: 'Hide Password',
    fields: 'Fields',
    field: 'Field',
    created: 'Created',
    viewSubmission: 'View Submission',
    noSubmissionsUser: 'No Submissions',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    language: 'Language',
    arabic: 'Arabic',
    english: 'English',
    national_id: 'National ID',
    noDescription: 'No description provided',
    deactivateForm: 'Form deactivated successfully',
    activateForm: 'Form activated successfully',

    show_password: 'Show password',
    hide_password: 'Hide password',

    preview: 'Preview',
    hidden: 'Hidden',
    phoneRequired: 'Phone number is required',
    retrievePasswordError: 'An error occurred while retrieving the password',
    fetchPasswordError: 'Failed to fetch password',
    fetchDataError: 'Failed to fetch data',
    updateOrderError: 'Failed to update order',
    fieldDeleted: 'Field deleted successfully',
    formDeleted: 'Form deleted successfully',
    deleteFieldError: 'An error occurred while deleting the field',
    deleteFormError: 'An error occurred while deleting the form',
    formCreated: 'Form created successfully',
    createFormError: 'An error occurred while creating the form',
    createUserError: 'An error occurred while creating the user',
    updateUserError: 'An error occurred while updating the user',
    deleteUserError: 'An error occurred while deleting the user',
    updateSubmissionError: 'An error occurred while updating the submission',
    submissionDeleted: 'Submission deleted successfully',
    deleteSubmissionError: 'An error occurred while deleting the submission',
    exportSuccess: 'Data exported successfully',
    exportError: 'An error occurred while exporting data',
  },
  ar: {
    searchUsers: 'ابحث عن المستخدمين...',
    enterValidLimit: 'من فضلك أدخل حدًا صالحًا',
    exportStarted: 'تم إكمال التصدير',
    exportFailed: 'فشل التصدير',
    exportHint: 'حدد عدد المستخدمين المطلوب تضمينهم. سيتم تطبيق عوامل التصفية الحالية (البحث).',
    limit: 'الحد',
    currentSearch: 'البحث الحالي',
    none: 'لا يوجد',
    cancel: 'إلغاء',
    export: 'تصدير',
    perPage: 'لكل صفحة',
    allProjects: 'جميع المشاريع',
    downloadTemplate: 'تحميل القالب',
    uploading: 'جاري الرفع',
    importUsers: 'استيراد المستخدمين',
    noProjectSelected: 'لم يتم تحديد مشروع',

    projects: 'المشاريع',
    projectName: 'اسم المشروع',
    createNewForm: 'إنشاء مشروع جديد',
    create: 'إنشاء',
    edit: 'تعديل',
    delete: 'حذف',
    usersInProject: 'المستخدمون في المشروع',
    noUsersFound: 'لم يتم العثور على مستخدمين',
    selectProjectToViewUsers: 'اختر مشروعًا لعرض مستخدميه',
    status: 'الحالة',
    submissionDate: 'تاريخ الإرسال',
    actions: 'الإجراءات',
    view: 'عرض',
    reviewed: 'تمت مراجعته',
    pending: 'قيد الانتظار',
    submissionDetails: 'تفاصيل الإرسال',
    submittedOn: 'تم الإرسال في',
    markAsReviewed: 'وضع علامة كمراجع',
    markAsPending: 'وضع علامة كقيد الانتظار',
    confirmDelete: 'تأكيد الحذف',
    confirmDeleteProjectMessage: 'هل أنت متأكد أنك تريد حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.',
    noProjectsFound: 'لم يتم العثور على مشاريع',
    noSubmissionsFound: 'لم يتم العثور على إرساليات',
    selectProjectToViewDetails: 'اختر مشروعًا لعرض التفاصيل',
    users: 'المستخدمون',
    submissions: 'الإرساليات',
    viewFile: 'عرض الملف',
    projectDetails: 'تفاصيل وإحصائيات المشروع',
    loadingProjects: 'حدث خطأ أثناء تحميل المشاريع',
    loadingUsers: 'حدث خطأ أثناء تحميل المستخدمين',
    deletingProject: 'حدث خطأ أثناء حذف المشروع',
    renamingProject: 'حدث خطأ أثناء إعادة تسمية المشروع',
    creatingProject: 'حدث خطأ أثناء إنشاء المشروع',
    updatingSubmission: 'حدث خطأ أثناء تحديث الإرسالية',
    updatingStatus: 'حدث خطأ أثناء تحديث الحالة',
    projectDeleted: 'تم حذف المشروع بنجاح',
    projectRenamed: 'تمت إعادة تسمية المشروع بنجاح',
    projectCreated: 'تم إنشاء المشروع بنجاح',
    submissionUpdated: 'تم تحديث الإرسالية بنجاح',
    updateFieldError: 'حدث خطأ أثناء تحديث الحقل',
    addFieldError: 'حدث خطأ أثناء إضافة الحقل',
    fieldUpdated: 'تم تحديث الحقل بنجاح',
    fieldAdded: 'تمت إضافة الحقل بنجاح',
    generate_password: 'توليد كلمة مرور آمنة',
    password: 'كلمة المرور',
    generate: 'توليد',
    filterByForm: 'تصفية حسب النموذج',
    allForms: 'جميع النماذج',
    form: 'نموذج',
    project: 'مشروع',
    select_project: 'اختر مشروعًا',
    project_required: 'المشروع مطلوب',
    project_id_invalid: 'معرّف المشروع يجب أن يكون رقمًا',
    checklist: 'قائمة التحقق',
    fieldKeyAlreadyExists: 'لا يمكن إضافة الحقل: المفتاح موجود مسبقًا',
    userCreated: 'تم إنشاء المستخدم بنجاح',
    userDeleted: 'تم حذف المستخدم بنجاح',
    userUpdated: 'تم تحديث المستخدم بنجاح',
    optionsPlaceholder: 'اختر من الخيارات المتاحة',
    identity_document: 'رقم الهوية أو الإقامة',
    createForm: 'إنشاء نموذج',
    updateField: 'تحديث الحقل',
    editField: 'تعديل الحقل',
    addField: 'إضافة حقل',
    createNewUser: 'إنشاء مستخدم جديد',
    orCreateNewForm: 'أو أنشئ نموذجًا جديدًا',
    selectFormDescription: 'اختر وصف النموذج',
    dashboard: 'لوحة التحكم',
    welcome: 'مرحبًا',
    logout: 'تسجيل الخروج',
    formsManagement: 'إدارة النماذج',
    yourForms: 'نماذجك',
    createManageForms: 'أنشئ وأدر نماذج جمع البيانات الخاصة بك',
    newForm: 'نموذج جديد',
    formBuilder: 'منشئ النماذج',
    editing: 'تحرير',
    selectForm: 'اختر نموذجًا لتعديل حقوله',
    addNewField: 'إضافة حقل جديد',
    formSubmissions: 'إرساليات النموذج',
    totalSubmissions: 'إجمالي الإرساليات',
    exportExcel: 'تصدير إلى Excel',
    exporting: 'جارٍ التصدير...',
    registeredUsers: 'المستخدمون المسجلون',
    newUser: 'مستخدم جديد',
    name: 'الاسم',
    role: 'الدور',
    joinedAt: 'تاريخ الانضمام',
    admin: 'مشرف',
    user: 'مستخدم',
    cancel: 'إلغاء',
    createUser: 'إنشاء مستخدم',
    updateUser: 'تحديث المستخدم',
    editUser: 'تعديل المستخدم',
    cannotUndo: 'لا يمكن التراجع عن هذا الإجراء.',
    submit: 'إرسال',
    update: 'تحديث',
    close: 'إغلاق',
    required: 'مطلوب',
    optional: 'اختياري',
    active: 'نشط',
    inactive: 'غير نشط',
    pendingReview: 'قيد المراجعة',
    submittedAt: 'تاريخ الإرسال',
    question: 'السؤال',
    response: 'الإجابة',
    noResponse: 'لا توجد إجابة',
    markReviewed: 'وضع علامة كمراجع',
    noForms: 'لا توجد نماذج حتى الآن',
    createFirstForm: 'ابدأ بإنشاء النموذج الأول',
    noSubmissions: 'لا توجد إرساليات',
    noUsers: 'لا يوجد مستخدمون',
    shareCredentials: 'مشاركة بيانات الدخول عبر واتساب',
    recipientNumber: 'رقم واتساب المستلم',
    phonePlaceholder: 'مثال: 201234567890',
    shareWhatsApp: 'مشاركة عبر واتساب',
    verifying: 'جارٍ التحقق...',
    imagePreview: 'معاينة الصورة',
    label: 'التسمية',
    key: 'المفتاح (معرّف فريد)',
    placeholder: 'النص التوضيحي',
    fieldType: 'نوع الحقل',
    options: 'الخيارات (مفصولة بفواصل)',
    addOptions: 'أضف عدة خيارات مفصولة بفواصل',
    requiredField: 'حقل مطلوب',
    textInput: 'إدخال نصي',
    radioButtons: 'أزرار اختيار',
    dropdownSelect: 'قائمة منسدلة',
    checkbox: 'مربع اختيار',
    textArea: 'منطقة نصية',
    number: 'رقم',
    phoneNumber: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    date: 'تاريخ',
    fileUpload: 'رفع ملف',
    description: 'الوصف',
    title: 'العنوان',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    fields: 'الحقول',
    field: 'الحقل',
    created: 'تم الإنشاء',
    viewSubmission: 'عرض الإرسالية',
    noSubmissionsUser: 'لا توجد إرساليات',
    search: 'بحث',
    filter: 'تصفية',
    all: 'الكل',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'الإنجليزية',
    national_id: 'الهوية الوطنية',
    noDescription: 'لا يوجد وصف',
    deactivateForm: 'تم تعطيل النموذج بنجاح',
    activateForm: 'تم تفعيل النموذج بنجاح',
    show_password: 'إظهار كلمة المرور',
    hide_password: 'إخفاء كلمة المرور',
    preview: 'معاينة',
    hidden: 'مخفي',
    phoneRequired: 'رقم الهاتف مطلوب',
    retrievePasswordError: 'حدث خطأ أثناء استرجاع كلمة المرور',
    fetchPasswordError: 'فشل في جلب كلمة المرور',
    fetchDataError: 'فشل في جلب البيانات',
    updateOrderError: 'فشل في تحديث الترتيب',
    fieldDeleted: 'تم حذف الحقل بنجاح',
    formDeleted: 'تم حذف النموذج بنجاح',
    deleteFieldError: 'حدث خطأ أثناء حذف الحقل',
    deleteFormError: 'حدث خطأ أثناء حذف النموذج',
    formCreated: 'تم إنشاء النموذج بنجاح',
    createFormError: 'حدث خطأ أثناء إنشاء النموذج',
    createUserError: 'حدث خطأ أثناء إنشاء المستخدم',
    updateUserError: 'حدث خطأ أثناء تحديث المستخدم',
    deleteUserError: 'حدث خطأ أثناء حذف المستخدم',
    updateSubmissionError: 'حدث خطأ أثناء تحديث الإرسالية',
    submissionDeleted: 'تم حذف الإرسالية بنجاح',
    deleteSubmissionError: 'حدث خطأ أثناء حذف الإرسالية',
    exportSuccess: 'تم تصدير البيانات بنجاح',
    exportError: 'حدث خطأ أثناء تصدير البيانات',
  },
};

const userSchema = yup.object().shape({
  // name: yup.string().required('Name is required'),
  email: yup.string().required('National ID is required').matches(/^\d+$/, 'National ID must contain only digits').length(10, 'National ID must be exactly 10 digits long'),
  projectId: yup.number().typeError('Project ID must be a number').required('Project ID is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').optional(),
  role: yup.string().oneOf(['admin', 'user'], 'Invalid role').required('Role is required'),
});

const formSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string(),
});

const fieldSchema = yup.object().shape({
  label: yup.string().required('Label is required'),
  // key: yup.string().required('Key is required'),
  placeholder: yup.string(), // Now optional (no .required())
  type: yup.string().required('Type is required'),
  required: yup.boolean(),
});

const SubmissionDetails = ({ submission, onClose, t }) => {
  if (!submission) return null;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg'>
        <div className='space-y-1'>
          <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>{t('status')}</h4>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${submission.isCheck ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{submission.isCheck ? t('reviewed') : t('pendingReview')}</span>
        </div>
        <div className='space-y-1'>
          <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>{t('submittedAt')}</h4>
          <p className='text-sm font-medium text-gray-900'>
            {new Date(submission.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className='overflow-hidden shadow-inner ring-1 ring-black/10 ring-opacity-5 rounded-lg'>
        <table className='min-w-full  divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th scope='col' className='py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'>
                {t('question')}
              </th>
              <th scope='col' className='px-3 py-3 rtl:text-right ltr:text-left text-sm font-semibold text-gray-900'>
                {t('response')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {Object.entries(submission.answers).map(([question, answer]) => (
              <tr key={question}>
                <td className='whitespace-normal py-2 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-6'>{question}</td>
                <td className='px-3 py-2 text-xs text-gray-500'>
                  {Array.isArray(answer) ? (
                    <ul className='list-disc pl-5 space-y-1'>
                      {answer.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : typeof answer === 'object' && answer !== null ? (
                    answer.url ? (
                      answer.url.startsWith('uploads/') ? (
                        <DynamicImage src={answer.url} alt='Uploaded content' className='max-w-full h-auto' />
                      ) : (
                        <a href={answer.url} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
                          {answer.url}
                        </a>
                      )
                    ) : (
                      <pre className='whitespace-pre-wrap font-sans text-sm bg-gray-50 p-2 rounded'>{JSON.stringify(answer, null, 2)}</pre>
                    )
                  ) : typeof answer === 'string' && answer.startsWith('uploads/') ? (
                    <DynamicImage src={answer} alt='Uploaded content' className='max-w-full h-auto' />
                  ) : answer ? (
                    typeof answer === 'string' && answer.startsWith('uploads') ? (
                      <DynamicImage src={answer} alt='Uploaded content' className='max-w-full h-auto' />
                    ) : (
                      answer
                    )
                  ) : (
                    <span className='text-gray-400 italic'>{t('noResponse')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='flex justify-end gap-3'>
        <button type='button' onClick={onClose} className=' cursor-pointer inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
          {t('close')}
        </button>
      </div>
    </div>
  );
};

export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div className='overflow-x-auto scrollbar-custom'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i} scope='col' className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {[...Array(5)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 animate-pulse'></div>
                  <div className='ml-4'>
                    <div className='h-4 bg-gray-200 rounded w-24 animate-pulse'></div>
                  </div>
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='h-4 bg-gray-200 rounded w-32 animate-pulse'></div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='h-6 bg-gray-200 rounded-full w-16 animate-pulse'></div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='h-4 bg-gray-200 rounded w-20 animate-pulse'></div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='h-4 bg-gray-200 rounded w-24 animate-pulse'></div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex space-x-2'>
                  <div className='h-6 w-6 bg-gray-200 rounded-full animate-pulse'></div>
                  <div className='h-6 w-6 bg-gray-200 rounded-full animate-pulse'></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div dir='ltr' className='flex items-center justify-center mt-8 space-x-1'>
        <div className='h-8 w-8 bg-gray-200 rounded-full animate-pulse'></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='h-8 w-8 bg-gray-200 rounded-full animate-pulse'></div>
        ))}
        <div className='h-8 w-8 bg-gray-200 rounded-full animate-pulse'></div>
      </div>
    </div>
  );
};

const ShareCredentialsModal = ({ user, onClose, t }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('966'); // بادئة رقم السعودية
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const handleShare = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error(t('phoneRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/auth/verify-user/${user.id}`);
      const message = `Your login credentials:\nEmail: ${user.email}\nPassword: ${response?.data?.password}\n\nLogin here: ${siteUrl}`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      onClose();
    } catch (error) {
      toast.error(t('retrievePasswordError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title={t('shareCredentials')} show={true} onClose={onClose}>
      <div className='space-y-4'>
        <div>
          <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
            {t('recipientNumber')}
          </label>
          <input type='tel' id='phone' className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500' placeholder={t('phonePlaceholder')} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} />
          {/* <p className='mt-1 text-sm text-gray-500'>{t('phonePlaceholder')}</p> */}
        </div>

        <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4'>
          <button onClick={handleShare} disabled={isLoading} className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer ${isLoading ? 'opacity-50' : ''}`}>
            {isLoading ? t('verifying') : t('shareWhatsApp')}
          </button>
          <button onClick={onClose} className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'>
            {t('cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default function DashboardPage() {
  const { logout, user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [activeTab, setActiveTab] = useState('forms');
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, id: null, type: null });
  const [viewSubmission, setViewSubmission] = useState(null);
  const [editField, setEditField] = useState(null);
  const [tempOptions, setTempOptions] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [showShareModal, setShowShareModal] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [language, setLanguage] = useState('ar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedFormId, setSelectedFormId] = useState('all');
  const [selectedLimit, setSelectedLimit] = useState(10);

  const t = key => translations[language][key] || key;

  useEffect(() => {
    // Load language preference from localStorage
    const savedLang = localStorage.getItem('dashboardLang');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    localStorage.setItem('dashboardLang', newLang);
  };

  const handleShowPassword = async userId => {
    if (visiblePasswords[userId]) {
      setVisiblePasswords(prev => ({ ...prev, [userId]: null }));
      return;
    }

    try {
      const response = await api.post(`/auth/verify-user/${userId}`);
      setVisiblePasswords(prev => ({ ...prev, [userId]: response.data.password }));
    } catch (error) {
      console.error('Error fetching password:', error);
      alert(t('fetchPasswordError'));
    }
  };

  const [isLoading, setIsLoading] = useState({
    forms: false,
    submissions: false,
    users: false,
  });

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    setValue,
    formState: { errors: userErrors },
    reset: resetUserForm,
  } = useForm({
    resolver: yupResolver(userSchema),
  });

  const {
    register: registerForm,
    handleSubmit: handleFormSubmit,
    formState: { errors: formErrors },
    reset: resetFormForm,
  } = useForm({
    resolver: yupResolver(formSchema),
  });

  const {
    register: registerField,
    handleSubmit: handleFieldSubmit,
    formState: { errors: fieldErrors },
    reset: resetFieldForm,
    setValue: setFieldValue,
    watch: watchFieldType,
  } = useForm({
    resolver: yupResolver(fieldSchema),
  });

  const fieldType = watchFieldType('type');

  useEffect(() => {
    const savedTab = localStorage.getItem('adminActiveTab');
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      localStorage.setItem('adminActiveTab', activeTab);
      fetchData();
    }
  }, [activeTab, user, authLoading]);

  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: selectedLimit.toString(),
    ...(selectedFormId !== 'all' && { form_id: selectedFormId }),
    ...(selectedProjectId !== 'all' && { project_id: selectedProjectId }),
  });

  const fetchData = async () => {
    try {
      setIsLoading(prev => ({ ...prev, [activeTab]: true }));

      if (activeTab === 'forms') {
        const formsRes = await api.get('/forms');
        setForms(formsRes.data.data || formsRes.data);
      } else if (activeTab === 'submissions') {
        const submissionsRes = await api.get(`/form-submissions?${queryParams}`);
        setSubmissions(submissionsRes.data.data || submissionsRes.data);
        setTotalPages(submissionsRes.data.lastPage || 1);
      } else if (activeTab === 'users') {
        const usersRes = await api.get(`/users?page=${currentUserPage}`);
        setUsers(usersRes.data.data || usersRes.data);
        setTotalUserPages(usersRes.data.lastPage || Math.ceil(usersRes.data.total / usersRes.data.limit) || 1);
      }
    } catch (error) {
      toast.error(t('fetchDataError'));
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, [activeTab]: false }));
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchData();
    }
  }, [selectedFormId, selectedLimit, selectedProjectId, currentPage]);

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.data); // ✅ نأخذ data فقط
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, currentUserPage, activeTab]);

  const onDragEnd = async result => {
    if (!result.destination) return;

    const items = Array.from(selectedForm.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedForm = {
      ...selectedForm,
      fields: items.map((field, index) => ({
        ...field,
        order: index + 1,
      })),
    };

    setSelectedForm(updatedForm);
    setForms(forms.map(f => (f.id === updatedForm.id ? updatedForm : f)));

    try {
      const updatedFields = items.map((field, index) => ({
        id: field.id,
        order: index + 1,
      }));

      await api.patch('/forms/re-order', {
        fields: updatedFields,
      });
    } catch (error) {
      toast.error(t('updateOrderError'));
      console.error('Failed to update field order:', error);
      fetchData();
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setValue('password', newPassword); // تحديث قيمة input في react-hook-form
  };

  const handleDeleteField = async fieldId => {
    try {
      await api.delete(`/forms/${selectedForm.id}/fields/${fieldId}`);
      const updatedFields = selectedForm.fields.filter(f => f.id !== fieldId);
      const updatedForm = { ...selectedForm, fields: updatedFields };
      setSelectedForm(updatedForm);
      setForms(forms.map(f => (f.id === updatedForm.id ? updatedForm : f)));
      toast.success(t('fieldDeleted'));
      setShowDeleteModal({ show: false, id: null, type: null });
    } catch (error) {
      toast.error(t('deleteFieldError'));
      console.error('Failed to delete field:', error);
    }
  };

  const handleDeleteForm = async formId => {
    try {
      await api.delete(`/forms/${formId}`);
      setForms(forms.filter(f => f.id !== formId));
      if (selectedForm?.id === formId) {
        setSelectedForm(null);
      }
      toast.success(t('formDeleted'));
      setShowDeleteModal({ show: false, id: null, type: null });
    } catch (error) {
      toast.error(t('deleteFormError'));
      console.error('Failed to delete form:', error);
    }
  };

  const handleCreateForm = async formData => {
    try {
      const response = await api.post('/forms', {
        title: formData.title,
        description: formData.description,
        fields: [],
      });
      setForms([response.data, ...forms]);
      setShowNewFormModal(false);
      resetFormForm();
      toast.success(t('formCreated'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('createFormError'));
      console.error('Failed to create form:', error);
    }
  };

  const handleAddField = async fieldData => {
    try {
      const fieldKey = fieldData.label ? fieldData.label.toLowerCase().replace(/\s+/g, '-') : null;
      // التحقق إن كان المفتاح موجود مسبقًا
      const keyExists = selectedForm.fields.some(field => field.key === fieldKey);

      if (keyExists && !editField) {
        toast.error(t('fieldKeyAlreadyExists') || 'Cannot add field: key already exists.');
        return;
      }

      const fieldToAdd = {
        ...fieldData,
        key: fieldKey,
        options: fieldData.type === 'radio' || fieldData.type === 'checklist' || fieldData.type === 'select' ? tempOptions.split(',').map(opt => opt.trim()) : [],
      };
      if (!editField) fieldToAdd['order'] = selectedForm.fields.length + 1;

      let updatedFields;
      if (editField) {
        updatedFields = selectedForm.fields.map(f => (f.id === editField.id ? { ...f, ...fieldToAdd } : f));
      } else {
        const response = await api.post(`/forms/${selectedForm.id}/fields`, { fields: [fieldToAdd] });
        updatedFields = [...selectedForm.fields, ...(response.data.fields || response.data)];
      }

      const updatedForm = {
        ...selectedForm,
        fields: updatedFields,
      };

      if (editField) {
        await api.patch('/forms', {
          id: selectedForm.id,
          title: selectedForm.title,
          description: selectedForm.description,
          fields: updatedFields,
        });
      }

      setSelectedForm(updatedForm);
      setForms(forms.map(f => (f.id === updatedForm.id ? updatedForm : f)));
      setShowNewFieldModal(false);
      setEditField(null);
      setTempOptions('');
      resetFieldForm();
      toast.success(t(editField ? 'fieldUpdated' : 'fieldAdded'));
    } catch (error) {
      toast.error(error.response?.data?.message || t(editField ? 'updateFieldError' : 'addFieldError'));
      console.error(`Failed to ${editField ? 'update' : 'add'} field:`, error);
    }
  };

  const handleCreateUser = async userData => {
    try {
      const response = await api.post('/auth/create-user', userData);
      setUsers([response.data, ...users]);
      setShowNewUserModal(false);
      resetUserForm();
      toast.success(t('userCreated'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('createUserError'));
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const payload = userData.password ? userData : { name: userData.name, email: userData.email, role: userData.role };

      const response = await api.patch(`/users/${userId}`, payload);
      setUsers(users.map(u => (u.id === userId ? response.data : u)));
      setShowEditUserModal(false);
      resetUserForm();
      toast.success(t('userUpdated'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('updateUserError'));
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async userId => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteModal({ show: false, id: null, type: null });
      toast.success(t('userDeleted'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('deleteUserError'));
      console.error('Failed to delete user:', error);
    }
  };

  const markSubmissionReviewed = async (submissionId, reviewed) => {
    try {
      setSubmissions(submissions.map(s => (s.id === submissionId ? { ...s, isCheck: reviewed } : s)));

      await api.patch(`/form-submissions/${submissionId}`, { isCheck: reviewed });
    } catch (error) {
      setSubmissions(submissions.map(s => (s.id === submissionId ? { ...s, isCheck: !reviewed } : s)));
      toast.error(error.response?.data?.message || t('updateSubmissionError'));
      console.error('Failed to update submission status:', error);
    }
  };

  const handleDeleteSubmission = async submissionId => {
    try {
      await api.delete(`/form-submissions/${submissionId}`);
      setSubmissions(submissions.filter(s => s.id !== submissionId));
      setShowDeleteModal({ show: false, id: null, type: null });
      toast.success(t('submissionDeleted'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('deleteSubmissionError'));
      console.error('Failed to delete submission:', error);
    }
  };

  const toggleFormActive = async (formId, isActive) => {
    try {
      const updatedForms = forms.map(form => ({
        ...form,
        isActive: form.id === formId ? !isActive : false,
      }));
      setForms(updatedForms);

      if (selectedForm && selectedForm.id === formId) {
        setSelectedForm({ ...selectedForm, isActive: !isActive });
      }
      await api.post(`/forms/${formId}/activate`);
    } catch (error) {
      const originalForms = forms.map(form => ({
        ...form,
        isActive: form.id === formId ? isActive : form.isActive,
      }));
      setForms(originalForms);

      if (selectedForm && selectedForm.id === formId) {
        setSelectedForm({ ...selectedForm, isActive: isActive });
      }

      toast.error(error.response?.data?.message || t(isActive ? 'deactivateFormError' : 'activateFormError'));
      console.error(`Failed to ${isActive ? 'deactivate' : 'activate'} form:`, error);
    }
  };

  const openEditFieldModal = field => {
    setEditField(field);
    setFieldValue('label', field.label);
    setFieldValue('key', field.key);
    setFieldValue('placeholder', field.placeholder);
    setFieldValue('type', field.type);
    setFieldValue('required', field.required);
    if (field.options) {
      setTempOptions(field.options.join(', '));
    }
    setShowNewFieldModal(true);
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      const response = await api.get(`/form-submissions?${queryParams}`);

      let dataToExport = response.data.data;

      if (selectedFormId !== 'all') {
        dataToExport = dataToExport.filter(sub => sub.form_id === selectedFormId);
      }

      const excelData = dataToExport.map(submission => {
        const updatedAnswers = { ...submission.answers };

        for (const [key, value] of Object.entries(updatedAnswers)) {
          // Case 1: plain string starting with uploads
          if (typeof value === 'string' && value.startsWith('uploads')) {
            updatedAnswers[key] = `${process.env.NEXT_PUBLIC_BASE_URL}${value}`;
          }
          // Case 2: object with .url starting with uploads
          if (typeof value === 'object' && value?.url?.startsWith('uploads')) {
            updatedAnswers[key] = `${process.env.NEXT_PUBLIC_BASE_URL}${value.url}`;
          }
        }

        return {
          User: submission.user.email,
          'Submitted At': new Date(submission.created_at).toLocaleString(),
          Status: submission.isCheck ? t('reviewed') : t('pendingReview'),
          ...updatedAnswers, // replaced values, no duplicates
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, t('submissions'));

      const fileName = `submissions-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(t('exportSuccess'));
    } catch (error) {
      toast.error(t('exportError'));
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFieldTypeColor = type => {
    const colors = {
      text: { bg: 'bg-blue-100', text: 'text-blue-800' },
      email: { bg: 'bg-purple-100', text: 'text-purple-800' },
      number: { bg: 'bg-green-100', text: 'text-green-800' },
      select: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      checkbox: { bg: 'bg-red-100', text: 'text-red-800' },
      radio: { bg: 'bg-orange-100', text: 'text-orange-800' },
      date: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
      default: { bg: 'bg-gray-100', text: 'text-gray-800' },
    };

    return colors[type] || colors.default;
  };

  const renderSubmissionTable = () => {
    if (isLoading.submissions) return <SkeletonLoader count={5} />;
    const filteredSubmissions = submissions;
    if (filteredSubmissions.length === 0) return <div className='text-center py-8 text-gray-500'>{t('noSubmissions')}</div>;

    const allKeys = filteredSubmissions.reduce((keys, submission) => {
      Object.keys(submission.answers).forEach(key => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      });
      return keys;
    }, []);

    return (
      <>
        <div className='overflow-x-auto scrollbar-custom'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('status')}</th>
                <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('national_id')}</th>
                <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('project')}</th>
                {allKeys.map(key => (
                  <th key={key} className={` ${key?.endsWith('_asset') && 'hidden'}  px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {key}
                  </th>
                ))}
                <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('submittedAt')}</th>
                <th className='px-6 py-3 rtl:text-right ltr:text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredSubmissions.map(submission => (
                <tr key={submission.id} className={`hover:bg-gray-50 ${submission.isCheck ? 'bg-blue-50' : ''}`}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <label className='relative flex items-center gap-2 cursor-pointer'>
                        <input type='checkbox' checked={submission.isCheck} onChange={() => markSubmissionReviewed(submission.id, !submission.isCheck)} className='absolute opacity-0 h-0 w-0' />
                        <div className={`relative w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${submission.isCheck ? 'bg-indigo-600 border-indigo-700' : 'bg-white border-gray-300 hover:border-gray-400'}`}>{submission.isCheck && <FiCheck className='w-3.5 h-3.5 text-white' strokeWidth={3} />}</div>
                        <span className={`ml-2 text-sm ${submission.isCheck ? 'text-indigo-700 font-medium' : 'text-gray-500'}`}>{submission.isCheck ? t('reviewed') : t('markReviewed')}</span>
                      </label>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{submission?.user?.email}</td>
                  <td className=' px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{submission?.user?.project?.name || 'N/A'}</td>

                  {allKeys.map(key => {
                    const value = submission.answers[key];
                    let content = 'N/A';
                    if (key.endsWith('_asset')) return null;
                    if (value) {
                      if (typeof value === 'string' && value.startsWith('upload')) {
                        content = (
                          <div className='relative group w-10 h-10'>
                            <img src={baseImg + value} alt='Uploaded' className='h-full w-full rounded object-cover border border-gray-300 cursor-pointer' onClick={() => setPreviewImg(baseImg + value)} />
                            <div onClick={() => setPreviewImg(baseImg + value)} className='absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer'>
                              <FiMaximize className='w-5 h-5' />
                            </div>
                          </div>
                        );
                      } else if (typeof value === 'object' && value !== null) {
                        if (value.url) {
                          content = (
                            <div className='relative group w-10 h-10'>
                              <img src={baseImg + value.url} alt='Uploaded' className='h-full w-full rounded object-cover border border-gray-300 cursor-pointer' onClick={() => setPreviewImg(value.url)} />
                              <div onClick={() => setPreviewImg(value.url)} className='absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer'>
                                <FiMaximize className='w-5 h-5' />
                              </div>
                            </div>
                          );
                        } else {
                          content = (
                            <ul className='list-disc list-inside space-y-1 text-xs text-gray-700'>
                              {Object.entries(value).map(([k, v]) => (
                                <li key={k}>
                                  <span className='font-medium'>{k}:</span> {String(v)}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                      } else {
                        if (typeof value === 'boolean') {
                          content = value ? 'YES' : 'NO';
                        } else if (Number.isInteger(+value)) {
                          content = value;
                        } else {
                          const maybeDate = new Date(value);
                          if (!isNaN(maybeDate.getTime())) {
                            content = maybeDate.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              weekday: 'short',
                            });
                          } else {
                            content = String(value);
                          }
                        }
                      }
                    }

                    return (
                      <td key={key} className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {content}
                      </td>
                    );
                  })}
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{new Date(submission.created_at).toLocaleString()}</td>

                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2'>
                    <button onClick={() => setShowDeleteModal({ show: true, id: submission.id, type: 'submission' })} className='text-red-600 hover:text-red-900 cursor-pointer'>
                      <FiTrash2 className='h-4 w-4' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div dir='ltr' className='flex items-center justify-center mt-8 space-x-1'>
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className='p-2 !rounded-full w-[30px] h-[30px] flex items-center justify-center border border-gray-300  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'>
            <FiChevronLeft className='h-4 w-4' />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`!rounded-full w-[30px] h-[30px] flex items-center justify-center text-sm ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                {pageNum}
              </button>
            );
          })}

          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className='p-2 border border-gray-300 !rounded-full w-[30px] h-[30px] flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'>
            <FiChevronRight className='h-4 w-4' />
          </button>
        </div>
      </>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100' dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <header className='bg-white shadow-sm sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='flex flex-col items-start gap-0 leading-tight'>
              <h1 className='text-2xl font-bold text-gray-800'>{t('dashboard')}</h1>
              <div className='text-xs text-gray-600 flex items-center gap-1'>
                {t('welcome')},<span className='text-sm font-semibold text-indigo-600 capitalize'>{user?.name}</span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <LanguageToggle IsFixed={false} onToggle={toggleLanguage} currentLang={language} languages={translations} />
            <LogoutButton IsFixed={false} onClick={logout} label={t('logout')} position={{ top: '1rem', right: '5rem' }} className=' h-12 z-50' showText={false} />
            <button className='  md:hidden rtl:ml-4 ltr:mr-4 text-gray-500 hover:text-gray-700' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg className='cursor-pointer w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden  bg-white shadow-md'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            <button
              onClick={() => {
                setActiveTab('forms');
                setIsMobileMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${activeTab === 'forms' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>
              {t('formsManagement')}
            </button>
            <button
              onClick={() => {
                setActiveTab('submissions');
                setIsMobileMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${activeTab === 'submissions' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>
              {t('submissions')}
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                setIsMobileMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>
              {t('users')}
            </button>
          </div>
        </div>
      )}

      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {/* Desktop tabs - hidden on mobile */}
        <div className='hidden md:flex items-center justify-between mb-6 border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button onClick={() => setActiveTab('forms')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'forms' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}>
              <FiFileText className='h-4 w-4' />
              <span>{t('formsManagement')}</span>
            </button>
            <button onClick={() => setActiveTab('submissions')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'submissions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}>
              <FiList className='h-4 w-4' />
              <span>{t('submissions')}</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}>
              <FiUser className='h-4 w-4' />
              <span>{t('users')}</span>
            </button>
            <button onClick={() => setActiveTab('projects')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'projects' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} cursor-pointer`}>
              <FiUser className='h-4 w-4' />
              <span>{t('projects')}</span>
            </button>
          </nav>
        </div>

        {activeTab === 'forms' && (
          <div className='grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-6'>
            <div className='sticky top-[100px] h-fit bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md'>
              <div className='p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white'>
                <div>
                  <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                    <FiFileText className='text-indigo-500' />
                    {t('yourForms')}
                  </h2>
                  <p className='text-sm text-gray-500 mt-1'>{t('createManageForms')}</p>
                </div>
                <button onClick={() => setShowNewFormModal(true)} className='flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95'>
                  <FiPlus className='h-4 w-4' />
                  <span>{t('newForm')}</span>
                </button>
              </div>

              <div className='p-5 space-y-3'>
                {isLoading.forms ? (
                  <div className='space-y-4'>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className='p-4 rounded-lg border border-gray-200 bg-white'>
                        <div className='animate-pulse flex space-x-4'>
                          <div className='flex-1 space-y-3'>
                            <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                            <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                            <div className='flex justify-between pt-2'>
                              <div className='h-4 bg-gray-200 rounded w-16'></div>
                              <div className='h-4 bg-gray-200 rounded w-20'></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : forms.length > 0 ? (
                  forms.map(form => (
                    <div key={form.id} className={`relative p-5 rounded-xl cursor-pointer transition-all duration-200 group overflow-hidden ${selectedForm?.id === form.id ? 'ring-2 ring-indigo-400 bg-indigo-50 shadow-sm' : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'} ${form.isActive ? 'before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-green-400' : ''} `} onClick={() => setSelectedForm(form)}>
                      <div className='flex justify-between items-start'>
                        <div className='flex items-start gap-3'>
                          <div className={`p-2 rounded-lg mt-1 ${form.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <FiFileText className='w-5 h-5' />
                          </div>
                          <div>
                            <div className='flex items-center gap-2'>
                              <h3 className='font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors'>{form.title}</h3>
                              {form.isActive && <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>{t('active')}</span>}
                            </div>
                            <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{form.description || t('noDescription')}</p>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleFormActive(form.id, form.isActive);
                            }}
                            title={form.isActive ? t('deactivateForm') : t('activateForm')}
                            className={`relative cursor-pointer inline-flex h-6 w-11 items-center rounded-full transition-colors  ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform  ${form.isActive ? ' rtl:-translate-x-6 ltr:translate-x-6' : ' rtl:-translate-x-1 ltr:translate-x-1'}`} />
                          </button>

                          <div className='flex items-center gap-1'>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setShowDeleteModal({ show: true, id: form.id, type: 'form' });
                              }}
                              className='p-1.5 cursor-pointer text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors'
                              title={t('delete')}>
                              <FiTrash2 className='w-4 ' />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className='flex justify-between items-center mt-3 pt-3 border-t border-gray-100'>
                        <span className={`text-xs px-2 py-1 rounded-full ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'}`}>
                          {form.fields?.length || 0} {form.fields?.length === 1 ? t('field') : t('fields')}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {t('created')} {new Date(form.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-10'>
                    <div className='mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4'>
                      <FiFileText className='w-8 h-8 text-indigo-400' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-700 mb-1'>{t('noForms')}</h3>
                    <p className='text-sm text-gray-500 mb-4'>{t('createFirstForm')}</p>
                    <button onClick={() => setShowNewFormModal(true)} className='inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-all'>
                      <FiPlus className='h-4 w-4' />
                      {t('createForm')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'>
              <div className='p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white'>
                <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                  <FiEdit3 className='text-indigo-500' />
                  {t('formBuilder')}
                </h2>
                <p className='text-sm text-gray-500 mt-1'>{selectedForm ? `${t('editing')}: ${selectedForm.title}` : t('selectForm')}</p>
              </div>

              <div className='p-5'>
                {selectedForm ? (
                  <>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId='fields'>
                        {provided => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className='space-y-3'>
                            {selectedForm.fields
                              ?.sort((a, b) => a.order - b.order)
                              .map((field, index) => (
                                <Draggable key={field.id?.toString() || `new-field-${index}`} draggableId={field.id?.toString() || `new-field-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`p-5 cursor-pointer rounded-lg transition-all duration-200 ease-in-out relative overflow-hidden group
                                ${snapshot.isDragging ? 'bg-indigo-100 shadow-lg ring-2 ring-indigo-300' : 'bg-white border border-gray-200 hover:border-indigo-200 hover:ring-1 hover:ring-indigo-100'}`}
                                      onClick={() => openEditFieldModal(field)}>
                                      <div className='flex items-start gap-4'>
                                        <div {...provided.dragHandleProps} className='p-1 -ml-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing'>
                                          <FaGripVertical className='h-5 w-5' />
                                        </div>

                                        <div className='flex-1 min-w-0 space-y-2'>
                                          <div className='flex justify-between items-start gap-2'>
                                            <h4 className='font-semibold text-gray-800 flex items-center gap-1 '>
                                              {field.label}
                                              {field.required && (
                                                <span className=' -mt-2 text-xs text-red-500'>
                                                  <FaAsterisk />
                                                </span>
                                              )}
                                            </h4>

                                            <div>
                                              <span className={`text-xs px-2 py-1 rounded-full capitalize   ${getFieldTypeColor(field.type).bg}   ${getFieldTypeColor(field.type).text}`}>{t(field.type)}</span>
                                            </div>
                                          </div>

                                          {field.placeholder && (
                                            <p className='text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block'>
                                              {t('placeholder')}: "{field.placeholder}"
                                            </p>
                                          )}

                                          {field.options?.length > 0 && (
                                            <div className='flex flex-wrap gap-1 pt-1'>
                                              {field.options.map(option => (
                                                <span key={option} className='text-xs px-2 py-1 bg-white text-gray-600 rounded-md border border-gray-200 shadow-xs flex items-center gap-1'>
                                                  {field.type === 'checkbox' || field.type === 'radio' ? (
                                                    <>
                                                      {field.type === 'checkbox' ? <FiCheck className='w-3 h-3 text-gray-400' /> : <FiCircle className='w-3 h-3 text-gray-400' />}
                                                      {option}
                                                    </>
                                                  ) : (
                                                    option
                                                  )}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        <div className='flex items-center gap-1 '>
                                          <button
                                            onClick={e => {
                                              e.stopPropagation();
                                              setShowDeleteModal({ show: true, id: field.id, type: 'field' });
                                            }}
                                            className='cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors'
                                            title={t('delete')}>
                                            <FiTrash2 className='h-4 w-4' />
                                          </button>

                                          <button onClick={() => openEditFieldModal(field)} className='p-1.5 cursor-pointer text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors' title={t('edit')}>
                                            <FiEdit2 className='w-4 h-4' />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <button
                      onClick={() => {
                        setEditField(null);
                        setShowNewFieldModal(true);
                      }}
                      className='group mt-6 w-full flex items-center justify-center gap-3 bg-white border border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-xs hover:shadow-sm'>
                      <div className='p-1.5 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-200 transition-colors'>
                        <FiPlus className='h-4 w-4' />
                      </div>
                      <span className='font-medium'>{t('addNewField')}</span>
                    </button>
                  </>
                ) : (
                  <div className='flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                    <div className='bg-indigo-100 p-4 rounded-full mb-4'>
                      <FiEdit2 className='h-6 w-6 text-indigo-600' />
                    </div>
                    <h3 className='text-lg font-semibold text-gray-700 mb-2'>{t('selectForm')}</h3>
                    <p className='text-sm text-gray-500 max-w-xs mb-4'>{t('selectFormDescription')}</p>
                    <button onClick={() => setShowNewFormModal(true)} className='inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium'>
                      <FiPlus className='h-4 w-4' />
                      {t('orCreateNewForm')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className='bg-white rounded-xl shadow-md overflow-hidden'>
            <div className='p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4'>
              <div>
                <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                  <FiFileText className='text-indigo-500' />
                  {t('formSubmissions')}
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  {selectedFormId == 'all' ? submissions.length : submissions?.filter(e => e.form_id == selectedFormId).length} {t('totalSubmissions')}
                </p>
              </div>

              {/* Form ID Filter Dropdown */}
              <div className='flex flex-wrap items-center gap-2'>
                <select id='formFilter' value={selectedFormId} onChange={e => setSelectedFormId(e.target.value)} className=' truncate !w-[150px] !max-w-fit border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'>
                  <option value='all'>{t('allForms')}</option>
                  {Array.from(new Set(submissions.map(s => s.form_id))).map(formId => (
                    <option className='max-w-[100px] w-full truncate ' key={formId} value={formId}>
                      {forms.find(e => e.id == formId)?.title || 'unKnown'}
                    </option>
                  ))}
                </select>

                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className='truncate !w-[150px] border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'>
                  <option value='all'>{t('allProjects')}</option>
                  {projects.map(e => {
                    return (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    );
                  })}
                </select>

                <select value={selectedLimit} onChange={e => setSelectedLimit(Number(e.target.value))} className='truncate !w-[150px] border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'>
                  {[10, 20, 30, 40, 50, 100, 200].map(limit => (
                    <option key={limit} value={limit}>
                      {limit} {t('perPage')}
                    </option>
                  ))}
                </select>
                <button onClick={exportToExcel} disabled={isExporting} className='flex-none flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer disabled:opacity-50'>
                  <FiDownload className='h-4 w-4' />
                  <span>{isExporting ? t('exporting') : t('exportExcel')}</span>
                </button>
              </div>
            </div>
            <div className='p-4'>{renderSubmissionTable()}</div>
          </div>
        )}

        {activeTab === 'users' && <UsersTab handleGeneratePassword={handleGeneratePassword} setUsers={setUsers} projects={projects} t={t} users={users} isLoading={isLoading} visiblePasswords={visiblePasswords} handleShowPassword={handleShowPassword} setShowNewUserModal={setShowNewUserModal} setEditingUser={setEditingUser} resetUserForm={resetUserForm} setShowEditUserModal={setShowEditUserModal} setShowShareModal={setShowShareModal} setShowDeleteModal={setShowDeleteModal} setViewSubmission={setViewSubmission} currentUserPage={currentUserPage} setCurrentUserPage={setCurrentUserPage} totalUserPages={totalUserPages} />}

        {activeTab === 'projects' && <ProjectsTab t={t} />}
      </main>

      {/* Modals */}
      <Modal
        title={t('createNewForm')}
        show={showNewFormModal}
        onClose={() => {
          setShowNewFormModal(false);
          resetFormForm();
        }}>
        <form onSubmit={handleFormSubmit(handleCreateForm)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='form-title' className='block text-sm font-medium text-gray-700'>
                {t('title')}*
              </label>
              <input type='text' id='form-title' className={`mt-1 block w-full border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerForm('title')} />
              {formErrors.title && <p className='mt-1 text-sm text-red-600'>{formErrors.title.message}</p>}
            </div>
            <div>
              <label htmlFor='form-description' className='block text-sm font-medium text-gray-700'>
                {t('description')}
              </label>
              <textarea id='form-description' rows={3} className={`mt-1 block w-full border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerForm('description')} />
              {formErrors.description && <p className='mt-1 text-sm text-red-600'>{formErrors.description.message}</p>}
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4'>
            <button type='submit' className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'>
              {t('createForm')}
            </button>
            <button
              type='button'
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'
              onClick={() => {
                setShowNewFormModal(false);
                resetFormForm();
              }}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title={editField ? t('editField') : t('addNewField')}
        show={showNewFieldModal}
        onClose={() => {
          setShowNewFieldModal(false);
          setEditField(null);
          resetFieldForm();
          setTempOptions('');
        }}>
        <form onSubmit={handleFieldSubmit(handleAddField)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='field-label' className='block text-sm font-medium text-gray-700'>
                {t('label')}*
              </label>
              <input type='text' id='field-label' className={`mt-1 block w-full border ${fieldErrors.label ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerField('label')} />
              {fieldErrors.label && <p className='mt-1 text-sm text-red-600'>{fieldErrors.label.message}</p>}
            </div>

            {/* <div>
              <label htmlFor='field-key' className='block text-sm font-medium text-gray-700'>
                {t('key')}*
              </label>
              <input type='text' id='field-key' className={`mt-1 block w-full border ${fieldErrors.key ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerField('key')} />
              {fieldErrors.key && <p className='mt-1 text-sm text-red-600'>{fieldErrors.key.message}</p>}
            </div> */}

            <div>
              <label htmlFor='field-placeholder' className='block text-sm font-medium text-gray-700'>
                {t('placeholder')}
              </label>
              <input type='text' id='field-placeholder' className={`mt-1 block w-full border ${fieldErrors.placeholder ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerField('placeholder')} />
              {fieldErrors.placeholder && <p className='mt-1 text-sm text-red-600'>{fieldErrors.placeholder.message}</p>}
            </div>

            <div>
              <label htmlFor='field-type' className='block text-sm font-medium text-gray-700'>
                {t('fieldType')}*
              </label>
              <select id='field-type' className={`mt-1 block w-full border ${fieldErrors.type ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerField('type')}>
                <option value='text'>{t('textInput')}</option>
                <option value='number'>{t('number')}</option>
                <option value='phone'>{t('phoneNumber')}</option>
                <option value='email'>{t('email')}</option>
                <option value='date'>{t('date')}</option>
                <option value='textarea'>{t('textArea')}</option>
                <option value='select'>{t('dropdownSelect')}</option>
                <option value='checkbox'>{t('checkbox')}</option>
                <option value='checklist'>{t('checklist')}</option>
                <option value='radio'>{t('radioButtons')}</option>
                <option value='file'>{t('fileUpload')}</option>
              </select>
              {fieldErrors.type && <p className='mt-1 text-sm text-red-600'>{fieldErrors.type.message}</p>}
            </div>

            {(fieldType === 'radio' || fieldType === 'select' || fieldType === 'checklist') && (
              <div>
                <label htmlFor='field-options' className='block text-sm font-medium text-gray-700'>
                  {t('options')}*
                </label>
                <input type='text' id='field-options' className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500' value={tempOptions} onChange={e => setTempOptions(e.target.value)} placeholder={t('optionsPlaceholder')} required />
                <p className='mt-1 text-sm text-gray-500'>{t('addOptions')}</p>
              </div>
            )}

            <div className='flex items-center'>
              <input id='field-required' type='checkbox' className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer' {...registerField('required')} />
              <label htmlFor='field-required' className='ml-2 block text-sm text-gray-700 cursor-pointer'>
                {t('requiredField')}
              </label>
            </div>
          </div>

          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4'>
            <button type='submit' className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'>
              {editField ? t('updateField') : t('addField')}
            </button>
            <button
              type='button'
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'
              onClick={() => {
                setShowNewFieldModal(false);
                setEditField(null);
                setTempOptions('');
              }}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title={t('createNewUser')}
        show={showNewUserModal}
        onClose={() => {
          setShowNewUserModal(false);
          resetUserForm();
        }}>
        <form onSubmit={handleUserSubmit(handleCreateUser)}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='user-email' className='block text-sm font-medium text-gray-700'>
                {t('identity_document')}*
              </label>
              <input type='text' id='user-email' className={`mt-1 block w-full border ${userErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('email')} />
              {userErrors.email && <p className='mt-1 text-sm text-red-600'>{userErrors.email.message}</p>}
            </div>

            <div className='relative '>
              <label htmlFor='user-password' className='block text-sm font-medium text-gray-700'>
                {t('password')}*
              </label>

              <div className='flex items-center gap-2 mt-1'>
                <div className='w-full relative '>
                  <input type={showPassword ? 'text' : 'password'} id='user-password' className={`block w-full border ${userErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('password')} />
                  <button type='button' onClick={() => setShowPassword(prev => !prev)} title={showPassword ? t('hide_password') : t('show_password')} className='absolute top-1/2 -translate-y-1/2 rtl:left-2 cursor-pointer ltr:right-2  text-gray-500 hover:text-indigo-600'>
                    {showPassword ? <HiEyeOff size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                <button type='button' onClick={handleGeneratePassword} title={t('generate_password')} className=' h-[42px] border border-gray-300 w-[45px] rounded-md shadow-sm flex-none flex items-center justify-center  p-2 bg-gray-100 text-white hover:bg-gray-300 cursor-pointer hover:scale-[1.1] duration-300 '>
                  <img src='reset-password.png' alt='' className='w-full h-fit' />
                </button>
              </div>
              {userErrors.password && <p className='mt-1 text-sm text-red-600'>{userErrors.password.message}</p>}
            </div>

            <div>
              <label htmlFor='user-projectId' className='block text-sm font-medium text-gray-700'>
                {t('project')}*
              </label>
              <select id='user-projectId' className={`mt-1 block w-full border ${userErrors.projectId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('projectId')}>
                <option value=''>-- {t('select_project')} --</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {userErrors.projectId && <p className='mt-1 text-sm text-red-600'>{userErrors.projectId.message}</p>}
            </div>

            <div>
              <label htmlFor='user-role' className='block text-sm font-medium text-gray-700'>
                {t('role')}*
              </label>
              <select id='user-role' className={`mt-1 block w-full border ${userErrors.role ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('role')}>
                <option value='user'>{t('user')}</option>
                <option value='admin'>{t('admin')}</option>
              </select>
              {userErrors.role && <p className='mt-1 text-sm text-red-600'>{userErrors.role.message}</p>}
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4'>
            <button type='submit' className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'>
              {t('createUser')}
            </button>
            <button
              type='button'
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'
              onClick={() => {
                setShowNewUserModal(false);
                resetUserForm();
              }}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title={t('editUser')}
        show={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          resetUserForm();
          setEditingUser(null);
        }}>
        <form onSubmit={handleUserSubmit(data => handleUpdateUser(editingUser.id, data))}>
          <div className='space-y-4'>
            <div>
              <label htmlFor='edit-user-email' className='block text-sm font-medium text-gray-700'>
                {t('identity_document')}*
              </label>
              <input type='text' id='edit-user-email' className={`mt-1 block w-full border ${userErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('email')} />
              {userErrors.email && <p className='mt-1 text-sm text-red-600'>{userErrors.email.message}</p>}
            </div>

            <div className='relative '>
              <label htmlFor='user-password' className='block text-sm font-medium text-gray-700'>
                {t('password')}*
              </label>

              <div className='flex items-center gap-2 mt-1'>
                <div className='w-full relative '>
                  <input type={showPassword ? 'text' : 'password'} id='user-password' className={`block w-full border ${userErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('password')} />
                  <button type='button' onClick={() => setShowPassword(prev => !prev)} title={showPassword ? t('hide_password') : t('show_password')} className='absolute top-1/2 -translate-y-1/2 rtl:left-2 cursor-pointer ltr:right-2  text-gray-500 hover:text-indigo-600'>
                    {showPassword ? <HiEyeOff size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                <button type='button' onClick={handleGeneratePassword} title={t('generate_password')} className=' h-[42px] border border-gray-300 w-[45px] rounded-md shadow-sm flex-none flex items-center justify-center  p-2 bg-gray-100 text-white hover:bg-gray-300 cursor-pointer hover:scale-[1.1] duration-300 '>
                  <img src='reset-password.png' alt='' className='w-full h-fit' />
                </button>
              </div>
              {userErrors.password && <p className='mt-1 text-sm text-red-600'>{userErrors.password.message}</p>}
            </div>

            <div>
              <label htmlFor='user-projectId' className='block text-sm font-medium text-gray-700'>
                {t('project')}*
              </label>
              <select id='user-projectId' className={`mt-1 block w-full border ${userErrors.projectId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('projectId')}>
                <option value=''>-- {t('select_project')} --</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {userErrors.projectId && <p className='mt-1 text-sm text-red-600'>{userErrors.projectId.message}</p>}
            </div>

            {/* <div>
              <label htmlFor='edit-user-password' className='block text-sm font-medium text-gray-700'>
                {t('password')} ({t('optional')})
              </label>
              <input type='password' id='edit-user-password' className={`mt-1 block w-full border ${userErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('password')} />
              {userErrors.password && <p className='mt-1 text-sm text-red-600'>{userErrors.password.message}</p>}
            </div> */}

            <div>
              <label htmlFor='edit-user-role' className='block text-sm font-medium text-gray-700'>
                {t('role')}*
              </label>
              <select id='edit-user-role' className={`mt-1 block w-full border ${userErrors.role ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('role')}>
                <option value='user'>{t('user')}</option>
                <option value='admin'>{t('admin')}</option>
              </select>
              {userErrors.role && <p className='mt-1 text-sm text-red-600'>{userErrors.role.message}</p>}
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4'>
            <button type='submit' className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'>
              {t('updateUser')}
            </button>
            <button
              type='button'
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'
              onClick={() => {
                setShowEditUserModal(false);
                resetUserForm();
                setEditingUser(null);
              }}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal title={t('submissionDetails')} show={!!viewSubmission} onClose={() => setViewSubmission(null)}>
        {viewSubmission && <SubmissionDetails submission={viewSubmission} onClose={() => setViewSubmission(null)} t={t} />}
      </Modal>

      {previewImg && (
        <Modal title={t('imagePreview')} show={!!previewImg} onClose={() => setPreviewImg(null)}>
          <div className='flex items-center justify-center p-4'>
            <img src={previewImg} alt={t('preview')} className='max-w-full max-h-[80vh]' />
          </div>
        </Modal>
      )}

      <Modal title={t('confirmDelete')} show={showDeleteModal.show} onClose={() => setShowDeleteModal({ show: false, id: null, type: null })}>
        <p className='text-gray-600'>{t('cannotUndo')}</p>
        <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4'>
          <button
            type='button'
            className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer'
            onClick={() => {
              if (showDeleteModal.type === 'submission') {
                handleDeleteSubmission(showDeleteModal.id);
              } else if (showDeleteModal.type === 'form') {
                handleDeleteForm(showDeleteModal.id);
              } else if (showDeleteModal.type === 'field') {
                handleDeleteField(showDeleteModal.id);
              } else if (showDeleteModal.type === 'user') {
                handleDeleteUser(showDeleteModal.id);
              }
            }}>
            {t('delete')}
          </button>
          <button type='button' className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer' onClick={() => setShowDeleteModal({ show: false, id: null, type: null })}>
            {t('cancel')}
          </button>
        </div>
      </Modal>

      {showShareModal && <ShareCredentialsModal user={showShareModal} onClose={() => setShowShareModal(null)} t={t} />}
    </div>
  );
}
