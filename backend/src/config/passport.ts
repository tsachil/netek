import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../prisma';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'mock_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_secret',
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error('No email found'), undefined);

        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
            let defaultBranch = await prisma.branch.findFirst({ where: { code: 'DEFAULT' } });
            if (!defaultBranch) {
                defaultBranch = await prisma.branch.create({
                    data: { name: 'Headquarters', code: 'DEFAULT' }
                });
            }

            user = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: email,
                    name: profile.displayName,
                    branchId: defaultBranch.id
                }
            });
        }
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);
