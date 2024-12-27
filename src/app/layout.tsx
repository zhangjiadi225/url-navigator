import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
})

export const metadata: Metadata = {
	title: '测试数据生成器',
	description: '生成测试用的统一社会信用代码和手机号',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="zh-CN">
			<body className={`${inter.variable} font-sans antialiased`}>
				{children}
			</body>
		</html>
	)
}
