const axios = require('axios');

const axiosInstance = axios.create();
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error || error.data);
  }
);

async function sendInteraktNotification(userDetails, eventName) {
  const { phoneNumber, otp } = userDetails;
  const countryCode = '91';
  const traits = {};
  traits['otp'] = otp;
  try {
    const response = await axiosInstance.post(
      'https://api.interakt.ai/v1/public/track/events/',
      {
        phoneNumber,
        countryCode,
        event: eventName,
        traits
      },
      {
        headers: {
          Authorization: process.env.INTERAKT_AUTH_TOKEN
        }
      }
    );
    // console.log({ response });
    return Promise.resolve({ message: 'Event Recorded Successfully', result: response.result });
  } catch (error) {
    if (!error.response.data.result) {
      return Promise.reject({ result: false, message: 'Unable to find the user.' });
    }
  }
}

module.exports = sendInteraktNotification;
