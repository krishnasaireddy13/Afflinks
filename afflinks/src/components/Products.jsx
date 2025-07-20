import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Slider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTheme } from '@mui/material/styles';
import { getFirestore, collection, query, onSnapshot, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import ProductCard from './ProductCard';
import ShimmerLoader from './ShimmerLoader';

// Utility to fetch sources, brands, and categories from Firestore
import { collection as fbCollection } from 'firebase/firestore';

const Products = ({ firebaseApp, auth, db, userId, isAuthReady }) => {
  const theme = useTheme();
  const [allProducts, setAllProducts] = useState([]);
  const [recentlyAddedProducts, setRecentlyAddedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [maxProductPrice, setMaxProductPrice] = useState(100000);
  const [sources, setSources] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const location = useLocation();

  // Extract productId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const selectedProductId = queryParams.get('productId');

  // Use the appId from firebaseApp options if available, otherwise fallback
  const appId = firebaseApp?.options?.appId || '1:43353831547:web:ce46623abfb89b3b5bcade';

  // Update max price and price range when products change
  useEffect(() => {
    if (allProducts.length > 0) {
      const prices = allProducts.map(p => p.dealPrice || p.originalPrice || 0);
      const highest = Math.max(...prices, 0);
      setMaxProductPrice(highest);
      setPriceRange([0, highest]);
    }
  }, [allProducts]);

  // Fetch sources, brands, and categories from Firestore on mount
  useEffect(() => {
    if (!db || !isAuthReady) return;
    const fetchMeta = async () => {
      try {
        const sourcesSnap = await getDocs(fbCollection(db, `artifacts/${appId}/public/data/sources`));
        setSources(sourcesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const brandsSnap = await getDocs(fbCollection(db, `artifacts/${appId}/public/data/brands`));
        setBrands(brandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const categoriesSnap = await getDocs(fbCollection(db, `artifacts/${appId}/public/data/categories`));
        setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.warn('Products.jsx: Could not fetch sources/brands/categories:', err.message);
        setError('Failed to load metadata. Please check Firestore permissions or collection paths.');
      }
    };
    fetchMeta();
  }, [db, appId, isAuthReady]);

  // Fetch products
  useEffect(() => {
    if (!db || !isAuthReady) {
      console.error('Products.jsx: Firestore db not initialized or auth not ready:', { db, isAuthReady });
      setError('Database not initialized. Please check Firebase configuration and authentication.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const productsCollectionRef = collection(db, `artifacts/${appId}/public/data/products`);
    console.log('Products.jsx: Attempting to fetch products from:', `artifacts/${appId}/public/data/products`);

    const unsubscribeAllProducts = onSnapshot(query(productsCollectionRef), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Products.jsx: All products fetched:', productsData);
      setAllProducts(productsData);
      setIsLoading(false);
    }, (err) => {
      console.error('Products.jsx: Error fetching all products:', err.message, err.code);
      setError(`Failed to load products: ${err.message}. Please check your Firebase rules and data path.`);
      setIsLoading(false);
    });

    const unsubscribeRecentlyAdded = onSnapshot(
      query(productsCollectionRef, orderBy('createdAt', 'desc'), limit(4)),
      (snapshot) => {
        const recentProductsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log('Products.jsx: Recently added products fetched:', recentProductsData);
        setRecentlyAddedProducts(recentProductsData);
      },
      (err) => {
        console.warn('Products.jsx: Warning - Error fetching recently added products with orderBy. Falling back to in-memory sort. Error:', err.message, err.code);
        onSnapshot(query(productsCollectionRef), (snapshot) => {
          const recentProductsData = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 4);
          console.log('Products.jsx: Fallback - Recently added products (in-memory sort):', recentProductsData);
          setRecentlyAddedProducts(recentProductsData);
        }, (fallbackErr) => {
          console.error('Products.jsx: Fallback - Error fetching all products for in-memory sort:', fallbackErr.message);
        });
      }
    );

    return () => {
      unsubscribeAllProducts();
      unsubscribeRecentlyAdded();
    };
  }, [db, appId, isAuthReady]);

  const calculateDiscount = (originalPrice, dealPrice) => {
    if (!originalPrice || !dealPrice || originalPrice <= 0) return null;
    const discountAmount = originalPrice - dealPrice;
    const discountPercentage = (discountAmount / originalPrice) * 100;
    return { amount: discountAmount.toFixed(2), percentage: discountPercentage.toFixed(0) };
  };

  const handleShare = (product) => {
    const shareData = {
      title: product.name || 'Product',
      text: `Check out ${product.name} from ${product.source}! Get it here: ${product.link} #AfflinksDeals`,
      url: product.link || window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.error('Products.jsx: Error using Web Share API:', err));
    } else {
      setSelectedProduct(product);
      setShareDialogOpen(true);
    }
  };

  const shareOnTwitter = (product) => {
    const text = `Check out ${product.name} from ${product.source}! Get it here: ${product.link} #AfflinksDeals`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = (product) => {
    const text = `Check out ${product.name} from ${product.source}! Get it here: ${product.link}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const trackClick = (product) => {
    const clickData = {
      productId: product.id,
      productName: product.name,
      source: product.source,
      category: product.category,
      timestamp: new Date().toISOString(),
    };
    console.log('Products.jsx: Affiliate Link Clicked:', clickData);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setEnhancedDescription('');
    setIsGeneratingDescription(false);
    setShareDialogOpen(false);
  };

  const generateEnhancedDescription = async (product) => {
    setIsGeneratingDescription(true);
    setEnhancedDescription('');

    const prompt = `Generate a compelling and concise product description (around 50-70 words) for the following product, focusing on its benefits and appeal to a potential buyer.
    Product Name: ${product.name}
    Source: ${product.source}
    Category: ${product.category}
    Original Price: ${product.originalPrice}
    Deal Price: ${product.dealPrice}`;

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      });
      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        setEnhancedDescription(result.candidates[0].content.parts[0].text);
      } else {
        setEnhancedDescription('Could not generate an enhanced description at this time.');
      }
    } catch (err) {
      console.error('Products.jsx: Error calling Gemini API:', err.message);
      setEnhancedDescription('Error generating description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const filteredProducts = allProducts.filter(product => {
    if (selectedProductId) {
      return product.id === selectedProductId;
    }
    const matchesName = nameFilter ? product.name?.toLowerCase().includes(nameFilter.toLowerCase()) : true;
    const matchesBrand = brandFilter.length > 0 ? brandFilter.includes(product.brandId) : true;
    const matchesCategory = categoryFilter ? product.categoryId === categoryFilter : true;
    const matchesSource = sourceFilter.length > 0 ? sourceFilter.includes(product.sourceId) : true;
    const price = product.dealPrice || product.originalPrice || 0;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    return matchesName && matchesBrand && matchesCategory && matchesSource && matchesPrice;
  });

  const handleClearFilters = () => {
    setNameFilter('');
    setBrandFilter([]);
    setCategoryFilter('');
    setSourceFilter([]);
    // Clear URL query parameter
    navigate('/products');
  };

  if (isLoading) {
    return <ShimmerLoader fullPage count={4} height={320} />;
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      id="products"
      component="section"
      sx={{
        minHeight: '100vh',
        bgcolor: 'linear-gradient(135deg, #181818 0%, #232323 100%)',
        color: '#F7E7CE',
        fontFamily: `'Lora', serif`,
        pb: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pt: { xs: 4, md: 6 },
        pb: { xs: 2, md: 3 },
        mb: { xs: 2, md: 3 },
        background: 'none',
        boxShadow: 'none',
        zIndex: 2,
        animation: 'fadeInDown 1.1s cubic-bezier(.4,2,.3,1)',
        '@keyframes fadeInDown': {
          from: { opacity: 0, transform: 'translateY(-32px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Playfair Display, serif',
            color: '#FFF8E1',
            fontWeight: 900,
            fontSize: { xs: '2rem', md: '2.5rem' },
            letterSpacing: '-0.01em',
            textShadow: '0 4px 24px #C8B07E55',
            mb: 1,
            textAlign: 'center',
            animation: 'fadeUp 1.2s cubic-bezier(.4,2,.3,1)',
            '@keyframes fadeUp': {
              from: { opacity: 0, transform: 'translateY(40px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          Discover Products
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Lora, serif',
            color: '#F7E7CE',
            fontWeight: 400,
            fontSize: { xs: '1.08rem', md: '1.18rem' },
            mb: 0,
            textAlign: 'center',
            opacity: 0.92,
            animation: 'fadeUp 1.5s cubic-bezier(.4,2,.3,1)',
          }}
        >
          Curated for the discerning customer.
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
        {!selectedProductId && (
          <Box sx={{
            width: '100%',
            mb: { xs: 2.5, md: 4 },
            mt: { xs: -5, md: -7 },
            px: { xs: 0, sm: 1 },
            py: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1.5,
            position: 'relative',
            zIndex: 4,
            animation: 'fadeInDown 1.1s cubic-bezier(.4,2,.3,1)',
            '@keyframes fadeInDown': {
              from: { opacity: 0, transform: 'translateY(-32px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Playfair Display, serif',
                color: '#C8B07E',
                fontWeight: 800,
                fontSize: { xs: '1.18rem', md: '1.32rem' },
                letterSpacing: '0.01em',
                mb: 0,
                mt: { xs: 2.5, md: 3.5 },
                ml: 0.5,
                textShadow: '0 2px 8px #181818',
                animation: 'fadeInLeft 1.2s cubic-bezier(.4,2,.3,1)',
                '@keyframes fadeInLeft': {
                  from: { opacity: 0, transform: 'translateX(-32px)' },
                  to: { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              Filter Products
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 2,
              width: '100%',
              border: 'none',
              background: 'none',
              boxShadow: 'none',
              animation: 'fadeInUp 1.2s cubic-bezier(.4,2,.3,1)',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(32px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}>
              <TextField
                label="Search by Name"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                size="small"
                sx={{
                  minWidth: 180,
                  maxWidth: 340,
                  mr: 1,
                  background: 'rgba(255,248,225,0.10)',
                  borderRadius: 2,
                  boxShadow: '0 1px 6px #C8B07E22',
                  '& .MuiInputBase-input': {
                    color: '#FFF8E1',
                    fontFamily: 'Lora, serif',
                    fontWeight: 600,
                  },
                  '& .MuiInputLabel-root': {
                    color: '#B89B5E',
                    fontWeight: 600,
                  },
                  '& .MuiInputLabel-shrink': {
                    color: '#FFF8E1',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' },
                  },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 180, maxWidth: 340, mr: 1, background: 'rgba(255,248,225,0.10)', borderRadius: 2, boxShadow: '0 1px 6px #C8B07E22' }}>
                <InputLabel sx={{ color: '#B89B5E', fontWeight: 600 }}>Select Brands</InputLabel>
                <Select
                  multiple
                  value={brandFilter}
                  onChange={e => {
                    const value = e.target.value;
                    setBrandFilter(typeof value === 'string' ? value.split(',') : value);
                  }}
                  displayEmpty
                  renderValue={selected => {
                    if (!selected || selected.length === 0) return '';
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {selected.map(sel => {
                          const brand = brands.find(b => b.id === sel);
                          const logo = brand?.logoUrl || brand?.logo;
                          return (
                            <span key={sel} style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                              {logo && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.6em', height: '1.6em', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px #C8B07E22' }}>
                                  <img src={logo} alt="brand logo" style={{ width: '1em', height: '1em', objectFit: 'contain', borderRadius: '50%' }} />
                                </span>
                              )}
                              <span style={{ color: '#FFF8E1', fontWeight: 600, fontFamily: 'Lora, serif', fontSize: '1em' }}>{brand?.name || sel}</span>
                            </span>
                          );
                        })}
                      </span>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 320,
                        maxWidth: 220,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        background: '#232323',
                        color: '#B89B5E',
                        fontFamily: 'Lora, serif',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minHeight: 24,
                      color: '#FFF8E1',
                      fontWeight: 600,
                      fontFamily: 'Lora, serif',
                      background: 'transparent',
                      transition: 'color 0.2s',
                      caretColor: '#FFF8E1',
                    },
                    '& .MuiSelect-icon': {
                      color: '#FFF8E1',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#FFF8E1',
                    },
                    '&.Mui-focused .MuiSelect-select, & .MuiSelect-select:focus, & .MuiSelect-select[aria-expanded="true"], & .MuiInputLabel-shrink': {
                      color: '#FFF8E1',
                      background: 'transparent',
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                    '& .MuiSelect-placeholder': {
                      color: '#B89B5E',
                      opacity: 0.7,
                    },
                    '& .MuiInputLabel-shrink': {
                      color: '#FFF8E1',
                    },
                  }}
                >
                  {brands.map(brand => {
                    const logo = brand.logoUrl || brand.logo;
                    const isSelected = brandFilter.includes(brand.id);
                    return (
                      <MenuItem key={brand.id} value={brand.id} selected={isSelected} style={{ whiteSpace: 'normal', wordBreak: 'break-word', color: '#B89B5E', fontFamily: 'Lora, serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {logo && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.6em', height: '1.6em', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px #C8B07E22', marginRight: 6 }}>
                            <img src={logo} alt="brand logo" style={{ width: '1em', height: '1em', objectFit: 'contain', borderRadius: '50%' }} />
                          </span>
                        )}
                        <span style={{ fontSize: '1em' }}>{brand.name}</span>
                        {isSelected && <span style={{ marginLeft: 'auto', color: '#B89B5E', fontWeight: 700 }}>✔</span>}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120, maxWidth: 220, mr: 1, background: 'rgba(255,248,225,0.10)', borderRadius: 2, boxShadow: '0 1px 6px #C8B07E22' }}>
                <InputLabel sx={{ color: '#B89B5E', fontWeight: 600 }}>Select Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  displayEmpty
                  renderValue={selected => {
                    if (!selected) return '';
                    const category = categories.find(c => c.id === selected);
                    return category?.name || selected;
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 320,
                        maxWidth: 220,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        background: '#232323',
                        color: '#B89B5E',
                        fontFamily: 'Lora, serif',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minHeight: 24,
                      color: '#B89B5E',
                      fontWeight: 600,
                      fontFamily: 'Lora, serif',
                      background: 'transparent',
                      transition: 'color 0.2s',
                    },
                    '&.Mui-focused .MuiSelect-select, & .MuiSelect-select:focus, & .MuiSelect-select[aria-expanded="true"]': {
                      color: '#B89B5E',
                      background: 'transparent',
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                    '& .MuiSelect-placeholder': {
                      color: '#B89B5E',
                      opacity: 0.7,
                    },
                  }}
                >
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120, maxWidth: 220, mr: 1, background: 'rgba(255,248,225,0.10)', borderRadius: 2, boxShadow: '0 1px 6px #C8B07E22' }}>
                <InputLabel sx={{ color: '#B89B5E', fontWeight: 600 }}>Select Sources</InputLabel>
                <Select
                  multiple
                  value={sourceFilter}
                  onChange={e => {
                    const value = e.target.value;
                    setSourceFilter(typeof value === 'string' ? value.split(',') : value);
                  }}
                  displayEmpty
                  renderValue={selected => {
                    if (!selected || selected.length === 0) return '';
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {selected.map(sel => {
                          const source = sources.find(s => s.id === sel);
                          const logo = source?.logoUrl || source?.logo;
                          return (
                            <span key={sel} style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                              {logo && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.6em', height: '1.6em', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px #C8B07E22' }}>
                                  <img src={logo} alt="source logo" style={{ width: '1em', height: '1em', objectFit: 'contain', borderRadius: '50%' }} />
                                </span>
                              )}
                              <span style={{ color: '#B89B5E', fontWeight: 600, fontFamily: 'Lora, serif', fontSize: '1em' }}>{source?.name || sel}</span>
                            </span>
                          );
                        })}
                      </span>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 320,
                        maxWidth: 220,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        background: '#232323',
                        color: '#B89B5E',
                        fontFamily: 'Lora, serif',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minHeight: 24,
                      color: '#B89B5E',
                      fontWeight: 600,
                      fontFamily: 'Lora, serif',
                      background: 'transparent',
                      transition: 'color 0.2s',
                    },
                    '&.Mui-focused .MuiSelect-select, & .MuiSelect-select:focus, & .MuiSelect-select[aria-expanded="true"]': {
                      color: '#B89B5E',
                      background: 'transparent',
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                    '& .MuiSelect-placeholder': {
                      color: '#B89B5E',
                      opacity: 0.7,
                    },
                  }}
                >
                  {sources.map(source => {
                    const logo = source.logoUrl || source.logo;
                    const isSelected = sourceFilter.includes(source.id);
                    return (
                      <MenuItem key={source.id} value={source.id} selected={isSelected} style={{ whiteSpace: 'normal', wordBreak: 'break-word', color: '#B89B5E', fontFamily: 'Lora, serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {logo && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.6em', height: '1.6em', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px #C8B07E22', marginRight: 6 }}>
                          <img src={logo} alt="source logo" style={{ width: '1em', height: '1em', objectFit: 'contain', borderRadius: '50%' }} />
                        </span>
                        )}
                        <span style={{ fontSize: '1em' }}>{source.name}</span>
                        {isSelected && <span style={{ marginLeft: 'auto', color: '#B89B5E', fontWeight: 700 }}>✔</span>}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                minWidth: 0,
                maxWidth: 340,
                py: 0.5,
                px: 1,
                borderRadius: 2,
                background: 'rgba(255,248,225,0.13)',
                boxShadow: '0 1px 4px #C8B07E18',
                flex: '0 1 auto',
              }}>
                <span style={{ fontWeight: 700, color: '#B89B5E', minWidth: 44, fontSize: '1.08rem', letterSpacing: '0.01em' }}>Price</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  minLength={1}
                  maxLength={7}
                  min={0}
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length > 7) val = val.slice(0, 7);
                    let num = Number(val);
                    if (isNaN(num)) num = 0;
                    if (num > priceRange[1]) num = priceRange[1];
                    setPriceRange([num, priceRange[1]]);
                  }}
                  style={{
                    width: '7ch',
                    background: '#232323',
                    border: '1.2px solid #B89B5E',
                    color: '#FFF8E1',
                    borderRadius: 5,
                    padding: '4px 8px',
                    fontFamily: 'Lora, serif',
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    outline: 'none',
                    marginRight: 6,
                    textAlign: 'center',
                    letterSpacing: '0.01em',
                    transition: 'width 0.2s',
                    MozAppearance: 'textfield',
                    appearance: 'textfield',
                  }}
                  autoComplete="off"
                  aria-label="Minimum price"
                  onWheel={e => e.target.blur()}
                  onKeyDown={e => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                  }}
                />
                <span style={{ color: '#B89B5E', fontWeight: 700, fontSize: '1.08rem' }}>to</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  minLength={1}
                  maxLength={7}
                  min={priceRange[0]}
                  max={maxProductPrice}
                  value={priceRange[1]}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length > 7) val = val.slice(0, 7);
                    let num = Number(val);
                    if (isNaN(num)) num = priceRange[0];
                    if (num < priceRange[0]) num = priceRange[0];
                    if (num > maxProductPrice) num = maxProductPrice;
                    setPriceRange([priceRange[0], num]);
                  }}
                  style={{
                    width: '7ch',
                    background: '#232323',
                    border: '1.2px solid #B89B5E',
                    color: '#FFF8E1',
                    borderRadius: 5,
                    padding: '4px 8px',
                    fontFamily: 'Lora, serif',
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    outline: 'none',
                    marginLeft: 2,
                    textAlign: 'center',
                    letterSpacing: '0.01em',
                    transition: 'width 0.2s',
                    MozAppearance: 'textfield',
                    appearance: 'textfield',
                  }}
                  autoComplete="off"
                  aria-label="Maximum price"
                  onWheel={e => e.target.blur()}
                  onKeyDown={e => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                  }}
                />
                <Slider
                  value={priceRange}
                  min={0}
                  max={maxProductPrice}
                  onChange={(_, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="off"
                  size="small"
                  sx={{
                    width: 220,
                    mx: 1.5,
                    color: '#FFF8E1',
                    height: 11,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    position: 'relative',
                    zIndex: 1,
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#B89B5E',
                      border: '2.5px solid #FFF8E1',
                      width: 22,
                      height: 22,
                      boxShadow: '0 2px 12px #FFF8E144',
                    },
                    '& .MuiSlider-rail': {
                      background: 'linear-gradient(90deg, #232323 0%, #B89B5E 100%)',
                      opacity: 0.7,
                      height: 11,
                      borderRadius: 6,
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #B89B5E 0%, #FFF8E1 100%)',
                      height: 11,
                      borderRadius: 6,
                    },
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                  height: 40,
                  fontSize: '1rem',
                  borderRadius: 2,
                  border: '1.5px solid #E5C98B',
                  color: '#B89B5E',
                  fontWeight: 700,
                  fontFamily: 'Playfair Display, serif',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  background: 'none',
                  boxShadow: 'none',
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    background: '#FFF8E1',
                    color: '#181818',
                    borderColor: '#B89B5E',
                  },
                }}
              >
                Clear
              </Button>
              {(brandFilter.length > 0 || sourceFilter.length > 0 || categoryFilter) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mt: 2, alignItems: 'center', background: 'rgba(35,35,35,0.5)', borderRadius: 2, px: 1.5, py: 1 }}>
                  {brandFilter.map(brandId => {
                    const brand = brands.find(b => b.id === brandId);
                    return (
                      <span key={brandId} style={{ display: 'flex', alignItems: 'center', background: '#232323', color: '#FFF8E1', border: '1px solid #B89B5E', borderRadius: 16, padding: '2px 10px', fontSize: '0.98em', fontFamily: 'Lora, serif', fontWeight: 600 }}>
                        {(brand?.logoUrl || brand?.logo) && (
                          <img src={brand.logoUrl || brand.logo} alt="brand logo" style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', marginRight: 6 }} />
                        )}
                        {brand?.name || brandId}
                        <span style={{ marginLeft: 8, cursor: 'pointer', color: '#B89B5E', fontWeight: 700 }} onClick={() => setBrandFilter(brandFilter.filter(b => b !== brandId))}>×</span>
                      </span>
                    );
                  })}
                  {categoryFilter && (
                    <span key={categoryFilter} style={{ display: 'flex', alignItems: 'center', background: '#232323', color: '#FFF8E1', border: '1px solid #B89B5E', borderRadius: 16, padding: '2px 10px', fontSize: '0.98em', fontFamily: 'Lora, serif', fontWeight: 600 }}>
                      {categories.find(c => c.id === categoryFilter)?.name || categoryFilter}
                      <span style={{ marginLeft: 8, cursor: 'pointer', color: '#B89B5E', fontWeight: 700 }} onClick={() => setCategoryFilter('')}>×</span>
                    </span>
                  )}
                  {sourceFilter.map(sourceId => {
                    const source = sources.find(s => s.id === sourceId);
                    return (
                      <span key={sourceId} style={{ display: 'flex', alignItems: 'center', background: '#232323', color: '#FFF8E1', border: '1px solid #B89B5E', borderRadius: 16, padding: '2px 10px', fontSize: '0.98em', fontFamily: 'Lora, serif', fontWeight: 600 }}>
                        {(source?.logoUrl || source?.logo) && (
                          <img src={source.logoUrl || source.logo} alt="source logo" style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', marginRight: 6 }} />
                        )}
                        {source?.name || sourceId}
                        <span style={{ marginLeft: 8, cursor: 'pointer', color: '#B89B5E', fontWeight: 700 }} onClick={() => setSourceFilter(sourceFilter.filter(s => s !== sourceId))}>×</span>
                      </span>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 2 }}>
          <Box sx={{
            flex: 1,
            height: 2,
            background: 'linear-gradient(90deg, #C8B07E 0%, #FFF8E1 100%)',
            borderRadius: 2,
            opacity: 0.7,
            minWidth: 40,
            maxWidth: 120,
          }} />
          <Box sx={{
            px: 2.5,
            py: 0.7,
            borderRadius: 6,
            background: 'linear-gradient(90deg, #C8B07E 0%, #FFF8E1 100%)',
            color: '#181818',
            fontWeight: 700,
            fontFamily: 'Playfair Display, serif',
            fontSize: { xs: '1rem', md: '1.1rem' },
            boxShadow: '0 2px 8px #C8B07E33',
            animation: 'fadeIn 1.2s cubic-bezier(.4,2,.3,1)',
          }}>
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
          </Box>
          <Box sx={{
            flex: 1,
            height: 2,
            background: 'linear-gradient(90deg, #FFF8E1 0%, #C8B07E 100%)',
            borderRadius: 2,
            opacity: 0.7,
            minWidth: 40,
            maxWidth: 120,
          }} />
        </Box>

        <Box sx={{
          width: '100%',
          minHeight: 400,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: '1fr 1fr 1fr 1fr',
          },
          gap: { xs: 2.5, md: 4 },
          mb: { xs: 4, md: 8 },
          mt: 2,
        }}>
          {isLoading ? (
            [...Array(6)].map((_, idx) => (
              <ProductCard key={idx} isSkeleton animationDelay={idx * 0.12} theme={theme} />
            ))
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: '#C8B07E', fontFamily: 'Lora, serif', opacity: 0.7 }}>
                {selectedProductId ? 'Selected product not found.' : 'No products match the current filters.'}
              </Typography>
            </Box>
          ) : (
            filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                theme={theme}
                allCategories={categories}
                allSources={sources}
                allBrands={brands}
                calculateDiscount={calculateDiscount}
                handleProductSelect={handleProductSelect}
                handleShare={handleShare}
                trackClick={trackClick}
                isGeneratingDescription={isGeneratingDescription}
                generateEnhancedDescription={generateEnhancedDescription}
                index={idx}
              />
            ))
          )}
        </Box>

        {!selectedProductId && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: { xs: 4, md: 7 }, mb: 2, gap: 2 }}>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, #FFF8E1 0%, #C8B07E 100%)',
              borderRadius: 2,
              opacity: 0.7,
              minWidth: 40,
              maxWidth: 120,
            }} />
            <Box sx={{
              px: 2.5,
              py: 0.7,
              borderRadius: 6,
              background: 'linear-gradient(90deg, #FFF8E1 0%, #C8B07E 100%)',
              color: '#181818',
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
              fontSize: { xs: '1rem', md: '1.1rem' },
              boxShadow: '0 2px 8px #C8B07E33',
              animation: 'fadeIn 1.2s cubic-bezier(.4,2,.3,1)',
            }}>
              Existing Products
            </Box>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, #C8B07E 0%, #FFF8E1 100%)',
              borderRadius: 2,
              opacity: 0.7,
              minWidth: 40,
              maxWidth: 120,
            }} />
          </Box>
        )}

        {!selectedProductId && (
          <Box sx={{ mt: { xs: 4, md: 8 }, mb: 2 }}>
            <Box sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 3,
              py: 2,
              px: 1,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}>
              {recentlyAddedProducts.length > 0 ? (
                recentlyAddedProducts.map((product, idx) => (
                  <Box key={product.id} sx={{ minWidth: 320, maxWidth: 340, flex: '0 0 auto', animation: `fadeUp 0.8s ${idx * 0.13}s both cubic-bezier(.4,2,.3,1)` }}>
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
                      isGeneratingDescription={isGeneratingDescription}
                      generateEnhancedDescription={generateEnhancedDescription}
                      index={idx}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="h6" align="center" sx={{ color: '#C8B07E', fontFamily: 'Lora, serif', opacity: 0.7 }}>
                  No recently added products available.
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Products;