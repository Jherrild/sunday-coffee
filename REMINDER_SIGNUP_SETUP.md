# Reminder Sign-Up Form Setup Guide

## Overview

The Sunday Coffee website now includes a mobile-responsive form that allows users to sign up for text reminders. The form collects:
- User's name
- User's phone number

## Implementation Approach

Since this website is hosted on **GitHub Pages** (static hosting only), the form uses [Formspree](https://formspree.io/) - a form backend service that's compatible with static sites.

## Setup Instructions

### 1. Create a Formspree Account

1. Go to [https://formspree.io/](https://formspree.io/)
2. Sign up for a free account (supports up to 50 submissions/month)
3. Verify your email address

### 2. Create a New Form

1. Log in to your Formspree dashboard
2. Click **"New Form"** or **"+ New Project"**
3. Give your form a name (e.g., "Sunday Coffee Reminders")
4. Copy your form's endpoint URL - it will look like:
   ```
   https://formspree.io/f/YOUR_FORM_ID
   ```

### 3. Update the Website

1. Open `index.html` in the repository
2. Find the line with `action="https://formspree.io/f/YOUR_FORM_ID"`
3. Replace `YOUR_FORM_ID` with your actual Formspree form ID
4. Commit and push the change

### 4. Configure Form Settings (Optional)

In your Formspree dashboard, you can:

- **Email Notifications**: Get notified when someone signs up
- **Custom Redirect**: Redirect users after submission
- **Spam Protection**: Enable reCAPTCHA
- **Export Data**: Download submissions as CSV

## How It Works

1. User fills out the form with their name and phone number
2. JavaScript intercepts the form submission
3. Data is sent to Formspree via AJAX
4. Formspree stores the submission and can send you an email notification
5. User sees a success message on the page

## Processing Sign-Ups

Sign-ups are stored in your Formspree dashboard. To send actual text reminders, you'll need to:

1. Export the phone numbers from Formspree (CSV format)
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

**Important**: Make sure to add a privacy policy or terms of service if collecting phone numbers. Consider adding:
- A checkbox for consent to receive text messages
- A link to your privacy policy
- Information about how often they'll receive texts
- An opt-out mechanism

## Alternative Solutions

If you need more advanced features or want to avoid third-party services:

1. **Google Forms**: Create a Google Form and embed it (less customizable)
2. **Zapier + Webhooks**: Use Zapier to connect form submissions to various services
3. **Netlify/Vercel**: Migrate from GitHub Pages to a platform with serverless functions
4. **Custom Backend**: Set up your own API endpoint (requires additional hosting)

## Cost

- **Formspree Free**: 50 submissions/month
- **Formspree Gold**: $10/month for 1,000 submissions
- **SMS Services**: Vary by provider (typically $0.01-0.02 per message)

## Support

For issues with the form:
- Check browser console for JavaScript errors
- Verify the Formspree form ID is correct
- Ensure you've committed and deployed the changes
- Test in different browsers and devices
