import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useUrlFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const updateUrl = useCallback((filters: {
    searchQuery: string;
    location: string;
    discipline: string;
    organisateur: string;
    startDate: string;
    endDate: string;
    availableOnly: boolean;
    showPastFormations: boolean;
  }) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const urlKey = key === 'searchQuery' ? 'recherche' : key;
        params.set(urlKey, value.toString());
      } else {
        params.delete(key === 'searchQuery' ? 'recherche' : key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const getFiltersFromUrl = () => ({
    searchQuery: searchParams?.get('recherche') ?? '',
    location: searchParams?.get('location') ?? '',
    discipline: searchParams?.get('discipline') ?? '',
    organisateur: searchParams?.get('organisateur') ?? '',
    startDate: searchParams?.get('startDate') ?? '',
    endDate: searchParams?.get('endDate') ?? '',
    availableOnly: searchParams?.get('availableOnly') === 'true',
    showPastFormations: searchParams?.get('showPastFormations') === 'true'
  });

  return { updateUrl, getFiltersFromUrl };
} 