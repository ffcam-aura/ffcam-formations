import React from 'react';

// Détecte les URLs http(s) et les adresses commençant par www.
const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const URL_TEST_REGEX = /^(https?:\/\/|www\.)/i;

// Retire la ponctuation de fin souvent collée à une URL dans du texte libre
function splitTrailingPunctuation(url: string): [string, string] {
  const match = url.match(/[).,;:!?]+$/);
  if (!match) {
    return [url, ''];
  }
  const trailing = match[0];
  return [url.slice(0, url.length - trailing.length), trailing];
}

interface LinkifyProps {
  text: string;
}

/**
 * Affiche un texte en transformant les URLs qu'il contient en liens cliquables.
 */
export default function Linkify({ text }: LinkifyProps) {
  const parts = text.split(URL_SPLIT_REGEX);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) {
          return null;
        }

        if (URL_TEST_REGEX.test(part)) {
          const [url, trailing] = splitTrailingPunctuation(part);
          const href = url.startsWith('http') ? url : `https://${url}`;

          return (
            <React.Fragment key={index}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline break-words"
              >
                {url}
              </a>
              {trailing}
            </React.Fragment>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}
