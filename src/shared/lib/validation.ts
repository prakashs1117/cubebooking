export function validatePhoneNumber(phone: string): string | null {
  if (!phone) return null
  const digitsOnly = phone.replace(/\D/g, '')
  if (digitsOnly.length !== 10) {
    return 'Phone number must be exactly 10 digits'
  }
  return null
}
