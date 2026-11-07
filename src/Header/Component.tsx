import { SiteHeader } from '@/components/SUG/SiteHeader'
import { getBreakingNews } from '@/utilities/getBreakingNews'
import { getEmergencyContacts } from '@/utilities/getEmergencyContacts'

export async function Header() {
  const [contacts, breaking] = await Promise.all([getEmergencyContacts(), getBreakingNews()])
  return <SiteHeader breaking={breaking} contacts={contacts} />
}
