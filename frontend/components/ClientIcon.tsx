'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ClientIconProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that only renders icons on the client side
 * to prevent hydration mismatches from browser extensions like Dark Reader
 */
export function ClientIcon({ children, fallback }: ClientIconProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback || <span className="inline-block" aria-hidden="true" />;
  }

  return <>{children}</>;
}

