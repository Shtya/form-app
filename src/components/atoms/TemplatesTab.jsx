import React, { useRef, useState } from 'react';
import { FiDownload, FiUpload, FiFileText } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const TemplatesTab = ({ forms = [], t }) => {
  const [selectedFormId, setSelectedFormId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = async () => {
    if (!selectedFormId) {
      toast.error(t?.('selectFormFirst') || 'Please select a form first');
      return;
    }

    try {
      const selectedForm = forms.find(f => f.id === parseInt(selectedFormId));
      if (!selectedForm) {
        toast.error(t?.('formNotFound') || 'Form not found');
        return;
      }

      // Create headers: User ID + all form field keys
      const headers = ['User ID'];
      selectedForm.fields?.forEach(field => {
        headers.push(field.label || field.key);
      });

      // Create example row
      const exampleRow = ['1'];
      selectedForm.fields?.forEach(field => {
        if (field.type === 'select' || field.type === 'radio') {
          exampleRow.push(field.options?.[0] || '');
        } else if (field.type === 'checkbox') {
          exampleRow.push('true');
        } else if (field.type === 'date') {
          exampleRow.push('2024-01-01');
        } else if (field.type === 'file') {
          // For file fields, show example URL format
          exampleRow.push('uploads/filename.pdf or https://example.com/file.pdf');
        } else {
          exampleRow.push('example value');
        }
      });

      const wsData = [headers, exampleRow];

      // Create forms reference sheet
      const formSheetData = [['ID', 'Form Title']];
      forms.forEach(form => {
        formSheetData.push([form.id, form.title]);
      });

      const wb = XLSX.utils.book_new();
      const templateSheet = XLSX.utils.aoa_to_sheet(wsData);
      const formSheet = XLSX.utils.aoa_to_sheet(formSheetData);

      // Set column widths
      const colWidths = [{ wch: 15 }]; // User ID column
      selectedForm.fields?.forEach(() => {
        colWidths.push({ wch: 20 });
      });
      templateSheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, templateSheet, 'Template');
      XLSX.utils.book_append_sheet(wb, formSheet, 'Forms');
      XLSX.writeFile(wb, `${selectedForm.title || 'form'}_template.xlsx`);
      toast.success(t?.('templateDownloaded') || 'Template downloaded successfully');
    } catch (error) {
      console.error('Failed to download template:', error);
      toast.error(t?.('downloadTemplateError') || 'Failed to download template');
    }
  };

  const handleUploadExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedFormId) {
      toast.error(t?.('selectFormFirst') || 'Please select a form first');
      event.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets['Template'] || workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (jsonData.length === 0) {
        toast.error(t?.('emptyFile') || 'The Excel file is empty');
        setIsUploading(false);
        event.target.value = '';
        return;
      }

      const selectedForm = forms.find(f => f.id === parseInt(selectedFormId));
      if (!selectedForm) {
        toast.error(t?.('formNotFound') || 'Form not found');
        setIsUploading(false);
        event.target.value = '';
        return;
      }

      // Get field keys from form
      const fieldKeys = selectedForm.fields?.map(f => f.key) || [];
      const userIdKey = Object.keys(jsonData[0]).find(key => 
        key.toLowerCase().includes('user') && key.toLowerCase().includes('id')
      );

      if (!userIdKey) {
        toast.error(t?.('userIdColumnNotFound') || 'User ID column not found in the file');
        setIsUploading(false);
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

        // Validate User ID is a number
        const userIdNum = parseInt(String(userId));
        if (isNaN(userIdNum)) {
          errors.push(`Row ${rowNumber}: User ID must be a number`);
          return;
        }

        // Build answers object from form fields
        const answers = {};
        fieldKeys.forEach(key => {
          // Find the column that matches this field's label or key
          const field = selectedForm.fields?.find(f => f.key === key);
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

          // Add value if it exists (for both required and optional fields)
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
            } else if (field?.type === 'file') {
              // For file fields, accept URL or file path
              // User should upload file first and put the URL in the Excel cell
              value = String(value).trim();
              // Validate it's a URL or path
              if (value && !value.startsWith('http') && !value.startsWith('/') && !value.startsWith('uploads/')) {
                // It might be a filename, we'll accept it but warn
                console.warn(`Row ${rowNumber}: File field "${field.label || key}" should contain a URL or path. Got: ${value}`);
              }
            } else {
              value = String(value);
            }

            answers[key] = value;
          }
        });

        submissions.push({
          userId: userIdNum,
          answers,
          form_id: String(selectedFormId),
        });
      });

      if (errors.length > 0) {
        errors.forEach(err => toast.error(err));
        setIsUploading(false);
        event.target.value = '';
        return;
      }

      if (submissions.length === 0) {
        toast.error(t?.('noValidSubmissions') || 'No valid submissions found in the file');
        setIsUploading(false);
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
          toast.error(`User ID ${result.userId}: ${result.reason}`);
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

    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || t?.('uploadError') || 'Failed to upload submissions');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className='bg-white rounded-xl shadow-md overflow-hidden'>
      <div className='p-5 border-b border-gray-100'>
        <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
          <FiFileText className='text-indigo-500' />
          {t?.('templates') || 'Templates'}
        </h2>
        <p className='text-sm text-gray-500 mt-1'>
          {t?.('templatesDescription') || 'Download form templates and upload bulk submissions'}
        </p>
      </div>

      <div className='p-6 space-y-6'>
        {/* Form Selection */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {t?.('selectForm') || 'Select Form'}
          </label>
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value=''>{t?.('selectForm') || 'Select a form...'}</option>
            {forms.map(form => (
              <option key={form.id} value={form.id}>
                {form.title} (ID: {form.id})
              </option>
            ))}
          </select>
        </div>

        {/* Download Template Section */}
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <h3 className='text-sm font-semibold text-gray-700 mb-3'>
            {t?.('downloadTemplate') || 'Download Template'}
          </h3>
          <p className='text-xs text-gray-600 mb-4'>
            {t?.('downloadTemplateDescription') || 'Download an Excel template with all form fields. Fill it with answers and upload it back.'}
          </p>
          <button
            onClick={handleDownloadTemplate}
            disabled={!selectedFormId || isUploading}
            className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FiDownload className='w-4 h-4' />
            {t?.('downloadTemplate') || 'Download Template'}
          </button>
        </div>

        {/* Upload Submissions Section */}
        <div className='bg-green-50 rounded-lg p-4 border border-green-200'>
          <h3 className='text-sm font-semibold text-gray-700 mb-3'>
            {t?.('uploadSubmissions') || 'Upload Submissions'}
          </h3>
          <p className='text-xs text-gray-600 mb-4'>
            {t?.('uploadSubmissionsDescription') || 'Upload a filled Excel file to create bulk form submissions. Make sure the file matches the template format.'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedFormId || isUploading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              isUploading
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUploading ? (
              <>
                <svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                {t?.('uploading') || 'Uploading...'}
              </>
            ) : (
              <>
                <FiUpload className='w-4 h-4' />
                {t?.('uploadExcel') || 'Upload Excel'}
              </>
            )}
          </button>
          <input
            type='file'
            ref={fileInputRef}
            accept='.xlsx,.xls'
            className='hidden'
            onChange={handleUploadExcel}
            disabled={isUploading || !selectedFormId}
          />
        </div>

        {/* Instructions */}
        <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
          <h3 className='text-sm font-semibold text-gray-700 mb-2'>
            {t?.('instructions') || 'Instructions'}
          </h3>
          <ul className='text-xs text-gray-600 space-y-1 list-disc list-inside'>
            <li>{t?.('instruction1') || 'Select a form from the dropdown above'}</li>
            <li>{t?.('instruction2') || 'Download the template Excel file'}</li>
            <li>{t?.('instruction3') || 'Fill in the template with user answers (Email/National ID is required)'}</li>
            <li>{t?.('instruction4') || 'Upload the filled Excel file to create bulk submissions'}</li>
            <li>{t?.('instruction5') || 'If a user already has a submission, it will be updated instead of creating a new one'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TemplatesTab;

