import { redirect } from 'next/navigation'

export default function Icon() {
  // 重定向到静态图标文件
  redirect('/icons/icon-192x192.png')
} 