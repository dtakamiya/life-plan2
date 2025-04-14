import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  const { userId } = getAuth(req)
  const publicPaths = ['/']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname === path)

  if (!userId && !isPublicPath) {
    const signInUrl = new URL('/sign-in', req.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
