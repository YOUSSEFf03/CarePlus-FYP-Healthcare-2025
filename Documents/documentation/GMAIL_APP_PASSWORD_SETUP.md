# Gmail App Password Setup Guide

## 🎯 Issue

The email test failed because Gmail requires an **App Password** instead of your regular password for security reasons.

## 🔧 Solution: Create Gmail App Password

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with `fyphealthcare2025@gmail.com`
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA

### Step 2: Generate App Password

1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **App passwords**
3. Select **Mail** as the app
4. Select **Other (custom name)** as the device
5. Enter name: `FYP Healthcare 2025`
6. Click **Generate**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Configuration

Replace the password in your email service:

```typescript
// In Apps/backend/apps/notification/src/services/email.service.ts
private transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fyphealthcare2025@gmail.com',
    pass: 'YOUR_16_CHARACTER_APP_PASSWORD', // ← Replace with App Password
  },
});
```

### Step 4: Update Environment Variables

```env
# In Apps/backend/apps/notification/.env
EMAIL_USER=fyphealthcare2025@gmail.com
EMAIL_PASS=YOUR_16_CHARACTER_APP_PASSWORD
```

## 🚀 Alternative: Less Secure App Access (Not Recommended)

If you can't enable 2FA, you can use "Less secure app access":

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Turn on **Less secure app access**
3. Use your regular password: `DTYfyp8$`

⚠️ **Warning**: This is less secure and Google may disable it.

## 🧪 Test After Setup

Run the test again:

```bash
cd Apps/backend/apps/notification
node test-email-whatsapp.js
```

You should see:

```
✅ Email OTP sent successfully!
✅ WhatsApp OTP sent successfully!
```

## 📧 Expected Results

After setup, you should receive:

- **Email**: Test OTP message in your Gmail inbox
- **WhatsApp**: Test OTP message on your phone

## 🔐 Security Notes

- **App Passwords** are more secure than regular passwords
- **2FA** provides additional security
- **App Passwords** are specific to applications
- You can revoke App Passwords anytime

## 🎉 Success!

Once you have the App Password set up, your email OTP system will work perfectly alongside WhatsApp OTP!

## 📞 Support

If you need help:

1. Check [Google App Passwords Help](https://support.google.com/accounts/answer/185833)
2. Verify 2FA is enabled
3. Ensure the App Password is copied correctly (no spaces)

