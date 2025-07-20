// src/components/ProductCard.jsx
import React from 'react';
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { keyframes } from '@emotion/react';

// Animations (consistent across components)
const fadeInUpLuxury = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ProductCard = ({
  product,
  theme,
  allCategories,
  allSources,
  allBrands,
  calculateDiscount,
  handleProductSelect,
  handleShare,
  trackClick,
  isGeneratingDescription,
  generateEnhancedDescription,
  isSkeleton = false, // Prop to trigger skeleton state
  index = 0, // For animation delay
}) => {
  // --- ADD THIS CHECK ---
  // If product is null/undefined AND we are not explicitly rendering a skeleton,
  // return null to prevent the TypeError.
  if (!product && !isSkeleton) {
    console.warn("ProductCard received a null/undefined product prop and is not in skeleton mode.");
    return null;
  }
  // --- END ADDITION ---

  // Default logo for fallbacks if image is missing
  const defaultLogoUrl = 'https://placehold.co/20x20/cccccc/333333?text=?';

  // Render skeleton if isSkeleton prop is true (this was already good)
  if (isSkeleton) {
    // ... (rest of your existing skeleton rendering logic)
    return (
        <Card
          sx={{
            width: 270,
            minWidth: 270,
            maxWidth: 270,
            height: 370,
            borderRadius: 4,
            bgcolor: theme.palette.background.paper,
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: `${fadeInUpLuxury} 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.1}s both`,
            border: '2.5px solid #B89B5E40',
          }}
        >
          <Skeleton
            variant="rectangular"
            height={150}
            sx={{
              flexShrink: 0,
              borderRadius: '12px 12px 0 0',
              bgcolor: 'rgba(255,255,255,0.1)',
            }}
          />
          <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Skeleton variant="text" width="85%" height={32} sx={{ mb: 0.5, mx: 'auto', bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1, mx: 'auto', bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Skeleton variant="circular" width={18} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Skeleton variant="text" width="30%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Skeleton variant="rectangular" width="100%" height={45} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>
          </Box>
        </Card>
      );
  }


  // --- Crucial Lookups (these lines caused the error if product was undefined) ---
  const productSource = allSources?.find(s => s.id === product.sourceId); // product is now guaranteed to be defined here
  const productBrand = allBrands?.find(b => b.id === product.brandId);
  const productCategory = allCategories?.find(c => c.id === product.categoryId);
  // --- End Crucial Lookups ---

  // ... (rest of your ProductCard rendering logic, it should be fine now)
  const discount = product ? calculateDiscount(product.originalPrice, product.dealPrice) : null;

  return (
    <Card
      sx={{
        width: 270,
        minWidth: 270,
        maxWidth: 270,
        height: 370,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        bgcolor: '#23212B',
        boxShadow: '0 10px 32px #B89B5E33, 0 2px 8px #B89B5E44',
        border: '2.5px solid #B89B5E',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.3s cubic-bezier(.4,2,.3,1), box-shadow 0.3s cubic-bezier(.4,2,.3,1), border 0.3s',
        animation: `${fadeInUpLuxury} 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.1}s both`,
        '&:hover': {
          transform: 'translateY(-10px) scale(1.045)',
          boxShadow: '0 16px 48px #B89B5Ecc, 0 4px 24px #B89B5E99',
          borderColor: '#FFF8E1',
        },
      }}
    >
      {/* Top Section: Image */}
      <Box
        sx={{
          height: 150,
          minHeight: 150,
          maxHeight: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFF',
          borderBottom: '1.5px solid #B89B5E',
          flexShrink: 0,
          p: 1,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <CardMedia
          component="img"
          image={product.image || 'https://via.placeholder.com/400x200?text=No+Image'} // Fallback image
          alt={product.name || 'Product Image'}
          onClick={() => handleProductSelect(product)}
          sx={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
            borderRadius: '10px',
            boxShadow: '0 2px 12px #607D8B33',
          }}
        />
      </Box>

      {/* Middle Section: Product Details */}
      <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component="h3"
          align="center"
          sx={{
            mb: 1.5,
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#FFF8E1',
            fontFamily: `'Playfair Display', serif`,
            fontSize: '1.13rem',
            letterSpacing: '-0.01em',
            textShadow: '0 2px 12px #121212',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}
          title={product.name || 'Unnamed Product'}
        >
          {(product.name || 'Unnamed Product').length > 32
            ? (product.name || 'Unnamed Product').slice(0, 32) + '...'
            : (product.name || 'Unnamed Product')}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 0.8 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: '#B89B5E',
                fontFamily: `'Playfair Display', serif`,
                fontSize: '1.25rem',
                textShadow: '0 1px 6px #607D8B44',
              }}
            >
              ₹{product.dealPrice ? product.dealPrice.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }) : 'N/A'}
            </Typography>
            {product.originalPrice && product.dealPrice && (
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', opacity: 0.7, color: '#B89B5E99', fontFamily: `'Lora', serif` }}
              >
                ₹{product.originalPrice.toLocaleString('en-IN', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </Typography>
            )}
            {discount && (
              <Chip
                label={`${discount.percentage}% OFF`}
                size="small"
                sx={{
                  bgcolor: '#B89B5E',
                  color: '#181818',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  borderRadius: '4px',
                  height: 20,
                  px: 0.8,
                  fontFamily: `'Lora', serif`,
                }}
              />
            )}
          </Box>

          {/* Source & Category Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, color: '#B89B5E' }}>
            {productSource ? (
              <img
                src={productSource.logo || defaultLogoUrl}
                alt={`${productSource.name} logo`}
                style={{ width: 18, height: 18, objectFit: 'contain', background: '#fff', borderRadius: '50%', border: '1px solid #eee', boxShadow: '0 1px 4px #607D8B22' }}
                onError={(e) => { e.target.onerror = null; e.target.src = defaultLogoUrl; }} // Fallback on error
              />
            ) : (
                <img
                    src={defaultLogoUrl}
                    alt="Unknown source logo"
                    style={{ width: 18, height: 18, objectFit: 'contain', background: '#fff', borderRadius: '50%', border: '1px solid #eee', boxShadow: '0 1px 4px #607D8B22' }}
                />
            )}
            <Typography variant="caption" sx={{ fontSize: '0.8em', opacity: 0.9, color: '#B89B5E', fontFamily: `'Lora', serif` }}>
              {productSource?.name || 'Unknown Source'} {productCategory && `| ${productCategory.name}`}
            </Typography>
          </Box>
        </Box>

        {/* Bottom Section: Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            href={product.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(product)}
            fullWidth
            sx={{
              py: 1,
              fontSize: '0.98rem',
              borderRadius: 2,
              fontWeight: 700,
              fontFamily: `'Lora', serif`,
              background: 'linear-gradient(90deg, #B89B5E 0%, #FFF8E1 100%)',
              color: '#181818',
              boxShadow: '0 3px 8px #B89B5E44',
              textTransform: 'none',
              letterSpacing: '-0.01em',
              transition: 'background 0.3s, color 0.3s',
              '&:hover': {
                background: 'linear-gradient(90deg, #FFF8E1 0%, #B89B5E 100%)',
                color: '#B89B5E',
              },
            }}
            disabled={!product.link}
          >
            Buy Now
          </Button>
        </Box>
      </Box>

      {/* Share Button */}
      <IconButton
        onClick={() => handleShare(product)}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 30,
          height: 30,
          color: '#B89B5E',
          backgroundColor: '#FFF8E144',
          borderRadius: '50%',
          boxShadow: '0 2px 5px #607D8B22',
          transition: 'transform 0.2s, background-color 0.2s',
          '&:hover': {
            bgcolor: '#B89B5E99',
            color: '#181818',
            transform: 'scale(1.1)',
          },
          '&:active': {
            animation: 'pulse 0.3s',
          },
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.2)' },
            '100%': { transform: 'scale(1)' },
          },
        }}
      >
        <ShareIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
    </Card>
  );
};

export default ProductCard;