import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const UNSPLASH_ACCESS_KEY = Constants.expoConfig?.extra?.UNSPLASH_ACCESS_KEY;
console.log("UNSPLASH_ACCESS_KEY:", UNSPLASH_ACCESS_KEY);

const useFetchUnsplashImages = (query: string, count = 10) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
            `https://api.unsplash.com/search/photos?page=1&query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&count=${count}`
        );
        console.log("FETCHING IMAGES for:", query);
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const data = await response.json();
        setImages(data.results.map((img: any) => img.urls.small));
      } catch (err: any) {
        setError(err.message);
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [query, count]);

  return { images, loading, error };
};

export default useFetchUnsplashImages;
