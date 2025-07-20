import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Import HashRouter
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import getAppTheme from './theme';

// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Import components
import Header from './components/Header';
import Deals from './components/Deals';
import Footer from './components/Footer';
import Home from './components/Home';
import AffiliateLinks from './components/AffiliateLinks'; // Assuming this component is used elsewhere or will be
import About from './components/About';
import Admin from './components/Admin';
import Categories from './components/Categories';
import Products from './components/Products';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgyq-xGXAabq-KpRv0wVX6StkUlENYUbU",
  authDomain: "afflinks-83e43.firebaseapp.com",
  projectId: "afflinks-83e43",
  storageBucket: "afflinks-83e43.firebasestorage.app",
  messagingSenderId: "43353831547",
  appId: "1:43353831547:web:ce46623abfb89b3b5bcade",
  measurementId: "G-7LWT5WL9T7"
};

// Custom UUID generator
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const App = () => {
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  const theme = useMemo(() => getAppTheme('light'), []);

  useEffect(() => {
    const initializeFirebase = async () => {
      console.log(`App.jsx: Starting Firebase initialization at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      const authTimeout = setTimeout(() => {
        if (!isAuthReady) {
          console.warn('App.jsx: Firebase initialization timed out after 10 seconds.');
          setInitError('Firebase initialization timed out.');
          setIsAuthReady(true);
          setUserId(null);
        }
      }, 10000);

      try {
        const app = initializeApp(firebaseConfig);
        console.log('App.jsx: Firebase app initialized:', app.name, 'Project ID:', app.options.projectId);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        const analyticsInstance = getAnalytics(app); // Analytics instance initialized but not used further

        setFirebaseApp(app);
        setAuth(authInstance);
        setDb(dbInstance);
        console.log('App.jsx: Firebase services initialized (Auth, Firestore, Analytics).');

        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
          if (isAuthProcessing) {
            console.log('App.jsx: Skipping onAuthStateChanged due to ongoing processing.');
            return;
          }
          setIsAuthProcessing(true);
          console.log('App.jsx: onAuthStateChanged fired. User:', user ? { uid: user.uid, email: user.email || 'Anonymous' } : 'null');

          try {
            if (user) {
              console.log('App.jsx: User authenticated. UID:', user.uid, 'Email:', user.email || 'Anonymous');
              setUserId(user.uid);
            } else if (window.location.pathname !== '/admin') {
              console.log('App.jsx: No user logged in. Attempting anonymous sign-in for non-admin page.');
              try {
                const { user } = await signInAnonymously(authInstance);
                console.log('App.jsx: Signed in anonymously. UID:', user.uid);
                setUserId(user.uid);
              } catch (error) {
                console.warn('App.jsx: Anonymous sign-in failed:', error.code, error.message);
                console.log('App.jsx: Retrying anonymous sign-in...');
                try {
                  const { user } = await signInAnonymously(authInstance);
                  console.log('App.jsx: Retry successful. UID:', user.uid);
                  setUserId(user.uid);
                } catch (retryError) {
                  console.error('App.jsx: Anonymous sign-in retry failed:', retryError.code, retryError.message);
                  // Fallback to client-generated UUID if Firebase anonymous sign-in fails after retries
                  const fallbackUserId = generateUUID();
                  setUserId(fallbackUserId);
                  console.log('App.jsx: Fallback userId generated:', fallbackUserId);
                }
              }
            } else {
              console.log('App.jsx: No user logged in for admin page. Allowing Admin component to handle login.');
              setUserId(null); // Ensure userId is null for admin if not logged in
            }
          } catch (error) {
            console.error('App.jsx: Auth processing error:', error.code, error.message);
            setUserId(null);
          } finally {
            setIsAuthReady(true);
            setIsAuthProcessing(false);
            console.log(`App.jsx: isAuthReady set to true at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
            clearTimeout(authTimeout);
          }
        }, (error) => {
          console.error('App.jsx: Auth state change error:', error.code, error.message);
          setInitError('Authentication error: ' + error.message);
          setIsAuthReady(true);
          setUserId(null);
          setIsAuthProcessing(false);
          clearTimeout(authTimeout);
        });

        return () => {
          console.log('App.jsx: Cleaning up onAuthStateChanged listener.');
          clearTimeout(authTimeout);
          unsubscribe();
        };
      } catch (error) {
        console.error('App.jsx: Firebase initialization failed:', error.code || error.message);
        setInitError('Failed to initialize Firebase: ' + error.message);
        setIsAuthReady(true);
        setFirebaseApp(null);
        setAuth(null);
        setDb(null);
        setUserId(null);
        clearTimeout(authTimeout);
      }
    };

    initializeFirebase();
  }, []);

  if (!isAuthReady) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (initError) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
          <Typography color="error" variant="h6">
            {initError}
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Changed to HashRouter and removed the basename prop */}
      <HashRouter>
        <div>
          <Header />
          <Routes>
            {/* Routes remain the same */}
            <Route
              path="/home"
              element={<Home db={db} firebaseApp={firebaseApp} />}
            />
            <Route path="/deals" element={<Deals />} />
            <Route path="/categories" element={<Categories db={db} userId={userId} isAuthReady={isAuthReady} />} />
            <Route path="/products" element={<Products firebaseApp={firebaseApp} auth={auth} db={db} userId={userId} isAuthReady={isAuthReady} />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/admin"
              element={<Admin firebaseApp={firebaseApp} auth={auth} db={db} userId={userId} isAuthReady={isAuthReady} />}
            />
            {/* Redirect from root to /home, this will now be #/home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            {/* Catch-all route, this will now be #/home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          <Footer />
        </div>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
