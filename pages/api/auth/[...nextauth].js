import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';

// Create fallback functions if imports fail
const dbFallback = {
  query: async () => ({ rows: [] }),
  getUser: async () => null,
  getUserByEmail: async () => null,
  createUser: async () => ({ id: 1 }),
  updateUser: async () => ({ id: 1 }),
  getOrder: async () => null
};

const twoFactorFallback = {
  verify2FA: async () => true,
  generate2FASecret: async () => ({
    secret: 'placeholder-secret',
    qrCode: 'placeholder-qrcode'
  }),
  enable2FA: async () => true,
  disable2FA: async () => true,
  getUserTwoFactorSettings: async () => ({
    enabled: false,
    email_enabled: false,
    sms_enabled: false,
    duo_enabled: false,
    preferred_method: 'email'
  })
};

// Try to import the real modules, fall back to the simple ones if they fail
let db, twoFactor;
try {
  db = require('../../../lib/db');
} catch (e) {
  db = dbFallback;
}

try {
  twoFactor = require('../../../lib/2fa');
} catch (e) {
  twoFactor = twoFactorFallback;
}

const { query } = db;
const { getUserTwoFactorSettings } = twoFactor;

// Mock user for development
const MOCK_USER = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  image: '/images/avatar-placeholder.png',
  first_name: 'Demo',
  last_name: 'User',
  email_verified: true
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // For development, allow any credentials to work with the mock user
          if (process.env.NODE_ENV === 'development') {
            // Using mock user for development
            return {
              id: MOCK_USER.id,
              name: MOCK_USER.name,
              email: MOCK_USER.email,
              image: MOCK_USER.image
            };
          }

          // Production code - find user by email
          const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          // Check password
          const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash);

          if (!passwordMatch) {
            return null;
          }

          // Check if 2FA is enabled
          const twoFactorSettings = await getUserTwoFactorSettings(user.id);

          if (twoFactorSettings?.enabled) {
            // Return user with requiresTwoFactor flag
            return {
              id: user.id,
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
              email: user.email,
              image: user.image,
              requiresTwoFactor: true,
              twoFactorMethods: {
                email_enabled: twoFactorSettings.email_enabled,
                sms_enabled: twoFactorSettings.sms_enabled,
                duo_enabled: twoFactorSettings.duo_enabled,
                preferred_method: twoFactorSettings.preferred_method
              }
            };
          }

          // Return user object without password
          return {
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
            email: user.email,
            image: user.image
          };
        } catch (error) {
          console.error('Authentication error:', error);

          // For development, return mock user even if there's an error
          if (process.env.NODE_ENV === 'development') {
            // Using mock user due to authentication error
            return {
              id: MOCK_USER.id,
              name: MOCK_USER.name,
              email: MOCK_USER.email,
              image: MOCK_USER.image
            };
          }

          return null;
        }
      }
    }),
    // 2FA completion provider
    CredentialsProvider({
      id: '2fa-completion',
      name: '2FA Completion',
      credentials: {
        userId: { label: "User ID", type: "text" },
        twoFactorVerified: { label: "2FA Verified", type: "text" }
      },
      async authorize(credentials) {
        try {
          if (!credentials.userId || credentials.twoFactorVerified !== 'true') {
            return null;
          }

          // For development, use mock user
          if (process.env.NODE_ENV === 'development') {
            // Using mock user for 2FA completion
            return {
              id: MOCK_USER.id,
              name: MOCK_USER.name,
              email: MOCK_USER.email,
              image: MOCK_USER.image
            };
          }

          // Get user by ID
          const result = await query(
            'SELECT * FROM users WHERE id = $1',
            [credentials.userId]
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          // Return user object
          return {
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
            email: user.email,
            image: user.image
          };
        } catch (error) {
          console.error('2FA completion error:', error);

          // For development, return mock user even if there's an error
          if (process.env.NODE_ENV === 'development') {
            // Using mock user due to 2FA completion error
            return {
              id: MOCK_USER.id,
              name: MOCK_USER.name,
              email: MOCK_USER.email,
              image: MOCK_USER.image
            };
          }

          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        // Handle 2FA
        if (user.requiresTwoFactor) {
          token.requiresTwoFactor = true;
          token.twoFactorMethods = user.twoFactorMethods;
        }

        // If using the 2FA completion provider, clear the requiresTwoFactor flag
        if (account?.provider === '2fa-completion') {
          token.requiresTwoFactor = false;
          token.twoFactorMethods = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;

      // Add 2FA status to session
      if (token.requiresTwoFactor) {
        session.requiresTwoFactor = true;
        session.twoFactorMethods = token.twoFactorMethods;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle 2FA redirect
      if (url.startsWith(`${baseUrl}/auth/2fa`)) {
        return url;
      }

      // Default behavior
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    }
  },
  adapter: {
    async createUser(user) {
      // For development, return mock user
      if (process.env.NODE_ENV === 'development') {
        // Using mock user for createUser
        return MOCK_USER;
      }

      const { name, email, image } = user;

      // Split name into first_name and last_name if provided
      let firstName = '';
      let lastName = '';

      if (name) {
        const nameParts = name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }

      try {
        const result = await query(
          'INSERT INTO users (first_name, last_name, email, image) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email, image',
          [firstName, lastName, email, image]
        );

        const newUser = result.rows[0];
        return {
          ...newUser,
          name: `${newUser.first_name || ''} ${newUser.last_name || ''}`.trim() || email.split('@')[0]
        };
      } catch (error) {
        console.error('Error creating user:', error);
        if (process.env.NODE_ENV === 'development') {
          return MOCK_USER;
        }
        throw error;
      }
    },

    async getUser(id) {
      // For development, return mock user if ID matches
      if (process.env.NODE_ENV === 'development' && id === MOCK_USER.id) {
        // Using mock user for getUser
        return MOCK_USER;
      }

      try {
        const result = await query(
          'SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE id = $1',
          [id]
        );

        if (!result.rows[0]) {
          if (process.env.NODE_ENV === 'development') {
            return MOCK_USER;
          }
          return null;
        }

        const user = result.rows[0];
        return {
          ...user,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
        };
      } catch (error) {
        console.error('Error getting user:', error);
        if (process.env.NODE_ENV === 'development') {
          return MOCK_USER;
        }
        return null;
      }
    },

    async getUserByEmail(email) {
      // For development, return mock user if email matches
      if (process.env.NODE_ENV === 'development' &&
        (email === MOCK_USER.email || email === 'demo@example.com' || email === 'test@example.com')) {
        // Using mock user for getUserByEmail
        return MOCK_USER;
      }

      try {
        const result = await query(
          'SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE email = $1',
          [email]
        );

        if (!result.rows[0]) {
          if (process.env.NODE_ENV === 'development') {
            return MOCK_USER;
          }
          return null;
        }

        const user = result.rows[0];
        return {
          ...user,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
        };
      } catch (error) {
        console.error('Error getting user by email:', error);
        if (process.env.NODE_ENV === 'development') {
          return MOCK_USER;
        }
        return null;
      }
    },

    async getUserByAccount({ provider, providerAccountId }) {
      // For development, return mock user
      if (process.env.NODE_ENV === 'development') {
        // Using mock user for getUserByAccount
        return MOCK_USER;
      }

      try {
        const result = await query(
          `SELECT u.id, u.first_name, u.last_name, u.email, u.email_verified, u.image
           FROM users u
           JOIN accounts a ON u.id = a.user_id
           WHERE a.provider_id = $1 AND a.provider_account_id = $2`,
          [provider, providerAccountId]
        );

        if (!result.rows[0]) return null;

        const user = result.rows[0];
        return {
          ...user,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
        };
      } catch (error) {
        console.error('Error getting user by account:', error);
        if (process.env.NODE_ENV === 'development') {
          return MOCK_USER;
        }
        return null;
      }
    },

    async updateUser(user) {
      // For development, return mock user
      if (process.env.NODE_ENV === 'development') {
        // Using mock user for updateUser
        return {
          ...MOCK_USER,
          ...user,
        };
      }

      const { id, name, email, image } = user;

      // Split name into first_name and last_name if provided
      let firstName = '';
      let lastName = '';

      if (name) {
        const nameParts = name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }

      try {
        const result = await query(
          'UPDATE users SET first_name = $1, last_name = $2, email = $3, image = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, first_name, last_name, email, image',
          [firstName, lastName, email, image, id]
        );

        const updatedUser = result.rows[0];
        return {
          ...updatedUser,
          name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || email.split('@')[0]
        };
      } catch (error) {
        console.error('Error updating user:', error);
        if (process.env.NODE_ENV === 'development') {
          return {
            ...MOCK_USER,
            ...user,
          };
        }
        throw error;
      }
    },

    async linkAccount(account) {
      // For development, just return the account
      if (process.env.NODE_ENV === 'development') {
        // Mock linkAccount for development
        return account;
      }

      try {
        const { userId, provider, type, providerAccountId, access_token, refresh_token, expires_at } = account;

        await query(
          `INSERT INTO accounts (user_id, provider_type, provider_id, provider_account_id, access_token, refresh_token, access_token_expires)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, type, provider, providerAccountId, access_token, refresh_token, expires_at ? new Date(expires_at * 1000) : null]
        );

        return account;
      } catch (error) {
        console.error('Error linking account:', error);
        if (process.env.NODE_ENV === 'development') {
          return account;
        }
        throw error;
      }
    },

    async createSession(session) {
      // For development, just return the session
      if (process.env.NODE_ENV === 'development') {
        // Mock createSession for development
        return session;
      }

      try {
        await query(
          'INSERT INTO sessions (user_id, expires, session_token, access_token) VALUES ($1, $2, $3, $4)',
          [session.userId, session.expires, session.sessionToken, session.accessToken]
        );

        return session;
      } catch (error) {
        console.error('Error creating session:', error);
        if (process.env.NODE_ENV === 'development') {
          return session;
        }
        throw error;
      }
    },

    async getSessionAndUser(sessionToken) {
      // For development, create a mock session
      if (process.env.NODE_ENV === 'development') {
        // Using mock session for development
        return {
          session: {
            sessionToken,
            userId: MOCK_USER.id,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          },
          user: MOCK_USER
        };
      }

      try {
        const sessionResult = await query(
          'SELECT * FROM sessions WHERE session_token = $1',
          [sessionToken]
        );

        const session = sessionResult.rows[0];

        if (!session) {
          return null;
        }

        const userResult = await query(
          'SELECT id, first_name, last_name, email, email_verified, image FROM users WHERE id = $1',
          [session.user_id]
        );

        const userData = userResult.rows[0];

        if (!userData) return null;

        const user = {
          ...userData,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email.split('@')[0]
        };

        return {
          session,
          user
        };
      } catch (error) {
        console.error('Error getting session and user:', error);
        if (process.env.NODE_ENV === 'development') {
          return {
            session: {
              sessionToken,
              userId: MOCK_USER.id,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            },
            user: MOCK_USER
          };
        }
        return null;
      }
    },

    async updateSession(session) {
      // For development, just return the session
      if (process.env.NODE_ENV === 'development') {
        // Mock updateSession for development
        return session;
      }

      try {
        const { sessionToken, expires, userId } = session;

        await query(
          'UPDATE sessions SET expires = $1, user_id = $2 WHERE session_token = $3',
          [expires, userId, sessionToken]
        );

        return session;
      } catch (error) {
        console.error('Error updating session:', error);
        if (process.env.NODE_ENV === 'development') {
          return session;
        }
        throw error;
      }
    },

    async deleteSession(sessionToken) {
      // For development, just log
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock deleteSession for development');
        return;
      }

      try {
        await query(
          'DELETE FROM sessions WHERE session_token = $1',
          [sessionToken]
        );
      } catch (error) {
        console.error('Error deleting session:', error);
        // Don't throw for delete operations
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
