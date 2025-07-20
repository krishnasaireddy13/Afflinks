import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Grid, Card, CardMedia, CardContent, CardActions, Container, Autocomplete, Checkbox, FormControlLabel, List, ListItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import { useTheme } from '@mui/material/styles';
import { getAuth, signInWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, onSnapshot } from 'firebase/firestore';

// Utility function for discount calculation
const calculateDiscount = (originalPrice, dealPrice) => {
  if (!originalPrice || !dealPrice || originalPrice <= 0) return null;
  const discountAmount = originalPrice - dealPrice;
  const discountPercentage = (discountAmount / originalPrice) * 100;
  return { amount: discountAmount.toFixed(2), percentage: discountPercentage.toFixed(0) };
};

const Admin = ({ firebaseApp, auth, db, isAuthReady }) => {
  const theme = useTheme();

  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthTimeout, setIsAuthTimeout] = useState(false);

  // Tab State
  const [tabValue, setTabValue] = useState(0); // 0: Products, 1: Categories, 2: Sources, 3: Brands, 4: Suggested Products

  // Product Management States
  const [products, setProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSourceId, setNewProductSourceId] = useState('');
  const [newProductCustomSource, setNewProductCustomSource] = useState('');
  const [newProductBrandId, setNewProductBrandId] = useState('');
  const [newProductCustomBrand, setNewProductCustomBrand] = useState('');
  const [newProductCategoryId, setNewProductCategoryId] = useState('');
  const [newProductCustomCategory, setNewProductCustomCategory] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductLink, setNewProductLink] = useState('');
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState('');
  const [newProductDealPrice, setNewProductDealPrice] = useState('');
  const [newProductIsBestDeal, setNewProductIsBestDeal] = useState(false);
  const [newProductIsBestProduct, setNewProductIsBestProduct] = useState(false);
  const [productActionStatus, setProductActionStatus] = useState('');
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Category Management States
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState('');
  const [categoryActionStatus, setCategoryActionStatus] = useState('');
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Source Management States
  const [sources, setSources] = useState([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceLogo, setNewSourceLogo] = useState('');
  const [editSource, setEditSource] = useState(null);
  const [editSourceName, setEditSourceName] = useState('');
  const [editSourceLogo, setEditSourceLogo] = useState('');
  const [sourceActionStatus, setSourceActionStatus] = useState('');
  const [isSourceLoading, setIsSourceLoading] = useState(false);

  // Brand Management States
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');
  const [editBrand, setEditBrand] = useState(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandLogo, setEditBrandLogo] = useState('');
  const [brandActionStatus, setBrandActionStatus] = useState('');
  const [isBrandLoading, setIsBrandLoading] = useState(false);

  // Suggested Products States
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isSuggestedLoading, setIsSuggestedLoading] = useState(false);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState('');
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false);

  // Authentication Logic
  useEffect(() => {
    if (!auth) {
      setAuthError('Authentication service is not available.');
      setIsAuthTimeout(true);
      return;
    }

    const authTimeout = setTimeout(() => {
      if (!isAuthReady) {
        setAuthError('Authentication took too long. Please try again.');
        setIsAuthTimeout(true);
      }
    }, 10000);

    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        if (user && user.email === 'admin@afflinks.com') {
          setIsLoggedIn(true);
          setLoginError('');
          setAuthError('');
        } else {
          setIsLoggedIn(false);
          setAuthError(user ? 'Access denied: Not an admin account.' : '');
        }
      },
      (error) => {
        setAuthError('Error checking authentication status: ' + error.message);
        setIsAuthTimeout(true);
      }
    );

    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, [isAuthReady, auth]);

  const handleLogin = async () => {
    setLoginError('');
    setIsPasswordChanging(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error) {
      setLoginError('Invalid credentials. Please try again.');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setLoginEmail('');
      setLoginPassword('');
      setProducts([]);
      setCategories([]);
      setSources([]);
      setBrands([]);
      setSuggestedProducts([]);
      setNewProductName('');
      setNewProductSourceId('');
      setNewProductCustomSource('');
      setNewProductBrandId('');
      setNewProductCustomBrand('');
      setNewProductCategoryId('');
      setNewProductCustomCategory('');
      setNewProductImage('');
      setNewProductLink('');
      setNewProductOriginalPrice('');
      setNewProductDealPrice('');
      setNewProductIsBestDeal(false);
      setNewProductIsBestProduct(false);
      setNewCategoryName('');
      setNewCategoryImage('');
      setNewSourceName('');
      setNewSourceLogo('');
      setEditSource(null);
      setEditSourceName('');
      setEditSourceLogo('');
      setNewBrandName('');
      setNewBrandLogo('');
      setEditBrand(null);
      setEditBrandName('');
      setEditBrandLogo('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setAuthError('Error logging out.');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeStatus('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeStatus('New password must be at least 6 characters long.');
      return;
    }

    setIsPasswordChanging(true);
    setPasswordChangeStatus('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setPasswordChangeStatus('No user is logged in.');
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordChangeStatus('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordChangeDialog(false);
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setPasswordChangeStatus('Current password is incorrect.');
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordChangeStatus('Please log in again to change your password.');
        await signOut(auth);
        setIsLoggedIn(false);
      } else {
        setPasswordChangeStatus(`Error: ${error.message}`);
      }
    } finally {
      setIsPasswordChanging(false);
    }
  };

  // Data Fetching and Management (Firestore)
  const appId = firebaseApp ? firebaseApp.options.appId : '1:43353831547:web:ce46623abfb89b3b5bcade';
  const productsCollectionRef = db ? collection(db, `artifacts/${appId}/public/data/products`) : null;
  const categoriesCollectionRef = db ? collection(db, `artifacts/${appId}/public/data/categories`) : null;
  const sourcesCollectionRef = db ? collection(db, `artifacts/${appId}/public/data/sources`) : null;
  const brandsCollectionRef = db ? collection(db, `artifacts/${appId}/public/data/brands`) : null;
  const suggestedProductsCollectionRef = db ? collection(db, `artifacts/${appId}/public/data/suggestedProducts`) : null;

  const fetchProducts = () => {
    if (!productsCollectionRef) return;
    setIsProductLoading(true);
    const q = query(productsCollectionRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        setIsProductLoading(false);
      },
      (error) => {
        setProductActionStatus(`Error fetching products: ${error.message}`);
        setIsProductLoading(false);
      }
    );
    return unsubscribe;
  };

  const fetchCategories = () => {
    if (!categoriesCollectionRef) return;
    setIsCategoryLoading(true);
    const q = query(categoriesCollectionRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesData);
        setIsCategoryLoading(false);
      },
      (error) => {
        setCategoryActionStatus('Error fetching categories.');
        setIsCategoryLoading(false);
      }
    );
    return unsubscribe;
  };

  const fetchSources = () => {
    if (!sourcesCollectionRef) return;
    setIsSourceLoading(true);
    const q = query(sourcesCollectionRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sourcesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSources(sourcesData);
        setIsSourceLoading(false);
      },
      (error) => {
        setSourceActionStatus('Error fetching sources.');
        setIsSourceLoading(false);
      }
    );
    return unsubscribe;
  };

  const fetchBrands = () => {
    if (!brandsCollectionRef) return;
    setIsBrandLoading(true);
    const q = query(brandsCollectionRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const brandsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBrands(brandsData);
        setIsBrandLoading(false);
      },
      (error) => {
        setBrandActionStatus('Error fetching brands.');
        setIsBrandLoading(false);
      }
    );
    return unsubscribe;
  };

  const fetchSuggestedProducts = () => {
    if (!suggestedProductsCollectionRef) return;
    setIsSuggestedLoading(true);
    const q = query(suggestedProductsCollectionRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const suggestedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSuggestedProducts(suggestedData);
        setIsSuggestedLoading(false);
      },
      (error) => {
        setProductActionStatus('Error fetching suggested products.');
        setIsSuggestedLoading(false);
      }
    );
    return unsubscribe;
  };

  useEffect(() => {
    if (isLoggedIn && db) {
      const unsubscribeProducts = fetchProducts();
      const unsubscribeCategories = fetchCategories();
      const unsubscribeSources = fetchSources();
      const unsubscribeBrands = fetchBrands();
      const unsubscribeSuggested = fetchSuggestedProducts();
      return () => {
        if (unsubscribeProducts) unsubscribeProducts();
        if (unsubscribeCategories) unsubscribeCategories();
        if (unsubscribeSources) unsubscribeSources();
        if (unsubscribeBrands) unsubscribeBrands();
        if (unsubscribeSuggested) unsubscribeSuggested();
      };
    }
  }, [isLoggedIn, db]);

  const handleAddProduct = async () => {
    if (!newProductName || !newProductImage || !newProductLink || !newProductOriginalPrice || !newProductDealPrice) {
      setProductActionStatus('Name, image, link, original price, and deal price are required.');
      return;
    }
    if (newProductCategoryId !== 'other' && !newProductCategoryId) {
      setProductActionStatus('Please select a category or choose "Other".');
      return;
    }
    if (newProductCategoryId === 'other' && !newProductCustomCategory) {
      setProductActionStatus('Custom category name is required when "Other" is selected.');
      return;
    }
    if (newProductSourceId !== 'other' && !newProductSourceId) {
      setProductActionStatus('Please select a source or choose "Other".');
      return;
    }
    if (newProductSourceId === 'other' && !newProductCustomSource) {
      setProductActionStatus('Custom source name is required when "Other" is selected.');
      return;
    }
    if (newProductBrandId !== 'other' && !newProductBrandId) {
      setProductActionStatus('Please select a brand or choose "Other".');
      return;
    }
    if (newProductBrandId === 'other' && !newProductCustomBrand) {
      setProductActionStatus('Custom brand name is required when "Other" is selected.');
      return;
    }
    if (isNaN(newProductOriginalPrice) || newProductOriginalPrice <= 0) {
      setProductActionStatus('Original price must be a positive number.');
      return;
    }
    if (isNaN(newProductDealPrice) || newProductDealPrice <= 0) {
      setProductActionStatus('Deal price must be a positive number.');
      return;
    }
    if (Number(newProductDealPrice) > Number(newProductOriginalPrice)) {
      setProductActionStatus('Deal price cannot be greater than original price.');
      return;
    }

    setIsProductLoading(true);
    setProductActionStatus('');
    try {
      let categoryId = newProductCategoryId;
      let sourceId = newProductSourceId;
      let brandId = newProductBrandId;

      // Handle custom category
      if (newProductCategoryId === 'other' && newProductCustomCategory) {
        const newCategory = await addDoc(categoriesCollectionRef, {
          name: newProductCustomCategory,
          image: newProductImage || '',
          createdAt: new Date().toISOString(),
        });
        categoryId = newCategory.id;
      }

      // Handle custom source
      if (newProductSourceId === 'other' && newProductCustomSource) {
        const newSource = await addDoc(sourcesCollectionRef, {
          name: newProductCustomSource,
          logo: '',
          createdAt: new Date().toISOString(),
        });
        sourceId = newSource.id;
      }

      // Handle custom brand
      if (newProductBrandId === 'other' && newProductCustomBrand) {
        const newBrand = await addDoc(brandsCollectionRef, {
          name: newProductCustomBrand,
          logo: '',
          createdAt: new Date().toISOString(),
        });
        brandId = newBrand.id;
      }

      const discount = calculateDiscount(Number(newProductOriginalPrice), Number(newProductDealPrice));

      const productData = {
        name: newProductName,
        categoryId,
        sourceId,
        brandId,
        image: newProductImage,
        link: newProductLink,
        originalPrice: Number(newProductOriginalPrice),
        dealPrice: Number(newProductDealPrice),
        discountAmount: discount ? discount.amount : null,
        discountPercentage: discount ? discount.percentage : null,
        isBestDeal: newProductIsBestDeal,
        isBestProduct: newProductIsBestProduct,
        createdAt: new Date().toISOString(),
      };

      const productRef = await addDoc(productsCollectionRef, productData);
      setProductActionStatus('Product added successfully!');

      // Add to suggested products if marked as best product
      if (newProductIsBestProduct) {
        await addDoc(suggestedProductsCollectionRef, {
          productId: productRef.id,
          categoryId: categoryId, // Include categoryId
          createdAt: new Date().toISOString(),
        });
      }

      // Reset form
      setNewProductName('');
      setNewProductSourceId('');
      setNewProductCustomSource('');
      setNewProductBrandId('');
      setNewProductCustomBrand('');
      setNewProductCategoryId('');
      setNewProductCustomCategory('');
      setNewProductImage('');
      setNewProductLink('');
      setNewProductOriginalPrice('');
      setNewProductDealPrice('');
      setNewProductIsBestDeal(false);
      setNewProductIsBestProduct(false);
    } catch (error) {
      setProductActionStatus(`Error adding product: ${error.message}`);
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setNewProductName(product.name);
    setNewProductSourceId(product.sourceId || 'other');
    setNewProductCustomSource('');
    setNewProductBrandId(product.brandId || 'other');
    setNewProductCustomBrand('');
    setNewProductCategoryId(product.categoryId || 'other');
    setNewProductCustomCategory('');
    setNewProductImage(product.image);
    setNewProductLink(product.link);
    setNewProductOriginalPrice(product.originalPrice);
    setNewProductDealPrice(product.dealPrice);
    setNewProductIsBestDeal(product.isBestDeal || false);
    setNewProductIsBestProduct(product.isBestProduct || false);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;
    if (!newProductName || !newProductImage || !newProductLink || !newProductOriginalPrice || !newProductDealPrice) {
      setProductActionStatus('Name, image, link, original price, and deal price are required.');
      return;
    }
    if (newProductCategoryId !== 'other' && !newProductCategoryId) {
      setProductActionStatus('Please select a category or choose "Other".');
      return;
    }
    if (newProductCategoryId === 'other' && !newProductCustomCategory) {
      setProductActionStatus('Custom category name is required when "Other" is selected.');
      return;
    }
    if (newProductSourceId !== 'other' && !newProductSourceId) {
      setProductActionStatus('Please select a source or choose "Other".');
      return;
    }
    if (newProductSourceId === 'other' && !newProductCustomSource) {
      setProductActionStatus('Custom source name is required when "Other" is selected.');
      return;
    }
    if (newProductBrandId !== 'other' && !newProductBrandId) {
      setProductActionStatus('Please select a brand or choose "Other".');
      return;
    }
    if (newProductBrandId === 'other' && !newProductCustomBrand) {
      setProductActionStatus('Custom brand name is required when "Other" is selected.');
      return;
    }
    if (isNaN(newProductOriginalPrice) || newProductOriginalPrice <= 0) {
      setProductActionStatus('Original price must be a positive number.');
      return;
    }
    if (isNaN(newProductDealPrice) || newProductDealPrice <= 0) {
      setProductActionStatus('Deal price must be a positive number.');
      return;
    }
    if (Number(newProductDealPrice) > Number(newProductOriginalPrice)) {
      setProductActionStatus('Deal price cannot be greater than original price.');
      return;
    }

    setIsProductLoading(true);
    setProductActionStatus('');
    try {
      let categoryId = newProductCategoryId;
      let sourceId = newProductSourceId;
      let brandId = newProductBrandId;

      // Handle custom category
      if (newProductCategoryId === 'other' && newProductCustomCategory) {
        const newCategory = await addDoc(categoriesCollectionRef, {
          name: newProductCustomCategory,
          image: newProductImage || '',
          createdAt: new Date().toISOString(),
        });
        categoryId = newCategory.id;
      }

      // Handle custom source
      if (newProductSourceId === 'other' && newProductCustomSource) {
        const newSource = await addDoc(sourcesCollectionRef, {
          name: newProductCustomSource,
          logo: '',
          createdAt: new Date().toISOString(),
        });
        sourceId = newSource.id;
      }

      // Handle custom brand
      if (newProductBrandId === 'other' && newProductCustomBrand) {
        const newBrand = await addDoc(brandsCollectionRef, {
          name: newProductCustomBrand,
          logo: '',
          createdAt: new Date().toISOString(),
        });
        brandId = newBrand.id;
      }

      const discount = calculateDiscount(Number(newProductOriginalPrice), Number(newProductDealPrice));

      const productData = {
        name: newProductName,
        categoryId,
        sourceId,
        brandId,
        image: newProductImage,
        link: newProductLink,
        originalPrice: Number(newProductOriginalPrice),
        dealPrice: Number(newProductDealPrice),
        discountAmount: discount ? discount.amount : null,
        discountPercentage: discount ? discount.percentage : null,
        isBestDeal: newProductIsBestDeal,
        isBestProduct: newProductIsBestProduct,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(productsCollectionRef, editProduct.id), productData);
      setProductActionStatus('Product updated successfully!');

      // Handle suggested products
      const suggestedProduct = suggestedProducts.find((sp) => sp.productId === editProduct.id);
      if (newProductIsBestProduct && !suggestedProduct) {
        await addDoc(suggestedProductsCollectionRef, {
          productId: editProduct.id,
          categoryId,
          createdAt: new Date().toISOString(),
        });
      } else if (!newProductIsBestProduct && suggestedProduct) {
        await deleteDoc(doc(suggestedProductsCollectionRef, suggestedProduct.id));
      }

      // Reset form
      setEditProduct(null);
      setNewProductName('');
      setNewProductSourceId('');
      setNewProductCustomSource('');
      setNewProductBrandId('');
      setNewProductCustomBrand('');
      setNewProductCategoryId('');
      setNewProductCustomCategory('');
      setNewProductImage('');
      setNewProductLink('');
      setNewProductOriginalPrice('');
      setNewProductDealPrice('');
      setNewProductIsBestDeal(false);
      setNewProductIsBestProduct(false);
    } catch (error) {
      setProductActionStatus(`Error updating product: ${error.message}`);
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setIsProductLoading(true);
    setProductActionStatus('');
    try {
      await deleteDoc(doc(productsCollectionRef, productId));
      const suggestedProduct = suggestedProducts.find((sp) => sp.productId === productId);
      if (suggestedProduct) {
        await deleteDoc(doc(suggestedProductsCollectionRef, suggestedProduct.id));
      }
      setProductActionStatus('Product deleted successfully!');
    } catch (error) {
      setProductActionStatus(`Error deleting product: ${error.message}`);
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) {
      setCategoryActionStatus('Category name is required.');
      return;
    }
    setIsCategoryLoading(true);
    setCategoryActionStatus('');
    try {
      await addDoc(categoriesCollectionRef, {
        name: newCategoryName,
        image: newCategoryImage || '',
        createdAt: new Date().toISOString(),
      });
      setCategoryActionStatus('Category added successfully!');
      setNewCategoryName('');
      setNewCategoryImage('');
    } catch (error) {
      setCategoryActionStatus('Error adding category.');
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryImage(category.image);
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !editCategoryName) {
      setCategoryActionStatus('Category name is required.');
      return;
    }
    setIsCategoryLoading(true);
    setCategoryActionStatus('');
    try {
      await updateDoc(doc(categoriesCollectionRef, editCategory.id), {
        name: editCategoryName,
        image: editCategoryImage || '',
        updatedAt: new Date().toISOString(),
      });
      setCategoryActionStatus('Category updated successfully!');
      setEditCategory(null);
      setEditCategoryName('');
      setEditCategoryImage('');
    } catch (error) {
      setCategoryActionStatus('Error updating category.');
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setIsCategoryLoading(true);
    setCategoryActionStatus('');
    try {
      const productsInCategory = products.filter((p) => p.categoryId === categoryId);
      if (productsInCategory.length > 0) {
        setCategoryActionStatus('Cannot delete category with associated products.');
        setIsCategoryLoading(false);
        return;
      }
      await deleteDoc(doc(categoriesCollectionRef, categoryId));
      setCategoryActionStatus('Category deleted successfully!');
    } catch (error) {
      setCategoryActionStatus('Error deleting category.');
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!newSourceName) {
      setSourceActionStatus('Source name is required.');
      return;
    }
    setIsSourceLoading(true);
    setSourceActionStatus('');
    try {
      await addDoc(sourcesCollectionRef, {
        name: newSourceName,
        logo: newSourceLogo || '',
        createdAt: new Date().toISOString(),
      });
      setSourceActionStatus('Source added successfully!');
      setNewSourceName('');
      setNewSourceLogo('');
    } catch (error) {
      setSourceActionStatus('Error adding source.');
    } finally {
      setIsSourceLoading(false);
    }
  };

  const handleEditSource = (source) => {
    setEditSource(source);
    setEditSourceName(source.name);
    setEditSourceLogo(source.logo);
  };

  const handleUpdateSource = async () => {
    if (!editSource || !editSourceName) {
      setSourceActionStatus('Source name is required.');
      return;
    }
    setIsSourceLoading(true);
    setSourceActionStatus('');
    try {
      await updateDoc(doc(sourcesCollectionRef, editSource.id), {
        name: editSourceName,
        logo: editSourceLogo || '',
        updatedAt: new Date().toISOString(),
      });
      setSourceActionStatus('Source updated successfully!');
      setEditSource(null);
      setEditSourceName('');
      setEditSourceLogo('');
    } catch (error) {
      setSourceActionStatus('Error updating source.');
    } finally {
      setIsSourceLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    setIsSourceLoading(true);
    setSourceActionStatus('');
    try {
      const productsInSource = products.filter((p) => p.sourceId === sourceId);
      if (productsInSource.length > 0) {
        setSourceActionStatus('Cannot delete source with associated products.');
        setIsSourceLoading(false);
        return;
      }
      await deleteDoc(doc(sourcesCollectionRef, sourceId));
      setSourceActionStatus('Source deleted successfully!');
    } catch (error) {
      setSourceActionStatus('Error deleting source.');
    } finally {
      setIsSourceLoading(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName) {
      setBrandActionStatus('Brand name is required.');
      return;
    }
    setIsBrandLoading(true);
    setBrandActionStatus('');
    try {
      await addDoc(brandsCollectionRef, {
        name: newBrandName,
        logo: newBrandLogo || '',
        createdAt: new Date().toISOString(),
      });
      setBrandActionStatus('Brand added successfully!');
      setNewBrandName('');
      setNewBrandLogo('');
    } catch (error) {
      setBrandActionStatus('Error adding brand.');
    } finally {
      setIsBrandLoading(false);
    }
  };

  const handleEditBrand = (brand) => {
    setEditBrand(brand);
    setEditBrandName(brand.name);
    setEditBrandLogo(brand.logo);
  };

  const handleUpdateBrand = async () => {
    if (!editBrand || !editBrandName) {
      setBrandActionStatus('Brand name is required.');
      return;
    }
    setIsBrandLoading(true);
    setBrandActionStatus('');
    try {
      await updateDoc(doc(brandsCollectionRef, editBrand.id), {
        name: editBrandName,
        logo: editBrandLogo || '',
        updatedAt: new Date().toISOString(),
      });
      setBrandActionStatus('Brand updated successfully!');
      setEditBrand(null);
      setEditBrandName('');
      setEditBrandLogo('');
    } catch (error) {
      setBrandActionStatus('Error updating brand.');
    } finally {
      setIsBrandLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    setIsBrandLoading(true);
    setBrandActionStatus('');
    try {
      const productsInBrand = products.filter((p) => p.brandId === brandId);
      if (productsInBrand.length > 0) {
        setBrandActionStatus('Cannot delete brand with associated products.');
        setIsBrandLoading(false);
        return;
      }
      await deleteDoc(doc(brandsCollectionRef, brandId));
      setBrandActionStatus('Brand deleted successfully!');
    } catch (error) {
      setBrandActionStatus('Error deleting brand.');
    } finally {
      setIsBrandLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm" className="mt-12">
        <Paper elevation={6} className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
          <Typography variant="h4" className="mb-6 text-gray-800 font-bold">Admin Login</Typography>
          {authError && <Alert severity="error" className="mb-6">{authError}</Alert>}
          {isAuthTimeout ? (
            <Typography color="error" className="text-center">Authentication timed out. Please refresh the page.</Typography>
          ) : (
            <>
              <TextField
                label="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                fullWidth
                margin="normal"
                disabled={isPasswordChanging}
                className="rounded-lg"
                variant="outlined"
                size="medium"
              />
              <TextField
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                fullWidth
                margin="normal"
                disabled={isPasswordChanging}
                className="rounded-lg"
                variant="outlined"
                size="medium"
              />
              {loginError && <Alert severity="error" className="mb-6">{loginError}</Alert>}
              <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                disabled={isPasswordChanging}
                fullWidth
                className="mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg py-3"
              >
                {isPasswordChanging ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="mt-12">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Typography variant="h4" className="text-gray-800 font-bold">Admin Dashboard</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowPasswordChangeDialog(true)}
            className="mr-3 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            Change Password
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        centered
        className="mb-6 bg-gray-100 rounded-xl p-2 shadow-sm"
      >
        <Tab label="Products" className="text-gray-700 font-medium" />
        <Tab label="Categories" className="text-gray-700 font-medium" />
        <Tab label="Sources" className="text-gray-700 font-medium" />
        <Tab label="Brands" className="text-gray-700 font-medium" />
        <Tab label="Suggested Products" className="text-gray-700 font-medium" />
      </Tabs>

      {/* Products Tab */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" className="mb-4 text-gray-800 font-semibold">Manage Products</Typography>
          {productActionStatus && (
            <Alert severity={productActionStatus.includes('Error') ? 'error' : 'success'} className="mb-6">
              {productActionStatus}
            </Alert>
          )}
          <Paper elevation={3} className="p-8 mb-6 rounded-xl bg-white shadow-md max-w-2xl mx-auto">
            <Typography variant="h6" className="mb-6 text-gray-700 font-medium">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </Typography>
            <List disablePadding>
              <ListItem className="py-3">
                <TextField
                  label="Product Name"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  fullWidth
                  disabled={isProductLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                  sx={{ '& .MuiInputBase-root': { height: 48 } }}
                />
              </ListItem>
              <ListItem className="py-3">
                <Autocomplete
                  options={[...categories, { id: 'other', name: 'Other' }]}
                  getOptionLabel={(option) => option.name}
                  value={categories.find((c) => c.id === newProductCategoryId) || (newProductCategoryId === 'other' ? { id: 'other', name: 'Other' } : null)}
                  onChange={(e, newValue) => setNewProductCategoryId(newValue ? newValue.id : '')}
                  renderInput={(params) => <TextField {...params} label="Category" fullWidth className="rounded-lg" variant="outlined" size="medium" />}
                  disabled={isProductLoading}
                  sx={{ '& .MuiInputBase-root': { height: 48 }, width: '100%' }}
                />
              </ListItem>
              {newProductCategoryId === 'other' && (
                <ListItem className="py-3">
                  <TextField
                    label="Custom Category Name"
                    value={newProductCustomCategory}
                    onChange={(e) => setNewProductCustomCategory(e.target.value)}
                    fullWidth
                    disabled={isProductLoading}
                    className="rounded-lg"
                    variant="outlined"
                    size="medium"
                    sx={{ '& .MuiInputBase-root': { height: 48 } }}
                  />
                </ListItem>
              )}
              <ListItem className="py-3">
                <Autocomplete
                  options={[...sources, { id: 'other', name: 'Other' }]}
                  getOptionLabel={(option) => option.name}
                  value={sources.find((s) => s.id === newProductSourceId) || (newProductSourceId === 'other' ? { id: 'other', name: 'Other' } : null)}
                  onChange={(e, newValue) => setNewProductSourceId(newValue ? newValue.id : '')}
                  renderInput={(params) => <TextField {...params} label="Source" fullWidth className="rounded-lg" variant="outlined" size="medium" />}
                  disabled={isProductLoading}
                  sx={{ '& .MuiInputBase-root': { height: 48 }, width: '100%' }}
                />
              </ListItem>
              {newProductSourceId === 'other' && (
                <ListItem className="py-3">
                  <TextField
                    label="Custom Source Name"
                    value={newProductCustomSource}
                    onChange={(e) => setNewProductCustomSource(e.target.value)}
                    fullWidth
                    disabled={isProductLoading}
                    className="rounded-lg"
                    variant="outlined"
                    size="medium"
                    sx={{ '& .MuiInputBase-root': { height: 48 } }}
                  />
                </ListItem>
              )}
              <ListItem className="py-3">
                <Autocomplete
                  options={[...brands, { id: 'other', name: 'Other' }]}
                  getOptionLabel={(option) => option.name}
                  value={brands.find((b) => b.id === newProductBrandId) || (newProductBrandId === 'other' ? { id: 'other', name: 'Other' } : null)}
                  onChange={(e, newValue) => setNewProductBrandId(newValue ? newValue.id : '')}
                  renderInput={(params) => <TextField {...params} label="Brand" fullWidth className="rounded-lg" variant="outlined" size="medium" />}
                  disabled={isProductLoading}
                  sx={{ '& .MuiInputBase-root': { height: 48 }, width: '100%' }}
                />
              </ListItem>
              {newProductBrandId === 'other' && (
                <ListItem className="py-3">
                  <TextField
                    label="Custom Brand Name"
                    value={newProductCustomBrand}
                    onChange={(e) => setNewProductCustomBrand(e.target.value)}
                    fullWidth
                    disabled={isProductLoading}
                    className="rounded-lg"
                    variant="outlined"
                    size="medium"
                    sx={{ '& .MuiInputBase-root': { height: 48 } }}
                  />
                </ListItem>
              )}
              <ListItem className="py-3">
                <TextField
                  label="Image URL"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  fullWidth
                  disabled={isProductLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                  sx={{ '& .MuiInputBase-root': { height: 48 } }}
                />
              </ListItem>
              <ListItem className="py-3">
                <TextField
                  label="Affiliate Link"
                  value={newProductLink}
                  onChange={(e) => setNewProductLink(e.target.value)}
                  fullWidth
                  disabled={isProductLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                  sx={{ '& .MuiInputBase-root': { height: 48 } }}
                />
              </ListItem>
              <ListItem className="py-3">
                <TextField
                  label="Original Price (₹)"
                  type="number"
                  value={newProductOriginalPrice}
                  onChange={(e) => setNewProductOriginalPrice(e.target.value)}
                  fullWidth
                  disabled={isProductLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                  sx={{ '& .MuiInputBase-root': { height: 48 } }}
                />
              </ListItem>
              <ListItem className="py-3">
                <TextField
                  label="Deal Price (₹)"
                  type="number"
                  value={newProductDealPrice}
                  onChange={(e) => setNewProductDealPrice(e.target.value)}
                  fullWidth
                  disabled={isProductLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                  sx={{ '& .MuiInputBase-root': { height: 48 } }}
                />
              </ListItem>
              <ListItem className="py-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newProductIsBestDeal}
                      onChange={(e) => setNewProductIsBestDeal(e.target.checked)}
                      disabled={isProductLoading}
                    />
                  }
                  label="Mark as Best Deal"
                  className="text-gray-700"
                />
              </ListItem>
              <ListItem className="py-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newProductIsBestProduct}
                      onChange={(e) => setNewProductIsBestProduct(e.target.checked)}
                      disabled={isProductLoading}
                    />
                  }
                  label="Mark as Best Product"
                  className="text-gray-700"
                />
              </ListItem>
              <ListItem className="py-3">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={editProduct ? handleUpdateProduct : handleAddProduct}
                  disabled={isProductLoading}
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg py-3"
                  sx={{ maxWidth: '200px', mx: 'auto' }}
                >
                  {isProductLoading ? <CircularProgress size={24} /> : editProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </ListItem>
              {editProduct && (
                <ListItem className="py-3">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setEditProduct(null);
                      setNewProductName('');
                      setNewProductSourceId('');
                      setNewProductCustomSource('');
                      setNewProductBrandId('');
                      setNewProductCustomBrand('');
                      setNewProductCategoryId('');
                      setNewProductCustomCategory('');
                      setNewProductImage('');
                      setNewProductLink('');
                      setNewProductOriginalPrice('');
                      setNewProductDealPrice('');
                      setNewProductIsBestDeal(false);
                      setNewProductIsBestProduct(false);
                    }}
                    fullWidth
                    className="border-red-600 text-red-600 hover:bg-red-50 rounded-lg py-3"
                    sx={{ maxWidth: '200px', mx: 'auto' }}
                  >
                    Cancel Edit
                  </Button>
                </ListItem>
              )}
            </List>
          </Paper>

          {isProductLoading ? (
            <CircularProgress className="mx-auto" />
          ) : products.length === 0 ? (
            <Typography variant="h6" className="text-center text-gray-600 mt-8">
              No products available.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => {
                const discount = calculateDiscount(product.originalPrice, product.dealPrice);
                const sourceName = sources.find((s) => s.id === product.sourceId)?.name || 'Unknown';
                const brandName = brands.find((b) => b.id === product.brandId)?.name || 'Unknown';
                return (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-xl h-96 flex flex-col">
                      <CardMedia
                        component="img"
                        height="120"
                        image={product.image}
                        alt={product.name}
                        className="object-cover rounded-t-xl"
                      />
                      <CardContent className="p-4 flex-grow">
                        <Typography variant="body1" className="font-semibold text-gray-800 truncate">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 mt-1">
                          Category: {categories.find((c) => c.id === product.categoryId)?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Source: {sourceName}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Brand: {brandName}
                        </Typography>
                        <Typography variant="body2" className="text-gray-800 font-medium">
                          Price: ₹{product.dealPrice} {discount && <span className="text-green-600">({discount.percentage}% off)</span>}
                        </Typography>
                        {product.isBestDeal && (
                          <Typography variant="body2" className="text-blue-600 font-medium mt-1">
                            Best Deal
                          </Typography>
                        )}
                        {product.isBestProduct && (
                          <Box display="flex" alignItems="center" className="text-yellow-600 mt-1">
                            <Typography variant="body2" className="font-medium">Best Product</Typography>
                            <StarIcon fontSize="small" className="ml-1" />
                          </Box>
                        )}
                      </CardContent>
                      <CardActions className="p-3 justify-end border-t">
                        <IconButton onClick={() => handleEditProduct(product)} size="small">
                          <EditIcon className="text-blue-600" />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteProduct(product.id)} size="small">
                          <DeleteIcon className="text-red-600" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Categories Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" className="mb-4 text-gray-800 font-semibold">Manage Categories</Typography>
          {categoryActionStatus && (
            <Alert severity={categoryActionStatus.includes('Error') ? 'error' : 'success'} className="mb-6">
              {categoryActionStatus}
            </Alert>
          )}
          <Paper elevation={3} className="p-6 mb-6 rounded-xl bg-white shadow-md">
            <Typography variant="h6" className="mb-4 text-gray-700 font-medium">
              {editCategory ? 'Edit Category' : 'Add New Category'}
            </Typography>
            <List disablePadding>
              <ListItem className="py-2">
                <TextField
                  label="Category Name"
                  value={editCategory ? editCategoryName : newCategoryName}
                  onChange={(e) => (editCategory ? setEditCategoryName(e.target.value) : setNewCategoryName(e.target.value))}
                  fullWidth
                  disabled={isCategoryLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                />
              </ListItem>
              <ListItem className="py-2">
                <TextField
                  label="Category Image URL"
                  value={editCategory ? editCategoryImage : newCategoryImage}
                  onChange={(e) => (editCategory ? setEditCategoryImage(e.target.value) : setNewCategoryImage(e.target.value))}
                  fullWidth
                  disabled={isCategoryLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                />
              </ListItem>
              <ListItem className="py-2">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={editCategory ? handleUpdateCategory : handleAddCategory}
                  disabled={isCategoryLoading}
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg py-3"
                >
                  {isCategoryLoading ? <CircularProgress size={24} /> : editCategory ? 'Update Category' : 'Add Category'}
                </Button>
              </ListItem>
              {editCategory && (
                <ListItem className="py-2">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setEditCategory(null);
                      setEditCategoryName('');
                      setEditCategoryImage('');
                    }}
                    fullWidth
                    className="border-red-600 text-red-600 hover:bg-red-50 rounded-lg py-3"
                  >
                    Cancel Edit
                  </Button>
                </ListItem>
              )}
            </List>
          </Paper>

          {isCategoryLoading ? (
            <CircularProgress className="mx-auto" />
          ) : categories.length === 0 ? (
            <Typography variant="h6" className="text-center text-gray-600 mt-8">
              No categories available.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={3} key={category.id}>
                  <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-xl h-64 flex flex-col">
                    {category.image && (
                      <CardMedia
                        component="img"
                        height="80"
                        image={category.image}
                        alt={category.name}
                        className="object-cover rounded-t-xl"
                      />
                    )}
                    <CardContent className="p-4 flex-grow">
                      <Typography variant="body1" className="font-semibold text-gray-800 truncate">
                        {category.name}
                      </Typography>
                    </CardContent>
                    <CardActions className="p-3 justify-end border-t">
                      <IconButton onClick={() => handleEditCategory(category)} size="small">
                        <EditIcon className="text-blue-600" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteCategory(category.id)} size="small">
                        <DeleteIcon className="text-red-600" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Sources Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" className="mb-4 text-gray-800 font-semibold">Manage Sources</Typography>
          {sourceActionStatus && (
            <Alert severity={sourceActionStatus.includes('Error') ? 'error' : 'success'} className="mb-6">
              {sourceActionStatus}
            </Alert>
          )}
          <Paper elevation={3} className="p-6 mb-6 rounded-xl bg-white shadow-md">
            <Typography variant="h6" className="mb-4 text-gray-700 font-medium">
              {editSource ? 'Edit Source' : 'Add New Source'}
            </Typography>
            <List disablePadding>
              <ListItem className="py-2">
                <TextField
                  label="Source Name"
                  value={editSource ? editSourceName : newSourceName}
                  onChange={(e) => (editSource ? setEditSourceName(e.target.value) : setNewSourceName(e.target.value))}
                  fullWidth
                  disabled={isSourceLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                />
              </ListItem>
              <ListItem className="py-2">
                <TextField
                  label="Source Logo URL"
                  value={editSource ? editSourceLogo : newSourceLogo}
                  onChange={(e) => (editSource ? setEditSourceLogo(e.target.value) : setNewSourceLogo(e.target.value))}
                  fullWidth
                  disabled={isSourceLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                />
              </ListItem>
              <ListItem className="py-2">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={editSource ? handleUpdateSource : handleAddSource}
                  disabled={isSourceLoading}
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg py-3"
                >
                  {isSourceLoading ? <CircularProgress size={24} /> : editSource ? 'Update Source' : 'Add Source'}
                </Button>
              </ListItem>
              {editSource && (
                <ListItem className="py-2">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setEditSource(null);
                      setEditSourceName('');
                      setEditSourceLogo('');
                    }}
                    fullWidth
                    className="border-red-600 text-red-600 hover:bg-red-50 rounded-lg py-3"
                  >
                    Cancel Edit
                  </Button>
                </ListItem>
              )}
            </List>
          </Paper>

          {isSourceLoading ? (
            <CircularProgress className="mx-auto" />
          ) : sources.length === 0 ? (
            <Typography variant="h6" className="text-center text-gray-600 mt-8">
              No sources available.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {sources.map((source) => (
                <Grid item xs={12} sm={6} md={3} key={source.id}>
                  <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-xl h-64 flex flex-col">
                    {source.logo && (
                      <CardMedia
                        component="img"
                        height="80"
                        image={source.logo}
                        alt={source.name}
                        className="object-cover rounded-t-xl"
                      />
                    )}
                    <CardContent className="p-4 flex-grow">
                      <Typography variant="body1" className="font-semibold text-gray-800 truncate">
                        {source.name}
                      </Typography>
                    </CardContent>
                    <CardActions className="p-3 justify-end border-t">
                      <IconButton onClick={() => handleEditSource(source)} size="small">
                        <EditIcon className="text-blue-600" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteSource(source.id)} size="small">
                        <DeleteIcon className="text-red-600" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Brands Tab */}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h5" className="mb-4 text-gray-800 font-semibold">Manage Brands</Typography>
          {brandActionStatus && (
            <Alert severity={brandActionStatus.includes('Error') ? 'error' : 'success'} className="mb-6">
              {brandActionStatus}
            </Alert>
          )}
          <Paper elevation={3} className="p-6 mb-6 rounded-xl bg-white shadow-md">
            <Typography variant="h6" className="mb-4 text-gray-700 font-medium">
              {editBrand ? 'Edit Brand' : 'Add New Brand'}
            </Typography>
            <List disablePadding>
              <ListItem className="py-2">
                <TextField
                  label="Brand Name"
                  value={editBrand ? editBrandName : newBrandName}
                  onChange={(e) => (editBrand ? setEditBrandName(e.target.value) : setNewBrandName(e.target.value))}
                  fullWidth
                  disabled={isBrandLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                />
              </ListItem>
              <ListItem className="py-2">
                <TextField
                  label="Brand Logo URL"
                  value={editBrand ? editBrandLogo : newBrandLogo}
                  onChange={(e) => (editBrand ? setEditBrandLogo(e.target.value) : setNewBrandLogo(e.target.value))}
                  fullWidth
                  disabled={isBrandLoading}
                  className="rounded-lg"
                  variant="outlined"
                  size="medium"
                />
              </ListItem>
              <ListItem className="py-2">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={editBrand ? handleUpdateBrand : handleAddBrand}
                  disabled={isBrandLoading}
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg py-3"
                >
                  {isBrandLoading ? <CircularProgress size={24} /> : editBrand ? 'Update Brand' : 'Add Brand'}
                </Button>
              </ListItem>
              {editBrand && (
                <ListItem className="py-2">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setEditBrand(null);
                      setEditBrandName('');
                      setEditBrandLogo('');
                    }}
                    fullWidth
                    className="border-red-600 text-red-600 hover:bg-red-50 rounded-lg py-3"
                  >
                    Cancel Edit
                  </Button>
                </ListItem>
              )}
            </List>
          </Paper>

          {isBrandLoading ? (
            <CircularProgress className="mx-auto" />
          ) : brands.length === 0 ? (
            <Typography variant="h6" className="text-center text-gray-600 mt-8">
              No brands available.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {brands.map((brand) => (
                <Grid item xs={12} sm={6} md={3} key={brand.id}>
                  <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-xl h-64 flex flex-col">
                    {brand.logo && (
                      <CardMedia
                        component="img"
                        height="80"
                        image={brand.logo}
                        alt={brand.name}
                        className="object-cover rounded-t-xl"
                      />
                    )}
                    <CardContent className="p-4 flex-grow">
                      <Typography variant="body1" className="font-semibold text-gray-800 truncate">
                        {brand.name}
                      </Typography>
                    </CardContent>
                    <CardActions className="p-3 justify-end border-t">
                      <IconButton onClick={() => handleEditBrand(brand)} size="small">
                        <EditIcon className="text-blue-600" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteBrand(brand.id)} size="small">
                        <DeleteIcon className="text-red-600" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Suggested Products Tab */}
      {tabValue === 4 && (
        <Box>
          <Typography variant="h5" className="mb-4 text-gray-800 font-semibold">Suggested Products</Typography>
          {isSuggestedLoading ? (
            <CircularProgress className="mx-auto" />
          ) : suggestedProducts.length === 0 ? (
            <Typography variant="h6" className="text-center text-gray-600 mt-8">
              No suggested products available.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {suggestedProducts.map((sp) => {
                const product = products.find((p) => p.id === sp.productId);
                if (!product) return null;
                const discount = calculateDiscount(product.originalPrice, product.dealPrice);
                const sourceName = sources.find((s) => s.id === product.sourceId)?.name || 'Unknown';
                const brandName = brands.find((b) => b.id === product.brandId)?.name || 'Unknown';
                return (
                  <Grid item xs={12} sm={6} md={4} key={sp.id}>
                    <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-xl h-96 flex flex-col">
                      <CardMedia
                        component="img"
                        height="120"
                        image={product.image}
                        alt={product.name}
                        className="object-cover rounded-t-xl"
                      />
                      <CardContent className="p-4 flex-grow">
                        <Typography variant="body1" className="font-semibold text-gray-800 truncate">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 mt-1">
                          Category: {categories.find((c) => c.id === product.categoryId)?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Source: {sourceName}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Brand: {brandName}
                        </Typography>
                        <Typography variant="body2" className="text-gray-800 font-medium">
                          Price: ₹{product.dealPrice} {discount && <span className="text-green-600">({discount.percentage}% off)</span>}
                        </Typography>
                        <Box display="flex" alignItems="center" className="text-yellow-600 mt-1">
                          <Typography variant="body2" className="font-medium">Best Product</Typography>
                          <StarIcon fontSize="small" className="ml-1" />
                        </Box>
                      </CardContent>
                      <CardActions className="p-3 justify-end border-t">
                        <IconButton onClick={() => handleEditProduct(product)} size="small">
                          <EditIcon className="text-blue-600" />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteProduct(product.id)} size="small">
                          <DeleteIcon className="text-red-600" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Change Password Dialog */}
      <Dialog open={showPasswordChangeDialog} onClose={() => setShowPasswordChangeDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordChangeStatus && (
            <Alert severity={passwordChangeStatus.includes('Error') || passwordChangeStatus.includes('incorrect') ? 'error' : 'success'} className="mb-6">
              {passwordChangeStatus}
            </Alert>
          )}
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isPasswordChanging}
            className="rounded-lg"
            variant="outlined"
            size="medium"
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isPasswordChanging}
            className="rounded-lg"
            variant="outlined"
            size="medium"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isPasswordChanging}
            className="rounded-lg"
            variant="outlined"
            size="medium"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordChangeDialog(false)} disabled={isPasswordChanging} className="text-gray-600">
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            color="primary"
            variant="contained"
            disabled={isPasswordChanging}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            {isPasswordChanging ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;