import { signIn } from "next-auth/react";
import { signOut } from "next-auth/react"

export function SignIn() {
  return (
    <div>
      <h1>Sign in</h1>
      <button onClick={() => signIn('google')}>Sign in with Google</button>
    </div>
  );
}

export function Signout(){
  return (
    <div>
      <h1>Sign out</h1>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}