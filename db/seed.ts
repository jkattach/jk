import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ACCOUNTS = [
  { email: 'admin@chakchak.local', password: 'chakchak-admin-2026', role: 'admin', display_name: '관리자' },
  { email: 'staff1@chakchak.local', password: 'chakchak-staff-2026', role: 'internal_staff', display_name: '본사직원1', sido: '서울' },
  { email: 'dealer1@chakchak.local', password: 'chakchak-dealer-2026', role: 'dealer', display_name: '서울대리점', sido: '서울', business_name: '서울어태치먼트' },
  { email: 'dealer2@chakchak.local', password: 'chakchak-dealer-2026', role: 'dealer', display_name: '경기대리점', sido: '경기', business_name: '경기어태치먼트' },
  { email: 'dealer3@chakchak.local', password: 'chakchak-dealer-2026', role: 'dealer', display_name: '부산대리점', sido: '부산', business_name: '부산어태치먼트' },
  { email: 'semi1@chakchak.local', password: 'chakchak-semi-2026', role: 'semi_dealer', display_name: '서울세미딜러', sido: '서울', business_name: '서울세미' },
  { email: 'semi2@chakchak.local', password: 'chakchak-semi-2026', role: 'semi_dealer', display_name: '대구세미딜러', sido: '대구', business_name: '대구세미' },
  { email: 'installer1@chakchak.local', password: 'chakchak-install-2026', role: 'installer', display_name: '서울장착자', sido: '서울', business_name: '서울장착' },
  { email: 'installer2@chakchak.local', password: 'chakchak-install-2026', role: 'installer', display_name: '경기장착자', sido: '경기', business_name: '경기장착' },
  { email: 'installer3@chakchak.local', password: 'chakchak-install-2026', role: 'installer', display_name: '부산장착자', sido: '부산', business_name: '부산장착' },
  { email: 'cust1@chakchak.local', password: 'chakchak-cust-2026', role: 'customer', display_name: '고객1' },
  { email: 'cust2@chakchak.local', password: 'chakchak-cust-2026', role: 'customer', display_name: '고객2(기업)' },
]

const CATEGORIES = [
  { name: '어태치먼트', slug: 'attachment', sort_order: 0, parent_id: null },
  { name: '브레이커', slug: 'breaker', sort_order: 1 },
  { name: '크러셔', slug: 'crusher', sort_order: 2 },
  { name: '버킷', slug: 'bucket', sort_order: 3 },
  { name: '그래플', slug: 'grapple', sort_order: 4 },
  { name: '퀵커플러', slug: 'quick-coupler', sort_order: 5 },
  { name: '마그넷', slug: 'magnet', sort_order: 6 },
  { name: '컴팩터', slug: 'compactor', sort_order: 7 },
]

const ATTACHMENTS = [
  { brand: 'TBD', model_code: 'BR-03', display_name: '소형 브레이커 BR-03', category_slug: 'breaker', ton_min: 3, ton_max: 6 },
  { brand: 'TBD', model_code: 'BR-07', display_name: '중형 브레이커 BR-07', category_slug: 'breaker', ton_min: 7, ton_max: 14 },
  { brand: 'TBD', model_code: 'BR-20', display_name: '대형 브레이커 BR-20', category_slug: 'breaker', ton_min: 20, ton_max: 30 },
  { brand: 'TBD', model_code: 'CR-05', display_name: '소형 크러셔 CR-05', category_slug: 'crusher', ton_min: 5, ton_max: 10 },
  { brand: 'TBD', model_code: 'CR-15', display_name: '대형 크러셔 CR-15', category_slug: 'crusher', ton_min: 15, ton_max: 25 },
  { brand: 'TBD', model_code: 'BK-S', display_name: '소형 버킷 BK-S', category_slug: 'bucket', ton_min: 3, ton_max: 6 },
  { brand: 'TBD', model_code: 'BK-L', display_name: '대형 버킷 BK-L', category_slug: 'bucket', ton_min: 20, ton_max: 30 },
  { brand: 'TBD', model_code: 'GR-08', display_name: '그래플 GR-08', category_slug: 'grapple', ton_min: 8, ton_max: 14 },
  { brand: 'TBD', model_code: 'QC-STD', display_name: '퀵커플러 QC-STD', category_slug: 'quick-coupler', ton_min: 1, ton_max: 50 },
  { brand: 'TBD', model_code: 'MG-12', display_name: '마그넷 MG-12', category_slug: 'magnet', ton_min: 12, ton_max: 20 },
]

async function seed() {
  console.log('🌱 Seeding...')

  // 1) Categories
  const catMap: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    const parentSlug = cat.parent_id === null && cat.slug !== 'attachment' ? 'attachment' : null
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name: cat.name, slug: cat.slug, sort_order: cat.sort_order }, { onConflict: 'slug' })
      .select('id')
      .single()
    if (error) console.error('category error', error.message)
    if (data) catMap[cat.slug] = data.id
  }

  // Set parent_ids for subcategories
  const parentId = catMap['attachment']
  if (parentId) {
    for (const slug of ['breaker','crusher','bucket','grapple','quick-coupler','magnet','compactor']) {
      await supabase.from('categories').update({ parent_id: parentId }).eq('slug', slug)
    }
  }

  // 2) Internal supplier
  const { data: supplier } = await supabase
    .from('suppliers')
    .upsert({ name: '착착 본사', type: 'internal', verified: true }, { onConflict: 'name' })
    .select('id')
    .single()

  // 3) Attachments
  const attMap: Record<string, string> = {}
  for (const att of ATTACHMENTS) {
    const catId = catMap[att.category_slug]
    if (!catId) continue
    const { data, error } = await supabase
      .from('attachments')
      .upsert(
        {
          brand: att.brand,
          model_code: att.model_code,
          display_name: att.display_name,
          category_id: catId,
          supplier_id: supplier?.id ?? null,
          list_price: null,
          dealer_price: null,
        },
        { onConflict: 'brand,model_code' }
      )
      .select('id')
      .single()
    if (error) console.error('attachment error', error.message)
    if (data) {
      attMap[att.model_code] = data.id
      await supabase.from('compatibility').upsert(
        { attachment_id: data.id, ton_min: att.ton_min, ton_max: att.ton_max },
        { onConflict: 'attachment_id,ton_min,ton_max' }
      )
    }
  }

  // 4) Auth accounts + users rows
  for (const acc of ACCOUNTS) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { full_name: acc.display_name },
    })
    if (error && !error.message.includes('already been registered')) {
      console.error(`user create error ${acc.email}:`, error.message)
      continue
    }
    const userId = created?.user?.id
    if (!userId) continue

    await supabase.from('users').upsert(
      {
        id: userId,
        role: acc.role,
        email: acc.email,
        display_name: acc.display_name,
      },
      { onConflict: 'id' }
    )
    await supabase.from('notification_preferences').upsert(
      [
        { user_id: userId, channel: 'push', priority: 1 },
        { user_id: userId, channel: 'telegram', priority: 2, enabled: false },
      ],
      { onConflict: 'user_id,channel' }
    )

    if ((acc as any).business_name) {
      await supabase.from('partner_profiles').upsert(
        {
          user_id: userId,
          business_name: (acc as any).business_name,
          region_sido: (acc as any).sido ?? null,
        },
        { onConflict: 'user_id' }
      )
    }

    console.log(`  ✓ ${acc.email} (${acc.role})`)
  }

  console.log('✅ Seed complete')
}

seed().catch(console.error)
