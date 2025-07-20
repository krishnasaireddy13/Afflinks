import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, Container, Avatar, Paper, Fade } from '@mui/material';
import ShimmerLoader from './ShimmerLoader';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Hero from './Hero';
import { collection as fbCollection, getDocs } from 'firebase/firestore';
import { useTheme } from '@mui/material/styles';



const howItWorks = [
  {
    icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#F7E7CE', background: '#1C2526', borderRadius: '50%', p: '6px', boxShadow: '0 2px 8px #F7E7CE55' }} />,
    title: 'Browse Top Deals',
    desc: 'Explore trending offers from top brands and categories.'
  },
  {
    icon: <LocalOfferIcon sx={{ fontSize: 40, color: '#1C2526', background: '#F7E7CE', borderRadius: '50%', p: '6px', boxShadow: '0 2px 8px #F7E7CE55' }} />,
    title: 'Copy Product Link',
    desc: 'Get your unique affiliate link for every product.'
  },
  {
    icon: <ShoppingCartIcon sx={{ fontSize: 40, color: '#F7E7CE', background: '#1C2526', borderRadius: '50%', p: '6px', boxShadow: '0 2px 8px #F7E7CE55' }} />,
    title: 'Share Products',
    desc: 'Share links on social media, WhatsApp, or your blog.'
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 40, color: '#1C2526', background: '#F7E7CE', borderRadius: '50%', p: '6px', boxShadow: '0 2px 8px #F7E7CE55' }} />,
    title: 'Track Clicks',
    desc: 'Track your product clicks in real time.'
  },
];

const highlights = [
  { icon: <AutoAwesomeIcon sx={{ color: '#00eaff', fontSize: 32 }} />, title: 'AI-Powered Product Descriptions', desc: 'Generate compelling, SEO-friendly product descriptions with one click.' },
  { icon: <VerifiedIcon sx={{ color: '#00e676', fontSize: 32 }} />, title: 'Verified Offers', desc: 'All deals are hand-checked and updated daily for maximum savings.' },
  { icon: <TrendingUpIcon sx={{ color: '#ff9100', fontSize: 32 }} />, title: 'Analytics Dashboard', desc: 'See your product clicks and performance in real time.' },
  { icon: <LocalOfferIcon sx={{ color: '#ff4081', fontSize: 32 }} />, title: 'Easy Product Posting', desc: 'Add new affiliate products in seconds with our streamlined admin panel.' },
];





