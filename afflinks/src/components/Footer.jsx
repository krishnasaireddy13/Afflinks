import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        color: 'white',
        py: 4,
        borderTop: `3px solid ${theme.palette.secondary.main}`,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.12)',
        opacity: 0,
        animation: 'fadeInUp 1s ease-out forwards',
        '@keyframes fadeInUp': {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="flex-start">
          <Grid item xs={12} sm={4}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              Afflinks
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Lora, serif' }}>
              Your one-stop destination for the best affiliate deals.
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, '& li': { mb: 1 } }}>
              <li><Link href="#" color="inherit" underline="none" sx={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, opacity: 0.95, '&:hover': { color: theme.palette.secondary.light } }}>Home</Link></li>
              <li><Link href="#" color="inherit" underline="none" sx={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, opacity: 0.95, '&:hover': { color: theme.palette.secondary.light } }}>Deals</Link></li>
              <li><Link href="#" color="inherit" underline="none" sx={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, opacity: 0.95, '&:hover': { color: theme.palette.secondary.light } }}>Categories</Link></li>
              <li><Link href="#" color="inherit" underline="none" sx={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, opacity: 0.95, '&:hover': { color: theme.palette.secondary.light } }}>Contact</Link></li>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              Connect
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, '& li': { mb: 1 } }}>
              <li><Link href="#" color="inherit" underline="none" sx={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, opacity: 0.95, '&:hover': { color: theme.palette.secondary.light } }}>Twitter</Link></li>
              <li><Link href="#" color="inherit" underline="none" sx={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, opacity: 0.95, '&:hover': { color: theme.palette.secondary.light } }}>Instagram</Link></li>
              <li><Link href="#" color="inherit" underline="none" sx={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, opacity: 0.95, '&:hover': { color: theme.palette.secondary.light } }}>Email</Link></li>
            </Box>
          </Grid>
        </Grid>
        <Typography variant="body2" align="center" sx={{ mt: 4, opacity: 0.85, fontFamily: 'Lora, serif' }}>
          © 2025 Afflinks. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
