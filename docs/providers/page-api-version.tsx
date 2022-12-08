import { MemoryRouter } from 'next-router-mock';
import { NextRouter } from 'next/router';
import { createContext, PropsWithChildren, useCallback, useContext } from 'react';

import navigation from '~/public/static/constants/navigation.json';

export const PageApiVersionContext = createContext({
  /** The version selected in the URL, or the default version */
  version: 'latest',
  /** If the current URL has a version defined */
  hasVersion: false,
  /** Change the URL to the select version  */
  setVersion: newVersion => {
    throw new Error('PageApiVersionContext not found');
  },
} as PageApiVersionContextType);

export type PageApiVersionContextType = {
  version: keyof typeof navigation.reference;
  hasVersion: boolean;
  setVersion: (newVersion: string) => void;
};

type Props = PropsWithChildren<{
  /** The router containing the current URL info of the page, possibly containing the API version */
  router: NextRouter | MemoryRouter;
}>;

export function PageApiVersionProvider(props: Props) {
  const version = getVersionFromPath(props.router.pathname);
  const hasVersion = version !== null;

  // note: if the page doesn't exists, the error page will handle it
  const setVersion = useCallback((newVersion: string) => {
    props.router.push(replaceVersionInPath(props.router.pathname, newVersion));
  }, []);

  return (
    <PageApiVersionContext.Provider
      value={{ setVersion, hasVersion, version: version || 'latest' }}>
      {props.children}
    </PageApiVersionContext.Provider>
  );
}

export function usePageApiVersion() {
  return useContext(PageApiVersionContext);
}

/**
 * Determine if there is a version within the pathname of the URL.
 * Versioned pages always starts with /versions/<version>.
 */
export function isVersionedPath(path: string) {
  return path.startsWith('/versions/');
}

/**
 * Find the version within the pathname of the URL.
 * This only accepts pathnames, without hashes or query strings.
 */
export function getVersionFromPath(path: string): PageApiVersionContextType['version'] | null {
  return !isVersionedPath(path)
    ? null
    : (path.split('/', 3).pop()! as PageApiVersionContextType['version']);
}

/**
 * Replace the version in the pathname from the URL.
 * If no version was found, the path is returned as is.
 */
export function replaceVersionInPath(path: string, newVersion: string) {
  const version = getVersionFromPath(path);
  return version ? path.replace(version, newVersion) : path;
}
