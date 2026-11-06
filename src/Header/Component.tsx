import { SiteHeader } from '@/components/SUG/SiteHeader'
import { getEmergencyContacts } from '@/utilities/getEmergencyContacts'

export async function Header() {
  const contacts = await getEmergencyContacts()
  return <SiteHeader contacts={contacts} />
}
