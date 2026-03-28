const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOtpSMS = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });

    console.log("✅ OTP sent:", message.sid);
    return true;
  } catch (err) {
    console.error("❌ Twilio Error:", err.message);
    return false;
  }
};

module.exports = sendOtpSMS;