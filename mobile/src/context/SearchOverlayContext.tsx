import React, { createContext, useCallback, useContext, useState } from 'react';

interface SearchOverlayContextType {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextType>({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
});

export const SearchOverlayProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  return (
    <SearchOverlayContext.Provider value={{ isOpen, openSearch, closeSearch }}>
      {children}
    </SearchOverlayContext.Provider>
  );
};

export const useSearchOverlay = () => useContext(SearchOverlayContext);
