'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.replace('/auth/login')
    } else {
      const { role } = JSON.parse(stored)
      router.replace(role === 'admin' ? '/dashboard' : '/student')
    }
  }, [])
  return null
}