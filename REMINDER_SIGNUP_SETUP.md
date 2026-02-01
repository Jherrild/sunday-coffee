# Reminder Sign-Up Form Setup Guide

## Overview

The Sunday Coffee website now includes a mobile-responsive form that allows users to sign up for text reminders. The form collects:
- User's name
- User's phone number

## Implementation Approach

Since this website is hosted on **GitHub Pages** (static hosting only), the form uses [Fabform.io](https://fabform.io/) - a completely free form backend service that's compatible with static sites.

## Setup Instructions

### 1. Update the Website

1. Open `index.html` in the repository
2. Find the line with `action="https://fabform.io/f/YOUR_EMAIL"`
3. Replace `YOUR_EMAIL` with your actual email address (e.g., `your@email.com`)
4. Commit and push the change

**That's it!** No account signup required.

### 2. First Submission Verification

1. When the first form submission is received, Fabform will send you a verification email
2. Click the verification link in the email to activate the form
3. All future submissions will be forwarded to your email automatically

## How It Works

1. User fills out the form with their name and phone number
2. JavaScript intercepts the form submission
3. Data is sent to Fabform.io via AJAX
4. Fabform forwards the submission to your email
5. User sees a success message on the page

## Processing Sign-Ups

Sign-ups will be delivered directly to your email inbox. To send actual text reminders, you'll need to:

1. Collect phone numbers from your email submissions
2. Use a text messaging service like:
   - **Twilio** - Programmable SMS API
   - **SimpleTexting** - Bulk SMS service
   - **TextMagic** - SMS marketing platform
   - **Google Voice** - Manual text sending (small lists only)

## Mobile Responsiveness

The form is fully responsive and will:
- Display properly on all screen sizes (mobile, tablet, desktop)
- Adjust padding and font sizes for smaller screens
- Use native mobile keyboards (phone number pad for phone field)
- Include proper autocomplete attributes for better UX

## Privacy Considerations

The form includes a required consent checkbox for users to agree to receive text messages. This is important for:
- Legal compliance (TCPA in the US, GDPR in EU)
- Setting user expectations
- Building trust

Additional privacy best practices to consider:
- Add a privacy policy page explaining how phone numbers will be used
- Information about how often they'll receive texts
- Clear opt-out mechanism in your text messages
- Secure storage of contact information in your form backend

## Alternative Solutions

If you need more advanced features or want different options:

1. **Formspree**: Alternative form backend with dashboard (50 submissions/month free)
2. **Google Forms**: Create a Google Form and embed it (less customizable)
3. **Zapier + Webhooks**: Use Zapier to connect form submissions to various services
4. **Netlify/Vercel**: Migrate from GitHub Pages to a platform with serverless functions
5. **Custom Backend**: Set up your own API endpoint (requires additional hosting)

## Cost

- **Fabform.io**: Completely free, unlimited submissions
- **Email delivery**: Free (uses your email)
- **SMS Services**: Vary by provider (typically $0.01-0.02 per message)

## Features

- ✅ Completely free with no limits
- ✅ No account signup required
- ✅ Email delivery of form submissions
- ✅ Spam protection built-in
- ✅ Works with any static site
- ✅ AJAX and traditional form submissions supported

## Support

For issues with the form:
- Check browser console for JavaScript errors
- Verify your email address is correct in the form action
- Ensure you've committed and deployed the changes
- Check your spam folder for the verification email (first submission only)
- Test in different browsers and devices
