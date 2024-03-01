import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDB } from "@utils/database";
import User from "@/app/(models)/User";
import bcrypt from "bcrypt";

export const options = {
  providers: [
    GoogleProvider({
      profile(profile) {
        console.log("Profile Google: ", profile);

        let userRole = "Google User";
        if (profile?.email == "shriyansadit@gmail.com") {
          userRole = "admin";
        }
        else userRole = 'resident'
        return {
          ...profile,
          id: profile.sub,
          role: userRole,
        };
      },
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_Secret,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email:",
          type: "text",
          placeholder: "your-email",
        },
        password: {
          label: "password:",
          type: "password",
          placeholder: "your-password",
        },
      },
      async authorize(credentials) {
        try {
          await connectToDB();
      
          const foundUser = await User.findOne({ email: credentials.email }).lean().exec();
      
          if (foundUser) {
            console.log("User Exists");
            const match = await bcrypt.compare(credentials.password, foundUser.password);
      
            if (match) {
              console.log("Good Pass");
              delete foundUser.password;
      
              foundUser["role"] = "Unverified Email";
              return foundUser;
            }
          } else {
            // Hash the password before storing it
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
      
            const newUser = await User.create({
              name: "Unknown", // Set a default name if necessary
              email: credentials.email,
              password: hashedPassword,
            });
      
            console.log("User Created:", newUser);
            
            // Return the newly created user
            return newUser;
          }
        } catch (error) {
          console.log(error);
        }
        return null;
      },      
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },
};