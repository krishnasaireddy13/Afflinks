import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Path to match firebaseConfig.js
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ProductCard from './ProductCard'; // Adjust path to provided ProductCard component
import { keyframes } from '@emotion/react';

// Define calculateDiscount function
const calculateDiscount = (originalPrice, dealPrice) => {
  if (!originalPrice || !dealPrice || originalPrice <= 0) return null;
  const discountAmount = originalPrice - dealPrice;
  const discountPercentage = (discountAmount / originalPrice) * 100;
  return { amount: discountAmount.toFixed(2), percentage: discountPercentage.toFixed(0) };
};

// Define animations consistent with ProductCard
const fadeInUpLuxury = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Create theme consistent with ProductCard
const theme = createTheme({
  palette: {
    background: { default: '#23212B', paper: '#23212B' },
    primary: { main: '#B89B5E' },
    secondary: { main: '#607D8B' },
    text: { primary: '#FFF8E1', secondary: '#FFF8E1cc' },
  },
  typography: {
    fontFamily: 'Lora, serif',
    h3: { fontFamily: 'Playfair Display, serif' },
    h5: { fontFamily: 'Playfair Display, serif' },
  },
});

const Deals = () => {
  const [products, setProducts] = useState([]);
  const [sources, setSources] = useState({});
  const [brands, setBrands] = useState({});
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use appId from firebaseConfig
  const appId = '1:43353831547:web:ce46623abfb89b3b5bcade';
  const productsCollectionRef = collection(db, `artifacts/${appId}/public/data/products`);
  const sourcesCollectionRef = collection(db, `artifacts/${appId}/public/data/sources`);
  const brandsCollectionRef = collection(db, `artifacts/${appId}/public/data/brands`);
  const categoriesCollectionRef = collection(db, `artifacts/${appId}/public/data/categories`);

  // Fetch products where isBestDeal is true
  useEffect(() => {
    setLoading(true);
    const q = query(productsCollectionRef, where('isBestDeal', '==', true));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Deals fetched:', productsData); // Debug log
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error('Deals.jsx: Error fetching deals:', err);
        setError('Failed to load deals. Please check Firestore permissions or collection path.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch sources
  useEffect(() => {
    const unsubscribe = onSnapshot(
      sourcesCollectionRef,
      (snapshot) => {
        const sourcesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Sources fetched:', sourcesData); // Debug log
        setSources(sourcesData);
      },
      (err) => {
        console.error('Deals.jsx: Error fetching sources:', err);
        setError('Failed to load sources.');
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch brands
  useEffect(() => {
    const unsubscribe = onSnapshot(
      brandsCollectionRef,
      (snapshot) => {
        const brandsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Brands fetched:', brandsData); // Debug log
        setBrands(brandsData);
      },
      (err) => {
        console.error('Deals.jsx: Error fetching brands:', err);
        setError('Failed to load brands.');
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch categories
  useEffect(() => {
    const unsubscribe = onSnapshot(
      categoriesCollectionRef,
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Categories fetched:', categoriesData); // Debug log
        setCategories(categoriesData);
      },
      (err) => {
        console.error('Deals.jsx: Error fetching categories:', err);
        setError('Failed to load categories.');
      }
    );
    return () => unsubscribe();
  }, []);

  // Handlers for ProductCard props
  const handleProductSelect = (product) => {
    console.log('Selected product:', product);
    // Implement navigation or modal logic here
  };

  const handleShare = (product) => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on sale!`,
          url: product.link,
        })
        .catch((err) => console.error('Deals.jsx: Share failed:', err));
    } else {
      console.log('Web Share API not supported');
      // Fallback to copy link or other share mechanism
    }
  };

  const trackClick = (product) => {
    console.log('Tracked click for product:', product);
    // Implement analytics tracking
  };

  const generateEnhancedDescription = async (product) => {
    console.log('Generating description for:', product);
    // Implement description generation logic
    return `Enhanced description for ${product.name}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: '#23212B', minHeight: '100vh', p: { xs: 2, sm: 4 }, animation: `${fadeIn} 1s ease-in` }}>
        <Typography
          variant="h3"
          sx={{
            color: '#FFF8E1',
            textAlign: 'center',
            mb: 4,
            fontWeight: 800,
            textShadow: '0 2px 12px #121212',
          }}
        >
          Best Deals
        </Typography>
        {error && (
          <Typography color="error" sx={{ textAlign: 'center', mb: 2, fontFamily: 'Lora, serif' }}>
            {error}
          </Typography>
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress sx={{ color: '#B89B5E' }} />
          </Box>
        )}
        {!loading && products.length === 0 && (
          <Typography sx={{ color: '#FFF8E1', textAlign: 'center', fontFamily: 'Lora, serif' }}>
            No deals found. Please check if products have isBestDeal set to true.
          </Typography>
        )}
        <Grid container spacing={2} sx={{ maxWidth: 1200, mx: 'auto' }}>
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard
                product={product}
                theme={theme}
                allCategories={categories}
                allSources={sources}
                allBrands={brands}
                calculateDiscount={calculateDiscount}
                handleProductSelect={handleProductSelect}
                handleShare={handleShare}
                trackClick={trackClick}
                isGeneratingDescription={false}
                generateEnhancedDescription={generateEnhancedDescription}
                index={index}
              />
            </Grid>
          ))}
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-product-${index}`}>
                <ProductCard
                  isSkeleton
                  theme={theme}
                  index={index}
                  calculateDiscount={calculateDiscount}
                  allCategories={categories}
                  allSources={sources}
                  allBrands={brands}
                  handleProductSelect={handleProductSelect}
                  handleShare={handleShare}
                  trackClick={trackClick}
                  isGeneratingDescription={false}
                  generateEnhancedDescription={generateEnhancedDescription}
                />
              </Grid>
            ))}
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Deals;