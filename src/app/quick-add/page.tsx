'use client'

import { useState, useEffect } from 'react'
import { todoDB } from '@/app/utils/indexedDB'
import './styles.css'

interface WebsiteItem {
	id: string
	url: string
	title: string
	username: string
	password: string
	visitedAt?: string
}

interface Category {
	id: string
	name: string
	websites: WebsiteItem[]
}

export default function QuickAdd() {
	const [categories, setCategories] = useState<Category[]>([])
	const [newCategory, setNewCategory] = useState('')
	const [newUrl, setNewUrl] = useState('')
	const [activeCategory, setActiveCategory] = useState<string>('')
	const [activeWebsite, setActiveWebsite] = useState<string>('')
	const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<{
		type: 'category' | 'website'
		id: string
	} | null>(null)
	const [showConfig, setShowConfig] = useState(false)
	const [configData, setConfigData] = useState('')

	useEffect(() => {
		const checkData = async () => {
			const existingCategories = await todoDB.getAllCategories()
			if (existingCategories.length === 0) {
				setShowConfig(true)
			} else {
				setCategories(existingCategories)
			}
		}

		checkData()
	}, [])

	const handleImportConfig = async () => {
		try {
			const data = JSON.parse(configData)
			const formattedCategories = data.categories.map(
				(cat: {
					name: string
					urls: {
						url: string
						title: string
						account?: string
						password?: string
						visitedAt?: string
					}[]
				}) => ({
					id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
					name: cat.name,
					websites: cat.urls.map(
						(url: {
							url: string
							title: string
							account?: string
							password?: string
							visitedAt?: string
						}) => ({
							id:
								Date.now().toString() + Math.random().toString(36).substr(2, 9),
							url: url.url,
							title: url.title,
							username: url.account || '',
							password: url.password || '',
							visitedAt: url.visitedAt,
						})
					),
				})
			)

			for (const category of formattedCategories) {
				await todoDB.addCategory(category)
			}

			setCategories(formattedCategories)
			setShowConfig(false)
			setConfigData('')
		} catch (error) {
			console.error('Failed to import config:', error)
			alert('配置数据格式错误，请检查后重试')
		}
	}

	const handleAddCategory = async (
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === 'Enter' && newCategory.trim()) {
			const category: Category = {
				id: Date.now().toString(),
				name: newCategory,
				websites: [],
			}
			try {
				await todoDB.addCategory(category)
				setCategories([...categories, category])
				setNewCategory('')
			} catch (error) {
				console.error('Failed to add category:', error)
			}
		}
	}

	const handleAddWebsite = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && newUrl.trim() && activeCategory) {
			const newItem: WebsiteItem = {
				id: Date.now().toString(),
				url: newUrl,
				title: new URL(newUrl).hostname,
				username: '',
				password: '',
			}

			try {
				const updatedCategories = categories.map((cat) =>
					cat.id === activeCategory
						? { ...cat, websites: [...cat.websites, newItem] }
						: cat
				)

				const updatedCategory = updatedCategories.find(
					(cat) => cat.id === activeCategory
				)
				if (updatedCategory) {
					await todoDB.updateCategory(updatedCategory)
					setCategories(updatedCategories)
					setNewUrl('')
				}
			} catch (error) {
				console.error('Failed to add website:', error)
			}
		}
	}

	const handleUpdateWebsite = async (
		categoryId: string,
		websiteId: string,
		field: 'title' | 'username' | 'password',
		value: string
	) => {
		try {
			const updatedCategories = categories.map((cat) => {
				if (cat.id === categoryId) {
					const updatedWebsites = cat.websites.map((website) =>
						website.id === websiteId ? { ...website, [field]: value } : website
					)
					return { ...cat, websites: updatedWebsites }
				}
				return cat
			})

			const updatedCategory = updatedCategories.find(
				(cat) => cat.id === categoryId
			)
			if (updatedCategory) {
				await todoDB.updateCategory(updatedCategory)
				setCategories(updatedCategories)
			}
		} catch (error) {
			console.error('Failed to update website:', error)
		}
	}

	const handleDeleteCategory = async (categoryId: string) => {
		try {
			await todoDB.deleteCategory(categoryId)
			const newCategories = categories.filter((cat) => cat.id !== categoryId)
			setCategories(newCategories)
			if (activeCategory === categoryId) {
				setActiveCategory('')
				setActiveWebsite('')
			}
			setDeleteTarget(null)
		} catch (error) {
			console.error('Failed to delete category:', error)
		}
	}

	const handleDeleteWebsite = async (categoryId: string, websiteId: string) => {
		try {
			const updatedCategories = categories.map((cat) => {
				if (cat.id === categoryId) {
					return {
						...cat,
						websites: cat.websites.filter((web) => web.id !== websiteId),
					}
				}
				return cat
			})

			const updatedCategory = updatedCategories.find(
				(cat) => cat.id === categoryId
			)
			if (updatedCategory) {
				await todoDB.updateCategory(updatedCategory)
				setCategories(updatedCategories)
				if (activeWebsite === websiteId) {
					setActiveWebsite('')
				}
			}
			setDeleteTarget(null)
		} catch (error) {
			console.error('Failed to delete website:', error)
		}
	}

	// 格式化当前数据为 JSON 字符串
	const formatCurrentData = () => {
		const data = {
			categories: categories.map((cat) => ({
				name: cat.name,
				urls: cat.websites.map((web) => ({
					url: web.url,
					title: web.title,
					account: web.username,
					password: web.password,
					visitedAt: web.visitedAt || new Date().toISOString(),
				})),
			})),
		}
		return JSON.stringify(data, null, 2)
	}

	// 修改配置按钮的点击处理
	const handleConfigClick = () => {
		setConfigData(formatCurrentData())
		setShowConfig(true)
	}

	// 添加复制文本到剪贴板的函数
	const copyToClipboard = async (text: string) => {
		try {
			const tempInput = document.createElement('input')
			tempInput.value = text
			document.body.appendChild(tempInput)
			tempInput.select()
			document.execCommand('copy')
			document.body.removeChild(tempInput)
		} catch (error) {
			console.error('Failed to copy:', error)
		}
	}

	// 修改网址点击处理函数
	const handleWebsiteClick = (
		categoryId: string,
		websiteId: string,
		username: string
	) => {
		setActiveCategory(categoryId)
		setActiveWebsite(websiteId)
		copyToClipboard(username)
	}

	return (
		<>
			<div className="flex h-[calc(100vh-64px)]">
				{/* 左侧分类区域 */}
				<div className="w-1/8 border-r p-4 overflow-y-auto">
					<div className="mb-4">
						<input
							type="text"
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="添加新分类"
							value={newCategory}
							onChange={(e) => setNewCategory(e.target.value)}
							onKeyPress={handleAddCategory}
						/>
					</div>
					<div className="space-y-2">
						{categories.map((category) => (
							<div key={category.id} className="flex items-center gap-2 group">
								<button
									onClick={() => setActiveCategory(category.id)}
									className={`flex-1 text-left px-4 py-2 rounded ${
										activeCategory === category.id
											? 'bg-blue-500 text-white'
											: 'hover:bg-gray-100'
									}`}
								>
									{category.name}
								</button>
								<button
									className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
									onClick={(e) => {
										e.stopPropagation()
										setDeleteTarget({ type: 'category', id: category.id })
									}}
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							</div>
						))}
					</div>
				</div>

				{/* 右侧内容区域 */}
				<div className="flex-1 p-4 flex justify-center overflow-y-auto">
					<div className="w-full">
						<div className="mb-4">
							<input
								type="url"
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder={activeCategory ? '添加新网址' : '请先选择分类'}
								value={newUrl}
								onChange={(e) => setNewUrl(e.target.value)}
								onKeyPress={handleAddWebsite}
								disabled={!activeCategory}
							/>
						</div>
						<div className="flex gap-4 relative">
							{/* 网址列表 */}
							<div className="w-[1000px]">
								{activeCategory &&
									categories
										.find((cat) => cat.id === activeCategory)
										?.websites.map((website) => (
											<div
												key={website.id}
												className={`p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors duration-300 group relative ${
													website.id === activeWebsite
														? 'border-blue-500 shadow-lg relative active-website'
														: 'border-gray-200'
												}`}
												onClick={() => setActiveWebsite(website.id)}
											>
												{/* 删除按钮 */}
												<button
													className="absolute right-3 top-3 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={(e) => {
														e.stopPropagation()
														setDeleteTarget({ type: 'website', id: website.id })
													}}
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>

												{/* 标题区域 */}
												<div className="flex items-center gap-2 mb-2 w-[400px]">
													<a
														href={website.url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-500 hover:text-blue-700 flex-shrink-0"
														onClick={(e) => {
															e.stopPropagation()
															handleWebsiteClick(
																activeCategory,
																website.id,
																website.username
															)
														}}
													>
														<svg
															className="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
															/>
														</svg>
													</a>
													<h3
														className="font-medium outline-none truncate flex-1 editable-title"
														contentEditable
														suppressContentEditableWarning
														onFocus={() => setEditingTitleId(website.id)}
														onBlur={(e) => {
															handleUpdateWebsite(
																activeCategory,
																website.id,
																'title',
																e.currentTarget.textContent || ''
															)
															setEditingTitleId(null)
														}}
														onClick={(e) => e.stopPropagation()}
													>
														{website.title}
													</h3>
													{editingTitleId === website.id && (
														<button
															className="p-1 text-gray-400 hover:text-blue-500"
															onClick={(e) => {
																e.stopPropagation()
																const titleElement = e.currentTarget
																	.previousElementSibling as HTMLElement
																titleElement.blur()
															}}
														>
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														</button>
													)}
												</div>
												{/* URL 区域 */}
												<div
													className="text-sm text-gray-500 pl-7 truncate"
													title={website.url}
												>
													{website.url}
												</div>
											</div>
										))}
							</div>

							{/* 账号密码区域 */}
							<div className="w-[400px]">
								<div
									className={`credentials-container ${
										activeWebsite ? 'active' : ''
									}`}
								>
									<div
										className={`p-4 border rounded transition-colors duration-300 active-credentials ${
											activeWebsite
												? 'border-blue-500 shadow-lg'
												: 'border-gray-200'
										}`}
									>
										<h3 className="font-medium mb-2">账号信息</h3>
										<div className="space-y-2">
											<div
												contentEditable
												className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												onBlur={(e) =>
													handleUpdateWebsite(
														activeCategory,
														activeWebsite,
														'username',
														e.currentTarget.textContent || ''
													)
												}
												suppressContentEditableWarning
											>
												{
													categories
														.find((cat) => cat.id === activeCategory)
														?.websites.find((web) => web.id === activeWebsite)
														?.username
												}
											</div>
											<div
												contentEditable
												className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												onBlur={(e) =>
													handleUpdateWebsite(
														activeCategory,
														activeWebsite,
														'password',
														e.currentTarget.textContent || ''
													)
												}
												suppressContentEditableWarning
											>
												{
													categories
														.find((cat) => cat.id === activeCategory)
														?.websites.find((web) => web.id === activeWebsite)
														?.password
												}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* 删除确认对话框 */}
				{deleteTarget && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded-lg shadow-xl">
							<h3 className="text-lg font-semibold mb-4">确认删除</h3>
							<p className="mb-4">
								{deleteTarget.type === 'category'
									? '确定要删除这个分类吗？该分类下的所有网址也会被删除。'
									: '确定要删除这个网址吗？'}
							</p>
							<div className="flex justify-end gap-2">
								<button
									className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
									onClick={() => setDeleteTarget(null)}
								>
									取消
								</button>
								<button
									className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
									onClick={() => {
										if (deleteTarget.type === 'category') {
											handleDeleteCategory(deleteTarget.id)
										} else {
											handleDeleteWebsite(activeCategory, deleteTarget.id)
										}
									}}
								>
									确认删除
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* 配置弹框 */}
			{showConfig && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-xl w-[800px]">
						<h3 className="text-lg font-semibold mb-4">初始化配置</h3>
						<p className="mb-4 text-gray-600">请粘贴配置数据（JSON 格式）：</p>
						<textarea
							className="w-full h-[400px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
							value={configData}
							onChange={(e) => setConfigData(e.target.value)}
							placeholder="请粘贴 JSON 配置数据..."
						/>
						<div className="flex justify-end gap-2 mt-4">
							<button
								className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
								onClick={() => {
									if (categories.length === 0) {
										alert('必须先导入初始数据')
										return
									}
									setShowConfig(false)
								}}
							>
								取消
							</button>
							<button
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
								onClick={handleImportConfig}
							>
								导入
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 配置按钮 */}
			<button
				className="fixed right-4 bottom-4 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
				onClick={handleConfigClick}
				title="导入配置"
			>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
			</button>
		</>
	)
}
