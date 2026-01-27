# EMAIL CONFIGURATION GUIDE

## To enable email notifications, add the following to your backend .env file:

### For Zoho Mail (Recommended):
```
EMAIL_USER=bellora@zohomail.in
EMAIL_PASSWORD=nyPzHR5BUnVk
EMAIL_HOST=smtp.zoho.in
EMAIL_PORT=465
```

### For Gmail:
```
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

## Steps to Set Up:

### Option 1: Zoho Mail (Your Current Setup)
1. Log in to Zoho Mail
2. Go to Settings > Security
3. Use your Zoho email and generate an app password if needed
4. Add the credentials to your .env file as shown above
5. Zoho Mail uses PORT 465 for secure connection

### Option 2: Gmail
1. **Enable 2-Factor Authentication:**
   - Go to myaccount.google.com
   - Select "Security" from the left sidebar
   - Scroll down and enable "2-Step Verification"

2. **Generate App Password:**
   - Go to myaccount.google.com
   - Select "Security" from the left sidebar
   - Find "App passwords" (appears after 2FA is enabled)
   - Select "Mail" and "Windows Computer" (or your device)
   - Generate a password - this is your EMAIL_PASSWORD

## What Emails Will Be Sent:

1. **Order Confirmed** - When customer places an order
   - Contains order ID, amount, and items
   
2. **Order Shipped** - When admin changes status to "Shipped"
   - Notifies customer that order is on the way
   
3. **Order Delivered** - When admin changes status to "Delivered"
   - Confirms successful delivery

## Testing Emails Locally:

If you haven't configured email credentials yet, the system will:
- Log "Email service not configured. Skipping email."
- Continue with the order process without sending emails

Once configured, emails will be sent automatically.

## Troubleshooting:

- Check your spam/junk folder if emails aren't appearing
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Ensure EMAIL_HOST and EMAIL_PORT are correct for your provider
- Check backend console logs for email errors
- For Zoho Mail issues, verify the app password is correctly set
- Make sure your Zoho account has SMTP enabled in settings
