import { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, Users, Folder, Eye, Download, ExternalLink, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Modal from './Modal';
import api, { baseImg } from '../../utils/api';
import toast from 'react-hot-toast';
import { CustomCheckbox } from './CustomCheckbox';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

function buildFileUrl(urlOrPath) {
	if (!urlOrPath) return '';
	// already absolute
	if (typeof urlOrPath === 'string' && (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://'))) return urlOrPath;
	// relative (uploads/...)
	if (typeof urlOrPath === 'string') return `${baseImg}${urlOrPath}`;
	return '';
}

function isLikelyDateString(value) {
	if (!value) return false;
	if (typeof value !== 'string' && typeof value !== 'number') return false;
	const str = value.toString();
	// your data has "GMT" in many date strings
	if (str.includes('GMT')) return true;
	// also accept ISO-ish
	const d = new Date(str);
	return !isNaN(d.getTime()) && (str.includes('T') || str.includes('-'));
}

function isUploadsPath(value) {
	return typeof value === 'string' && value.startsWith('uploads');
}

function getExtFromName(name = '') {
	const dot = name.lastIndexOf('.');
	return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

function isImageMime(mime = '') {
	return mime.startsWith('image/');
}
function isImageExt(ext = '') {
	return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'].includes(ext);
}

function AttachmentView({ fileUrl, filename, mimeType, size }) {
	const ext = getExtFromName(filename || fileUrl);
	const isImg = isImageMime(mimeType || '') || isImageExt(ext);


	return (
		<div className="w-full">
			{isImg ? (
				<div className="space-y-2">
					<a href={fileUrl} target="_blank" rel="noreferrer" className="block">
						<img
							src={fileUrl}
							alt={filename || 'attachment'}
							className="max-h-64 w-full object-contain rounded border border-gray-200 bg-white"
							loading="lazy"
						/>
					</a>

					<div className="flex flex-wrap gap-2">
						<a
							href={fileUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
							title="Preview in new tab"
						>
							<ExternalLink size={16} />
							Preview
						</a>

						<a
							href={fileUrl}
							download={filename || true}
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
							title="Download"
							target="_blank"
						>
							<Download size={16} />
							Download
						</a>

						{filename && (
							<span className="text-xs text-gray-500 self-center">
								{filename}
								{typeof size === 'number' ? ` • ${(size / 1024).toFixed(1)} KB` : ''}
							</span>
						)}
					</div>
				</div>
			) : (
				<div className="space-y-2">
					<div className="flex items-center gap-3 p-3 rounded border bg-white">
						<FileText className="text-gray-500" />
						<div className="min-w-0">
							<div className="text-sm font-medium text-gray-800 truncate">{filename?.slice(0, 20) || 'Attachment'}</div>
							<div className="text-xs text-gray-500">
								{mimeType?.slice(0, 20) || 'file'}
								{typeof size === 'number' ? ` • ${(size / 1024).toFixed(1)} KB` : ''}
							</div>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						<a
							href={fileUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
						>
							<ExternalLink size={16} />
							Open
						</a>

						<a
							href={fileUrl}
							target="_blank"
							download={filename || true}
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
						>
							<Download size={16} />
							Download
						</a>
					</div>
				</div>
			)}
		</div>
	);
}

function renderValueAsText(value) {
	if (value === null || value === undefined || value === '') return '-';

	if (isLikelyDateString(value)) {
		const d = new Date(value);
		if (!isNaN(d.getTime())) return format(d, 'dd MMMM yyyy', { locale: arSA });
	}

	return value.toString();
}

export default function ProjectsTab({ user, t }) {
	const [projects, setProjects] = useState([]);
	const [loadingpage, setLoadingpage] = useState(true);
	const [selectedProjectId, setSelectedProjectId] = useState(null);
	const [users, setUsers] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [newName, setNewName] = useState('');
	const [showNewProjectModal, setShowNewProjectModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState(null);
	const [showSubmissionModal, setShowSubmissionModal] = useState(false);
	const [currentSubmission, setCurrentSubmission] = useState(null);
	const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);

	const { register, handleSubmit, reset } = useForm();

	const fetchProjects = async () => {
		try {
			setLoadingpage(true);
			const res = await api.get('/projects?limit=200');
			setProjects(res.data.data);
			if (res.data.data.length > 0 && !selectedProjectId) {
				handleSelectProject(res.data.data[0]);
			}
		} catch (error) {
			toast.error(error?.response?.data?.message || t('loadingProjects'));
		} finally {
			setLoadingpage(false);
		}
	};

	const fetchUsers = async projectId => {
		try {
			setLoadingProjectDetails(true);
			setUsers([]);
			const res = await api.get(`/projects/${projectId}/users`);
			setUsers(res.data);
		} catch (error) {
			toast.error(error?.response?.data?.message || t('loadingUsers'));
		} finally {
			setLoadingProjectDetails(false);
		}
	};


	const handleSelectProject = project => {
		setSelectedProjectId(project.id);
		setLoadingProjectDetails(true); // يبدأ skeleton فور الضغط
		fetchUsers(project.id);
	};


	const confirmDeleteProject = id => {
		setProjectToDelete(id);
		setShowDeleteModal(true);
	};

	const handleDeleteProject = async () => {
		try {
			await api.delete(`/projects/${projectToDelete}`);
			fetchProjects();
			if (selectedProjectId === projectToDelete) {
				setUsers([]);
				setSelectedProjectId(null);
			}
			toast.success(t('projectDeleted'));
		} catch (error) {
			toast.error(error?.response?.data?.message || t('deletingProject'));
		} finally {
			setShowDeleteModal(false);
			setProjectToDelete(null);
		}
	};

	const handleRenameProject = async (id, name) => {
		try {
			await api.patch(`/projects/${id}`, { name });
			setEditingId(null);
			fetchProjects();
			toast.success(t('projectRenamed'));
		} catch (error) {
			toast.error(error?.response?.data?.message || t('renamingProject'));
		}
	};

	const handleCreateProject = async data => {
		try {
			await api.post(`/projects`, data);
			reset();
			setShowNewProjectModal(false);
			fetchProjects();
			toast.success(t('projectCreated'));
		} catch (error) {
			toast.error(error?.response?.data?.message || t('creatingProject'));
		}
	};

	const viewSubmissionDetails = submission => {
		setCurrentSubmission(submission);
		setShowSubmissionModal(true);
	};

	useEffect(() => {
		fetchProjects();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Build assets map from answers: { baseKey: assetObj }
	const assetsByBaseKey = useMemo(() => {
		const answers = currentSubmission?.answers || {};
		const map = {};
		for (const [k, v] of Object.entries(answers)) {
			if (k.endsWith('_asset') && v && typeof v === 'object') {
				const baseKey = k.replace(/_asset$/, '');
				// expecting v.url, v.filename, v.mimeType, v.size
				map[baseKey] = v;
			}
		}
		return map;
	}, [currentSubmission]);


	function ProjectDetailsSkeleton() {
		return (
			<div className="p-4 space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="border border-gray-200 rounded-lg p-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
								<div className="space-y-2">
									<div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
									<div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
							<div className="h-8 bg-gray-100 rounded animate-pulse" />
						</div>
					</div>
				))}
			</div>
		);
	}


	return (
		<div className="flex gap-6 min-h-screen p-6 bg-gray-50">
			{/* Sidebar Projects */}
			<aside className="sticky top-[100px] w-64 !h-full bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
				<div className="flex justify-between items-center pb-2 border-b border-gray-100">
					<h2 className="font-semibold text-lg text-gray-800 capitalize ">{t('projects')}</h2>
					{user?.role === 'admin' && (
						<button
							onClick={() => setShowNewProjectModal(true)}
							title={t('createNewForm')}
							className="cursor-pointer hover:scale-[1.03] flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition text-sm font-medium"
						>
							<Plus size={16} />
							{t('create')}
						</button>
					)}
				</div>

				<div className="space-y-1.5" style={{ height: '500px', overflow: 'auto' }}>
					{loadingpage ? (
						Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
						))
					) : projects.length > 0 ? (
						projects.map(project => (
							<div
								key={project.id}
								onClick={() => handleSelectProject(project)}
								className={`group flex justify-between items-center p-2.5 rounded-md transition-all cursor-pointer ${selectedProjectId === project.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50 border border-transparent'
									}`}
							>
								{editingId === project.id ? (
									<input
										autoFocus
										className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
										value={newName}
										onChange={e => setNewName(e.target.value)}
										onBlur={() => handleRenameProject(project.id, newName)}
										onKeyDown={e => {
											if (e.key === 'Enter') handleRenameProject(project.id, newName);
										}}
									/>
								) : (
									<span
										onDoubleClick={() => {
											setEditingId(project.id);
											setNewName(project.name);
										}}
										className="text-sm font-medium text-gray-700 truncate"
									>
										{project.name}
									</span>
								)}

								<div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
									<button
										onClick={e => {
											e.stopPropagation();
											setEditingId(project.id);
											setNewName(project.name);
										}}
										className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50 transition"
										title={t('edit')}
									>
										<Pencil size={16} />
									</button>
									<button
										onClick={e => {
											e.stopPropagation();
											confirmDeleteProject(project.id);
										}}
										className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
										title={t('delete')}
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						))
					) : (
						<div className="text-center py-4 text-gray-500">{t('noProjectsFound')}</div>
					)}
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1">
				{selectedProjectId ? (
					<div className="bg-white border border-gray-200 rounded-xl shadow-sm">
						<div className="p-4 border-b border-gray-200">
							<h3 className="text-lg font-semibold text-gray-800">{projects.find(p => p.id === selectedProjectId)?.name}</h3>
						</div>

						<div className="p-4">
							{loadingProjectDetails ? (
								<ProjectDetailsSkeleton />
							) : users.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<Users size={48} className="text-gray-300 mb-3" />
									<p className="text-gray-500">{t('noUsersFound')}</p>
								</div>
							) : (
								<div className="space-y-4">
									{users.map(u => (
										<div key={u.id} className="border border-gray-200 rounded-lg p-4">
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center space-x-3">
													<div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium">
														{u.email.charAt(0).toUpperCase()}
													</div>
													<div>
														<h4 className="font-medium text-gray-800">{u.email}</h4>
														<span className="text-xs text-gray-500">{u.role}</span>
													</div>
												</div>
											</div>

											{u.formSubmissions?.length > 0 ? (
												<div className="overflow-x-auto">
													<table className="min-w-full divide-y divide-gray-200">
														<thead className="bg-gray-50">
															<tr>
																<th className="rtl:text-right px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
																<th className="rtl:text-right px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('submissionDate')}</th>
																<th className="rtl:text-right px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
															</tr>
														</thead>
														<tbody className="bg-white divide-y divide-gray-200">
															{u.formSubmissions.map((submission, idx) => (
																<tr key={idx}>
																	<td className="px-6 py-4 whitespace-nowrap">
																		<CustomCheckbox setUsers={setUsers} submission={submission} t={t} />
																	</td>
																	<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(submission.created_at).toLocaleString()}</td>
																	<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
																		<button onClick={() => viewSubmissionDetails(submission)} className="cursor-pointer text-indigo-600 hover:text-indigo-900 flex items-center">
																			<Eye className="mr-1 h-4 w-4" />
																			{t('view')}
																		</button>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											) : (
												<div className="text-center py-4 text-gray-500">{t('noSubmissionsFound')}</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>

					</div>
				) : (
					<div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex items-center justify-center h-full">
						<div className="text-center py-12">
							<Folder size={48} className="mx-auto text-gray-300 mb-4" />
							<h3 className="text-lg font-medium text-gray-700 mb-1">{t('noProjectSelected')}</h3>
							<p className="text-gray-500 max-w-md">{t('selectProjectToViewDetails')}</p>
						</div>
					</div>
				)}
			</main>

			{/* Create Project Modal */}
			<Modal
				title={t('createNewForm')}
				show={showNewProjectModal}
				onClose={() => {
					setShowNewProjectModal(false);
					reset();
				}}
			>
				<form onSubmit={handleSubmit(handleCreateProject)} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">{t('projectName')}</label>
						<input
							type="text"
							{...register('name', { required: true })}
							className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
						/>
					</div>
					<div className="flex justify-end space-x-3 pt-2">
						<button type="button" onClick={() => setShowNewProjectModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
							{t('cancel')}
						</button>
						<button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
							{t('create')}
						</button>
					</div>
				</form>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal title={t('confirmDelete')} show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
				<div className="space-y-4">
					<p className="text-gray-600">{t('confirmDeleteProjectMessage')}</p>
					<div className="flex justify-end space-x-3 pt-2">
						<button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
							{t('cancel')}
						</button>
						<button onClick={handleDeleteProject} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition">
							{t('delete')}
						</button>
					</div>
				</div>
			</Modal>

			{/* Submission Details Modal */}
			<Modal title={t('submissionDetails')} show={showSubmissionModal} onClose={() => setShowSubmissionModal(false)} cn="max-w-xl  ">
				{currentSubmission && (
					<div className="space-y-6">
						<div className="max-h-[500px] overflow-y-auto overflow-x-hidden px-2 space-y-2">
							{Object.entries(currentSubmission.answers || {})
								.filter(([key]) => !key.endsWith('_asset')) // لا تعرض الـ asset كصف منفصل
								.map(([key, value]) => {
									const asset = assetsByBaseKey[key]; // لو فيه asset لنفس المفتاح
									const hasAssetObject = asset && typeof asset === 'object' && asset.url;
									const hasUploadsString = isUploadsPath(value);

									// attachment case: either uploads string or asset object
									if (hasUploadsString || hasAssetObject) {
										const fileUrl = hasAssetObject ? buildFileUrl(asset.url) : buildFileUrl(value);
										const filename = hasAssetObject ? asset.filename : key;
										const mimeType = hasAssetObject ? asset.mimeType : '';
										const size = hasAssetObject ? asset.size : undefined;

										return (
											<div key={key} className="flex flex-col sm:flex-row sm:items-start sm:gap-3 border border-gray-200 shadow-sm rounded-lg p-3 bg-gray-50">
												<span className="text-[14px] font-medium text-gray-600 capitalize whitespace-nowrap min-w-[160px]">{key}:</span>
												<div className="w-full">
													<AttachmentView fileUrl={fileUrl} filename={filename} mimeType={mimeType} size={size} />
												</div>
											</div>
										);
									}

									// normal text case (ignore raw objects)
									if (typeof value === 'object') {
										return null;
									}

									return (
										<div key={key} className="flex flex-col flex-wrap sm:flex-row sm:items-start sm:gap-3 border border-gray-200 shadow-sm rounded-lg p-3 bg-gray-50">
											<span className="text-[14px] font-medium text-gray-600 capitalize whitespace-nowrap min-w-[160px]">{key}:</span>
											<span className="text-sm text-gray-800 break-words">{renderValueAsText(value)}</span>
										</div>
									);
								})}
						</div>

						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4 border-gray-200 gap-3">
							<div className="text-sm text-gray-500">
								{t('submittedOn')}:{' '}
								<span className="font-medium text-gray-700">
									{format(new Date(currentSubmission.created_at), 'dd MMMM yyyy, hh:mm a', {
										locale: arSA,
									})}
								</span>
							</div>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
}
