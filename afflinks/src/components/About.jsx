import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const About = () => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: '#121212',
        color: '#F7E7CE',
        fontFamily: `'Lora', serif`,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            bgcolor: 'linear-gradient(135deg, #1C2526 0%, #121212 100%)',
            boxShadow: '0 10px 30px #F7E7CE22',
            border: '2px solid #F7E7CE',
            fontFamily: `'Lora', serif`,
            animation: 'fadeInUpLuxury 1.1s cubic-bezier(.4,2,.3,1)',
            opacity: 0.98,
            transition: 'box-shadow 0.4s, background 0.5s',
            '&:hover': {
              boxShadow: '0 0 32px 4px #F7E7CE99, 0 10px 30px #F7E7CE22',
              bgcolor: 'linear-gradient(135deg, #1C2526 0%, #FFF8E1 100%)',
              borderColor: '#FFF8E1',
            },
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              color: '#F7E7CE',
              fontFamily: `'Playfair Display', serif`,
              fontWeight: 800,
              mb: { xs: 2, md: 3 },
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              fontSize: { xs: '1.5rem', sm: '2.1rem', md: '2.5rem' },
              textShadow: '0 2px 8px #121212',
              animation: 'fadeIn 1.2s cubic-bezier(.4,2,.3,1)',
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                margin: '0 auto',
                width: '0%',
                height: '4px',
                background: 'linear-gradient(90deg, #F7E7CE 0%, #FFF8E1 100%)',
                borderRadius: 2,
                transition: 'width 0.5s cubic-bezier(.4,2,.3,1)',
              },
              '&:hover::after': {
                width: '60%',
              },
            }}
          >
            About Afflinks
          </Typography>

          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: '#FFF8E1', fontFamily: `'Lora', serif`, fontSize: '1.18rem', animation: 'fadeIn 1.4s 0.2s both', transition: 'color 0.25s', cursor: 'pointer', '&:hover': { color: '#F7E7CE' } }}>
            Welcome to Afflinks, your premier destination for discovering incredible deals and savings across a vast array of products. In today's fast-paced world, finding the best value can be challenging, but we're here to simplify that process for you. Our mission is to connect you with top-tier products from leading e-commerce platforms like Amazon, Flipkart, and many more, all through carefully curated affiliate links.
          </Typography>

          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: '#FFF8E1', fontFamily: `'Lora', serif`, fontSize: '1.18rem', animation: 'fadeIn 1.4s 0.4s both', transition: 'color 0.25s', cursor: 'pointer', '&:hover': { color: '#F7E7CE' } }}>
            At Afflinks, we believe that smart shopping shouldn't require endless searching. That's why our dedicated team works tirelessly to identify and categorize the most compelling offers, ensuring you get access to high-quality items at competitive prices. Whether you're looking for the latest electronics, trendy fashion, essential home goods, or captivating books, our platform is designed to make your shopping experience seamless and rewarding.
          </Typography>

          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: '#FFF8E1', fontFamily: `'Lora', serif`, fontSize: '1.18rem', animation: 'fadeIn 1.4s 0.6s both', transition: 'color 0.25s', cursor: 'pointer', '&:hover': { color: '#F7E7CE' } }}>
            We are committed to transparency and user satisfaction. Every link on our site is an affiliate link, meaning we may earn a small commission when you make a purchase through it, at no extra cost to you. This allows us to maintain and improve our service, bringing you even more amazing deals. Thank you for choosing Afflinks as your trusted partner in smart shopping. Happy saving!
          </Typography>

          <Typography
            variant="h5"
            align="center"
            sx={{
              mt: { xs: 4, md: 6 },
              color: '#FFF8E1',
              fontWeight: 700,
              fontFamily: `'Playfair Display', serif`,
              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' },
              textShadow: '0 2px 8px #121212',
              animation: 'fadeInUpLuxury 1.2s 0.8s both',
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                margin: '0 auto',
                width: '0%',
                height: '3px',
                background: 'linear-gradient(90deg, #F7E7CE 0%, #FFF8E1 100%)',
                borderRadius: 2,
                transition: 'width 0.5s cubic-bezier(.4,2,.3,1)',
              },
              '&:hover::after': {
                width: '40%',
              },
            }}
          >
            "Shop Smarter, Save More with Afflinks."
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;
