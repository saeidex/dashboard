'use client'

import { useMemo } from 'react'
import { useRouterState } from '@tanstack/react-router'

type BreadcrumbItem = {
  title: string
  link: string
}

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Overview', link: '/' }],
  '/products': [
    { title: 'Dashboard', link: '/' },
    { title: 'Products', link: '/products' },
  ],
  '/dashboard/employees': [
    { title: 'Dashboard', link: '/' },
    { title: 'Employees', link: '/dashboard/employees' },
  ],
  // Add more custom mappings as needed
}

export function useBreadcrumbs() {
  const {
    location: { pathname },
  } = useRouterState()

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname]
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path,
      }
    })
  }, [pathname])

  return breadcrumbs
}
