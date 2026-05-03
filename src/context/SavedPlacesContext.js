import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SavedPlacesContext = createContext({
  savedPlaces: [],
  toggleSave: () => {},
  isSaved: () => false,
});

export const SavedPlacesProvider = ({ children }) => {
  const [savedPlaces, setSavedPlaces] = useState([]);

  useEffect(() => {
    const loadSavedPlaces = async () => {
      try {
        const stored = await AsyncStorage.getItem('@saved_places');
        if (stored) {
          setSavedPlaces(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load saved places", err);
      }
    };
    loadSavedPlaces();
  }, []);

  const saveToStorage = async (places) => {
    try {
      await AsyncStorage.setItem('@saved_places', JSON.stringify(places));
    } catch (err) {
      console.error("Failed to save places to storage", err);
    }
  };

  const toggleSave = (place) => {
    setSavedPlaces((prev) => {
      const exists = prev.find((p) => p._id === place._id || p.id === place.id);
      let newPlaces;
      if (exists) {
        newPlaces = prev.filter((p) => p._id !== place._id && p.id !== place.id);
      } else {
        newPlaces = [...prev, place];
      }
      saveToStorage(newPlaces);
      return newPlaces;
    });
  };

  const isSaved = (placeId) => {
    return savedPlaces.some((p) => p._id === placeId || p.id === placeId);
  };

  return (
    <SavedPlacesContext.Provider value={{ savedPlaces, toggleSave, isSaved }}>
      {children}
    </SavedPlacesContext.Provider>
  );
};

export const useSavedPlaces = () => useContext(SavedPlacesContext);
