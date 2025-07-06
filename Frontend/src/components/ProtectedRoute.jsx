import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as jose from 'jose';

const JWE_SECRET_KEY = 'abHFngAxgJMLmCAFqjpHmMpMj3-bR46jizpagzmTkX0=';
const JWE_ALG = 'dir';
const JWE_ENC = 'A256GCM';

async function getEncryptionKey() {
  const secretKey = new TextEncoder().encode(JWE_SECRET_KEY);
  if (secretKey.length !== 32) {
    const hash = await crypto.subtle.digest('SHA-256', secretKey);
    return new Uint8Array(hash).slice(0, 32);
  }
  return secretKey.slice(0, 32);
}

async function decryptJWEToken(token) {
  try {
    const secretKey = await getEncryptionKey();
    const { payload } = await jose.jwtDecrypt(token, secretKey, {
      contentEncryptionAlgorithms: [JWE_ENC],
      keyManagementAlgorithms: [JWE_ALG]
    });
    return payload;
  } catch (error) {
    console.error('JWE decryption failed:', error);
    return null;
  }
}

const ProtectedRoute = ({ children, requiredUserType, requiredPosition }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const authToken = localStorage.getItem('authToken');
            const userType = localStorage.getItem('userType');
            const isDemo = localStorage.getItem('isDemo') === 'true';

            // Check if user is logged in
            if (!authToken && !isDemo) {
                setIsAuthorized(false);
                return;
            }

            // For demo admin
            if (isDemo && userType === 'admin') {
                const allowedTypes = Array.isArray(requiredUserType) ? requiredUserType : [requiredUserType];
                if (allowedTypes.includes('admin')) {
                    setIsAuthorized(true);
                    return;
                }
            }

            // For real users with tokens
            if (authToken && !isDemo) {
                const payload = await decryptJWEToken(authToken);
                if (!payload) {
                    localStorage.clear();
                    setIsAuthorized(false);
                    return;
                }

                const allowedTypes = Array.isArray(requiredUserType) ? requiredUserType : [requiredUserType];
                
                // Check user type
                if (!allowedTypes.includes(payload.userType)) {
                    setIsAuthorized(false);
                    return;
                }

                // Check position if required (for personnel)
                if (requiredPosition && payload.userType === 'personnel') {
                    if (payload.position !== requiredPosition) {
                        setIsAuthorized(false);
                        return;
                    }
                }

                setIsAuthorized(true);
                return;
            }

            setIsAuthorized(false);
        };

        checkAuth();
    }, [requiredUserType, requiredPosition]);

    if (isAuthorized === null) {
        // Loading state
        return <div>Loading...</div>;
    }

    if (!isAuthorized) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;