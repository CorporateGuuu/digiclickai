# Setting Up Google OAuth for MDTS Tech Store

This guide will walk you through the process of setting up Google OAuth for your MDTS Tech Store application.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a name for your project (e.g., "MDTS Tech Store")
5. Click "Create"

## 2. Enable the Google OAuth API

1. Select your newly created project
2. In the left sidebar, navigate to "APIs & Services" > "Library"
3. Search for "Google OAuth API" or "Google Identity"
4. Click on "Google Identity Services" or "OAuth 2.0 API"
5. Click "Enable"

## 3. Configure OAuth Consent Screen

1. In the left sidebar, navigate to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have a Google Workspace organization)
3. Click "Create"
4. Fill in the required information:
   - App name: "MDTS Tech Store"
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Under "Scopes", add the following scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Click "Save and Continue"
8. Add any test users if you're still in testing mode
9. Click "Save and Continue"
10. Review your settings and click "Back to Dashboard"

## 4. Create OAuth Client ID

1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name for your client (e.g., "MDTS Tech Store Web Client")
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3000` (for development)
   - `https://mdtstech.store` (for production)
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://mdtstech.store/api/auth/callback/google` (for production)
7. Click "Create"
8. You'll see a modal with your client ID and client secret. Copy these values.

## 5. Add Credentials to Environment Variables

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add the following lines:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
3. Replace `your-client-id` and `your-client-secret` with the values you copied in the previous step

## 6. Restart Your Application

1. Save all changes
2. Restart your Next.js development server
3. Try signing in with Google again

## Troubleshooting

If you're still experiencing issues:

1. **Check Redirect URIs**: Make sure the redirect URIs exactly match your application's callback URL.
2. **Verify Environment Variables**: Ensure your environment variables are correctly set and the server has restarted.
3. **Check Console Logs**: Look for any error messages in your browser console or server logs.
4. **Verify API Enabled**: Make sure the Google Identity API is enabled for your project.
5. **Check OAuth Consent Screen**: Ensure your OAuth consent screen is properly configured.
6. **Verify Project Status**: If your project is still in "Testing" mode, make sure your test user is added to the allowed testers.

## Additional Resources

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
