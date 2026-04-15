import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hasLocaleParam = url.searchParams.has('locale') || url.searchParams.has('fallback-locale')

  if (!hasLocaleParam) {
    return NextResponse.next()
  }

  url.searchParams.delete('locale')
  url.searchParams.delete('fallback-locale')

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/globals/homepage/:path*']
}
