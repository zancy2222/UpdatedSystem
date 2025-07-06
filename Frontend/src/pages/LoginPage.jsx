import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import BagongPilipinasLogo from "../resources/Bagong_Pilipinas_logo.png";
import LRALogo from "../resources/lra.png";
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

async function createJWEToken(payload) {
  const secretKey = await getEncryptionKey();
  return await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: JWE_ALG, enc: JWE_ENC })
    .setIssuedAt()
    .setExpirationTime('2h')
    .encrypt(secretKey);
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
export default function LoginPage() {
    const [credentials, setCredentials] = useState({ username: '', password: '' })
    const [loginType, setLoginType] = useState(''); // 'admin', 'personnel', or 'client'
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userType = localStorage.getItem('userType');
        const isDemo = localStorage.getItem('isDemo') === 'true';
        
        if (authToken || isDemo) {
            const verifyToken = async () => {
                if (!isDemo && authToken) {
                    const payload = await decryptJWEToken(authToken);
                    if (!payload) {
                        localStorage.clear();
                        return;
                    }
                }
                
                switch (userType) {
                    case 'admin':
                        navigate('/dashboard', { replace: true });
                        break;
                    case 'personnel':
                        navigate('/personel', { replace: true });
                        break;
                    case 'client':
                        navigate('/clientdashboard', { replace: true });
                        break;
                    default:
                        localStorage.clear();
                }
            };
            
            verifyToken();
        }
    }, [navigate]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    const handleLoginTypeChange = (type) => {
        setLoginType(type);
        setCredentials({ username: '', password: '' }); 
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
        const { username, password } = credentials;

        if (!username || !password) {
            throw new Error('Please enter both username and password');
        }

        // 1. Try Admin (Demo only)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('userType', 'admin');
            localStorage.setItem('isDemo', 'true');

            navigate('/dashboard', { replace: true });
            return;
        }

        // 2. Try Personnel Login
        const personnelResponse = await fetch('/api/personnel/personnel/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (personnelResponse.ok) {
            const personnelData = await personnelResponse.json();
            if (personnelData.success) {
                const personnel = personnelData.data.personnel;

                const tokenPayload = {
                    id: personnel.id,
                    username: personnel.username,
                    email: personnel.email,
                    position: personnel.position,
                    userType: 'personnel',
                };

                const jweToken = await createJWEToken(tokenPayload);

                localStorage.setItem('authToken', jweToken);
                localStorage.setItem('userType', 'personnel');
                localStorage.setItem('personnelData', JSON.stringify(personnel));
                localStorage.setItem('isDemo', 'false');

                const redirectPath = personnel.position === 'Head of Office' ? '/dashboard' : '/personel';
                navigate(redirectPath, { replace: true });
                return;
            }
        }

        // 3. Try Client Login
        const clientResponse = await fetch('/api/clients/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (clientResponse.ok) {
            const clientData = await clientResponse.json();
            if (clientData.success) {
                const client = clientData.data.client;

                const tokenPayload = {
                    id: client.id,
                    username: client.username,
                    email: client.email,
                    userType: 'client',
                };

                const jweToken = await createJWEToken(tokenPayload);

                localStorage.setItem('authToken', jweToken);
                localStorage.setItem('userType', 'client');
                localStorage.setItem('clientData', JSON.stringify(client));
                localStorage.setItem('isDemo', 'false');

                navigate('/clientdashboard', { replace: true });
                return;
            }
        }

        // If all fail
        throw new Error('Invalid credentials. Please check your username and password.');

    } catch (err) {
        setError(err.message);
        setShowErrorModal(true);
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(234,179,8,0.1)_0%,_transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(234,179,8,0.05)_0%,_transparent_50%)]"></div>
            
            <div className="relative w-full max-w-md">
                {/* Main Title */}
                <div className="relative text-center mb-8">
                    {/* Absolute-positioned logo on the left */}
                    <img
                        src={LRALogo}
                        alt="LRA Logo"
                        className="absolute left-[-80px] top-1/2 transform -translate-y-1/2 w-24 h-24 object-contain"
                    />
                    {/* Right-side: Bagong Pilipinas Logo */}
                    <img
                        src={BagongPilipinasLogo}
                        alt="Bagong Pilipinas Logo"
                        className="absolute right-[-80px] top-1/2 transform -translate-y-1/2 w-24 h-24 object-contain"
                    />

                    <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                        Appointment & Analytics
                    </h1>
                    <h2 className="text-xl font-semibold text-yellow-400">
                        Management System
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mt-4 rounded-full"></div>
                </div>
                                
                {/* Login Form */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-slate-800">Welcome Back</h3>
                        <p className="text-gray-600 mt-1">Sign in to your account</p>
                    </div>
                    
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                                {loginType === 'admin' ? 'Admin Username' : 
                                 loginType === 'personnel' ? 'Personnel Username/Email' : 
                                 'Username/Email'}
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                placeholder={
                                    loginType === 'admin' ? 'Enter admin username' : 
                                    loginType === 'personnel' ? 'Enter personnel username or email' : 
                                    'Enter username or email'
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        {loginType === 'admin' && (
                            <div className="text-sm text-gray-500">
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-900 to-slate-800 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-blue-800 hover:to-slate-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none border-2 border-transparent hover:border-yellow-400"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Log In...
                                </div>
                            ) : (
                                'Log In'
                            )}
                        </button>
                    </form>
                    {/* Register Link - only for clients */}
                    
                        <div className="text-center mt-6 pt-4 border-t border-gray-200">
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="text-blue-900 hover:text-yellow-600 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-2"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                  
                </div>
                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm">
                       Registry of Deeds, San Fernando La Union
                    </p>
                </div>
            </div>
            
            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-red-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-red-600 mb-2">Login Failed</h3>
                            <p className="text-sm text-gray-700 mb-6">{error}</p>
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="bg-gradient-to-r from-blue-900 to-slate-800 text-white px-6 py-2 rounded-lg hover:from-blue-800 hover:to-slate-700 transition-all duration-200 font-semibold"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}