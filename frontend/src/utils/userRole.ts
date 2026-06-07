export const roleLabel = (role: string) => {
  if (role === 'admin') return 'Admin'
  if (role === 'doktor') return 'Doctor'
  if (role === 'pacijent') return 'Patient'
  return role
}

export const roleColor = (role: string): 'error' | 'info' | 'success' | 'default' => {
  if (role === 'admin') return 'error'
  if (role === 'doktor') return 'info'
  if (role === 'pacijent') return 'success'
  return 'default'
}
