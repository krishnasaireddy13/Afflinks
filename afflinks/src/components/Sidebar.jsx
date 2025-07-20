import React, { useState } from 'react';
import { Drawer, IconButton, List, ListItem, Typography, Divider, Autocomplete, TextField, Slider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';

const Sidebar = ({ sources, brands, categories, onFilterChange }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    onFilterChange('priceRange', newValue);
  };

  return (
    <>
      <IconButton
        sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', top: 16, left: 16, zIndex: 1200 }}
        onClick={() => setOpen(true)}
        aria-label="Open filter menu"
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 250, sm: 300 }, p: 2, bgcolor: theme.palette.background.paper } }}
      >
        <Typography variant="h6" sx={{ p: 2, color: theme.palette.primary.main }}>Filters</Typography>
        <Divider />
        <List>
          <ListItem>
            <Autocomplete
              options={sources}
              getOptionLabel={(option) => option.name || ''}
              onChange={(e, value) => onFilterChange('source', value?.name || '')}
              renderInput={(params) => <TextField {...params} label="Source" />}
              fullWidth
              renderOption={(props, option) => (
                <li {...props}>
                  {option.logo && (
                    <img src={option.logo} alt={option.name} style={{ width: 24, height: 24, marginRight: 8, objectFit: 'contain' }} />
                  )}
                  {option.name}
                </li>
              )}
            />
          </ListItem>
          <ListItem>
            <Autocomplete
              options={brands}
              getOptionLabel={(option) => option.name || ''}
              onChange={(e, value) => onFilterChange('brand', value?.name || '')}
              renderInput={(params) => <TextField {...params} label="Brand" />}
              fullWidth
              renderOption={(props, option) => (
                <li {...props}>
                  {option.logo && (
                    <img src={option.logo} alt={option.name} style={{ width: 24, height: 24, marginRight: 8, objectFit: 'contain' }} />
                  )}
                  {option.name}
                </li>
              )}
            />
          </ListItem>
          <ListItem>
            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.name || ''}
              onChange={(e, value) => onFilterChange('category', value?.name || '')}
              renderInput={(params) => <TextField {...params} label="Category" />}
              fullWidth
            />
          </ListItem>
          <ListItem>
            <Box sx={{ width: '100%', px: 2 }}>
              <Typography gutterBottom>Price Range (INR)</Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={100}
              />
            </Box>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;