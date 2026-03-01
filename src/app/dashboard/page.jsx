
'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { baseImg } from '../../utils/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiTrash2, FiEdit2, FiPlus, FiCheck, FiEye, FiUser, FiFileText, FiList, FiDownload, FiChevronLeft, FiChevronRight, FiEdit3, FiCircle, FiMaximize, FiUpload, FiCopy, FiFile } from 'react-icons/fi';
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
import { Check, Pencil, X } from 'lucide-react';
import EmployeeRequestsTab from '../../components/atoms/EmployeeRequestsTab';

// Translation objects
const translations = {
	en: {
		"confirmDeleteTitle": "Confirm deletion",
		"confirmDeleteSubmission": "Are you sure you want to delete this submission? This action cannot be undone.",
		"delete": "Delete",
		"deleting": "Deleting...",
		"cancel": "Cancel",
		"submissionDeleted": "Submission deleted successfully",
		"deleteSubmissionError": "Failed to delete submission",
		searchWithNationalID: 'Search by National ID',
		"copyUrl": "Copy URL",
		"fileDeleted": "File deleted successfully",
		"deleteError": "Failed to delete file",
		"upload": "Upload",
		"uploadExcel": "Upload Excel",
		"fileManager": "File Manager",
		"yourFiles": "Your Files",
		"fileManagerDescription": "Manage, upload, and organize your files easily",
		"No file chosen": "No file chosen",
		"urlCopied": "URL copied to clipboard!",
		searchUsers: 'Search users...',
		enterValidLimit: 'Please enter a valid limit',
		exportStarted: 'Export completed',
		exportFailed: 'Export failed',
		exportHint: 'Set how many users to include. Current filters (search) will be applied.',
		limit: 'Limit',
		length: 'Length',
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
		// form here translate 
		assignedProject: 'Assigned Project',
		supervisor: 'Supervisor',
		supervisorDashboard: 'Supervisor Dashboard',
		viewAssignedProject: 'View Assigned Project',
		assignedForm: 'Assigned Form',
		select_form: 'Select Form',
		form_required: 'Form is required',
		no_forms_available: 'No forms available',

		type: 'Form Type',
		project_type: 'Project Form',
		employee_request_type: 'Employee Request Form',
		approvalFlow: 'Approval Flow',
		none: 'None (Direct)',
		hr_only: 'HR Only',
		supervisor_only: 'Supervisor Only',
		hr_then_supervisor: 'HR then Supervisor',
		supervisor_then_hr: 'Supervisor then HR',
		employeeRequests: 'Employee Requests',
		pending_hr: 'Pending HR',
		pending_supervisor: 'Pending Supervisor',
		approved: 'Approved',
		rejected: 'Rejected',
		approve: 'Approve',
		reject: 'Reject',
	},
	ar: {
		"confirmDeleteTitle": "تأكيد الحذف",
		"confirmDeleteSubmission": "هل أنت متأكد أنك تريد حذف هذا الإرسال؟ لا يمكن التراجع عن هذا الإجراء.",
		"delete": "حذف",
		"deleting": "جارٍ الحذف...",
		"cancel": "إلغاء",
		"submissionDeleted": "تم حذف الإرسال بنجاح",
		"deleteSubmissionError": "حدث خطأ أثناء حذف الإرسال",
		searchWithNationalID: 'البحث باستخدام رقم الهوية',
		"copyUrl": "نسخ الرابط",
		"fileDeleted": "تم حذف الملف بنجاح",
		"deleteError": "فشل في حذف الملف",
		"upload": "رفع",
		"uploadExcel": "رفع إكسل",
		"fileManager": "مدير الملفات",
		"yourFiles": "ملفاتك",
		"fileManagerDescription": "إدارة ورفع وتنظيم ملفاتك بسهولة",
		"No file chosen": "لم يتم اختيار ملف",
		"urlCopied": "تم نسخ الرابط",
		searchUsers: 'ابحث عن المستخدمين...',
		enterValidLimit: 'من فضلك أدخل حدًا صالحًا',
		exportStarted: 'تم إكمال التصدير',
		exportFailed: 'فشل التصدير',
		exportHint: 'حدد عدد المستخدمين المطلوب تضمينهم. سيتم تطبيق عوامل التصفية الحالية (البحث).',
		limit: 'الحد',
		length: 'المدة',
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
		assignedProject: 'المشروع المعيّن',
		supervisor: 'مسؤول عن مشروع',
		supervisorDashboard: 'لوحة تحكم المشرف',
		viewAssignedProject: 'عرض المشروع المعيّن',
		assignedForm: 'النموذج المعيّن',
		select_form: 'اختر النموذج',
		form_required: 'النموذج مطلوب',
		no_forms_available: 'لا توجد نماذج متاحة',

		type: 'نوع النموذج',
		project_type: 'نموذج مشروع',
		employee_request_type: 'نموذج طلب موظف',
		approvalFlow: 'مسار الاعتماد',
		none: 'بدون (مباشر)',
		hr_only: 'الموارد البشرية فقط',
		supervisor_only: 'المشرف المباشر فقط',
		hr_then_supervisor: 'الموارد البشرية ثم المشرف',
		supervisor_then_hr: 'المشرف ثم الموارد البشرية',
		employeeRequests: 'طلبات الموظفين',
		pending_hr: 'بانتظار الموارد البشرية',
		pending_supervisor: 'بانتظار المشرف',
		approved: 'مقبول',
		rejected: 'مرفوض',
		approve: 'موافقة',
		reject: 'رفض',
	},
};

const userSchema = yup.object().shape({
	// name: yup.string().required('Name is required'),
	email: yup.string().required('National ID is required').matches(/^\d+$/, 'National ID must contain only digits').length(10, 'National ID must be exactly 10 digits long'),
	projectId: yup.number().typeError('Project ID must be a number').required('Project ID is required'),
	projectName: yup.string().optional(), // Added Project Name
	password: yup.string().min(6, 'Password must be at least 6 characters').optional(),
	role: yup.string().oneOf(['admin', 'user', 'supervisor'], 'Invalid role').required('Role is required'),
	formId: yup
		.number()
		.typeError('Form ID must be a number')
		.nullable()
		.when('role', {
			is: 'user',
			then: (schema) => schema.required('Form is required for users'),
			otherwise: (schema) => schema.optional().nullable()
		}),
});

const formSchema = yup.object().shape({
	title: yup.string().required('Title is required'),
	description: yup.string(),
	type: yup.string().oneOf(['project', 'employee_request']).default('project'),
	approvalFlow: yup.string().nullable().oneOf(['none', 'hr_only', 'supervisor_only', 'hr_then_supervisor', 'supervisor_then_hr']).default('none'),
});

const fieldSchema = yup.object().shape({
	label: yup.string().required('Label is required'),
	// key: yup.string().required('Key is required'),
	placeholder: yup.string(), // Now optional (no .required())
	type: yup.string().required('Type is required'),
	required: yup.boolean(),
	length: yup.number().nullable().transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value)),
});


const IMG_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'];

const getUrlExt = (url = '') => {
	const clean = String(url).split('?')[0].split('#')[0];
	const last = clean.split('/').pop() || '';
	const dot = last.lastIndexOf('.');
	return dot >= 0 ? last.slice(dot + 1).toLowerCase() : '';
};

const isImageByExt = (url = '') => IMG_EXTS.includes(getUrlExt(url));

const toFileUrl = (value, baseImg) => {
	if (!value) return '';
	if (String(value).startsWith('http')) return String(value);
	return baseImg + String(value);
};


