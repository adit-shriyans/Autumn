'use client'
// import { options } from "../api/auth/[...nextauth]/options";
import { signIn, signOut, useSession, getProviders, LiteralUnion, ClientSafeProvider } from 'next-auth/react';

import { redirect } from "next/navigation";

const Member = async () => {
  const { data: session } = useSession();


  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/Member");
  }
  else {
    console.log(session.user);
  }

  return (
    <div>
      <h1>Member Server Session</h1>
      <p>{session?.user?.email}</p>
      <p>{session?.user?.role}</p>
    </div>
  );
};

export default Member;
