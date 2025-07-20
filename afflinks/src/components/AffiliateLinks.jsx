import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Pagination,
  useMediaQuery,
} from '@mui/material';
import ShimmerLoader from './ShimmerLoader';
import CloseIcon from '@mui/icons-material/Close';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTheme } from '@mui/material/styles';

const AffiliateLinks = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const productsPerPage = 8; // Increased for better display on larger screens

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch('/products.json') // Fetch from root, assuming products.json is in public folder
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError('Unable to load products. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  const categories = ['All', ...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === 'All' || product.category === selectedCategory) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.source.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const shareOnTwitter = (product) => {
    const text = `Check out ${product.name} from ${product.source}! ${product.link} via @Afflinks`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = (product) => {
    const text = `Check out ${product.name} from ${product.source}! ${product.link}`;
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
    console.log('Affiliate Link Clicked:', clickData);
    // In a real application, you would send this data to an analytics service or backend
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setEnhancedDescription(''); // Clear previous enhanced description
    setIsGeneratingDescription(false); // Reset generation state
  };

  const generateEnhancedDescription = async (product) => {
    setIsGeneratingDescription(true);
    setEnhancedDescription(''); // Clear previous description

    const prompt = `Generate a compelling and concise product description (around 50-70 words) for the following product, focusing on its benefits and appeal to a potential buyer.
    Product Name: ${product.name}
    Source: ${product.source}
    Category: ${product.category}
    `;

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setEnhancedDescription(text);
      } else {
        setEnhancedDescription('Could not generate an enhanced description at this time.');
      }
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      setEnhancedDescription('Error generating description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" color="error">
          An error occurred. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="section" id="products" sx={{
      padding: { xs: '3rem 1rem', md: '6rem 1rem' },
      background: theme.palette.background.default,
      borderRadius: '16px',
      margin: { xs: '1rem', md: '2rem' },
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
        <Typography
          variant="h3"
          component="h3"
          align="center"
          gutterBottom
          sx={{
            marginBottom: { xs: '2rem', md: '3rem' },
            textTransform: 'uppercase',
            color: theme.palette.text.primary,
          }}
        >
          Featured Products
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 3 },
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: { xs: '2rem', md: '2.5rem' },
        }}>
          <TextField
            fullWidth={isSmallScreen}
            variant="outlined"
            placeholder="Search products or sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              maxWidth: { xs: '100%', sm: '36rem' },
              borderRadius: '10px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: theme.palette.grey[100],
                transition: 'box-shadow 0.3s ease',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'transparent' },
                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'contained' : 'outlined'}
                color={selectedCategory === category ? 'primary' : 'inherit'}
                onClick={() => setSelectedCategory(category)}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  ...(selectedCategory !== category && {
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.grey[300],
                    backgroundColor: theme.palette.grey[100],
                    '&:hover': {
                      backgroundColor: theme.palette.grey[200],
                      borderColor: theme.palette.grey[300],
                    },
                  }),
                }}
              >
                {category}
              </Button>
            ))}
          </Box>
        </Box>

        {isLoading ? (
          <ShimmerLoader fullPage count={3} height={260} />
        ) : (
          <>
            <Grid container spacing={4} justifyContent="center">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.image}
                        alt={product.name}
                        onClick={() => handleProductSelect(product)}
                        sx={{
                          objectFit: 'cover',
                          cursor: 'pointer',
                          borderBottom: `3px solid ${theme.palette.error.main}`, // Using error color as a vibrant accent
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography variant="h6" component="h4" noWrap sx={{ marginBottom: '0.5rem' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '0.25rem' }}>
                          from {product.source}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '1rem' }}>
                          Category: {product.category}
                        </Typography>
                        <Button
                          variant="contained"
                          color="success"
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackClick(product)}
                          fullWidth
                          sx={{ mb: 1.5 }}
                        >
                          Buy Now
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => generateEnhancedDescription(product)}
                          fullWidth
                          sx={{ mb: 1.5 }}
                          disabled={isGeneratingDescription}
                        >
                          {isGeneratingDescription ? <CircularProgress size={24} /> : '✨ Enhance Description'}
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            variant="outlined"
                            startIcon={<TwitterIcon />}
                            onClick={() => shareOnTwitter(product)}
                            sx={{
                              flexGrow: 1,
                              borderColor: '#1DA1F2',
                              color: '#1DA1F2',
                              '&:hover': {
                                backgroundColor: '#1DA1F2',
                                color: 'white',
                                borderColor: '#1DA1F2',
                              },
                            }}
                          >
                            Twitter
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<WhatsAppIcon />}
                            onClick={() => shareOnWhatsApp(product)}
                            sx={{
                              flexGrow: 1,
                              borderColor: '#25D366',
                              color: '#25D366',
                              '&:hover': {
                                backgroundColor: '#25D366',
                                color: 'white',
                                borderColor: '#25D366',
                              },
                            }}
                          >
                            WhatsApp
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="h6" align="center" color="text.secondary" sx={{ py: 4 }}>
                    No products found matching your criteria.
                  </Typography>
                </Grid>
              )}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '10px',
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.grey[200],
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        {selectedProduct && (
          <Dialog
            open={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                animation: 'slide-up 0.3s ease-in-out',
                '@keyframes slide-up': {
                  from: { transform: 'translateY(40px)', opacity: 0 },
                  to: { transform: 'translateY(0)', opacity: 1 },
                },
              },
            }}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
              <Typography variant="h5" component="h4" sx={{ fontWeight: 600 }}>
                {selectedProduct.name}
              </Typography>
              <IconButton onClick={() => setSelectedProduct(null)} sx={{ color: theme.palette.grey[500] }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 0 }}>
              <CardMedia
                component="img"
                height="250"
                image={selectedProduct.image}
                alt={selectedProduct.name}
                sx={{
                  borderRadius: '12px',
                  mt: 2,
                  mb: 2,
                  border: `2px solid ${theme.palette.error.main}`,
                  objectFit: 'cover',
                }}
              />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Source: {selectedProduct.source}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Category: {selectedProduct.category}
              </Typography>
              {isGeneratingDescription ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ ml: 2 }}>Generating description...</Typography>
                </Box>
              ) : enhancedDescription ? (
                <Box sx={{ my: 2, p: 2, border: `1px solid ${theme.palette.primary.light}`, borderRadius: '8px', backgroundColor: theme.palette.background.default }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Enhanced Description:</Typography>
                  <Typography variant="body2">{enhancedDescription}</Typography>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => generateEnhancedDescription(selectedProduct)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  ✨ Generate Enhanced Description
                </Button>
              )}
              <Button
                variant="contained"
                color="success"
                href={selectedProduct.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick(selectedProduct)}
                fullWidth
                sx={{ mb: 2 }}
              >
                Buy Now
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </Box>
    </Box>
  );
};

export default AffiliateLinks;
