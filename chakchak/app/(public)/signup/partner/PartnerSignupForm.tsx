'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const schema = z.object({
  target_role: z.enum(['dealer', 'semi_dealer', 'installer']),
  business_name: z.string().min(2, '상호명을 입력하세요'),
  business_no: z.string().min(10, '사업자등록번호를 입력하세요'),
  region_sido: z.string().min(1, '시/도를 선택하세요'),
  region_sigungu: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SIDO_LIST = [
  '서울','부산','대구','인천','광주','대전','울산','세종',
  '경기','강원','충북','충남','전북','전남','경북','경남','제주'
]

const ROLE_LABELS: Record<string, string> = {
  dealer: '대리점',
  semi_dealer: '세미딜러',
  installer: '장착자',
}

export default function PartnerSignupForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [docFile, setDocFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    const supabase = createClient()
    let docs_url: string | null = null

    if (docFile) {
      const ext = docFile.name.split('.').pop()
      const path = `docs/${userId}_${Date.now()}.${ext}`
      const { data: upload, error: uploadErr } = await supabase.storage
        .from('partner-docs')
        .upload(path, docFile)
      if (!uploadErr && upload) {
        const { data: urlData } = supabase.storage
          .from('partner-docs')
          .getPublicUrl(upload.path)
        docs_url = urlData.publicUrl
      }
    }

    await supabase.from('user_approvals').insert({
      requester_id: userId,
      target_role: data.target_role,
      docs_url,
      status: 'pending',
    })

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">희망 역할</label>
        <select
          {...register('target_role')}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">선택하세요</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {errors.target_role && <p className="text-xs text-red-500 mt-1">{errors.target_role.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상호명</label>
        <input
          {...register('business_name')}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="예: 홍길동 어태치먼트"
        />
        {errors.business_name && <p className="text-xs text-red-500 mt-1">{errors.business_name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">사업자등록번호</label>
        <input
          {...register('business_no')}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="000-00-00000"
        />
        {errors.business_no && <p className="text-xs text-red-500 mt-1">{errors.business_no.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시/도</label>
          <select
            {...register('region_sido')}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">선택</option>
            {SIDO_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.region_sido && <p className="text-xs text-red-500 mt-1">{errors.region_sido.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시/군/구</label>
          <input
            {...register('region_sigungu')}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="선택사항"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">서류 첨부 (사업자등록증 등)</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => setDocFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? '제출 중...' : '신청 제출'}
      </button>
    </form>
  )
}
