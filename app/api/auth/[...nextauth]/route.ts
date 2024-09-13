import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly",
        },
      },
    }),
  ],

  // Callbacks to handle tokens and session
  callbacks: {
    async jwt({ token, account }) {
      // If it's the first time signing in, add the access token to the JWT
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      // Make the access token available in the session
      session.accessToken = token.accessToken;
      return session;
    },
  },

  // Configure options such as pages (if you want custom login pages, etc.)
  // pages: {
  //   signIn: '/auth/signin', // You can create a custom sign-in page here if desired
  // },

  // You can also enable debugging if necessary
  debug: process.env.NODE_ENV === 'development',
};

// Create a handler using NextAuth
const handler = NextAuth(authOptions);
// Explicitly export handlers for each HTTP method
export { handler as GET, handler as POST };