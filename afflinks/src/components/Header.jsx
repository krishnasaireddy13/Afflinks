import React, { useState, useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Custom debounce function with cancel method
const debounce = (func, wait) => {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  return debounced;
};

const Header = ({ setCurrentPage, db, firebaseApp }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const appId = firebaseApp?.options?.appId || '1:43353831547:web:ce46623abfb89b3b5bcade';

  // Debounced search function
  const debouncedSearch = debounce((queryText) => {
    if (!db || queryText.length < 2) {
      setSearchResults([]);
      return;
    }
    const productsCollectionRef = collection(db, `artifacts/${appId}/public/data/products`);
    const q = query(
      productsCollectionRef,
      where('name', '>=', queryText),
      where('name', '<=', queryText + '\uf8ff')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSearchResults(results.slice(0, 5)); // Limit to 5 results
    }, (err) => {
      console.error('Header.jsx: Error fetching search results:', err.message);
    });
    return () => unsubscribe();
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, db]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setSearchQuery(''); // Clear search when closing drawer
    setSearchResults([]);
    setAnchorEl(null);
  };

  const handleNavLinkClick = (item) => {
    const [basePage, hashSection] = item.pageIdentifier.split('#');
    setCurrentPage(basePage);
    navigate(item.urlPath);
    setTimeout(() => {
      if (hashSection) {
        const element = document.getElementById(hashSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
    setMobileOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setAnchorEl(event.currentTarget);
  };

  const handleSearchSelect = (product) => {
    setSearchQuery('');
    setSearchResults([]);
    setAnchorEl(null);
    navigate(`/products?productId=${product.id}`);
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navItems = [
    { name: 'Home', pageIdentifier: 'home', urlPath: '/home' },
    { name: 'Deals', pageIdentifier: 'deals', urlPath: '/deals' },
    { name: 'Products', pageIdentifier: 'products', urlPath: '/products' },
    { name: 'Categories', pageIdentifier: 'categories', urlPath: '/categories' },
    { name: 'About', pageIdentifier: 'about', urlPath: '/about' },
    { name: 'Admin', pageIdentifier: 'admin', urlPath: '/admin', hidden: true },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', bgcolor: theme.palette.background.paper }}>
      <Typography variant="h6" sx={{ my: 2, color: theme.palette.text.primary }}>
        Afflinks
      </Typography>
      <Box sx={{ px: 2, mb: 2 }}>
        <TextField
          label="Search Products"
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
          size="small"
          sx={{
            background: 'rgba(255,248,225,0.10)',
            borderRadius: 2,
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary,
              fontFamily: 'Lora, serif',
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' },
            },
          }}
        />
        {searchResults.length > 0 && (
          <Paper
            sx={{
              mt: 1,
              maxHeight: 200,
              overflowY: 'auto',
              bgcolor: theme.palette.background.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {searchResults.map((product) => (
              <ListItemButton
                key={product.id}
                onClick={() => handleSearchSelect(product)}
                sx={{
                  py: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemText
                  primary={product.name}
                  primaryTypographyProps={{
                    color: theme.palette.text.primary,
                    fontFamily: 'Lora, serif',
                  }}
                />
              </ListItemButton>
            ))}
          </Paper>
        )}
      </Box>
      <List>
        {navItems
          .filter((item) => !item.hidden)
          .map((item) => (
            <ListItem key={item.name} disablePadding>
              <ListItemButton sx={{ textAlign: 'center' }}>
                <RouterLink
                  to={item.urlPath}
                  onClick={() => handleNavLinkClick(item)}
                  style={{
                    width: '100%',
                    color: theme.palette.text.primary,
                    textDecoration: 'none',
                  }}
                  sx={{
                    '&:hover': {
                      color: theme.palette.secondary.main,
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText primary={item.name} />
                </RouterLink>
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        py: 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
      }}
    >
      <Toolbar sx={{ maxWidth: 1280, mx: 'auto', width: '100%', px: { xs: 2, sm: 3, lg: 4 } }}>
        <Typography
          variant="h3"
          component="div"
          onClick={() => handleNavLinkClick({ name: 'Home', pageIdentifier: 'home', urlPath: '/home' })}
          sx={{
            flexGrow: 1,
            color: theme.palette.primary.contrastText,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 8px #121212',
            cursor: 'pointer',
            fontFamily: `'Playfair Display', serif`,
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '2.1rem', md: '2.4rem', lg: '2.7rem' },
            lineHeight: 1.1,
            transition: 'transform 0.3s cubic-bezier(.4,2,.3,1)',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          Afflinks
        </Typography>
        {isDesktop ? (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Search Products"
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              inputRef={searchInputRef}
              sx={{
                width: 200,
                background: 'rgba(255,248,225,0.10)',
                borderRadius: 2,
                '& .MuiInputBase-input': {
                  color: theme.palette.primary.contrastText,
                  fontFamily: 'Lora, serif',
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.primary.contrastText,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' },
                },
              }}
            />
            <Popper
              open={searchResults.length > 0}
              anchorEl={anchorEl}
              placement="bottom-start"
              sx={{ zIndex: theme.zIndex.appBar + 1 }}
            >
              <Paper
                sx={{
                  width: 200,
                  maxHeight: 200,
                  overflowY: 'auto',
                  bgcolor: theme.palette.background.paper,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {searchResults.map((product) => (
                  <ListItemButton
                    key={product.id}
                    onClick={() => handleSearchSelect(product)}
                    sx={{
                      py: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemText
                      primary={product.name}
                      primaryTypographyProps={{
                        color: theme.palette.text.primary,
                        fontFamily: 'Lora, serif',
                      }}
                    />
                  </ListItemButton>
                ))}
              </Paper>
            </Popper>
            {navItems
              .filter((item) => !item.hidden)
              .map((item) => (
                <Button
                  key={item.name}
                  color="inherit"
                  sx={{
                    position: 'relative',
                    color: theme.palette.primary.contrastText,
                    fontFamily: `'Lora', serif`,
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.08rem', md: '1.13rem', lg: '1.18rem' },
                    letterSpacing: '-0.01em',
                    px: 1.6,
                    py: 0.7,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: 'none',
                    background: 'none',
                    transition: 'color 0.2s, background 0.2s, transform 0.2s',
                    opacity: 0.98,
                    '&:hover': {
                      color: theme.palette.secondary.light,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      transform: 'scale(1.04)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      bottom: 0,
                      height: '3px',
                      backgroundColor: theme.palette.secondary.main,
                      width: '0%',
                      opacity: 0.7,
                      transition: 'width 0.3s cubic-bezier(.4,2,.3,1), opacity 0.3s',
                      animation: 'underlineSlideIn 0.7s cubic-bezier(.4,2,.3,1)',
                    },
                    '&:hover::after': {
                      width: '100%',
                      opacity: 1,
                    },
                  }}
                >
                  <RouterLink
                    to={item.urlPath}
                    onClick={() => handleNavLinkClick(item)}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {item.name}
                  </RouterLink>
                </Button>
              ))}
          </Box>
        ) : (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{
              display: { md: 'none' },
              color: theme.palette.primary.contrastText,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scale(1.1)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: theme.palette.primary.contrastText,
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;