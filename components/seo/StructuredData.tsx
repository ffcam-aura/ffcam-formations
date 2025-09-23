export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FFCAM Auvergne-Rhône-Alpes",
    "alternateName": "Fédération Française des Clubs Alpins et de Montagne",
    "url": "https://formations.ffcam-aura.fr",
    "logo": "https://formations.ffcam-aura.fr/ffcam.png",
    "description": "Le Comité Régional FFCAM Auvergne-Rhône-Alpes organise des formations pour les activités de montagne : alpinisme, escalade, ski de randonnée, canyoning.",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Auvergne-Rhône-Alpes",
      "addressCountry": "FR"
    },
    "sameAs": [
      "https://ffcam-aura.fr",
      "https://www.ffcam.fr"
    ],
    "memberOf": {
      "@type": "Organization",
      "name": "Fédération Française des Clubs Alpins et de Montagne",
      "url": "https://www.ffcam.fr"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebSiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://formations.ffcam-aura.fr",
    "name": "Formations FFCAM Auvergne-Rhône-Alpes",
    "description": "Plateforme de recherche et d'inscription aux formations FFCAM",
    "publisher": {
      "@type": "Organization",
      "name": "FFCAM Auvergne-Rhône-Alpes"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://formations.ffcam-aura.fr?searchQuery={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url?: string }> }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": item.url })
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface Formation {
  titre: string;
  discipline: string;
  lieu: string;
  dates: string[];
  tarif: number;
  placesRestantes?: number | null;
  description?: string;
  organisateur: string;
}

export function FormationStructuredData({ formation }: { formation: Formation }) {
  const startDate = formation.dates[0] ? new Date(formation.dates[0]) : new Date();
  const endDate = formation.dates[formation.dates.length - 1] ? new Date(formation.dates[formation.dates.length - 1]) : startDate;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": formation.titre,
    "description": formation.description || `Formation ${formation.discipline} organisée par ${formation.organisateur}`,
    "provider": {
      "@type": "Organization",
      "name": formation.organisateur,
      "sameAs": "https://www.ffcam.fr"
    },
    "courseMode": "Onsite",
    "locationCreated": {
      "@type": "Place",
      "name": formation.lieu,
      "address": {
        "@type": "PostalAddress",
        "addressRegion": formation.lieu,
        "addressCountry": "FR"
      }
    },
    "startDate": startDate.toISOString(),
    "endDate": endDate.toISOString(),
    "offers": {
      "@type": "Offer",
      "price": formation.tarif,
      "priceCurrency": "EUR",
      "availability": formation.placesRestantes && formation.placesRestantes > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      "validFrom": new Date().toISOString()
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Onsite",
      "startDate": startDate.toISOString(),
      "endDate": endDate.toISOString(),
      "location": {
        "@type": "Place",
        "name": formation.lieu
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}