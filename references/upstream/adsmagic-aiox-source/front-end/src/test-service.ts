/**
 * Manual test file for contacts service
 *
 * Run this with: npm run dev
 * Then check console output
 */

import { getContacts, getContactById, createContact } from './services/api/contacts'
import type { CreateContactDTO } from './types'

async function testContactsService() {
  console.log('🧪 Testing Contacts Service...\n')

  // Test 1: Get all contacts
  console.log('📋 Test 1: Get all contacts (first page)')
  const allContactsResult = await getContacts({ page: 1, pageSize: 5 })

  if (allContactsResult.ok) {
    console.log('✅ Success!')
    console.log(`   Total contacts: ${allContactsResult.value.pagination.total}`)
    console.log(`   Returned: ${allContactsResult.value.data.length} contacts`)
    console.log(`   First contact: ${allContactsResult.value.data[0]?.name}`)
  } else {
    console.error('❌ Failed:', allContactsResult.error.message)
  }

  // Test 2: Search contacts
  console.log('\n🔍 Test 2: Search for "Leticia"')
  const searchResult = await getContacts({ search: 'Leticia' })

  if (searchResult.ok) {
    console.log('✅ Success!')
    console.log(`   Found: ${searchResult.value.data.length} contacts`)
    searchResult.value.data.forEach(c => console.log(`   - ${c.name}`))
  } else {
    console.error('❌ Failed:', searchResult.error.message)
  }

  // Test 3: Filter by origin
  console.log('\n🎯 Test 3: Filter by Google Ads origin')
  const googleAdsResult = await getContacts({
    origins: ['origin-google-ads'],
    pageSize: 3
  })

  if (googleAdsResult.ok) {
    console.log('✅ Success!')
    console.log(`   Total: ${googleAdsResult.value.pagination.total} Google Ads contacts`)
    console.log(`   Showing: ${googleAdsResult.value.data.length} contacts`)
    googleAdsResult.value.data.forEach(c => console.log(`   - ${c.name}`))
  } else {
    console.error('❌ Failed:', googleAdsResult.error.message)
  }

  // Test 4: Get contact by ID
  console.log('\n🔑 Test 4: Get contact by ID')
  const contactResult = await getContactById('contact-001')

  if (contactResult.ok && contactResult.value) {
    console.log('✅ Success!')
    console.log(`   Name: ${contactResult.value.name}`)
    console.log(`   Phone: ${contactResult.value.countryCode} ${contactResult.value.phone}`)
    console.log(`   Origin: ${contactResult.value.origin}`)
    console.log(`   Stage: ${contactResult.value.stage}`)
  } else {
    console.error('❌ Failed')
  }

  // Test 5: Create new contact
  console.log('\n➕ Test 5: Create new contact')
  const newContactData: CreateContactDTO = {
    name: 'Teste da Silva',
    phone: '11999887766',
    countryCode: '+55',
    origin: 'origin-google-ads'
  }

  const createResult = await createContact(newContactData)

  if (createResult.ok) {
    console.log('✅ Success!')
    console.log(`   Created contact: ${createResult.value.name}`)
    console.log(`   ID: ${createResult.value.id}`)
    console.log(`   Stage: ${createResult.value.stage}`)
  } else {
    console.error('❌ Failed:', createResult.error.message)
  }

  // Test 6: Filter by stage
  console.log('\n📊 Test 6: Filter by stage (Sale)')
  const salesResult = await getContacts({
    stages: ['stage-sale'],
    pageSize: 5
  })

  if (salesResult.ok) {
    console.log('✅ Success!')
    console.log(`   Total sales: ${salesResult.value.pagination.total}`)
    console.log(`   Showing: ${salesResult.value.data.length} contacts`)
    salesResult.value.data.forEach(c => console.log(`   - ${c.name}`))
  } else {
    console.error('❌ Failed:', salesResult.error.message)
  }

  console.log('\n✨ All tests completed!')
}

// Export for use in components
export { testContactsService }
