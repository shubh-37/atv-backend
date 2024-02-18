export async function sendInteraktNotification(user, whatsappSetting) {
  const { mobileNumber, otp } = user
  const { eventName, interaktAuthToken } = whatsappSetting
  const countryCode = '+91'
  const traits = {}
  traits['otp'] = otp
  const response = await axiosInstance.post(
    'https://api.interakt.ai/v1/public/track/events/',
    {
      phoneNumber: mobileNumber,
      countryCode,
      eventName,
      traits
    },
    {
      headers: {
        Authorization: interaktAuthToken
      }
    }
  )
  console.log(response)
  return Promise.resolve({ message: 'Event Recorded Successfully' })
}
