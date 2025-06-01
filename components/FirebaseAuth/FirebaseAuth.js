import React from 'react';
import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signOutUser } from '../../lib/firebase';
import styles from './FirebaseAuth.module.css';

const FirebaseAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { user: newUser, error: signUpError } = await signUpWithEmail(email, password, { displayName: name });
        
        if (signUpError) {
          throw new Error(signUpError);
        }
        
        setUser(newUser);
      } else {
        // Sign in
        const { user: existingUser, error: signInError } = await signInWithEmail(email, password);
        
        if (signInError) {
          throw new Error(signInError);
        }
        
        setUser(existingUser);
      }
      
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      const { success, error: signOutError } = await signOutUser();
      
      if (signOutError) {
        throw new Error(signOutError);
      }
      
      if (success) {
        setUser(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {user ? (
        <div className={styles.userInfo}>
          <h2>Welcome, {user.displayName || user.email}</h2>
          <p>Email: {user.email}</p>
          <button 
            className={styles.button} 
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      ) : (
        <>
          <h2>{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
          
          {error && <p className={styles.error}>{error}</p>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {isSignUp && (
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          
          <p className={styles.toggle}>
            {isSignUp ? 'Already have an account?' : 'Need an account?'}
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default FirebaseAuth;
