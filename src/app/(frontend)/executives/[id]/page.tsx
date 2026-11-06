import { redirect } from 'next/navigation'

type Params = Promise<{ id: string }>

export default async function ExecutiveRedirect({ params }: { params: Params }) {
  const { id } = await params
  redirect(`/officials/${encodeURIComponent(id)}`)
}