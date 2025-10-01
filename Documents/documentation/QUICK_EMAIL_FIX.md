# Quick Email OTP Fix for yousseffarah313@gmail.com

## 🎯 Problem

Gmail requires an App Password for security. The test failed with:

```
Invalid login: 534-5.7.9 Application-specific password required
```

## 🔧 Quick Solution (Choose One)

### Option 1: Enable Less Secure App Access (Fastest)

1. **Go to Gmail Security Settings:**
   - Visit: https://myaccount.google.com/security
   - Sign in with: `fyphealthcare2025@gmail.com`

2. **Enable Less Secure Apps:**
   - Scroll down to "Less secure app access"
   - Turn it **ON**
   - Confirm the action

3. **Test Again:**
   ```bash
   cd Apps/backend/apps/notification
   node test-email-otp.js
   ```

### Option 2: Create App Password (More Secure)

1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Go to "App passwords"
   - Select "Mail" → "Other (custom name)"
   - Name: "FYP Healthcare 2025"
   - Copy the 16-character password

3. **Update the Code:**
   ```javascript
   // Replace in test-email-otp.js
   pass: 'YOUR_16_CHARACTER_APP_PASSWORD';
   ```

## 🧪 Test Results Expected

After fixing, you should see:

```
✅ Email OTP sent successfully!
📧 Sent to: yousseffarah313@gmail.com
🔐 OTP Code: 123456
```

## 📧 What You'll Receive

You'll get a beautiful HTML email with:

- 🏥 FYP Healthcare 2025 branding
- 🔐 Your OTP code
- ⏰ Expiration time (10 minutes)
- 📱 System status

## 🚀 Next Steps

1. **Fix the Gmail authentication** (choose option above)
2. **Run the test again**
3. **Check your email**: yousseffarah313@gmail.com
4. **Verify you receive the OTP**

## 🎉 Success!

Once you receive the email, your email OTP system is working perfectly alongside WhatsApp OTP!

## 📞 Need Help?

- **Gmail Security**: https://myaccount.google.com/security
- **App Passwords**: https://support.google.com/accounts/answer/185833
- **Less Secure Apps**: https://support.google.com/accounts/answer/6010255

