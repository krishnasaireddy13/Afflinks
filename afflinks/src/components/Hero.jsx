import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Hero = () => {
  const theme = useTheme();
  const backgroundImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', // Headphones
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', // Shoes
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', // Watch
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', // Glasses
    'https://images.unsplash.com/photo-1526170379842-73855922047b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80', // Camera
  ];

  const [bgImage, setBgImage] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBgImage(randomImage);

    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20, // Subtle parallax movement
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box
      component="section"
      sx={{
        padding: { xs: '6rem 1rem', md: '8rem 1rem' },
        textAlign: 'center',
        backgroundImage: `linear-gradient(135deg, rgba(18,18,18,0.9), rgba(28,37,38,0.7)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: `center calc(50% + ${mousePos.y}px)`,
        backgroundAttachment: 'fixed', // Parallax effect
        position: 'relative',
        minHeight: '700px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        overflow: 'hidden',
        // Background zoom animation
        '@keyframes backgroundZoom': {
          '0%': { backgroundSize: '100% 100%' },
          '100%': { backgroundSize: '115% 115%' },
        },
        animation: 'backgroundZoom 15s ease-in-out infinite alternate',
      }}
    >
      {/* Dynamic decorative shapes with enhanced animations */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: { xs: '60px', md: '100px' },
          height: { xs: '60px', md: '100px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.main}, transparent)`,
          opacity: 0.4,
          filter: 'blur(25px)',
          animation: 'float1 8s ease-in-out infinite alternate',
          '@keyframes float1': {
            '0%': { transform: `translate(${mousePos.x}px, ${mousePos.y}px)` },
            '50%': { transform: `translate(${mousePos.x + 30}px, ${mousePos.y + 40}px)` },
            '100%': { transform: `translate(${mousePos.x}px, ${mousePos.y}px)` },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: { xs: '80px', md: '120px' },
          height: { xs: '80px', md: '120px' },
          borderRadius: '30%',
          background: `radial-gradient(circle, ${theme.palette.success.main}, transparent)`,
          opacity: 0.3,
          filter: 'blur(30px)',
          animation: 'float2 10s ease-in-out infinite alternate',
          '@keyframes float2': {
            '0%': { transform: `translate(${mousePos.x}px, ${mousePos.y}px)` },
            '50%': { transform: `translate(${mousePos.x - 40}px, ${mousePos.y - 30}px)` },
            '100%': { transform: `translate(${mousePos.x}px, ${mousePos.y}px)` },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '35%',
          right: '5%',
          width: { xs: '50px', md: '80px' },
          height: { xs: '50px', md: '80px' },
          borderRadius: '20px',
          background: `radial-gradient(circle, ${theme.palette.error.main}, transparent)`,
          opacity: 0.35,
          filter: 'blur(20px)',
          animation: 'float3 6s ease-in-out infinite alternate',
          '@keyframes float3': {
            '0%': { transform: `translate(${mousePos.x}px, ${mousePos.y}px) rotate(0deg)` },
            '50%': { transform: `translate(${mousePos.x - 20}px, ${mousePos.y + 20}px) rotate(45deg)` },
            '100%': { transform: `translate(${mousePos.x}px, ${mousePos.y}px) rotate(0deg)` },
          },
        }}
      />

      {/* Content container with enhanced animations */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1280,
          mx: 'auto',
          px: { xs: 2, sm: 3, lg: 4 },
          opacity: 0,
          animation: 'contentFadeInUp 1.2s ease-out 0.3s forwards',
          '@keyframes contentFadeInUp': {
            '0%': { opacity: 0, transform: 'translateY(40px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            color: 'white',
            marginBottom: { xs: '1.5rem', md: '2rem' },
            letterSpacing: '-0.02em',
            textShadow: '0 6px 12px rgba(0, 0, 0, 0.5)',
            fontSize: { xs: '2.8rem', sm: '4rem', md: '5rem' },
            fontWeight: 900,
            // Text animation for individual words
            '& >strateg: ': {
              display: 'inline-block',
              animation: 'textPop 0.8s ease-out forwards',
              opacity: 0,
              animationDelay: '0.5s',
            },
            '@keyframes textPop': {
              '0%': { opacity: 0, transform: 'scale(0.8)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          {['Unlock', 'Incredible', 'Savings', 'with', 'Afflinks'].map((word, index) => (
            <span key={index} style={{ animationDelay: `${0.5 + index * 0.2}s` }}>
              {word}&nbsp;
            </span>
          ))}
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{
            color: theme.palette.secondary.light,
            marginBottom: { xs: '2rem', md: '3rem' },
            maxWidth: '55rem',
            mx: 'auto',
            lineHeight: 1.8,
            fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.7rem' },
            textShadow: '0 3px 6px rgba(0, 0, 0, 0.3)',
            opacity: 0,
            animation: 'contentFadeInUp 1.2s ease-out 1s forwards',
          }}
        >
          Your ultimate gateway to exclusive deals on electronics, fashion, home essentials, and more. Discover curated offers from top brands like Amazon and Flipkart for unmatched savings daily.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          href="#products"
          sx={{
            padding: { xs: '1.2rem 3rem', md: '1.5rem 4rem' },
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            borderRadius: 50,
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            fontWeight: 700,
            textTransform: 'none',
            transition: 'transform 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease',
            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
              transform: 'translateY(-6px) scale(1.03)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            },
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' },
              '50%': { transform: 'scale(1.06)', boxShadow: '0 12px 25px rgba(0,0,0,0.5)' },
              '100%': { transform: 'scale(1)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' },
            },
            animation: 'pulse 2s infinite ease-in-out',
          }}
        >
          Discover Deals Now!
        </Button>
      </Box>
    </Box>
  );
};

export default Hero;