// SIGN IN WITH PHONE OTP
async function signInWithPhone() {
  if (!phoneInput) return alert("Enter phone number");

  const { error } = await supabase.auth.signInWithOtp({
    phone: "+91" + phoneInput,   // India numbers
  });

  if (error) return alert(error.message);

  alert("OTP sent! Check your phone.");
}

// VERIFY OTP
async function verifyOtp() {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: "+91" + phoneInput,
    token: otpInput,
    type: "sms",
  });

  if (error) return alert(error.message);

  alert("Logged in successfully!");
}
