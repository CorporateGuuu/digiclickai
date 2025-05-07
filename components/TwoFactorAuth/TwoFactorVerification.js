import React, { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from './TwoFactorAuth.module.css';

const TwoFactorVerification = ({ userId, email, methods, callbackUrl }) => {
  const [activeMethod, setActiveMethod] = useState(methods?.preferred_method || 'email');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showBackupForm, setShowBackupForm] = useState(false);
  const [duoData, setDuoData] = useState(null);
  const inputRefs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    // Send verification code when component mounts
    if (activeMethod === 'email' || activeMethod === 'sms') {
      sendVerificationCode(activeMethod);
    } else if (activeMethod === 'duo') {
      initializeDuo();
    }
  }, [activeMethod]);

  useEffect(() => {
    // Handle countdown for resending code
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const initializeDuo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/2fa/duo-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDuoData(data);
        
        // Initialize Duo Web
        if (window.Duo) {
          window.Duo.init({
            'host': data.host,
            'sig_request': data.sigRequest,
            'iframe': 'duo-iframe',
          });
        }
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to initialize DUO authentication');
      }
    } catch (err) {
      setError('An error occurred while initializing DUO authentication');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (method) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/2fa/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, method }),
      });
      
      if (response.ok) {
        setCountdown(60); // 60 seconds countdown
      } else {
        const error = await response.json();
        setError(error.message || `Failed to send ${method} verification code`);
      }
    } catch (err) {
      setError(`An error occurred while sending ${method} verification code`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setVerificationCode(digits);
      
      // Focus the last input
      inputRefs.current[5].focus();
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const code = verificationCode.join('');
      
      // Validate code
      if (code.length !== 6) {
        setError('Please enter a 6-digit verification code');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/2fa/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, method: activeMethod, code }),
      });
      
      if (response.ok) {
        // Complete the sign-in process
        const result = await signIn('2fa-completion', {
          redirect: false,
          userId,
          twoFactorVerified: true,
        });
        
        if (result.error) {
          setError(result.error);
        } else {
          router.push(callbackUrl || '/');
        }
      } else {
        const error = await response.json();
        setError(error.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred while verifying the code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate backup code
      if (!backupCode || backupCode.length < 8) {
        setError('Please enter a valid backup code');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/2fa/verify-backup-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, code: backupCode }),
      });
      
      if (response.ok) {
        // Complete the sign-in process
        const result = await signIn('2fa-completion', {
          redirect: false,
          userId,
          twoFactorVerified: true,
        });
        
        if (result.error) {
          setError(result.error);
        } else {
          router.push(callbackUrl || '/');
        }
      } else {
        const error = await response.json();
        setError(error.message || 'Invalid backup code');
      }
    } catch (err) {
      setError('An error occurred while verifying the backup code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDuoCallback = async (duoResponse) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/2fa/verify-duo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, signedResponse: duoResponse }),
      });
      
      if (response.ok) {
        // Complete the sign-in process
        const result = await signIn('2fa-completion', {
          redirect: false,
          userId,
          twoFactorVerified: true,
        });
        
        if (result.error) {
          setError(result.error);
        } else {
          router.push(callbackUrl || '/');
        }
      } else {
        const error = await response.json();
        setError(error.message || 'DUO authentication failed');
      }
    } catch (err) {
      setError('An error occurred during DUO authentication');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationForm = () => {
    if (showBackupForm) {
      return (
        <div className={styles.backupCodeForm}>
          <p>Enter one of your backup codes:</p>
          <input
            type="text"
            className={styles.backupCodeInput}
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
            placeholder="Enter backup code"
            maxLength={10}
          />
          <button
            className={styles.verifyButton}
            onClick={handleVerifyBackupCode}
            disabled={loading || !backupCode}
          >
            {loading ? 'Verifying...' : 'Verify Backup Code'}
          </button>
          <div className={styles.resendContainer}>
            <span
              className={styles.resendLink}
              onClick={() => setShowBackupForm(false)}
            >
              Back to verification methods
            </span>
          </div>
        </div>
      );
    }

    if (activeMethod === 'duo') {
      return (
        <div>
          <p>Complete the DUO authentication process:</p>
          <div className={styles.duoContainer}>
            <iframe
              id="duo-iframe"
              width="100%"
              height="330"
              frameBorder="0"
              title="DUO Authentication"
              data-host={duoData?.host}
              data-sig-request={duoData?.sigRequest}
            ></iframe>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.verificationForm}>
        <p>
          Enter the 6-digit verification code sent to your {activeMethod === 'email' ? 'email' : 'phone'}:
        </p>
        <div className={styles.codeInput} onPaste={handlePaste}>
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => (inputRefs.current[index] = el)}
              autoFocus={index === 0}
            />
          ))}
        </div>
        <button
          className={styles.verifyButton}
          onClick={handleVerifyCode}
          disabled={loading || verificationCode.some(digit => !digit)}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
        <div className={styles.resendContainer}>
          {countdown > 0 ? (
            <span>
              Resend code in <span className={styles.countdown}>{countdown}s</span>
            </span>
          ) : (
            <span
              className={styles.resendLink}
              onClick={() => sendVerificationCode(activeMethod)}
            >
              Resend verification code
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.verificationContainer}>
      <h2>Two-Factor Authentication</h2>
      <p className={styles.verificationDescription}>
        For added security, please verify your identity with a second factor.
      </p>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {renderVerificationForm()}
      
      {!showBackupForm && (
        <div className={styles.alternativeMethod}>
          <h3>Verification Methods</h3>
          <div>
            {methods?.email_enabled && (
              <button
                className={styles.methodButton}
                onClick={() => setActiveMethod('email')}
                disabled={activeMethod === 'email'}
              >
                Email
              </button>
            )}
            {methods?.sms_enabled && (
              <button
                className={styles.methodButton}
                onClick={() => setActiveMethod('sms')}
                disabled={activeMethod === 'sms'}
              >
                SMS
              </button>
            )}
            {methods?.duo_enabled && (
              <button
                className={styles.methodButton}
                onClick={() => setActiveMethod('duo')}
                disabled={activeMethod === 'duo'}
              >
                DUO Security
              </button>
            )}
          </div>
          
          <span
            className={styles.backupCodeLink}
            onClick={() => setShowBackupForm(true)}
          >
            Use a backup code
          </span>
        </div>
      )}
    </div>
  );
};

export default TwoFactorVerification;
