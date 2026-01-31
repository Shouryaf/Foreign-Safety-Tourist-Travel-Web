import React, { useState, useRef } from 'react';
import { Camera, Shield, CheckCircle, XCircle, Upload, Scan, Globe, Calendar, MapPin, User, FileText, AlertTriangle, Download } from 'lucide-react';

interface PassportData {
  id: string;
  passportNumber: string;
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  photo: string;
  isVerified: boolean;
  verificationScore: number;
  biometricData?: {
    faceMatch: number;
    fingerprintMatch?: number;
  };
}

interface VisaData {
  id: string;
  visaType: string;
  country: string;
  issueDate: string;
  expiryDate: string;
  entryType: 'single' | 'multiple';
  maxStayDuration: string;
  purpose: string;
  isValid: boolean;
  restrictions?: string[];
}

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

const PassportVerificationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'verify' | 'visa' | 'history'>('scan');
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [visaData, setVisaData] = useState<VisaData[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePassportData: PassportData = {
    id: 'P123456789',
    passportNumber: 'A12345678',
    fullName: 'John Michael Smith',
    nationality: 'United States',
    dateOfBirth: '1990-05-15',
    placeOfBirth: 'New York, USA',
    issueDate: '2020-03-10',
    expiryDate: '2030-03-10',
    issuingAuthority: 'U.S. Department of State',
    photo: '/api/placeholder/120/150',
    isVerified: true,
    verificationScore: 95,
    biometricData: {
      faceMatch: 98.5
    }
  };

  const sampleVisaData: VisaData[] = [
    {
      id: 'V001',
      visaType: 'Tourist Visa',
      country: 'France',
      issueDate: '2024-01-15',
      expiryDate: '2024-07-15',
      entryType: 'multiple',
      maxStayDuration: '90 days',
      purpose: 'Tourism',
      isValid: true
    },
    {
      id: 'V002',
      visaType: 'Business Visa',
      country: 'Germany',
      issueDate: '2024-02-20',
      expiryDate: '2025-02-20',
      entryType: 'multiple',
      maxStayDuration: '90 days per 180 days',
      purpose: 'Business meetings',
      isValid: true,
      restrictions: ['No employment allowed', 'Must register if staying >90 days']
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      simulatePassportScan();
    }
  };

  const simulatePassportScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setPassportData(samplePassportData);
          setVisaData(sampleVisaData);
          performVerification();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const performVerification = () => {
    // Simulate verification process
    setTimeout(() => {
      const result: VerificationResult = {
        isValid: true,
        confidence: 95,
        issues: [],
        recommendations: [
          'Passport expires in 6 years - renewal recommended 1 year before expiry',
          'Consider applying for Global Entry for faster border processing'
        ],
        riskLevel: 'low'
      };
      setVerificationResult(result);
    }, 1500);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderScanTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Digital Passport Scanner</h2>
        <p className="text-gray-600 mb-6">
          Securely scan and verify your passport using advanced OCR and biometric technology
        </p>
      </div>

      {!isScanning && !passportData && (
        <div className="bg-white rounded-xl shadow-soft p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Passport Image</h3>
            <p className="text-gray-600 mb-4">
              Take a clear photo of your passport's main page or upload an existing image
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {isScanning && (
        <div className="bg-white rounded-xl shadow-soft p-8">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: '1s' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Scanning Passport</h3>
            <p className="text-gray-600 mb-4">Processing document and extracting information...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{scanProgress}% Complete</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderVerifyTab = () => {
    if (!passportData) {
      return (
        <div className="bg-white rounded-xl shadow-soft p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Passport Data</h3>
          <p className="text-gray-600">Please scan a passport first to view verification results.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Passport Information */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-start space-x-6">
            <img 
              src={passportData.photo} 
              alt="Passport photo" 
              className="w-24 h-30 object-cover rounded border-2 border-gray-200"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-xl font-bold text-gray-800">{passportData.fullName}</h3>
                {passportData.isVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Passport Number:</span>
                  <p className="font-medium">{passportData.passportNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500">Nationality:</span>
                  <p className="font-medium">{passportData.nationality}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth:</span>
                  <p className="font-medium">{new Date(passportData.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Expiry Date:</span>
                  <p className="font-medium">{new Date(passportData.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{passportData.verificationScore}%</div>
              <div className="text-sm text-gray-500">Verification Score</div>
            </div>
          </div>
        </div>

        {/* Verification Results */}
        {verificationResult && (
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Verification Results</h4>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(verificationResult.riskLevel)}`}>
                Risk Level: {verificationResult.riskLevel.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">
                Confidence: {verificationResult.confidence}%
              </div>
            </div>

            {verificationResult.issues.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-red-600 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Issues Found
                </h5>
                <ul className="space-y-1">
                  {verificationResult.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {verificationResult.recommendations.length > 0 && (
              <div>
                <h5 className="font-medium text-blue-600 mb-2">Recommendations</h5>
                <ul className="space-y-1">
                  {verificationResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Biometric Data */}
        {passportData.biometricData && (
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Biometric Verification</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Face Recognition Match</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${passportData.biometricData.faceMatch}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{passportData.biometricData.faceMatch}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVisaTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Visa Information</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Globe className="w-4 h-4" />
          <span>Check Visa Requirements</span>
        </button>
      </div>

      {visaData.map((visa) => (
        <div key={visa.id} className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">{visa.visaType}</h4>
              <p className="text-gray-600">{visa.country}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              visa.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {visa.isValid ? 'Valid' : 'Expired'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-500">Issue Date:</span>
              <p className="font-medium">{new Date(visa.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Expiry Date:</span>
              <p className="font-medium">{new Date(visa.expiryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Entry Type:</span>
              <p className="font-medium capitalize">{visa.entryType}</p>
            </div>
            <div>
              <span className="text-gray-500">Max Stay:</span>
              <p className="font-medium">{visa.maxStayDuration}</p>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-gray-500 text-sm">Purpose:</span>
            <p className="font-medium">{visa.purpose}</p>
          </div>

          {visa.restrictions && (
            <div>
              <span className="text-gray-500 text-sm">Restrictions:</span>
              <ul className="mt-1 space-y-1">
                {visa.restrictions.map((restriction, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification History</h3>
      <div className="space-y-4">
        {[
          { date: '2024-09-08', action: 'Passport Scanned', status: 'success', location: 'Current Location' },
          { date: '2024-08-15', action: 'Visa Verification', status: 'success', location: 'France Border' },
          { date: '2024-07-22', action: 'Document Update', status: 'success', location: 'Embassy' }
        ].map((entry, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{entry.action}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{entry.date}</span>
                <span>•</span>
                <span>{entry.location}</span>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Digital Passport & Visa Verification</h1>
            <p className="text-blue-100">Secure, fast, and reliable document verification</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-soft mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'scan', label: 'Scan Document', icon: Scan },
            { key: 'verify', label: 'Verification', icon: CheckCircle },
            { key: 'visa', label: 'Visa Status', icon: Globe },
            { key: 'history', label: 'History', icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'scan' && renderScanTab()}
      {activeTab === 'verify' && renderVerifyTab()}
      {activeTab === 'visa' && renderVisaTab()}
      {activeTab === 'history' && renderHistoryTab()}
    </div>
  );
};

export default PassportVerificationSystem;
