import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { Filters } from '@/hooks/userFormationsFilter';

export function useUrlFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const updateUrl = useCallback((filters: Filters) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    Object.entries(filters).forEach(([key, value]) => {
      const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value);
      if (hasValue) {
        const urlKey = key === 'searchQuery' ? 'recherche' : key;
        params.set(urlKey, Array.isArray(value) ? value.join(',') : value.toString());
      } else {
        params.delete(key === 'searchQuery' ? 'recherche' : key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const getFiltersFromUrl = (): Filters => ({
    searchQuery: searchParams?.get('recherche') ?? '',
    location: searchParams?.get('location') ?? '',
    discipline: searchParams?.get('discipline') ?? '',
    organisateur: searchParams?.get('organisateur') ?? '',
    comites: (searchParams?.get('comites') ?? '').split(',').filter(Boolean),
    startDate: searchParams?.get('startDate') ?? '',
    endDate: searchParams?.get('endDate') ?? '',
    availableOnly: searchParams?.get('availableOnly') === 'true',
    showPastFormations: searchParams?.get('showPastFormations') === 'true'
  });

  return { updateUrl, getFiltersFromUrl };
} 