import { useState, useEffect } from 'react';

/**
 * Custom hook for debounced search functionality
 * @param {string} value - The search value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {string} - Debounced value
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Custom hook for debounced search with loading state
 * @param {string} initialValue - Initial search value
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {object} - Object with searchTerm, debouncedSearchTerm, setSearchTerm, and isSearching
 */
export const useSearch = (initialValue = '', delay = 300) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, delay);

    useEffect(() => {
        if (searchTerm !== debouncedSearchTerm) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
        }
    }, [searchTerm, debouncedSearchTerm]);

    return {
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        isSearching,
    };
};