const Home = ({ db, firebaseApp }) => {
  const theme = useTheme();
  const appId = firebaseApp?.options?.appId || '1:43353831547:web:ce46623abfb89b3b5bcade';


  const [brands, setBrands] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [sources, setSources] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSources, setLoadingSources] = useState(true);


  // Fetch products from Firestore
  useEffect(() => {
    if (!db) return;
    setLoadingProducts(true);
    const fetchProducts = async () => {
      try {
        const productsSnap = await getDocs(fbCollection(db, `artifacts/${appId}/public/data/products`));
        const productsArr = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsArr);
      } catch (err) {
        setProducts([]);
        console.error('Error fetching products:', err);
      }
      setLoadingProducts(false);
    };
    fetchProducts();
  }, [db, appId]);

  // Fetch sources from Firestore (sorted alphabetically)
  useEffect(() => {
    if (!db) return;
    setLoadingSources(true);
    const fetchSources = async () => {
      try {
        const sourcesSnap = await getDocs(fbCollection(db, `artifacts/${appId}/public/data/sources`));
        let sourcesArr = sourcesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        sourcesArr = sourcesArr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setSources(sourcesArr);
        console.log('Fetched sources from Firestore:', sourcesArr);
      } catch (err) {
        setSources([]);
        console.error('Error fetching sources:', err);
      }
      setLoadingSources(false);
    };
    fetchSources();
  }, [db, appId]);

  // Fetch brands from Firestore (sorted alphabetically)
  useEffect(() => {
    if (!db) return;
    const fetchBrands = async () => {
      try {
        const brandsSnap = await getDocs(fbCollection(db, `artifacts/${appId}/public/data/brands`));
        let brandsArr = brandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        brandsArr = brandsArr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setBrands(brandsArr);
      } catch (err) {
        setBrands([]);
      }
    };
    fetchBrands();
  }, [db, appId]);

  // Carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => setCarouselIdx(idx => (idx + 1) % products.length), 4000);
    return () => clearInterval(timer);
  }, [products.length]);

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '100vh' }}>
      <Hero />
      {/* Mission Statement */}
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, textAlign: 'center', bgcolor: '#121212', borderRadius: 4, boxShadow: '0 2px 16px rgba(247,231,206,0.10)', mb: 4 }}>
        <Fade in timeout={1200}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#F7E7CE', letterSpacing: '-0.03em' }}>
              Our Mission
            </Typography>
            <Typography variant="h6" sx={{ color: '#FFF8E1', mb: 1 }}>
              We help you discover the <b>best products at the best prices</b> from top online stores. No hype, no earning schemes—just honest, expert curation and daily deals.
            </Typography>
          </Box>
        </Fade>
      </Container>

      {/* Best Deals Today: Use listed products, animated grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: '#F7E7CE', letterSpacing: '-0.02em', textShadow: '0 2px 8px #121212' }}>
          Best Deals Today
        </Typography>
        {loadingProducts ? (
          <ShimmerLoader />
        ) : (
          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {products && products.length > 0 ? (
              products.map((product, idx) => (
                <Fade in timeout={600 + idx * 120} key={product.id}>
                  <Grid item xs={12} sm={6} md={4} lg={3} display="flex" justifyContent="center" alignItems="stretch">
                    <Card elevation={6} sx={{
                      width: 320,
                      minWidth: 320,
                      maxWidth: 320,
                      minHeight: 390,
                      maxHeight: 390,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      mx: 'auto',
                      borderRadius: 6,
                      p: 2,
                      bgcolor: '#1C2526',
                      boxShadow: '0 8px 32px #F7E7CE22',
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'box-shadow 0.3s, transform 0.4s cubic-bezier(.4,2,.3,1)',
                      '&:hover': {
                        boxShadow: '0 16px 48px #F7E7CE55',
                        transform: 'scale(1.045) rotate(-1deg)',
                      },
                      animation: `fadeInUp 0.7s ${0.1 * idx}s both, pulseShadow 2.5s ${0.2 * idx}s infinite alternate`,
                      '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(40px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                      '@keyframes pulseShadow': {
                        from: { boxShadow: '0 8px 32px #F7E7CE22' },
                        to: { boxShadow: '0 16px 48px #F7E7CE55' },
                      },
                    }}>
                      <CardMedia
                        component="img"
                        image={product.image}
                        alt={product.name}
                        sx={{ borderRadius: 4, height: 180, objectFit: 'contain', mb: 2, boxShadow: '0 4px 16px #F7E7CE33', background: '#FFF8E1', transition: 'transform 0.4s cubic-bezier(.4,2,.3,1)', '&:hover': { transform: 'scale(1.08) rotate(-2deg)' } }}
                      />
                    <CardContent sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minHeight: 120,
                      justifyContent: 'center',
                      px: 0,
                      flexGrow: 1,
                      animation: `fadeInUpLuxury 0.85s cubic-bezier(.4,0,.2,1) ${0.08 * idx}s both`,
                    }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: '#F7E7CE',
                          textShadow: '0 2px 8px #121212',
                          width: '100%',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '95%',
                          fontSize: '1.18rem',
                          letterSpacing: '-0.01em',
                          transition: 'color 0.3s',
                        }}
                        title={product.name}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          color: '#607D8B',
                          width: '100%',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '90%',
                          fontSize: '1rem',
                        }}
                        title={product.category}
                      >
                        {product.category}
                      </Typography>
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIosIcon />}
                        href={product.link}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #F7E7CE 0%, #FFF8E1 100%)',
                          color: '#121212',
                          boxShadow: '0 2px 8px #F7E7CE55',
                          mt: 1,
                          px: 3,
                          py: 1.1,
                          fontSize: '1.08rem',
                          letterSpacing: '0.01em',
                          transition: 'background 0.3s, color 0.3s, transform 0.2s',
                          animation: `popInLuxury 0.7s cubic-bezier(.4,0,.2,1) ${0.12 * idx}s both`,
                          '&:hover': {
                            background: 'linear-gradient(90deg, #FFF8E1 0%, #F7E7CE 100%)',
                            color: '#121212',
                            transform: 'scale(1.06)',
                          },
                        }}
                      >
                        View Deal
                      </Button>
                    </CardContent>
                      <Box sx={{ position: 'absolute', top: 12, right: 18, bgcolor: '#F7E7CE', color: '#121212', px: 2, py: 0.5, borderRadius: 3, fontWeight: 600, fontSize: 14, letterSpacing: '0.02em', boxShadow: '0 2px 8px #F7E7CE55' }}>
                        {product.source}
                      </Box>
                    </Card>
                  </Grid>
                </Fade>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="#FFF8E1" align="center">
                  No deals available.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      {/* Sources Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: 'relative', mb: 6 }}>
        {/* Mixed black/champagne gradient background for luxury separation */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'linear-gradient(120deg, #1C2526 60%, #FFF8E1 100%)',
          opacity: 0.16,
          filter: 'blur(4px)',
          pointerEvents: 'none',
          borderRadius: 8,
        }} />
        <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 5, color: '#F7E7CE', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          Our Sources
        </Typography>
        {loadingSources ? (
          <ShimmerLoader />
        ) : (
          <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ position: 'relative', zIndex: 1, px: { xs: 1, md: 2 } }}>
            {sources.length === 0 ? (
              <Typography variant="body1" color="#FFF8E1" sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                No sources available.
              </Typography>
            ) : (
              sources.map((src, idx) => (
                <Fade in timeout={600 + idx * 120} key={src.id || src.name}>
                  <Grid item xs={12} sm={6} md={3} lg={2} xl={2} display="flex" justifyContent="center" alignItems="center">
                    <Paper elevation={3} sx={{
                      p: 3,
                      borderRadius: 6,
                      bgcolor: 'rgba(28,37,38,0.98)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '2.5px solid #F7E7CE',
                      boxShadow: '0 4px 18px #F7E7CE33',
                      minWidth: 140,
                      minHeight: 160,
                      mx: 'auto',
                      transition: 'transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1)',
                      '&:hover': {
                        transform: 'scale(1.08) rotate(-1deg)',
                        boxShadow: '0 8px 32px #FFF8E1',
                        background: 'linear-gradient(120deg, #1C2526 60%, #F7E7CE 100%)',
                      },
                    }}>
                      <Box sx={{
                        width: 72,
                        height: 72,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        background: '#FFF8E1',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px #F7E7CE55',
                        border: '2px solid #F7E7CE',
                      }}>
                        <img
                          src={src.logo || ''}
                          alt={src.name}
                          style={{
                            width: '80%',
                            height: '80%',
                            objectFit: 'contain',
                            borderRadius: 8,
                            background: 'none',
                            transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)',
                          }}
                        />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F7E7CE', fontSize: 17, letterSpacing: '0.01em', mt: 1, textShadow: '0 2px 8px #121212', textAlign: 'center' }}>{src.name}</Typography>
                    </Paper>
                  </Grid>
                </Fade>
              ))
            )}
          </Grid>
        )}
      </Container>

      {/* Featured Brands (animated grid, smaller, luxury style) */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: 'relative', mb: 6 }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'linear-gradient(120deg, #1C2526 60%, #F7E7CE 100%)',
          opacity: 0.13,
          filter: 'blur(4px)',
          pointerEvents: 'none',
          borderRadius: 8,
        }} />
        <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 5, color: '#F7E7CE', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          Featured Brands
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ position: 'relative', zIndex: 1, px: { xs: 1, md: 2 } }}>
          {brands.length === 0 ? (
            <Typography variant="body1" color="#FFF8E1" sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              No brands available.
            </Typography>
          ) : (
            brands.map((brand, idx) => (
              <Fade in timeout={600 + idx * 120} key={brand.id || brand.name}>
                <Grid item xs={12} sm={6} md={3} lg={2} xl={2} display="flex" justifyContent="center" alignItems="center">
                  <Paper elevation={3} sx={{
                    p: 3,
                    borderRadius: 6,
                    bgcolor: 'rgba(28,37,38,0.98)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '2.5px solid #F7E7CE',
                    boxShadow: '0 4px 18px #F7E7CE33',
                    minWidth: 140,
                    minHeight: 160,
                    mx: 'auto',
                    transition: 'transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1)',
                    '&:hover': {
                      transform: 'scale(1.08) rotate(-1deg)',
                      boxShadow: '0 8px 32px #FFF8E1',
                      background: 'linear-gradient(120deg, #1C2526 60%, #F7E7CE 100%)',
                    },
                  }}>
                    <Box sx={{
                      width: 72,
                      height: 72,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      background: '#FFF8E1',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px #F7E7CE55',
                      border: '2px solid #F7E7CE',
                    }}>
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        style={{
                          width: '80%',
                          height: '80%',
                          objectFit: 'contain',
                          borderRadius: 8,
                          background: 'none',
                          transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)',
                        }}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F7E7CE', fontSize: 17, letterSpacing: '0.01em', mt: 1, textShadow: '0 2px 8px #121212', textAlign: 'center' }}>{brand.name}</Typography>
                  </Paper>
                </Grid>
              </Fade>
            ))
          )}
        </Grid>
      </Container>

      {/* How It Works (animated) */}
      <Box sx={{ bgcolor: '#1C2526', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: '#F7E7CE', letterSpacing: '-0.02em' }}>
            How It Works
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {howItWorks.map((step, idx) => (
              <Fade in timeout={700 + idx * 180} key={step.title}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: '#121212', color: '#F7E7CE', height: '100%', boxShadow: '0 4px 16px #F7E7CE22', border: '1.5px solid #F7E7CE', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: '0 8px 32px #F7E7CE44' } }}>
                    {step.icon}
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1, color: '#F7E7CE' }}>{step.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#FFF8E1' }}>{step.desc}</Typography>
                  </Paper>
                </Grid>
              </Fade>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Highlights (animated) */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: '#F7E7CE', letterSpacing: '-0.02em' }}>
          Why Choose Afflinks?
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {highlights.map((item, idx) => (
            <Fade in timeout={800 + idx * 180} key={item.title}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} sx={{ borderRadius: 4, p: 2, textAlign: 'center', bgcolor: '#1C2526', color: '#F7E7CE', height: '100%', boxShadow: '0 4px 16px #F7E7CE22', border: '1.5px solid #F7E7CE', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: '0 8px 32px #F7E7CE44' } }}>
                  <Box sx={{ mb: 2 }}>{item.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#F7E7CE' }}>{item.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#FFF8E1' }}>{item.desc}</Typography>
                </Card>
              </Grid>
            </Fade>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', bgcolor: 'linear-gradient(120deg, #1C2526 0%, #121212 100%)', color: '#F7E7CE' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em', color: '#F7E7CE' }}>
          Start Exploring Top Products
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: '#FFF8E1' }}>
          Discover the best affiliate deals in India, curated for you.
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="/products"
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.3rem',
            borderRadius: 50,
            fontWeight: 700,
            boxShadow: '0 8px 24px #F7E7CE33',
            background: 'linear-gradient(90deg, #F7E7CE 0%, #FFF8E1 100%)',
            color: '#121212',
            '&:hover': {
              background: 'linear-gradient(90deg, #FFF8E1 0%, #F7E7CE 100%)',
              color: '#121212',
              transform: 'scale(1.04)',
            },
          }}
        >
          Explore Products
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
