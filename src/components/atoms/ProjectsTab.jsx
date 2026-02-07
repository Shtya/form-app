import { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, Users, Folder, Eye, Download, ExternalLink, FileText, FolderOpen, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Modal from './Modal';
import api, { baseImg } from '../../utils/api';
import toast from 'react-hot-toast';
import { CustomCheckbox } from './CustomCheckbox';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

function buildFileUrl(urlOrPath) {
	if (!urlOrPath) return '';
	if (typeof urlOrPath === 'string' && (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://'))) return urlOrPath;
	if (typeof urlOrPath === 'string') return `${baseImg}${urlOrPath}`;
	return '';
}

function isLikelyDateString(value) {
	if (!value) return false;
	if (typeof value !== 'string' && typeof value !== 'number') return false;
	const str = value.toString();
	if (str.includes('GMT')) return true;
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
				<div className="space-y-3">
					<a href={fileUrl} target="_blank" rel="noreferrer" className="block group">
						<div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
							<img
								src={fileUrl}
								alt={filename || 'attachment'}
								className="max-h-64 w-full object-contain group-hover:scale-105 transition-transform duration-300"
								loading="lazy"
							/>
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
						</div>
					</a>

					<div className="flex flex-wrap gap-2">
						<a
							href={fileUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
							title="Preview in new tab"
						>
							<ExternalLink size={16} />
							<span>Preview</span>
						</a>

						<a
							href={fileUrl}
							download={filename || true}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all active:scale-95"
							title="Download"
							target="_blank"
						>
							<Download size={16} />
							<span>Download</span>
						</a>

						{filename && (
							<span className="text-xs text-gray-500 self-center px-2 py-1 bg-gray-100 rounded-md">
								{filename}
								{typeof size === 'number' ? ` • ${(size / 1024).toFixed(1)} KB` : ''}
							</span>
						)}
					</div>
				</div>
			) : (
				<div className="space-y-3">
					<div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-gray-300 transition-colors">
						<div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
							<FileText className="text-indigo-600" size={24} />
						</div>
						<div className="min-w-0 flex-1">
							<div className="text-sm font-semibold text-gray-800 truncate">{filename || 'Attachment'}</div>
							<div className="text-xs text-gray-500 mt-0.5">
								{mimeType || 'file'}
								{typeof size === 'number' ? ` • ${(size / 1024).toFixed(1)} KB` : ''}
							</div>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						<a
							href={fileUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
						>
							<ExternalLink size={16} />
							<span>Open</span>
						</a>

						<a
							href={fileUrl}
							target="_blank"
							download={filename || true}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium hover:from-indigo-700 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all active:scale-95"
						>
							<Download size={16} />
							<span>Download</span>
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
		setLoadingProjectDetails(true);
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

	const assetsByBaseKey = useMemo(() => {
		const answers = currentSubmission?.answers || {};
		const map = {};
		for (const [k, v] of Object.entries(answers)) {
			if (k.endsWith('_asset') && v && typeof v === 'object') {
				const baseKey = k.replace(/_asset$/, '');
				map[baseKey] = v;
			}
		}
		return map;
	}, [currentSubmission]);

	function ProjectDetailsSkeleton() {
		return (
			<div className=" space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50/50">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
								<div className="space-y-2">
									<div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse" />
									<div className="h-3 w-24 bg-gray-200 rounded-lg animate-pulse" />
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
							<div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
							<div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="flex gap-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 ">
			{/* Sidebar Projects */}
			<aside className="sticky top-[100px] w-80 h-fit bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
				<div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-5">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
								<FolderOpen className="text-white" size={24} />
							</div>
							<h2 className="font-bold text-xl text-white capitalize">{t('projects')}</h2>
						</div>
						{user?.role === 'admin' && (
							<button
								onClick={() => setShowNewProjectModal(true)}
								title={t('createNewForm')}
								className="cursor-pointer group flex items-center gap-2 bg-white text-indigo-600 px-3 py-2 rounded-lg hover:bg-white/90 transition-all text-sm font-semibold shadow-md hover:shadow-lg active:scale-95"
							>
								<Plus size={18} className="group-hover:rotate-90 transition-transform" />
								<span>{t('create')}</span>
							</button>
						)}
					</div>
				</div>

				<div className="">
					<div className="space-y-2 mt-2 max-h-[600px] overflow-y-auto scrollbar-custom">
						{loadingpage ? (
							Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className=" mx-4 h-14 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-xl"></div>
							))
						) : projects.length > 0 ? (
							projects.map(project => (
								<div
									key={project.id}
									onClick={() => handleSelectProject(project)}
									className={`group mx-3 flex justify-between items-center p-3 rounded-xl transition-all cursor-pointer ${
										selectedProjectId === project.id
											? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-2 border-indigo-300 shadow-md'
											: 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
									}`}
								>
									{editingId === project.id ? (
										<input
											autoFocus
											className="flex-1 text-sm border-2 border-indigo-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
											value={newName}
											onChange={e => setNewName(e.target.value)}
											onBlur={() => handleRenameProject(project.id, newName)}
											onKeyDown={e => {
												if (e.key === 'Enter') handleRenameProject(project.id, newName);
											}}
										/>
									) : (
										<>
											<div className="flex items-center gap-3 flex-1 min-w-0">
												<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
													selectedProjectId === project.id ? 'bg-indigo-600' : 'bg-gray-200'
												}`}>
													<Folder className={selectedProjectId === project.id ? 'text-white' : 'text-gray-600'} size={20} />
												</div>
												<span
													onDoubleClick={() => {
														setEditingId(project.id);
														setNewName(project.name);
													}}
													className={`text-sm font-semibold truncate ${
														selectedProjectId === project.id ? 'text-indigo-900' : 'text-gray-700'
													}`}
												>
													{project.name}
												</span>
											</div>

											<div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={e => {
														e.stopPropagation();
														setEditingId(project.id);
														setNewName(project.name);
													}}
													className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all active:scale-90"
													title={t('edit')}
												>
													<Pencil size={16} />
												</button>
												<button
													onClick={e => {
														e.stopPropagation();
														confirmDeleteProject(project.id);
													}}
													className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-all active:scale-90"
													title={t('delete')}
												>
													<Trash2 size={16} />
												</button>
											</div>
										</>
									)}
								</div>
							))
						) : (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="p-4 bg-gray-100 rounded-full mb-3">
									<Folder className="text-gray-400" size={32} />
								</div>
								<p className="text-gray-500 text-sm">{t('noProjectsFound')}</p>
							</div>
						)}
					</div>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1">
				{selectedProjectId ? (
					<div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
						<div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 border-b-2 border-gray-200">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-indigo-100 rounded-xl">
									<Folder className="text-indigo-600" size={24} />
								</div>
								<h3 className="text-xl font-bold text-gray-900">{projects.find(p => p.id === selectedProjectId)?.name}</h3>
							</div>
						</div>

						<div className="p-6">
							{loadingProjectDetails ? (
								<ProjectDetailsSkeleton />
							) : users.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="p-5 bg-gray-100 rounded-full mb-4">
										<Users size={48} className="text-gray-400" />
									</div>
									<h4 className="text-lg font-semibold text-gray-700 mb-1">{t('noUsersFound')}</h4>
									<p className="text-sm text-gray-500">No users are assigned to this project yet</p>
								</div>
							) : (
								<div className="space-y-4">
									{users.map((u, idx) => (
										<div key={u.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
											<div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 border-b-2 border-gray-200">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
														{u.email.charAt(0).toUpperCase()}
													</div>
													<div className="flex-1 min-w-0">
														<h4 className="font-semibold text-gray-900 truncate">{u.email}</h4>
														<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 mt-1">
															{u.role}
														</span>
													</div>
												</div>
											</div>

											{u.formSubmissions?.length > 0 ? (
												<div className="overflow-x-auto">
													<table className="min-w-full divide-y divide-gray-200">
														<thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
															<tr>
																<th className="rtl:text-right px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('status')}</th>
																<th className="rtl:text-right px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('submissionDate')}</th>
																<th className="rtl:text-right px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('actions')}</th>
															</tr>
														</thead>
														<tbody className="bg-white divide-y divide-gray-100">
															{u.formSubmissions.map((submission, subIdx) => (
																<tr key={subIdx} className={`transition-colors ${subIdx % 2 === 0 ? 'bg-white hover:bg-gray-50/50' : 'bg-gray-50/30 hover:bg-gray-50'}`}>
																	<td className="px-6 py-4 whitespace-nowrap">
																		<CustomCheckbox setUsers={setUsers} submission={submission} t={t} />
																	</td>
																	<td className="px-6 py-4 whitespace-nowrap">
																		<div className="flex items-center gap-2 text-sm text-gray-700">
																			<Calendar size={16} className="text-gray-400" />
																			<span>{new Date(submission.created_at).toLocaleString()}</span>
																		</div>
																	</td>
																	<td className="px-6 py-4 whitespace-nowrap">
																		<button
																			onClick={() => viewSubmissionDetails(submission)}
																			className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg font-medium text-sm transition-all active:scale-95 border-2 border-transparent hover:border-indigo-400"
																		>
																			<Eye size={16} />
																			<span>{t('view')}</span>
																		</button>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											) : (
												<div className="flex flex-col items-center justify-center py-8 text-center">
													<div className="p-3 bg-gray-100 rounded-full mb-2">
														<FileText className="text-gray-400" size={24} />
													</div>
													<p className="text-gray-500 text-sm">{t('noSubmissionsFound')}</p>
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg flex items-center justify-center h-[600px]">
						<div className="text-center py-12 px-6">
							<div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full mb-6 inline-block">
								<Folder size={56} className="text-indigo-400" />
							</div>
							<h3 className="text-2xl font-bold text-gray-800 mb-2">{t('noProjectSelected')}</h3>
							<p className="text-gray-500 max-w-md mx-auto">{t('selectProjectToViewDetails')}</p>
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
				<form onSubmit={handleSubmit(handleCreateProject)} className="space-y-5">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">{t('projectName')}</label>
						<input
							type="text"
							{...register('name', { required: true })}
							className="block w-full border-2 border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-all"
							placeholder="Enter project name..."
						/>
					</div>
					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={() => setShowNewProjectModal(false)}
							className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
						>
							{t('cancel')}
						</button>
						<button
							type="submit"
							className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all active:scale-95"
						>
							{t('create')}
						</button>
					</div>
				</form>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal title={t('confirmDelete')} show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
				<div className="space-y-5">
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
							<Trash2 className="text-rose-600" size={24} />
						</div>
						<div className="flex-1">
							<p className="text-gray-700 font-medium">{t('confirmDeleteProjectMessage')}</p>
							<p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
						</div>
					</div>
					<div className="flex justify-end gap-3 pt-2 border-t-2 border-gray-100">
						<button
							onClick={() => setShowDeleteModal(false)}
							className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
						>
							{t('cancel')}
						</button>
						<button
							onClick={handleDeleteProject}
							className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-xl text-sm font-semibold hover:from-rose-700 hover:to-rose-600 shadow-md hover:shadow-lg transition-all active:scale-95"
						>
							{t('delete')}
						</button>
					</div>
				</div>
			</Modal>

			{/* Submission Details Modal */}
			<Modal title={t('submissionDetails')} show={showSubmissionModal} onClose={() => setShowSubmissionModal(false)} cn="max-w-3xl">
				{currentSubmission && (
					<div className="space-y-6">
						<div className="max-h-[500px] overflow-y-auto overflow-x-hidden px-2 space-y-3 scrollbar-custom">
							{Object.entries(currentSubmission.answers || {})
								.filter(([key]) => !key.endsWith('_asset'))
								.map(([key, value]) => {
									const asset = assetsByBaseKey[key];
									const hasAssetObject = asset && typeof asset === 'object' && asset.url;
									const hasUploadsString = isUploadsPath(value);

									if (hasUploadsString || hasAssetObject) {
										const fileUrl = hasAssetObject ? buildFileUrl(asset.url) : buildFileUrl(value);
										const filename = hasAssetObject ? asset.filename : key;
										const mimeType = hasAssetObject ? asset.mimeType : '';
										const size = hasAssetObject ? asset.size : undefined;

										return (
											<div key={key} className="flex flex-col border-2 border-gray-200 shadow-sm rounded-xl p-4 bg-gradient-to-br from-white to-gray-50/50">
												<span className="text-sm font-bold text-gray-700 capitalize mb-3 flex items-center gap-2">
													<div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
													{key}
												</span>
												<div className="w-full">
													<AttachmentView fileUrl={fileUrl} filename={filename} mimeType={mimeType} size={size} />
												</div>
											</div>
										);
									}

									if (typeof value === 'object') {
										return null;
									}

									return (
										<div key={key} className="flex flex-col sm:flex-row sm:items-center border-2 border-gray-200 shadow-sm rounded-xl p-4 bg-gradient-to-br from-white to-gray-50/50 gap-2">
											<span className="text-sm font-bold text-gray-700 capitalize min-w-[180px] flex items-center gap-2">
												<div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
												{key}:
											</span>
											<span className="text-sm text-gray-800 font-medium break-words flex-1">{renderValueAsText(value)}</span>
										</div>
									);
								})}
						</div>

						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t-2 pt-5 border-gray-200 gap-3">
							<div className="flex items-center gap-2 text-sm">
								<Calendar size={18} className="text-indigo-500" />
								<span className="text-gray-600">{t('submittedOn')}:</span>
								<span className="font-semibold text-gray-800">
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