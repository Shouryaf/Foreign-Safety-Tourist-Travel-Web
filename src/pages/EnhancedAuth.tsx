import React, { useState, useEffect } from 'react';
import { 
  Shield, Mail, Lock, User, Phone, Fingerprint, Eye, EyeOff,
  Chrome, QrCode, Scan, Users, ArrowRight, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface EnhancedAuthProps {
  onLogin: (user: any) => void;
}

type AuthMethod = 'email' | 'google' | 'phone' | 'blockchain' | 'biometric';
type AuthStep = 'method' | 'credentials' | 'otp' | 'biometric' | 'trusted-contacts';

export default function EnhancedAuth({ onLogin }: EnhancedAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [currentStep, setCurrentStep] = useState<AuthStep>('method');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    otp: '',
    trustedContacts: [] as { name: string; phone: string; relation: string }[]
  });

  // Biometric support detection
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    // Check for biometric support
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      setBiometricSupported(true);
    }
  }, []);

  const handleMethodSelect = (method: AuthMethod) => {
    setAuthMethod(method);
    setCurrentStep('credentials');
    setError('');
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Simulate Google OAuth flow
      toast.success('Google authentication initiated...');
      // In real implementation, this would use Google OAuth SDK
      setTimeout(() => {
        const mockUser = {
          id: 'google_123',
          name: 'John Doe',
          email: 'john@gmail.com',
          role: 'tourist',
          authMethod: 'google'
        };
        onLogin(mockUser);
        toast.success('Google login successful!');
      }, 2000);
    } catch (error) {
      toast.error('Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTP = async () => {
    if (!formData.phone) {
      setError('Please enter your phone number');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep('otp');
      toast.success('OTP sent to your phone!');
    } catch (error) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isLogin) {
        setCurrentStep('trusted-contacts');
      } else {
        const mockUser = {
          id: 'phone_123',
          name: formData.fullName || 'User',
          phone: formData.phone,
          role: 'tourist',
          authMethod: 'phone'
        };
        onLogin(mockUser);
        toast.success('Phone verification successful!');
      }
    } catch (error) {
      setError('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricSupported) {
      toast.error('Biometric authentication not supported on this device');
      return;
    }

    setLoading(true);
    try {
      // Simulate biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "SafeTravel" },
          user: {
            id: new Uint8Array(16),
            name: formData.email || "user@example.com",
            displayName: formData.fullName || "User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        const mockUser = {
          id: 'biometric_123',
          name: formData.fullName || 'User',
          email: formData.email,
          role: 'tourist',
          authMethod: 'biometric'
        };
        onLogin(mockUser);
        toast.success('Biometric authentication successful!');
      }
    } catch (error) {
      toast.error('Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockchainAuth = async () => {
    setLoading(true);
    try {
      // Simulate blockchain ID verification
      toast.success('Scanning blockchain ID...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser = {
        id: 'blockchain_123',
        name: 'Verified User',
        blockchainId: '0x1234...5678',
        role: 'tourist',
        authMethod: 'blockchain'
      };
      onLogin(mockUser);
      toast.success('Blockchain ID verified!');
    } catch (error) {
      toast.error('Blockchain verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            name: formData.fullName, 
            email: formData.email, 
            password: formData.password, 
            phone: formData.phone,
            role: 'tourist' 
          };

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`, payload);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (!isLogin) {
        setCurrentStep('trusted-contacts');
      } else {
        onLogin(user);
        toast.success('Login successful!');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Authentication failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTrustedContactsSetup = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.trustedContacts = formData.trustedContacts;
    localStorage.setItem('user', JSON.stringify(user));
    onLogin(user);
    toast.success('Account setup complete!');
  };

  const addTrustedContact = () => {
    if (formData.trustedContacts.length < 3) {
      setFormData(prev => ({
        ...prev,
        trustedContacts: [...prev.trustedContacts, { name: '', phone: '', relation: '' }]
      }));
    }
  };

  const updateTrustedContact = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      trustedContacts: prev.trustedContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Shield className="h-16 w-16 text-teal-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SafeTravel</h2>
        <p className="text-gray-600">Choose your preferred authentication method</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Google Authentication */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center">
            <Chrome className="h-6 w-6 text-red-500 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Continue with Google</div>
              <div className="text-sm text-gray-500">Quick and secure</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-500" />
        </button>

        {/* Phone OTP */}
        <button
          onClick={() => handleMethodSelect('phone')}
          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center">
            <Phone className="h-6 w-6 text-blue-500 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Phone OTP</div>
              <div className="text-sm text-gray-500">Verify with SMS code</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-500" />
        </button>

        {/* Blockchain ID */}
        <button
          onClick={handleBlockchainAuth}
          disabled={loading}
          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center">
            <QrCode className="h-6 w-6 text-purple-500 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Blockchain ID</div>
              <div className="text-sm text-gray-500">Scan QR or use wallet</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-500" />
        </button>

        {/* Biometric */}
        {biometricSupported && (
          <button
            onClick={() => handleMethodSelect('biometric')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 flex items-center justify-between group"
          >
            <div className="flex items-center">
              <Fingerprint className="h-6 w-6 text-green-500 mr-3" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Biometric Login</div>
                <div className="text-sm text-gray-500">Fingerprint or Face ID</div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-500" />
          </button>
        )}

        {/* Email/Password */}
        <button
          onClick={() => handleMethodSelect('email')}
          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-gray-500 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Email & Password</div>
              <div className="text-sm text-gray-500">Traditional login</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-500" />
        </button>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );

  const renderCredentialsForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <button
          onClick={() => setCurrentStep('method')}
          className="text-teal-600 hover:text-teal-700 mb-4"
        >
          ← Back to methods
        </button>
        <h3 className="text-2xl font-bold text-gray-900">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {authMethod === 'email' && (
        <>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline h-4 w-4 mr-1" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                placeholder="Enter your password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </>
      )}

      {authMethod === 'phone' && (
        <>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <button
            onClick={handlePhoneOTP}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </>
      )}

      {authMethod === 'biometric' && (
        <div className="text-center py-8">
          <Fingerprint className="h-24 w-24 text-teal-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Biometric Authentication</h3>
          <p className="text-gray-600 mb-6">Use your fingerprint or face to authenticate</p>
          <button
            onClick={handleBiometricAuth}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </div>
      )}
    </div>
  );

  const renderOTPForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <button
          onClick={() => setCurrentStep('credentials')}
          className="text-teal-600 hover:text-teal-700 mb-4"
        >
          ← Back
        </button>
        <h3 className="text-2xl font-bold text-gray-900">Enter OTP</h3>
        <p className="text-gray-600">We sent a 6-digit code to {formData.phone}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          required
          value={formData.otp}
          onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl tracking-widest"
          placeholder="000000"
          maxLength={6}
        />
      </div>

      <button
        onClick={handleOTPVerification}
        disabled={loading || formData.otp.length !== 6}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <div className="text-center">
        <button
          onClick={handlePhoneOTP}
          className="text-teal-600 hover:text-teal-700 text-sm"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );

  const renderTrustedContactsSetup = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="h-16 w-16 text-teal-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900">Setup Trusted Contacts</h3>
        <p className="text-gray-600">Add up to 3 emergency contacts for safety alerts</p>
      </div>

      <div className="space-y-4">
        {formData.trustedContacts.map((contact, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Contact name"
                value={contact.name}
                onChange={(e) => updateTrustedContact(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={contact.phone}
                onChange={(e) => updateTrustedContact(index, 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <select
                value={contact.relation}
                onChange={(e) => updateTrustedContact(index, 'relation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select relationship</option>
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="emergency">Emergency Contact</option>
              </select>
            </div>
          </div>
        ))}

        {formData.trustedContacts.length < 3 && (
          <button
            onClick={addTrustedContact}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors duration-200"
          >
            + Add Trusted Contact
          </button>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleTrustedContactsSetup}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Complete Setup
        </button>
        <button
          onClick={handleTrustedContactsSetup}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          Skip for now
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {currentStep === 'method' && renderMethodSelection()}
        {currentStep === 'credentials' && renderCredentialsForm()}
        {currentStep === 'otp' && renderOTPForm()}
        {currentStep === 'trusted-contacts' && renderTrustedContactsSetup()}
      </div>
    </div>
  );
}
