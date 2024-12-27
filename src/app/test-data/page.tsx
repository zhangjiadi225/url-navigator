'use client';
import { Faker, zh_CN } from '@faker-js/faker'
import { useState } from 'react';

const customFaker = new Faker({
	locale: [zh_CN],
})

function organizationVaild(text: string) {
	return /[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}/.test(text)
}
function phoneValidType(txt: string) {
	return /^1[3456789]\d{9}$/.test(txt)
}
function idCardVerification(txt: string) {
	return /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
		txt
	)
}

type PersonRecord = {
	id: number
	name: string
	idCard: string
}

export default function TestDataGenerator() {
	const [records, setRecords] = useState<PersonRecord[]>(() => {
		if (typeof window !== 'undefined') {
			const saved = sessionStorage.getItem('personRecords')
			return saved ? JSON.parse(saved) : []
		}
		return []
	})

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const calculateCheckDigit = (code: string) => {
		const weights = [
			1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28,
		]
		const checkChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		let sum = 0

		for (let i = 0; i < code.length; i++) {
			sum += parseInt(code[i], 36) * weights[i]
		}

		const mod = sum % 31
		return checkChars[mod]
	}

	const generateUSCCode = () => {
		const managementDeptCode = customFaker.helpers.arrayElement(['1', '5'])
		const institutionCategoryCode = customFaker.string.numeric(1)
		const adminDivisionCode = customFaker.string.numeric(6)
		const entityIdentifierCode = customFaker.string.numeric(9)
		const baseCode = `${managementDeptCode}${institutionCategoryCode}${adminDivisionCode}${entityIdentifierCode}`
		const checkDigit = calculateCheckDigit(baseCode)
		return `${baseCode}${checkDigit}`
	}

	const handleGenerateClick = () => {
		const generatedCode = generateUSCCode()
		const inputElement = document.getElementById(
			'uscCodeInput'
		) as HTMLInputElement
		if (inputElement) {
			inputElement.value = generatedCode
		}
	}

	const showMessage = (message: string) => {
		const messageElement = document.createElement('div')
		messageElement.textContent = message
		messageElement.style.position = 'fixed'
		messageElement.style.top = '50%'
		messageElement.style.left = '50%'
		messageElement.style.transform = 'translate(-50%, -50%)'
		messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
		messageElement.style.color = 'white'

		messageElement.style.padding = '10px'
		messageElement.style.borderRadius = '5px'
		messageElement.style.zIndex = '1000'
		document.body.appendChild(messageElement)

		setTimeout(() => {
			document.body.removeChild(messageElement)
		}, 1000)
	}

	const handleValidateUSCClick = () => {
		const inputElement = document.getElementById(
			'uscCodeInput'
		) as HTMLInputElement
		if (inputElement) {
			const isValid = organizationVaild(inputElement.value)
			showMessage(
				isValid ? '统一社会信用代码格式正确' : '统一社会信用代码格式错误'
			)
		}
	}

	const generatePhoneNumber = () => {
		const secondDigit = customFaker.helpers.arrayElement([
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
		])
		return `1${secondDigit}${customFaker.string.numeric(9)}`
	}

	const handleGeneratePhoneClick = () => {
		const generatedPhone = generatePhoneNumber()
		const phoneInputElement = document.getElementById(
			'phoneInput'
		) as HTMLInputElement
		if (phoneInputElement) {
			phoneInputElement.value = generatedPhone
		}
	}

	const handleValidatePhoneClick = () => {
		const phoneInputElement = document.getElementById(
			'phoneInput'
		) as HTMLInputElement
		if (phoneInputElement) {
			const isValid = phoneValidType(phoneInputElement.value)
			showMessage(isValid ? '手机号格式正确' : '手机号格式错误')
		}
	}

	const fetchSmsCode = async (phone: string) => {
		try {
			const response = await fetch(
				`http://47.117.138.225:8080/conf/test/setSmsCode?phone=${phone}`
			)
			const data = await response.json()
			return data.data // 假设响应体中有一个 data 字段
		} catch (error) {
			console.error('Failed to fetch SMS code:', error)
			return null
		}
	}

	const handleFetchSmsCodeClick = async () => {
		const phoneInputElement = document.getElementById(
			'phoneInput'
		) as HTMLInputElement
		if (phoneInputElement) {
			const smsCode = await fetchSmsCode(phoneInputElement.value)
			if (smsCode) {
				try {
					await navigator.clipboard.writeText(smsCode)
					showMessage(`验证码已复制到剪切板: ${smsCode}`)
				} catch (error) {
					showMessage(error as string)
				}
			} else {
				showMessage('获取验证码失败')
			}
		}
	}

	const generateRandomName = () => {
		const firstName = customFaker.person.lastName()
		const secondName = customFaker.person.firstName()
		return `${firstName}${secondName}`
	}
	const generateRandomIdCard = () => {
		// 生成6位行政区划码
		const areaCode = customFaker.string.numeric(6)

		// 生成8位出生日期 (1960-2005年)
		const year = customFaker.number.int({ min: 1960, max: 2005 })
		const month = customFaker.number
			.int({ min: 1, max: 12 })
			.toString()
			.padStart(2, '0')
		const day = customFaker.number
			.int({ min: 1, max: 28 })
			.toString()
			.padStart(2, '0')
		const birthDate = `${year}${month}${day}`

		// 生成3位顺序码
		const sequenceCode = customFaker.string.numeric(3)

		// 计算校验码
		const baseCode = `${areaCode}${birthDate}${sequenceCode}`
		const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
		const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

		let sum = 0
		for (let i = 0; i < 17; i++) {
			sum += parseInt(baseCode[i]) * weights[i]
		}
		const checkCode = checkCodes[sum % 11]

		return `${baseCode}${checkCode}`
	}

	const handleGeneratePersonClick = () => {
		const name = generateRandomName()
		const idCard = generateRandomIdCard()

		const nameInput = document.getElementById('nameInput') as HTMLInputElement
		const idCardInput = document.getElementById(
			'idCardInput'
		) as HTMLInputElement

		if (nameInput && idCardInput) {
			nameInput.value = name
			idCardInput.value = idCard

			const newRecord: PersonRecord = {
				id: Date.now(),
				name,
				idCard,
			}

			const updatedRecords = [newRecord, ...records].slice(0, 50)
			setRecords(updatedRecords)
			sessionStorage.setItem('personRecords', JSON.stringify(updatedRecords))
		}
	}

	const handleValidateIdCardClick = () => {
		const idCardInput = document.getElementById(
			'idCardInput'
		) as HTMLInputElement
		if (idCardInput) {
			const isValid = idCardVerification(idCardInput.value)
			showMessage(isValid ? '身份证号格式正确' : '身份证号格式错误')
		}
	}

	return (
		<div className="relative">
			<div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
				<div className="flex items-start">
					<input
						id="uscCodeInput"
						type="text"
						placeholder="统一社会信用代码"
						className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
					/>
					<button
						className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						onClick={handleGenerateClick}
					>
						生成
					</button>
					<button
						className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						onClick={handleValidateUSCClick}
					>
						校验
					</button>
				</div>

				<div className="flex items-start">
					<input
						id="phoneInput"
						type="text"
						placeholder="手机号"
						className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
					/>
					<button
						className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						onClick={handleGeneratePhoneClick}
					>
						生成手机号
					</button>
					<button
						className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						onClick={handleValidatePhoneClick}
					>
						校验手机号
					</button>
					<button
						className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						onClick={handleFetchSmsCodeClick}
					>
						获取验证码
					</button>
				</div>

				<div className="flex items-start">
					<input
						id="nameInput"
						type="text"
						placeholder="姓名"
						className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
					/>
					<input
						id="idCardInput"
						type="text"
						placeholder="身份证号"
						className="flex-1 ml-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
					/>
					<button
						className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						onClick={handleGeneratePersonClick}
					>
						生成
					</button>
					<button
						className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						onClick={handleValidateIdCardClick}
					>
						校验
					</button>
				</div>
			</div>

			<button
				className="fixed right-4 top-1/2 -translate-y-1/2 px-4 py-8 bg-blue-500 text-white rounded-l hover:bg-blue-600 transition-colors"
				onClick={() => setIsDrawerOpen(true)}
			>
				历史记录
			</button>

			{isDrawerOpen && (
				<>
					<div
						className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
						onClick={() => setIsDrawerOpen(false)}
					/>
					<div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg transition-transform">
						<div className="p-4 flex justify-between items-center border-b">
							<h2 className="text-lg font-semibold">历史记录</h2>
							<button
								className="p-2 hover:bg-gray-100 rounded"
								onClick={() => setIsDrawerOpen(false)}
							>
								✕
							</button>
						</div>
						<div className="p-4 h-[calc(100%-4rem)] overflow-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50 sticky top-0">
									<tr>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											姓名
										</th>
										<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											身份证号
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{records.map((record) => (
										<tr key={record.id}>
											<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
												{record.name}
											</td>
											<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
												{record.idCard}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
