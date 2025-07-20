import React from 'react';
import { Box } from '@mui/material';

const ShimmerLoader = ({ count = 3, height = 300, grid = true, fullPage = false }) => (
  <Box
    sx={{
      display: grid ? 'grid' : 'flex',
      gridTemplateColumns: grid ? 'repeat(auto-fit, minmax(250px, 1fr))' : undefined,
      gap: 2,
      p: fullPage ? 8 : 4,
      background: fullPage ? '#121212' : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: fullPage ? '60vh' : undefined,
      width: '100%',
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <Box
        key={i}
        sx={{
          width: '100%',
          height,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #F7E7CE 25%, #FFF8E1 50%, #F7E7CE 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          '@keyframes shimmer': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        }}
      />
    ))}
  </Box>
);

export default ShimmerLoader;
