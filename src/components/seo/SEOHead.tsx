import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

const DEFAULT_SEO = {
  title: 'CandiVoc - Entraînement IA pour Entretiens d\'Emploi',
  description: 'Application d\'entraînement vocal avec IA pour préparer vos entretiens d\'embauche. Pratiquez avec des scénarios réalistes et recevez un feedback personnalisé.',
  keywords: 'entretien, emploi, IA, simulation, préparation, recrutement, carrière',
  image: '/og-image.jpg',
  type: 'website' as const,
  siteName: 'CandiVoc',
  author: 'CandiVoc Team',
  locale: 'fr_FR'
};

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  noIndex = false
}) => {
  const location = useLocation();

  // Construire le titre complet
  const fullTitle = title
    ? `${title} | CandiVoc`
    : DEFAULT_SEO.title;

  // Construire l'URL canonique
  const canonicalUrl = `https://candivoc.com${location.pathname}`;

  useEffect(() => {
    // Mettre à jour le document title
    document.title = fullTitle;

    // Mettre à jour ou créer les meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let tag: HTMLMetaElement | null = document.querySelector(
        property ? `meta[property="${property}"]` : `meta[name="${name}"]`
      );

      if (!tag) {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', property);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }

      tag.setAttribute('content', content);
    };

    // Meta tags de base
    updateMetaTag('description', description || DEFAULT_SEO.description);
    updateMetaTag('keywords', keywords || DEFAULT_SEO.keywords);
    updateMetaTag('author', DEFAULT_SEO.author);

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, 'og:title');
    updateMetaTag('og:description', description || DEFAULT_SEO.description, 'og:description');
    updateMetaTag('og:image', image || DEFAULT_SEO.image, 'og:image');
    updateMetaTag('og:type', type, 'og:type');
    updateMetaTag('og:site_name', DEFAULT_SEO.siteName, 'og:site_name');
    updateMetaTag('og:url', canonicalUrl, 'og:url');
    updateMetaTag('og:locale', DEFAULT_SEO.locale, 'og:locale');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description || DEFAULT_SEO.description);
    updateMetaTag('twitter:image', image || DEFAULT_SEO.image);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Robots tag
    const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';
    updateMetaTag('robots', robotsContent);

    // Nettoyer à la fin
    return () => {
      // Optionnel: nettoyer les tags spécifiques à la page si nécessaire
    };
  }, [fullTitle, description, keywords, image, type, canonicalUrl, noIndex]);

  // Structured Data (JSON-LD)
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === 'article' ? "Article" : "WebApplication",
      "name": fullTitle,
      "description": description || DEFAULT_SEO.description,
      "url": canonicalUrl,
      "image": image || DEFAULT_SEO.image,
      "author": {
        "@type": "Organization",
        "name": DEFAULT_SEO.author
      },
      "publisher": {
        "@type": "Organization",
        "name": DEFAULT_SEO.siteName
      },
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      }
    };

    // Supprimer le script précédent s'il existe
    const existingScript = document.querySelector('script[data-structured-data="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Ajouter le nouveau script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-structured-data="true"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [fullTitle, description, canonicalUrl, image, type]);

  return null; // Ce composant ne rend rien visuellement
};

export default SEOHead;