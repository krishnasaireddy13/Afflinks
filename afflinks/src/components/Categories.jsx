import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Path to match firebaseConfig.js
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
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
    h6: { fontFamily: 'Playfair Display, serif' },
  },
});

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [sources, setSources] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use appId from firebaseConfig
  const appId = '1:43353831547:web:ce46623abfb89b3b5bcade';
  const categoriesCollectionRef = collection(db, `artifacts/${appId}/public/data/categories`);
  const productsCollectionRef = collection(db, `artifacts/${appId}/public/data/products`);
  const sourcesCollectionRef = collection(db, `artifacts/${appId}/public/data/sources`);
  const brandsCollectionRef = collection(db, `artifacts/${appId}/public/data/brands`);

  // Fetch categories on mount
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      categoriesCollectionRef,
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Categories fetched:', categoriesData); // Debug log
        setCategories(categoriesData);
        setLoading(false);
      },
      (err) => {
        console.error('Categories.jsx: Error fetching categories:', err);
        setError('Failed to load categories. Please check Firestore permissions or collection path.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch sources on mount
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
        console.error('Categories.jsx: Error fetching sources:', err);
        setError('Failed to load sources.');
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch brands on mount
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
        console.error('Categories.jsx: Error fetching brands:', err);
        setError('Failed to load brands.');
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch products when a category is selected
  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      return;
    }
    setLoading(true);
    console.log('Fetching products for category ID:', selectedCategory.id); // Debug log
    const q = query(productsCollectionRef, where('categoryId', '==', selectedCategory.id));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Products fetched:', productsData); // Debug log
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error('Categories.jsx: Error fetching products:', err);
        setError(
          'Failed to load products. Please check Firestore permissions or ensure products have the correct categoryId.'
        );
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [selectedCategory]);

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
        .catch((err) => console.error('Categories.jsx: Share failed:', err));
    } else {
      console.log('Web Share API not supported');
      // Fallback to copy link or other share mechanism
    }
  };

  const trackClick = (product) => {
    console.log('Tracked click for product:', product);
    // Implement analytics tracking (e.g., Firebase Analytics)
  };

  const generateEnhancedDescription = async (product) => {
    console.log('Generating description for:', product);
    // Implement description generation logic (e.g., API call)
    return `Enhanced description for ${product.name}`;
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setError('');
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
          Categories
        </Typography>
        {error && (
          <Typography color="error" sx={{ textAlign: 'center', mb: 2, fontFamily: 'Lora, serif' }}>
            {error}
          </Typography>
        )}
        {loading && !selectedCategory && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress sx={{ color: '#B89B5E' }} />
          </Box>
        )}
        {!selectedCategory ? (
          <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  sx={{
                    bgcolor: '#2E2D38',
                    borderRadius: 3,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    animation: `${fadeInUpLuxury} 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.1}s both`,
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 25px rgba(0,0,0,0.6)',
                    },
                    border: '1px solid #B89B5E40',
                  }}
                >
                  <CardActionArea onClick={() => handleCategoryClick(category)} aria-label={`View ${category.name} products`}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={category.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={category.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          color: '#FFF8E1',
                          fontFamily: 'Playfair Display, serif',
                          fontWeight: 700,
                          textShadow: '0 1px 4px #121212',
                        }}
                      >
                        {category.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
            {loading &&
              Array.from({ length: 3 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-category-${index}`}>
                  <Card
                    sx={{
                      bgcolor: '#2E2D38',
                      borderRadius: 3,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                      overflow: 'hidden',
                      animation: `${fadeInUpLuxury} 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.1}s both`,
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{ height: 200, bgcolor: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite' }}
                    />
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          height: 24,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 1,
                          animation: 'pulse 1.5s infinite',
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            <style>
              {`
                @keyframes pulse {
                  0% { opacity: 0.5; }
                  50% { opacity: 0.2; }
                  100% { opacity: 0.5; }
                }
              `}
            </style>
          </Grid>
        ) : (
          <Box>
            <Button
              onClick={() => setSelectedCategory(null)}
              sx={{
                color: '#B89B5E',
                mb: 2,
                fontFamily: 'Lora, serif',
                '&:hover': { color: '#FFF8E1' },
              }}
              aria-label="Back to categories"
            >
              Back to Categories
            </Button>
            <Typography
              variant="h5"
              sx={{
                color: '#FFF8E1',
                mb: 2,
                fontWeight: 700,
                textShadow: '0 1px 6px #607D8B44',
              }}
            >
              Products in {selectedCategory.name}
            </Typography>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress sx={{ color: '#B89B5E' }} />
              </Box>
            )}
            {!loading && products.length === 0 && (
              <Typography sx={{ color: '#FFF8E1', textAlign: 'center', fontFamily: 'Lora, serif' }}>
                No products found in this category. Please check if products have the correct category ID linked from your categories.
              </Typography>
            )}
            <Grid container spacing={2}>
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
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Categories;