const SubmissionDetails = ({ submission, onClose, t }) => {
	if (!submission) return null;


	const renderFileLike = (rawUrl) => {
		const url = typeof rawUrl === 'string' ? rawUrl : '';
		if (!url) return null;

		const fullUrl = toFileUrl(url, baseImg); // لو عندك baseImg في الملف (import)
		const isImg = isImageByExt(url) || isImageByExt(fullUrl);

		if (isImg) {
			// صورة
			return (
				<a href={fullUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
					<img
						src={fullUrl}
						alt="Uploaded content"
						className="h-24 w-24 object-contain rounded border border-slate-200 bg-white p-1"
					/>
				</a>
			);
		}

		// ملف مش صورة
		return (
			<div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
				<div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
					<FiFile className="h-5 w-5 text-gray-500" />
				</div>
				<div className="flex flex-col">
					<span className="text-xs text-gray-700 break-all">{url}</span>
					<a
						href={fullUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-indigo-600 hover:underline w-fit"
					>
						Open / Download
					</a>
				</div>
			</div>
		);
	};


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
						{Object.entries(submission.answers)
							.filter(([question]) => !String(question).toLowerCase().endsWith('_asset'))
							.map(([question, answer]) => (

								<tr key={question}>
									<td className='whitespace-normal py-2 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-6'>{question}</td>
									<td className='px-3 py-2 text-xs text-gray-500'>
										{Array.isArray(answer) ? (
											<ul className='list-disc pl-5 space-y-1'>
												{answer.map((item, i) => (
													<li key={i}>{item}</li>
												))}
											</ul>
										) : typeof answer === 'string' && answer.startsWith('uploads/') ? (
											renderFileLike(answer)
										) : answer ? (
											typeof answer === 'string' && answer.startsWith('uploads') ? (
												renderFileLike(answer)
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
	const [uploadingFormId, setUploadingFormId] = useState(null);
	const templateFileInputRef = useRef(null);
	const [currentUploadFormId, setCurrentUploadFormId] = useState(null);
	const [showFileManagerModal, setShowFileManagerModal] = useState(false);
	const [userAssets, setUserAssets] = useState([]);
	const [uploadingFile, setUploadingFile] = useState(false);
	const fileUploadInputRef = useRef(null);
	const [deletingSubmissions, setDeletingSubmissions] = useState({});
	const t = key => translations[language][key] || key;
	const [subSearch, setSubSearch] = useState('');
	const [editingFormId, setEditingFormId] = useState(null);
	const [editedTitle, setEditedTitle] = useState('');
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		submissionId: null,
	});


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
		watch,
		formState: { errors: userErrors },
		reset: resetUserForm,
	} = useForm({
		resolver: yupResolver(userSchema),
	});

	const {
		register: registerForm,
		handleSubmit: handleFormSubmit,
		watch: watchForm,
		formState: { errors: formErrors },
		reset: resetFormForm,
	} = useForm({
		resolver: yupResolver(formSchema),
		defaultValues: {
			type: 'project',
			approvalFlow: 'none',
		}
	});

	const formType = watchForm('type');

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
		localStorage.setItem('adminActiveTab', activeTab);
	}, [activeTab]);

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
		...(subSearch.trim() && { search: subSearch.trim() }),

	});

	useEffect(() => {
		if (activeTab === 'submissions') {
			setCurrentPage(1);
			fetchData();
		}
	}, [subSearch]);

	const fetchData = async () => {
		if (!user) return
		try {
			setIsLoading(prev => ({ ...prev, [activeTab]: true }));
			const url = user?.role == "supervisor" ? "/forms/supervisor?limit=1000" : '/forms?limit=1000'
			const formsRes = await api.get(url);
			setForms(formsRes.data.data || formsRes.data);

			if (activeTab === 'forms') {
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
	}, [user, selectedFormId, selectedLimit, selectedProjectId, currentPage]);

	const [projects, setProjects] = useState([]);

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				let baseUrl = process.env.NEST_PUBLIC_BASE_URL_2 || '';
				if (baseUrl && !baseUrl.startsWith('http')) {
					baseUrl = `https://${baseUrl}`;
				}
				// Remove trailing slash if present to avoid double slash
				baseUrl = baseUrl.replace(/\/+$/, '');

				const res = await fetch(`${baseUrl}/clients?limit=2000`);
				const data = await res.json();
				console.log(data.data)
				setProjects(data.data); // ✅ نأخذ data فقط 
			} catch (error) {
				console.error('Failed to fetch projects:', error);
			}
		};

		fetchProjects();
	}, []);


	const [clients, setClients] = useState([]);
	useEffect(() => {
		const fetchClientsForFilter = async () => {
			try {
				const res = await api.get('/projects?limit=10000');
				setClients(res.data?.data || res.data || []);
			} catch (error) {
				console.error('Failed to fetch clients for filter:', error);
			}
		};
		fetchClientsForFilter();
	}, []);

	useEffect(() => {
		fetchData();
	}, [user, currentPage, currentUserPage, activeTab]);

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
				type: formData.type || 'project',
				approvalFlow: formData.approvalFlow || 'none',
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
			const keyExists = selectedForm?.fields?.some(field => field.key === fieldKey);
			const currentFields = Array.isArray(selectedForm?.fields) ? selectedForm.fields : [];

			if (keyExists && !editField) {
				toast.error(t('fieldKeyAlreadyExists') || 'Cannot add field: key already exists.');
				return;
			}

			const fieldToAdd = {
				...fieldData,
				key: fieldKey,
				options: fieldData.type === 'radio' || fieldData.type === 'checklist' || fieldData.type === 'select' ? tempOptions.split(',').map(opt => opt.trim()) : [],
			};
			if (!editField) fieldToAdd.order = currentFields.length + 1;


			let updatedFields;
			if (editField) {
				updatedFields = currentFields.map(f => (f.id === editField.id ? { ...f, ...fieldToAdd } : f));
			} else {
				const response = await api.post(`/forms/${selectedForm.id}/fields`, { fields: [fieldToAdd] });
				const returned = response.data?.fields ?? response.data ?? [];
				const returnedArr = Array.isArray(returned) ? returned : [returned];

				updatedFields = [...currentFields, ...returnedArr];
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
			// Find selected project to get clientName
			const selectedProject = projects.find(p => String(p.id) === String(userData.projectId));
			const payload = {
				...userData,
				projectName: selectedProject ? selectedProject.clientName : undefined
			};

			const response = await api.post('/auth/create-user', payload);
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
		setFieldValue('length', field.length);
		if (field.options) {
			setTempOptions(field.options.join(', '));
		}
		setShowNewFieldModal(true);
	};

	const fetchUserAssets = async () => {
		try {
			const response = await api.get('/assets');
			setUserAssets(response.data?.data || []);
		} catch (error) {
			console.error('Failed to fetch assets:', error);
		}
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			toast.error(t('fileSizeError') || 'File size must be less than 5MB');
			return;
		}

		try {
			setUploadingFile(true);
			const formData = new FormData();
			formData.append('file', file);

			const response = await api.post('/assets', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			setUserAssets(prev => [...prev, response.data]);
			toast.success(t('fileUploaded') || 'File uploaded successfully');
		} catch (error) {
			toast.error(t('fileUploadError') || 'Failed to upload file');
			console.error('Upload failed:', error);
		} finally {
			setUploadingFile(false);
			if (fileUploadInputRef.current) {
				fileUploadInputRef.current.value = '';
			}
		}
	};

	const extractUploadsPath = (url) => {
		const normalized = url.replace(/\\/g, '/');
		const index = normalized.indexOf('uploads');
		if (index === -1) return normalized;
		return normalized.slice(index);
	};
	const copyFileUrl = async (url) => {
		try {
			const uploadsPath = extractUploadsPath(url);

			await navigator.clipboard.writeText(uploadsPath);
			toast.success(t('urlCopied') || 'URL copied to clipboard!');
		} catch (error) {
			const uploadsPath = extractUploadsPath(url);

			const textArea = document.createElement('textarea');
			textArea.value = uploadsPath;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);

			toast.success(t('urlCopied') || 'URL copied to clipboard!');
		}
	};



	useEffect(() => {
		if (showFileManagerModal) {
			fetchUserAssets();
		}
	}, [showFileManagerModal]);

	const handleDownloadFormTemplate = async (form) => {
		try {
			if (!form || !form.fields || form.fields.length === 0) {
				toast.error(t('formHasNoFields') || 'This form has no fields');
				return;
			}

			// Create headers: User ID + all form field keys
			const headers = ['User ID'];
			form.fields?.forEach(field => {
				headers.push(field.label || field.key);
			});

			// Create example row
			const getExampleValue = (field) => {
				const key = field.key?.toLowerCase() || '';
				const label = field.label?.toLowerCase() || '';

				switch (field.type) {
					case 'text':
						if (key.includes('name') || label.includes('اسم')) return 'Ahmed Al-Qahtani';
						if (key.includes('nationality') || label.includes('الجنسية')) return 'Saudi';
						if (key.includes('religion') || label.includes('الديانة')) return 'Islam';
						if (key.includes('city') || label.includes('المدينة')) return 'Riyadh';
						if (key.includes('address') || label.includes('العنوان')) return 'King Fahd Road, Riyadh';
						if (key.includes('iban')) return 'SA4420000001234567891234';
						if (key.includes('bank')) return 'Saudi National Bank';
						if (key.includes('project')) return 'NEOM Project';
						if (key.includes('passport')) return 'A12345678';
						return 'Sample text';

					case 'email':
						return 'employee@example.com';

					case 'phone':
						return '0501234567';

					case 'number':
						if (key.includes('age') || label.includes('العمر')) return '30';
						return '1';

					case 'date':
						return '2024-01-01';

					case 'radio':
					case 'select':
						return field.options?.[0] || '';

					case 'checkbox':
						return 'true';

					case 'file':
						return 'sample-file.pdf';

					case 'textarea':
						return 'This is a sample long text address or description';

					default:
						return '';
				}
			};

			const exampleRow = ['1'];
			form.fields?.forEach(field => {
				exampleRow.push(getExampleValue(field));
			});

			const wsData = [headers, exampleRow];

			// Create forms reference sheet
			const formSheetData = [['Form ID', 'Form Title']];
			forms.forEach(f => {
				formSheetData.push([f.id, f.title]);
			});

			// Create users reference sheet - Fetch all users for the form's project
			const userSheetData = [['User ID', 'National ID', 'Project Name', 'Project ID']];

			try {
				// Fetch all users (you might want to paginate or filter by project)
				const usersRes = await api.get('/users?limit=1000'); // Adjust limit as needed
				const allUsers = usersRes.data.data || usersRes.data || [];

				// Filter users by project if form has a project association
				// Or you can show all users and let the admin choose
				allUsers.forEach(user => {
					userSheetData.push([
						user.id,
						user.email || '', // National ID from email field
						user.project?.name || 'N/A',
						user.projectId || 'N/A'
					]);
				});
			} catch (error) {
				console.error('Failed to fetch users for template:', error);
				// Add a placeholder row if fetch fails
				userSheetData.push(['1', '1234567890', 'Sample Project', '1']);
			}

			const wb = XLSX.utils.book_new();
			const templateSheet = XLSX.utils.aoa_to_sheet(wsData);
			const formSheet = XLSX.utils.aoa_to_sheet(formSheetData);
			const userSheet = XLSX.utils.aoa_to_sheet(userSheetData);

			// Set column widths for template sheet
			const templateColWidths = [{ wch: 25 }]; // User ID column
			form.fields?.forEach(() => {
				templateColWidths.push({ wch: 20 });
			});
			templateSheet['!cols'] = templateColWidths;

			// Set column widths for forms sheet
			const formColWidths = [
				{ wch: 10 }, // ID
				{ wch: 30 }  // Form Title
			];
			formSheet['!cols'] = formColWidths;

			// Set column widths for users sheet
			const userColWidths = [
				{ wch: 10 }, // User ID
				{ wch: 15 }, // National ID
				{ wch: 30 }, // Project Name
				{ wch: 10 }  // Project ID
			];
			userSheet['!cols'] = userColWidths;

			XLSX.utils.book_append_sheet(wb, templateSheet, 'Template');
			XLSX.utils.book_append_sheet(wb, formSheet, 'Forms');
			XLSX.utils.book_append_sheet(wb, userSheet, 'Users');

			XLSX.writeFile(wb, `${form.title || 'form'}_template.xlsx`);
			toast.success(t('templateDownloaded') || 'Template downloaded successfully');
		} catch (error) {
			console.error('Failed to download template:', error);
			toast.error(t('downloadTemplateError') || 'Failed to download template');
		}
	};

	const handleUploadFormTemplate = async (event, formId) => {
		const file = event.target.files[0];
		if (!file) return;

		setUploadingFormId(formId);
		setCurrentUploadFormId(formId);

		try {
			const data = await file.arrayBuffer();
			const workbook = XLSX.read(data, { type: 'array' });
			const sheet = workbook.Sheets['Template'] || workbook.Sheets[workbook.SheetNames[0]];
			const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

			if (jsonData.length === 0) {
				toast.error(t('emptyFile') || 'The Excel file is empty');
				setUploadingFormId(null);
				event.target.value = '';
				return;
			}

			const form = forms.find(f => f.id === formId);
			if (!form) {
				toast.error(t('formNotFound') || 'Form not found');
				setUploadingFormId(null);
				event.target.value = '';
				return;
			}

			// Get field keys from form
			const fieldKeys = form.fields?.map(f => f.key) || [];
			const userIdKey = Object.keys(jsonData[0]).find(key =>
				key.toLowerCase().includes('user') && key.toLowerCase().includes('id')
			);

			if (!userIdKey) {
				toast.error(t('userIdColumnNotFound') || 'User ID column not found in the file');
				setUploadingFormId(null);
				event.target.value = '';
				return;
			}

			const submissions = [];
			const errors = [];

			jsonData.forEach((row, index) => {
				const rowNumber = index + 2;
				const userId = row[userIdKey];

				// Validate User ID (always required)
				if (!userId || String(userId).trim() === '') {
					errors.push(`Row ${rowNumber}: Missing User ID (required)`);
					return;
				}


				// Build answers object from form fields
				const answers = {};
				fieldKeys.forEach(key => {
					// Find the column that matches this field's label or key
					const field = form.fields?.find(f => f.key === key);
					const columnKey = Object.keys(row).find(colKey => {
						const normalizedCol = colKey.toLowerCase().trim();
						const normalizedLabel = (field?.label || '').toLowerCase().trim();
						const normalizedKey = key.toLowerCase().trim();
						return normalizedCol === normalizedLabel || normalizedCol === normalizedKey;
					});

					// Only validate required fields
					if (field?.required) {
						if (!columnKey || row[columnKey] === undefined || row[columnKey] === '') {
							errors.push(`Row ${rowNumber}: Missing required field "${field.label || key}"`);
							return;
						}
					}

					// Add value if it exists (for both required and optional fields)s

					if (columnKey && row[columnKey] !== undefined && row[columnKey] !== '') {
						let value = row[columnKey];

						// Handle different field types
						if (field?.type === 'checkbox') {
							value = value === true || value === 'true' || value === 'TRUE' || value === 1 || value === '1';
						} else if (field?.type === 'number') {
							value = parseFloat(value);
							if (isNaN(value)) {
								errors.push(`Row ${rowNumber}: Invalid number for field "${field.label || key}"`);
								return;
							}
						} else if (field?.type === 'date') {
							// Keep date as string, backend will handle it
							value = String(value);
						} else {
							value = String(value);
						}

						answers[key] = value;
					}
				});

				const userIdNum = parseInt(String(userId));
				if (isNaN(userIdNum)) {
					errors.push(`Row ${rowNumber}: User ID must be a number`);
					return;
				}

				submissions.push({
					userId: userIdNum,
					answers,
					form_id: String(formId),
				});
			});

			if (errors.length > 0) {
				errors.forEach(err => toast.error(err));
				setUploadingFormId(null);
				event.target.value = '';
				return;
			}

			if (submissions.length === 0) {
				toast.error(t('noValidSubmissions') || 'No valid submissions found in the file');
				setUploadingFormId(null);
				event.target.value = '';
				return;
			}

			// Upload to backend
			const response = await api.post('/form-submissions/bulk-upload', { submissions });
			const { results } = response.data;

			let successCount = 0;
			let failCount = 0;

			results.forEach(result => {
				if (result.status === 'failed') {
					failCount++;
					toast.error(`${result.email}: ${result.reason}`);
				} else {
					successCount++;
				}
			});

			if (successCount > 0) {
				toast.success(`${successCount} submission(s) ${results[0]?.status === 'updated' ? 'updated' : 'created'} successfully`);
			}

			if (failCount > 0) {
				toast.error(`${failCount} submission(s) failed`);
			}

			// Refresh submissions if on submissions tab
			if (activeTab === 'submissions') {
				fetchData();
			}

		} catch (err) {
			console.error('Upload error:', err);
			toast.error(err.response?.data?.message || t('uploadError') || 'Failed to upload submissions');
		} finally {
			setUploadingFormId(null);
			setCurrentUploadFormId(null);
			event.target.value = '';
		}
	};

	const exportToExcel = async () => {
		try {
			setIsExporting(true);
			const response = await api.get(`/form-submissions?limit=100000`);

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


	const IMG_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'];

	const getUrlExt = (url = '') => {
		try {
			const clean = String(url).split('?')[0].split('#')[0];
			const last = clean.split('/').pop() || '';
			const dot = last.lastIndexOf('.');
			return dot >= 0 ? last.slice(dot + 1).toLowerCase() : '';
		} catch {
			return '';
		}
	};

	const isImageUrlByExt = (url = '') => IMG_EXTS.includes(getUrlExt(url));

	const renderSubmissionTable = () => {
		const requestDeleteSubmission = (submissionId) => {
			setDeletePopup({ open: true, submissionId });
		};

		const handleDeleteConfirmed = async () => {
			const submissionId = deletePopup.submissionId;
			if (!submissionId) return;
			setDeletingSubmissions(prev => ({ ...prev, [submissionId]: true }));

			try {
				await api.delete(`/form-submissions/${submissionId}`);

				// Remove from local state (استخدم functional update لتجنب stale state)
				setSubmissions(prev => prev.filter(s => s.id !== submissionId));

				toast.success(t('submissionDeleted'));
				setDeletePopup({ open: false, submissionId: null });
			} catch (error) {
				console.error('Failed to delete submission:', error);
				toast.error(error.response?.data?.message || t('deleteSubmissionError'));
			} finally {
				setDeletingSubmissions(prev => ({ ...prev, [submissionId]: false }));
			}
		};


		if (isLoading.submissions) return <SkeletonLoader count={5} />;
		const q = subSearch.trim().toLowerCase();

		const filteredSubmissions = submissions.filter((s) => {
			if (!q) return true;

			// search by user national id (email field)
			const userEmail = (s?.user?.email || '').toLowerCase();

			// search by project name
			const projectName = (s?.user?.project?.name || '').toLowerCase();

			// search inside answers (any value)
			const answersText = Object.values(s?.answers || {})
				.map(v => (typeof v === 'string' ? v : JSON.stringify(v)))
				.join(' ')
				.toLowerCase();

			return (
				userEmail.includes(q) ||
				projectName.includes(q) ||
				answersText.includes(q)
			);
		});

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
												<input
													type='checkbox'
													checked={submission.isCheck}
													onChange={() => markSubmissionReviewed(submission.id, !submission.isCheck)}
													className='absolute opacity-0 h-0 w-0'
													disabled={deletingSubmissions[submission.id]} // Disable when deleting
												/>
												<div className={`relative w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${submission.isCheck ? 'bg-indigo-600 border-indigo-700' : 'bg-white border-gray-300 hover:border-gray-400'} ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
													{submission.isCheck && <FiCheck className='w-3.5 h-3.5 text-white' strokeWidth={3} />}
												</div>
												<span className={`ml-2 text-sm ${submission.isCheck ? 'text-indigo-700 font-medium' : 'text-gray-500'} ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
													{submission.isCheck ? t('reviewed') : t('markReviewed')}
												</span>
											</label>
										</div>
									</td>
									<td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
										{submission?.user?.email}
									</td>
									<td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
										{submission?.user?.project?.name || 'N/A'}
									</td>

									{allKeys.map(key => {
										const value = submission.answers[key];
										let content = 'N/A';
										if (key.endsWith('_asset')) return null;
										if (value) {
											if (typeof value === 'string' && value.startsWith('upload')) {
												const fileUrl = baseImg + value; // ده الرابط النهائي

												const showImg = isImageUrlByExt(fileUrl); // ✅ صورة لو ext معروف
												// لو عايز الشرط يبقى "لو مفيش ext اعرض ايقونة" فقط:
												// const showImg = !hasNoExt(fileUrl);  ❌ (ده يعرض صور حتى لو pdf)
												// الأفضل: showImg حسب ext

												content = showImg ? (
													<div className={`relative group w-10 h-10 ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
														<img
															src={fileUrl}
															alt="Uploaded"
															className="h-full w-full rounded object-cover border border-gray-300 cursor-pointer"
															onClick={() => !deletingSubmissions[submission.id] && setPreviewImg(fileUrl)}
														/>
														<div
															onClick={() => !deletingSubmissions[submission.id] && setPreviewImg(fileUrl)}
															className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
														>
															<FiMaximize className="w-5 h-5" />
														</div>
													</div>
												) : (
													<div className="flex items-center gap-2">

														<a
															href={fileUrl}
															download
															className="inline-flex items-center justify-center w-10 h-10 rounded bg-indigo-600 text-white hover:bg-indigo-700"
															title="Download"
														>
															<FiDownload className="w-4 h-4" />
														</a>
													</div>
												);
											}
											else if (typeof value === 'object' && value !== null) {
												if (value.url) {
													const fileUrl = value.url.startsWith('http') ? value.url : (baseImg + value.url);
													const showImg = isImageUrlByExt(fileUrl);

													content = showImg ? (
														<div className={`relative group w-10 h-10 ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
															<img
																src={fileUrl}
																alt="Uploaded"
																className="h-full w-full rounded object-cover border border-gray-300 cursor-pointer"
																onClick={() => !deletingSubmissions[submission.id] && setPreviewImg(fileUrl)}
															/>
															<div
																onClick={() => !deletingSubmissions[submission.id] && setPreviewImg(fileUrl)}
																className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
															>
																<FiMaximize className="w-5 h-5" />
															</div>
														</div>
													) : (
														<div className="flex items-center gap-2">
															<a
																href={fileUrl}
																download
																className="inline-flex items-center justify-center w-9 h-9 rounded bg-indigo-600 text-white hover:bg-indigo-700"
																title="Download"
															>
																<FiDownload className="w-4 h-4" />
															</a>
														</div>
													);
												}
												else {
													content = (
														<ul className={`list-disc list-inside space-y-1 text-xs text-gray-700 ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
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
											<td key={key} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
												{content}
											</td>
										);
									})}
									<td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${deletingSubmissions[submission.id] ? 'opacity-50' : ''}`}>
										{new Date(submission.created_at).toLocaleString()}
									</td>

									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
										<button
											onClick={() => requestDeleteSubmission(submission.id)}

											disabled={deletingSubmissions[submission.id]}
											className={`text-red-600 hover:text-red-900 cursor-pointer flex items-center justify-center ${deletingSubmissions[submission.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
											title={t('delete')}
										>
											{deletingSubmissions[submission.id] ? (
												<svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
											) : (
												<FiTrash2 className='h-4 w-4' />
											)}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div dir='ltr' className='flex items-center justify-center mt-8 space-x-1'>
					<button
						onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
						disabled={currentPage === 1 || Object.values(deletingSubmissions).some(v => v)}
						className='p-2 !rounded-full w-[30px] h-[30px] flex items-center justify-center border border-gray-300  text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
					>
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
							<button
								key={pageNum}
								onClick={() => setCurrentPage(pageNum)}
								disabled={Object.values(deletingSubmissions).some(v => v)}
								className={`!rounded-full w-[30px] h-[30px] flex items-center justify-center text-sm ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${Object.values(deletingSubmissions).some(v => v) ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								{pageNum}
							</button>
						);
					})}

					<button
						onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
						disabled={currentPage === totalPages || Object.values(deletingSubmissions).some(v => v)}
						className='p-2 border border-gray-300 !rounded-full w-[30px] h-[30px] flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
					>
						<FiChevronRight className='h-4 w-4' />
					</button>
				</div>


				{deletePopup.open && (
					<div className="fixed inset-0 z-50 flex items-center justify-center">
						{/* Backdrop */}
						<button
							className="absolute inset-0 bg-black/40"
							onClick={() => setDeletePopup({ open: false, submissionId: null })}
							aria-label="Close"
						/>

						{/* Modal */}
						<div className="relative w-[92vw] max-w-md rounded-2xl bg-white shadow-xl">
							<div className="p-5">
								<h3 className="text-base font-semibold text-slate-900">
									{t('confirmDeleteTitle') || 'Confirm delete'}
								</h3>

								<p className="mt-2 text-sm text-slate-600">
									{t('confirmDeleteSubmission') || 'Are you sure you want to delete this submission?'}
								</p>

								<div className="mt-5 flex items-center justify-end gap-2">
									<button
										onClick={() => setDeletePopup({ open: false, submissionId: null })}
										className="h-9 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
										disabled={deletingSubmissions[deletePopup.submissionId]}
									>
										{t('cancel') || 'Cancel'}
									</button>

									<button
										onClick={handleDeleteConfirmed}
										className="h-9 rounded-lg bg-rose-600 px-3 text-sm font-semibold text-white hover:bg-rose-700 active:scale-[0.98] transition disabled:opacity-60"
										disabled={deletingSubmissions[deletePopup.submissionId]}
									>
										{deletingSubmissions[deletePopup.submissionId]
											? (t('deleting') || 'Deleting...')
											: (t('delete') || 'Delete')}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

			</>
		);
	};

	const handleDeleteAsset = async (assetId) => {
		if (!confirm(t('confirmDelete') || 'Are you sure you want to delete this file?')) {
			return;
		}

		try {
			await api.delete(`/assets/${assetId}`);

			// Remove from local state
			setUserAssets(prev => prev.filter(asset => asset.id !== assetId));

			toast.success(t('fileDeleted') || 'File deleted successfully');
		} catch (error) {
			console.error('Failed to delete asset:', error);
			toast.error(t('deleteError') || 'Failed to delete file');
		}
	};


	const q = subSearch.trim().toLowerCase();
	const filteredCount = submissions.filter((s) => {
		if (!q) return true;
		const userEmail = (s?.user?.email || '').toLowerCase();
		const projectName = (s?.user?.project?.name || '').toLowerCase();
		const answersText = Object.values(s?.answers || {})
			.map(v => (typeof v === 'string' ? v : JSON.stringify(v)))
			.join(' ')
			.toLowerCase();
		return userEmail.includes(q) || projectName.includes(q) || answersText.includes(q);
	}).length;


	const handleSaveTitle = async (formId) => {
		if (!editedTitle.trim()) return;

		try {
			await api.patch(`/forms/${formId}/title`, {
				title: editedTitle,
			});

			toast.success('تم تحديث عنوان النموذج');

			// تحديث الواجهة
			setForms((prev) =>
				prev.map((f) =>
					f.id === formId ? { ...f, title: editedTitle } : f
				)
			);

			setEditingFormId(null);
		} catch (error) {
			toast.error('فشل تحديث العنوان');
		}
	};


	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100' dir={language === 'ar' ? 'rtl' : 'ltr'}>
			{/* Premium Header Design */}
			<header className='bg-gradient-to-r from-white to-gray-50 shadow-lg sticky top-0 z-40 border-b-2 border-gray-200'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
					<div className='flex items-center justify-between'>
						{/* Left Section - Enhanced */}
						<div className='flex items-center gap-4'>
							<div className='hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 shadow-xl shadow-indigo-200'>
								<svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
								</svg>
							</div>
							<div className='flex flex-col leading-tight'>
								<h1 className='text-md font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
									{t('dashboard')}
								</h1>
								<div className='flex items-center gap-2 text-sm mt-1'>
									<span className='text-gray-600'>{t('welcome')},</span>
									<div className='flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 rounded-lg border border-indigo-200'>
										<div className='w-2 h-2 rounded-full bg-indigo-600 animate-pulse'></div>
										<span className='font-bold text-indigo-700 font-[Inter]'>{user?.name}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Right Section - Enhanced */}
						<div className='flex items-center gap-3'>
							<LanguageToggle
								IsFixed={false}
								onToggle={toggleLanguage}
								currentLang={language}
								languages={translations}
							/>

							<LogoutButton
								IsFixed={false}
								onClick={logout}
								label={t('logout')}
								position={{ top: '1rem', right: '5rem' }}
								className='h-12 z-50'
								showText={false}
							/>

							{/* Enhanced Mobile Menu Button */}
							<button
								className='md:hidden p-3 text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-500 border-2 border-gray-200 hover:border-indigo-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								aria-label="Toggle menu"
							>
								{isMobileMenuOpen ? (
									<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
									</svg>
								) : (
									<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M4 6h16M4 12h16M4 18h16' />
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Premium Mobile Menu */}
			{isMobileMenuOpen && (
				<>
					{/* Backdrop */}
					<div
						className='md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30 animate-fadeIn'
						onClick={() => setIsMobileMenuOpen(false)}
					/>

					{/* Menu Panel */}
					<div className='md:hidden fixed top-[98px] left-0 right-0 bg-white shadow-2xl border-b-2 border-gray-200 z-40 animate-slideDown'>
						<div className='px-4 py-4 space-y-2 max-h-[calc(100vh-72px)] overflow-y-auto'>
							<button
								onClick={() => {
									setActiveTab('forms');
									setIsMobileMenuOpen(false);
								}}
								className={`group relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 overflow-hidden ${activeTab === 'forms'
									? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200'
									: 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100/50 hover:text-indigo-700 border-2 border-transparent hover:border-indigo-200'
									}`}
							>
								<div className={`p-1.5 rounded-lg ${activeTab === 'forms' ? 'bg-white/20' : 'bg-indigo-100'}`}>
									<FiFileText className={`h-4 w-4 ${activeTab === 'forms' ? 'text-white' : 'text-indigo-600 group-hover:scale-110 transition-transform'}`} />
								</div>
								<span>{t('formsManagement')}</span>
								{activeTab === 'forms' && (
									<div className='absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse'></div>
								)}
							</button>

							<button
								onClick={() => {
									setActiveTab('submissions');
									setIsMobileMenuOpen(false);
								}}
								className={`group relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 overflow-hidden ${activeTab === 'submissions'
									? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200'
									: 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100/50 hover:text-indigo-700 border-2 border-transparent hover:border-indigo-200'
									}`}
							>
								<div className={`p-1.5 rounded-lg ${activeTab === 'submissions' ? 'bg-white/20' : 'bg-indigo-100'}`}>
									<FiList className={`h-4 w-4 ${activeTab === 'submissions' ? 'text-white' : 'text-indigo-600 group-hover:scale-110 transition-transform'}`} />
								</div>
								<span>{t('submissions')}</span>
								{activeTab === 'submissions' && (
									<div className='absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse'></div>
								)}
							</button>

							<button
								onClick={() => {
									setActiveTab('users');
									setIsMobileMenuOpen(false);
								}}
								className={`group relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 overflow-hidden ${activeTab === 'users'
									? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200'
									: 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100/50 hover:text-indigo-700 border-2 border-transparent hover:border-indigo-200'
									}`}
							>
								<div className={`p-1.5 rounded-lg ${activeTab === 'users' ? 'bg-white/20' : 'bg-indigo-100'}`}>
									<FiUser className={`h-4 w-4 ${activeTab === 'users' ? 'text-white' : 'text-indigo-600 group-hover:scale-110 transition-transform'}`} />
								</div>
								<span>{t('users')}</span>
								{activeTab === 'users' && (
									<div className='absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse'></div>
								)}
							</button>

							<button
								onClick={() => {
									setActiveTab('projects');
									setIsMobileMenuOpen(false);
								}}
								className={`group relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 overflow-hidden ${activeTab === 'projects'
									? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200'
									: 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100/50 hover:text-indigo-700 border-2 border-transparent hover:border-indigo-200'
									}`}
							>
								<div className={`p-1.5 rounded-lg ${activeTab === 'projects' ? 'bg-white/20' : 'bg-indigo-100'}`}>
									<FiUser className={`h-4 w-4 ${activeTab === 'projects' ? 'text-white' : 'text-indigo-600 group-hover:scale-110 transition-transform'}`} />
								</div>
								<span>{t('projects')}</span>
								{activeTab === 'projects' && (
									<div className='absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse'></div>
								)}
							</button> 

							<button
								onClick={() => {
									setActiveTab('employeeRequests');
									setIsMobileMenuOpen(false);
								}}
								className={`group relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 overflow-hidden ${activeTab === 'employeeRequests'
									? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200'
									: 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100/50 hover:text-indigo-700 border-2 border-transparent hover:border-indigo-200'
									}`}
							>
								<div className={`p-1.5 rounded-lg ${activeTab === 'employeeRequests' ? 'bg-white/20' : 'bg-indigo-100'}`}>
									<FiList className={`h-4 w-4 ${activeTab === 'employeeRequests' ? 'text-white' : 'text-indigo-600 group-hover:scale-110 transition-transform'}`} />
								</div>
								<span>{t('employeeRequests')}</span>
								{activeTab === 'employeeRequests' && (
									<div className='absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse'></div>
								)}
							</button>
						</div>
					</div>
				</>
			)}

			<main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
				{/* Desktop tabs - hidden on mobile */}
				<div className='hidden md:flex items-center justify-between mb-8'>
					<nav className='flex gap-2 p-1.5 bg-gray-100 rounded-xl border-2 border-gray-200 shadow-inner'>
						<button
							onClick={() => setActiveTab('forms')}
							className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer ${activeTab === 'forms'
								? 'bg-white text-indigo-700 shadow-md'
								: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
						>
							<FiFileText className={`h-4 w-4 transition-transform ${activeTab === 'forms' ? 'scale-110' : 'group-hover:scale-110'}`} />
							<span>{t('formsManagement')}</span>
							{activeTab === 'forms' && (
								<div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-t-full' />
							)}
						</button>

						<button
							onClick={() => setActiveTab('submissions')}
							className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer ${activeTab === 'submissions'
								? 'bg-white text-indigo-700 shadow-md'
								: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
						>
							<FiList className={`h-4 w-4 transition-transform ${activeTab === 'submissions' ? 'scale-110' : 'group-hover:scale-110'}`} />
							<span>{t('submissions')}</span>
							{activeTab === 'submissions' && (
								<div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-t-full' />
							)}
						</button>

						<button
							onClick={() => setActiveTab('users')}
							className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer ${activeTab === 'users'
								? 'bg-white text-indigo-700 shadow-md'
								: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
						>
							<FiUser className={`h-4 w-4 transition-transform ${activeTab === 'users' ? 'scale-110' : 'group-hover:scale-110'}`} />
							<span>{t('users')}</span>
							{activeTab === 'users' && (
								<div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-t-full' />
							)}
						</button>

						<button
							onClick={() => setActiveTab('projects')}
							className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer ${activeTab === 'projects'
								? 'bg-white text-indigo-700 shadow-md'
								: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
						>
							<FiUser className={`h-4 w-4 transition-transform ${activeTab === 'projects' ? 'scale-110' : 'group-hover:scale-110'}`} />
							<span>{t('projects')}</span>
							{activeTab === 'projects' && (
								<div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-t-full' />
							)}
						</button>

						<button
							onClick={() => setActiveTab('employeeRequests')}
							className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer ${activeTab === 'employeeRequests'
								? 'bg-white text-indigo-700 shadow-md'
								: 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
								}`}
						>
							<FiList className={`h-4 w-4 transition-transform ${activeTab === 'employeeRequests' ? 'scale-110' : 'group-hover:scale-110'}`} />
							<span>{t('employeeRequests')}</span>
							{activeTab === 'employeeRequests' && (
								<div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-t-full' />
							)}
						</button>
					</nav>
				</div>

				{activeTab === 'forms' && (
					<div className='grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-6'>
						{/* Forms List Section */}
						<div className='sticky top-[100px] h-fit bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 transition-all hover:shadow-xl'>
							{/* Header */}
							<div className='bg-gradient-to-r from-indigo-600 to-indigo-500 p-6'>
								<div className='flex justify-between items-center'>
									<div className='flex items-center gap-3'>
										<div className='p-2.5 bg-white/20 rounded-xl backdrop-blur-sm'>
											<FiFileText className='text-white w-6 h-6' />
										</div>
										<div>
											<h2 className='text-2xl font-bold text-white'>{t('yourForms')}</h2>
											<p className='text-sm text-indigo-100 mt-0.5'>{t('createManageForms')}</p>
										</div>
									</div>
									<button
										onClick={() => setShowNewFormModal(true)}
										className='group flex items-center gap-2 bg-white text-indigo-600 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95'
									>
										<FiPlus className='h-4 w-4 group-hover:rotate-90 transition-transform' />
										<span>{t('newForm')}</span>
									</button>
								</div>
							</div>

							{/* Forms List */}
							<div className='p-6 space-y-3 max-h-[700px] overflow-y-auto scrollbar-custom'>
								{isLoading.forms ? (
									<div className='space-y-4'>
										{[...Array(3)].map((_, i) => (
											<div key={i} className='p-5 rounded-xl border-2 border-gray-200 bg-white'>
												<div className='animate-pulse flex gap-4'>
													<div className='flex-shrink-0 w-12 h-12 bg-gray-200 rounded-xl'></div>
													<div className='flex-1 space-y-3'>
														<div className='h-4 bg-gray-200 rounded-lg w-3/4'></div>
														<div className='h-3 bg-gray-200 rounded-lg w-1/2'></div>
														<div className='flex justify-between pt-2'>
															<div className='h-4 bg-gray-200 rounded-lg w-16'></div>
															<div className='h-4 bg-gray-200 rounded-lg w-20'></div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								) : forms.length > 0 ? (
									forms.map(form => (
										<div
											key={form.id}
											className={`relative p-5 rounded-xl cursor-pointer transition-all duration-200 group overflow-hidden ${selectedForm?.id === form.id
												? 'ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100/50 shadow-lg border-2 border-indigo-300'
												: 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
												} ${form.isActive ? 'before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-gradient-to-b before:from-emerald-400 before:to-emerald-600 before:rounded-l-xl' : ''
												}`}
											onClick={() => setSelectedForm(form)}
										>
											<div className='flex justify-between items-start'>
												<div className='flex items-start gap-4 flex-1 min-w-0'>
													<div className={`p-3 rounded-xl mt-1 shadow-sm ${form.isActive
														? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
														: 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600'
														}`}>
														<FiFileText className='w-5 h-5' />
													</div>
													<div className='flex-1 min-w-0'>
														<div className='flex items-center gap-2 mb-2'>
															{editingFormId === form.id ? (
																<div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg border-2 border-indigo-300 w-full">
																	<input
																		value={editedTitle}
																		onChange={(e) => setEditedTitle(e.target.value)}
																		autoFocus
																		placeholder="Form title"
																		className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/40 rounded-lg px-2 py-1 transition"
																	/>

																	{/* Save */}
																	<button
																		onClick={() => handleSaveTitle(form.id)}
																		title="Save"
																		className="flex-none flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm active:scale-95 transition"
																	>
																		<Check size={18} strokeWidth={2.5} />
																	</button>

																	{/* Cancel */}
																	<button
																		onClick={() => setEditingFormId(null)}
																		title="Cancel"
																		className="flex-none flex items-center justify-center h-9 w-9 rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 shadow-sm active:scale-95 transition"
																	>
																		<X size={18} strokeWidth={2.5} />
																	</button>
																</div>
															) : (
																<div className="flex items-center gap-2 flex-1 min-w-0">
																	<h3 className={`text-lg font-bold tracking-tight truncate ${selectedForm?.id === form.id ? 'text-indigo-900' : 'text-gray-800'
																		}`}>
																		{form.title}
																	</h3>

																	{/* Edit */}
																	<button
																		onClick={(e) => {
																			e.stopPropagation();
																			setEditingFormId(form.id);
																			setEditedTitle(form.title);
																		}}
																		title="Edit title"
																		className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 opacity-0 group-hover:opacity-100 active:scale-95 transition-all"
																	>
																		<Pencil size={16} strokeWidth={2.5} />
																	</button>

																	{form.isActive && (
																		<span className='flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300'>
																			{t('active')}
																		</span>
																	)}
																</div>
															)}
														</div>
														<p className='text-sm text-gray-600 line-clamp-2 leading-relaxed'>
															{form.description || <span className='italic text-gray-400'>{t('noDescription')}</span>}
														</p>
													</div>
												</div>

												{/* Action Buttons */}
												<div className='flex items-center gap-1 ml-2'>
													<button
														onClick={e => {
															e.stopPropagation();
															setShowFileManagerModal(true);
														}}
														className='p-2 cursor-pointer text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all active:scale-90'
														title={t('fileManager') || 'File Manager'}
													>
														<FiFile className='w-4 h-4' />
													</button>
													<button
														onClick={e => {
															e.stopPropagation();
															handleDownloadFormTemplate(form);
														}}
														className='p-2 cursor-pointer text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all active:scale-90'
														title={t('downloadTemplate') || 'Download Template'}
													>
														<FiDownload className='w-4 h-4' />
													</button>
													<button
														onClick={e => {
															e.stopPropagation();
															setCurrentUploadFormId(form.id);
															templateFileInputRef.current?.click();
														}}
														disabled={uploadingFormId === form.id}
														className={`p-2 cursor-pointer text-gray-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all active:scale-90 ${uploadingFormId === form.id ? 'opacity-50 cursor-not-allowed' : ''
															}`}
														title={t('uploadExcel') || 'Upload Excel'}
													>
														{uploadingFormId === form.id ? (
															<svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
																<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
																<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
															</svg>
														) : (
															<FiUpload className='w-4 h-4' />
														)}
													</button>
													<button
														onClick={e => {
															e.stopPropagation();
															setShowDeleteModal({ show: true, id: form.id, type: 'form' });
														}}
														className='p-2 cursor-pointer text-gray-500 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all active:scale-90'
														title={t('delete')}
													>
														<FiTrash2 className='w-4 h-4' />
													</button>
												</div>
											</div>

											{/* Footer */}
											<div className='flex justify-between items-center mt-4 pt-4 border-t-2 border-gray-200'>
												<div className='flex items-center gap-2'>
													<span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${form.isActive
														? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
														: 'bg-indigo-100 text-indigo-700 border border-indigo-300'
														}`}>
														{form.fields?.length || 0} {form.fields?.length === 1 ? t('field') : t('fields')}
													</span>
													<span className='inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300'>
														ID: {form.id}
													</span>
												</div>
												<div className='flex items-center gap-1.5 text-xs text-gray-500'>
													<svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
													</svg>
													<span>
														{new Date(form.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
													</span>
												</div>
											</div>
										</div>
									))
								) : (
									<div className='text-center py-16'>
										<div className='mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-4 shadow-lg'>
											<FiFileText className='w-10 h-10 text-indigo-600' />
										</div>
										<h3 className='text-xl font-bold text-gray-800 mb-2'>{t('noForms')}</h3>
										<p className='text-sm text-gray-500 mb-6 max-w-xs mx-auto'>{t('createFirstForm')}</p>
										<button
											onClick={() => setShowNewFormModal(true)}
											className='inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95'
										>
											<FiPlus className='h-4 w-4' />
											{t('createForm')}
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Form Builder Section */}
						<div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200'>
							{/* Header */}
							<div className='bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 border-b-2 border-gray-200'>
								<div className='flex items-center gap-3 mb-2'>
									<div className='p-2.5 bg-indigo-100 rounded-xl'>
										<FiEdit3 className='text-indigo-600 w-5 h-5' />
									</div>
									<h2 className='text-2xl font-bold text-gray-900'>{t('formBuilder')}</h2>
								</div>
								<p className='text-sm text-gray-600 ml-14'>
									{selectedForm ? (
										<>
											<span className='font-semibold text-indigo-600'>{t('editing')}:</span> {selectedForm.title}
										</>
									) : (
										t('selectForm')
									)}
								</p>
							</div>

							{/* Builder Content */}
							<div className='p-6'>
								{selectedForm ? (
									<>
										<DragDropContext onDragEnd={onDragEnd}>
											<Droppable droppableId='fields'>
												{provided => (
													<div {...provided.droppableProps} ref={provided.innerRef} className='space-y-3'>
														{selectedForm.fields
															?.sort((a, b) => a.order - b.order)
															.map((field, index) => (
																<Draggable
																	key={field.id?.toString() || `new-field-${index}`}
																	draggableId={field.id?.toString() || `new-field-${index}`}
																	index={index}
																>
																	{(provided, snapshot) => (
																		<div
																			ref={provided.innerRef}
																			{...provided.draggableProps}
																			className={`p-5 cursor-pointer rounded-xl transition-all duration-200 ease-in-out relative overflow-hidden group ${snapshot.isDragging
																				? 'bg-gradient-to-r from-indigo-100 to-indigo-200 shadow-2xl ring-2 ring-indigo-400 scale-105'
																				: 'bg-white border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md'
																				}`}
																			onClick={() => openEditFieldModal(field)}
																		>
																			<div className='flex items-start gap-4'>
																				{/* Drag Handle */}
																				<div
																					{...provided.dragHandleProps}
																					className='p-2 -ml-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-grab active:cursor-grabbing transition-colors'
																				>
																					<FaGripVertical className='h-5 w-5' />
																				</div>

																				{/* Field Content */}
																				<div className='flex-1 min-w-0 space-y-3'>
																					<div className='flex justify-between items-start gap-3'>
																						<h4 className='font-bold text-gray-800 flex items-center gap-2'>
																							<span className='truncate'>{field.label}</span>
																							{field.required && (
																								<span className='flex-shrink-0 text-xs text-rose-500'>
																									<FaAsterisk />
																								</span>
																							)}
																						</h4>

																						<span className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full capitalize border-2 ${getFieldTypeColor(field.type).bg
																							} ${getFieldTypeColor(field.type).text
																							}`}>
																							{t(field.type)}
																						</span>
																					</div>

																					{field.placeholder && (
																						<p className='text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200'>
																							<span className='font-semibold text-gray-700'>{t('placeholder')}:</span> "{field.placeholder}"
																						</p>
																					)}

																					{field.options?.length > 0 && (
																						<div className='flex flex-wrap gap-2 pt-1'>
																							{field.options.map(option => (
																								<span
																									key={option}
																									className='text-xs px-3 py-1.5 bg-white text-gray-700 rounded-lg border-2 border-gray-200 shadow-sm font-medium flex items-center gap-1.5'
																								>
																									{field.type === 'checkbox' || field.type === 'radio' ? (
																										<>
																											{field.type === 'checkbox' ? (
																												<FiCheck className='w-3 h-3 text-emerald-500' />
																											) : (
																												<FiCircle className='w-3 h-3 text-indigo-500' />
																											)}
																											{option}
																										</>
																									) : (
																										option
																									)}
																								</span>
																							))}
																						</div>
																					)}

																					{field.length && (
																						<p className='text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-lg inline-block border border-indigo-300'>
																							{t('length')}: {field.length}
																						</p>
																					)}
																				</div>

																				{/* Action Buttons */}
																				<div className='flex items-center gap-1'>
																					<button
																						onClick={e => {
																							e.stopPropagation();
																							setShowDeleteModal({ show: true, id: field.id, type: 'field' });
																						}}
																						className='cursor-pointer p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all active:scale-90'
																						title={t('delete')}
																					>
																						<FiTrash2 className='h-4 w-4' />
																					</button>

																					<button
																						onClick={(e) => {
																							e.stopPropagation();
																							openEditFieldModal(field);
																						}}
																						className='p-2 cursor-pointer text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all active:scale-90'
																						title={t('edit')}
																					>
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

										{/* Add Field Button */}
										<button
											onClick={() => {
												setEditField(null);
												resetFieldForm({ type: 'text', required: false });
												setShowNewFieldModal(true);
											}}
											className='group mt-6 w-full flex items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-300 rounded-xl p-5 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-sm hover:shadow-md'
										>
											<div className='p-2 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-200 group-hover:scale-110 transition-all'>
												<FiPlus className='h-5 w-5' />
											</div>
											<span className='font-bold text-base'>{t('addNewField')}</span>
										</button>
									</>
								) : (
									<div className='flex flex-col items-center justify-center py-16 px-4 text-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border-2 border-dashed border-gray-300'>
										<div className='bg-gradient-to-br from-indigo-100 to-indigo-200 p-5 rounded-full mb-4 shadow-lg'>
											<FiEdit2 className='h-8 w-8 text-indigo-600' />
										</div>
										<h3 className='text-xl font-bold text-gray-800 mb-2'>{t('selectForm')}</h3>
										<p className='text-sm text-gray-500 max-w-xs mb-6'>{t('selectFormDescription')}</p>
										<button
											onClick={() => setShowNewFormModal(true)}
											className='inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-bold hover:underline'
										>
											<FiPlus className='h-4 w-4' />
											{t('orCreateNewForm')}
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Hidden file input for template upload */}
				<input
					type='file'
					ref={templateFileInputRef}
					accept='.xlsx,.xls'
					className='hidden'
					onChange={(e) => {
						if (currentUploadFormId) {
							handleUploadFormTemplate(e, currentUploadFormId);
						}
					}}
					disabled={!!uploadingFormId}
				/>

				{activeTab === 'submissions' && (
					<div className='bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
						{/* Header Section */}
						<div className='bg-white border-b border-gray-100'>
							<div className='p-6'>
								<div className='flex items-start justify-between flex-wrap gap-6'>
									{/* Title Area */}
									<div className='flex-1 min-w-[200px]'>
										<div className='flex items-center gap-3 mb-2'>
											<div className='p-2.5 bg-indigo-50 rounded-xl'>
												<FiFileText className='text-indigo-600 w-5 h-5' />
											</div>
											<h2 className='text-2xl font-bold text-gray-900'>
												{t('formSubmissions')}
											</h2>
										</div>
									</div>

									{/* Actions Area */}
									<div className='flex flex-wrap items-center gap-3'>
										{/* Search Input */}
										<div className='relative group'>
											<div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
												<svg className='w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
												</svg>
											</div>
											<input
												value={subSearch}
												onChange={(e) => {
													setSubSearch(e.target.value);
													setCurrentPage(1);
												}}
												placeholder={t('searchWithNationalID') + '...'}
												className='w-[240px] pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400'
											/>
										</div>

										{/* Form Filter */}
										<div className='relative'>
											<select
												id='formFilter'
												value={selectedFormId}
												onChange={e => setSelectedFormId(e.target.value)}
												className='appearance-none truncate min-w-[160px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer'
											>
												<option value='all'>{t('allForms')}</option>
												{Array.from(new Set(submissions.map(s => s.form_id))).map(formId => (
													<option className='truncate' key={formId} value={formId}>
														{forms.find(e => e.id == formId)?.title || 'Unknown'}
													</option>
												))}
											</select>

										</div>

										{/* Project Filter */}
										<div className='relative'>
											<select
												value={selectedProjectId}
												onChange={e => setSelectedProjectId(e.target.value)}
												className='appearance-none truncate min-w-[160px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer'
											>
												<option value='all'>{t('allProjects')}</option>
												{clients.map(e => (
													<option key={e.id} value={e.id}>
														{e.name}
													</option>
												))}
											</select>

										</div>

										{/* Limit Filter */}
										<div className='relative'>
											<select
												value={selectedLimit}
												onChange={e => setSelectedLimit(Number(e.target.value))}
												className='appearance-none truncate min-w-[130px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer'
											>
												{[10, 20, 30, 40, 50, 100, 200].map(limit => (
													<option key={limit} value={limit}>
														{limit} {t('perPage')}
													</option>
												))}
											</select>

										</div>

										{/* Export Button */}
										<button
											onClick={exportToExcel}
											disabled={isExporting}
											className='flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
										>
											{isExporting ? (
												<>
													<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
														<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
														<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
													</svg>
													<span>{t('exporting')}</span>
												</>
											) : (
												<>
													<FiDownload className='h-4 w-4' />
													<span>{t('exportExcel')}</span>
												</>
											)}
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Table Section */}
						<div className='p-6'>
							{renderSubmissionTable()}
						</div>
					</div>
				)}

				{activeTab === 'users' && <UsersTab handleGeneratePassword={handleGeneratePassword} setUsers={setUsers} projects={projects} forms={forms} t={t} users={users} isLoading={isLoading} visiblePasswords={visiblePasswords} handleShowPassword={handleShowPassword} setShowNewUserModal={setShowNewUserModal} setEditingUser={setEditingUser} resetUserForm={resetUserForm} setShowEditUserModal={setShowEditUserModal} setShowShareModal={setShowShareModal} setShowDeleteModal={setShowDeleteModal} setViewSubmission={setViewSubmission} currentUserPage={currentUserPage} setCurrentUserPage={setCurrentUserPage} totalUserPages={totalUserPages} />}

				{activeTab === 'projects' && <ProjectsTab user={user} t={t} />}

				{activeTab === 'employeeRequests' && <EmployeeRequestsTab language={language} t={t} />}

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

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700'>{t('type')}</label>
								<select className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500' {...registerForm('type')}>
									<option value='project'>{t('project_type')}</option>
									<option value='employee_request'>{t('employee_request_type')}</option>
								</select>
							</div>

							{formType === 'employee_request' && (
								<div>
									<label className='block text-sm font-medium text-gray-700'>{t('approvalFlow')}</label>
									<select className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500' {...registerForm('approvalFlow')}>
										<option value='none'>{t('none')}</option>
										<option value='hr_only'>{t('hr_only')}</option>
										<option value='supervisor_only'>{t('supervisor_only')}</option>
										<option value='hr_then_supervisor'>{t('hr_then_supervisor')}</option>
										<option value='supervisor_then_hr'>{t('supervisor_then_hr')}</option>
									</select>
								</div>
							)}
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

						{(fieldType === 'text' || fieldType === 'textarea' || fieldType === 'number' || fieldType === 'email' || fieldType === 'phone') && (
							<div>
								<label htmlFor='field-length' className='block text-sm font-medium text-gray-700'>
									{t('length')}
								</label>
								<input
									type='number'
									id='field-length'
									className={`mt-1 block w-full border ${fieldErrors.length ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
									{...registerField('length')}
								/>
								{fieldErrors.length && <p className='mt-1 text-sm text-red-600'>{fieldErrors.length.message}</p>}
							</div>
						)}

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


						{/* Regular project field - only shown for 'user' role */}
						<div>
							<label htmlFor='user-role' className='block text-sm font-medium text-gray-700'>
								{t('role')}*
							</label>
							<select id='user-role' className={`mt-1 block w-full border ${userErrors.role ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('role')}>
								{user?.role == "admin" && <option value='admin'>{t('admin')}</option>}
								{user?.role == "admin" && <option value='supervisor'>{t('supervisor')}</option>}
								<option value='user'>{t('user')}</option>
							</select>
							{userErrors.role && <p className='mt-1 text-sm text-red-600'>{userErrors.role.message}</p>}
						</div>

						<div>
							<label htmlFor='user-projectId' className='block text-sm font-medium text-gray-700'>
								{watch('role') === 'supervisor' ? `${t('assignedProject')}*` : `${t('project')}*`}
							</label>
							<select
								id='user-projectId'
								className={`mt-1 block w-full border ${userErrors.projectId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
								{...registerUser('projectId')}
							>
								<option value=''>-- {t('select_project')} --</option>
								{projects.map(project => (
									<option key={project.id} value={project.id}>
										{project.clientName}
									</option>
								))}
							</select>
							{userErrors.projectId && <p className='mt-1 text-sm text-red-600'>{userErrors.projectId.message}</p>}
						</div>



						<div>
							<label htmlFor='user-formId' className='block text-sm font-medium text-gray-700'>
								{t('assignedForm')}*
							</label>
							<select
								id='user-formId'
								className={`mt-1 block w-full border ${userErrors.formId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
								{...registerUser('formId')}
							>
								<option value=''>-- {t('select_form')} --</option>
								{forms.map(form => (
									<option key={form.id} value={form.id}>
										{form.title} {form.adminId ? `(Supervisor Form)` : ''}
									</option>
								))}
							</select>
							{userErrors.formId && <p className='mt-1 text-sm text-red-600'>{userErrors.formId.message}</p>}
							{forms.length === 0 && (
								<p className='mt-1 text-sm text-yellow-600'>{t('no_forms_available')}</p>
							)}
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
							<label htmlFor='edit-user-role' className='block text-sm font-medium text-gray-700'>
								{t('role')}*
							</label>
							<select id='edit-user-role' className={`mt-1 block w-full border ${userErrors.role ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('role')}>
								{user?.role == "admin" && <option value='admin'>{t('admin')}</option>}
								{user?.role == "admin" && <option value='supervisor'>{t('supervisor')}</option>}
								<option value='user'>{t('user')}</option>
							</select>
							{userErrors.role && <p className='mt-1 text-sm text-red-600'>{userErrors.role.message}</p>}
						</div>

						<div>
							<label htmlFor='user-projectId' className='block text-sm font-medium text-gray-700'>
								{t('project')}*
							</label>
							<select id='user-projectId' className={`mt-1 block w-full border ${userErrors.projectId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} {...registerUser('projectId')}>
								<option value=''>-- {t('select_project')} --</option>
								{projects.map(project => (
									<option key={project.id} value={project.id}>
										{project.clientName}
									</option>
								))}
							</select>
							{userErrors.projectId && <p className='mt-1 text-sm text-red-600'>{userErrors.projectId.message}</p>}
						</div>

						<div>
							<label htmlFor='user-formId' className='block text-sm font-medium text-gray-700'>
								{t('assignedForm')}*
							</label>
							<select
								id='user-formId'
								className={`mt-1 block w-full border ${userErrors.formId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
								{...registerUser('formId')}
							>
								<option value=''>-- {t('select_form')} --</option>
								{forms.map(form => (
									<option key={form.id} value={form.id}>
										{form.title} {form.adminId ? `(Supervisor Form)` : ''}
									</option>
								))}
							</select>
							{userErrors.formId && <p className='mt-1 text-sm text-red-600'>{userErrors.formId.message}</p>}
							{forms.length === 0 && (
								<p className='mt-1 text-sm text-yellow-600'>{t('no_forms_available')}</p>
							)}
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

			{/* File Manager Modal for uploading and copying file URLs */}
			<Modal
				title={t('fileManager') || 'File Manager'}
				show={showFileManagerModal}
				onClose={() => setShowFileManagerModal(false)}
				cn={"!max-w-3xl"}
			>
				<div className='space-y-6'>
					{/* Header Section */}
					<div className='bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-xl p-5 border-2 border-indigo-200'>
						<div className='flex items-start gap-4'>
							<div className='flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg'>
								<FiFile className='w-6 h-6 text-white' />
							</div>
							<div className='flex-1'>
								<h3 className='text-base font-bold text-gray-900 mb-1'>
									{t('yourFiles') || 'Your Files'}
								</h3>
								<p className='text-sm text-gray-600 leading-relaxed'>
									{t('fileManagerDescription') || 'Upload files and copy their URLs to use in Excel templates. Hover over an image to see the copy button.'}
								</p>
							</div>
						</div>
					</div>

					{/* Files Grid */}
					<div className='grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] min-h-[300px] overflow-y-auto scrollbar-custom rounded-xl p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200'>
						{/* Upload Button as First Item */}
						<label className='group relative flex flex-col items-center justify-center text-center p-4 h-[150px] w-full border-2 border-dashed border-indigo-300 rounded-xl bg-white hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 overflow-hidden'>
							<input
								type='file'
								ref={fileUploadInputRef}
								className='sr-only'
								onChange={handleFileUpload}
								disabled={uploadingFile}
							/>

							<div className='relative z-10'>
								<div className='w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform'>
									<FiUpload className='h-7 w-7 text-indigo-600' />
								</div>
								<span className='text-sm font-semibold text-indigo-700'>{t('upload') || 'Upload File'}</span>
								<span className='block text-xs text-gray-500 mt-1'>Click to browse</span>
							</div>

							{uploadingFile && (
								<div className='absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20'>
									<svg className='animate-spin h-8 w-8 text-indigo-600 mb-2' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
										<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
										<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
									</svg>
									<span className='text-sm font-medium text-indigo-600'>Uploading...</span>
								</div>
							)}
						</label>

						{/* User Uploaded Files */}
						{userAssets.map(asset => (
							<div
								key={asset.id}
								className='group relative h-[150px] rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200 overflow-hidden bg-white shadow-sm hover:shadow-md'
							>
								{asset.mimeType?.startsWith('image/') ? (
									<div className='relative h-full'>
										<img
											src={baseImg + asset.url}
											alt={asset.filename}
											className='h-full w-full object-cover'
										/>

										{/* Gradient Overlay */}
										<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />

										{/* Action Buttons Overlay */}
										<div className='absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200'>
											<button
												onClick={() => copyFileUrl(asset.url)}
												className='flex items-center justify-center w-11 h-11 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 cursor-pointer transition-all active:scale-95'
												title={t('copyUrl') || 'Copy URL'}
											>
												<FiCopy className='h-5 w-5 text-indigo-600' />
											</button>
											<button
												onClick={() => handleDeleteAsset(asset.id)}
												className='flex items-center justify-center w-11 h-11 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 cursor-pointer transition-all active:scale-95'
												title={t('delete') || 'Delete'}
											>
												<FiTrash2 className='h-5 w-5 text-rose-600' />
											</button>
										</div>

										{/* Filename Badge */}
										<div className='absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent'>
											<p className='text-xs font-medium text-white truncate' title={asset.filename}>
												{asset.filename}
											</p>
										</div>
									</div>
								) : (
									<div className='h-full flex flex-col'>
										{/* File Icon Area */}
										<div className='flex-1 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 relative'>
											<div className='w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-md'>
												<FiFile className='h-8 w-8 text-gray-400' />
											</div>

											{/* Action Buttons Overlay for Files */}
											<div className='absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200'>
												<button
													onClick={() => copyFileUrl(asset.url)}
													className='flex items-center justify-center w-11 h-11 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 cursor-pointer transition-all active:scale-95'
													title={t('copyUrl') || 'Copy URL'}
												>
													<FiCopy className='h-5 w-5 text-indigo-600' />
												</button>
												<button
													onClick={() => handleDeleteAsset(asset.id)}
													className='flex items-center justify-center w-11 h-11 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 cursor-pointer transition-all active:scale-95'
													title={t('delete') || 'Delete'}
												>
													<FiTrash2 className='h-5 w-5 text-rose-600' />
												</button>
											</div>
										</div>

										{/* Filename Area */}
										<div className='p-2 bg-white border-t-2 border-gray-200'>
											<p className='text-xs font-medium text-gray-700 text-center truncate' title={asset.filename}>
												{asset.filename}
											</p>
										</div>
									</div>
								)}
							</div>
						))}
					</div>

					{/* Empty State (if no files) */}
					{userAssets.length === 0 && (
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<div className='w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4'>
								<FiFile className='w-10 h-10 text-gray-400' />
							</div>
							<h4 className='text-base font-semibold text-gray-700 mb-1'>No files yet</h4>
							<p className='text-sm text-gray-500'>Upload your first file to get started</p>
						</div>
					)}

				</div>
			</Modal>
		</div>
	);
}
