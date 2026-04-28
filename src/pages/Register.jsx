import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, ChevronDown, Search, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ReactCountryFlag from "react-country-flag";

// All country data with flags and dial codes
const countries = [
  { code: 'ET', name: 'Ethiopia', dialCode: '+251' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
  { code: 'TR', name: 'Turkey', dialCode: '+90' },
  { code: 'KR', name: 'South Korea', dialCode: '+82' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'TH', name: 'Thailand', dialCode: '+66' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84' },
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { code: 'IR', name: 'Iran', dialCode: '+98' },
  { code: 'IL', name: 'Israel', dialCode: '+972' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'NO', name: 'Norway', dialCode: '+47' },
  { code: 'FI', name: 'Finland', dialCode: '+358' },
  { code: 'DK', name: 'Denmark', dialCode: '+45' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'BE', name: 'Belgium', dialCode: '+32' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'PL', name: 'Poland', dialCode: '+48' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420' },
  { code: 'HU', name: 'Hungary', dialCode: '+36' },
  { code: 'RO', name: 'Romania', dialCode: '+40' },
  { code: 'GR', name: 'Greece', dialCode: '+30' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'IE', name: 'Ireland', dialCode: '+353' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'PE', name: 'Peru', dialCode: '+51' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64' },
  // Add more African countries
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250' },
  { code: 'SD', name: 'Sudan', dialCode: '+249' },
  { code: 'SO', name: 'Somalia', dialCode: '+252' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213' },
  { code: 'MA', name: 'Morocco', dialCode: '+212' },
  { code: 'TN', name: 'Tunisia', dialCode: '+216' },
  { code: 'LY', name: 'Libya', dialCode: '+218' },
];

// Validation utility functions
const validators = {
  required: (message) => ({
    $validator: (value) => {
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return value !== undefined && value !== null && value !== '';
    },
    $message: message
  }),
  
  email: (message) => ({
    $validator: (value) => {
      if (!value || value.trim() === '') return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    $message: message
  }),
  
  minLength: (min, message) => ({
    $validator: (value) => {
      if (!value || value.trim() === '') return true;
      return value.length >= min;
    },
    $message: message
  }),
  
  phone: (message) => ({
    $validator: (value) => {
      if (!value || value.trim() === '') return true;
      const phoneRegex = /^[0-9]{8,15}$/;
      return phoneRegex.test(value.replace(/\D/g, ''));
    },
    $message: message
  }),
  
  sameAs: (fieldToCompare, message) => ({
    $validator: (value, formData) => {
      if (!value) return true;
      return value === formData[fieldToCompare];
    },
    $message: message
  }),
  
  passwordStrength: (message) => ({
    $validator: (value) => {
      if (!value || value.trim() === '') return true;
      
      // Check password strength requirements
      const hasMinLength = value.length >= 8;
      const hasLowerCase = /[a-z]/.test(value);
      const hasUpperCase = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
      
      return hasMinLength && hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;
    },
    $message: message
  })
};

// Password strength checker
const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, strength: 'Empty', color: 'gray' };
  
  let score = 0;
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // Calculate score
  Object.values(requirements).forEach(req => {
    if (req) score++;
  });

  // Determine strength level
  let strength, color;
  if (score === 5) {
    strength = 'Very Strong';
    color = 'green';
  } else if (score >= 4) {
    strength = 'Strong';
    color = 'lime';
  } else if (score >= 3) {
    strength = 'Medium';
    color = 'yellow';
  } else if (score >= 2) {
    strength = 'Weak';
    color = 'orange';
  } else {
    strength = 'Very Weak';
    color = 'red';
  }

  return {
    score,
    strength,
    color,
    requirements
  };
};

// Password Requirements Component
const PasswordRequirements = ({ password, isAmharic }) => {
  const strength = checkPasswordStrength(password);
  
  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg">
      {/* Password Strength Indicator */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isAmharic ? 'የይለፍ ቃል ጥንካሬ' : 'Password strength'}:
          </span>
          <span className={`text-sm font-bold ${
            strength.color === 'red' ? 'text-red-600 dark:text-red-400' :
            strength.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
            strength.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
            strength.color === 'lime' ? 'text-lime-600 dark:text-lime-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {strength.strength}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.color === 'red' ? 'bg-red-500 dark:bg-red-400' :
              strength.color === 'orange' ? 'bg-orange-500 dark:bg-orange-400' :
              strength.color === 'yellow' ? 'bg-yellow-500 dark:bg-yellow-400' :
              strength.color === 'lime' ? 'bg-lime-500 dark:bg-lime-400' :
              'bg-green-500 dark:bg-green-400'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1.5">
        <div className="flex items-center">
          {strength.requirements.length ? (
            <CheckCircle size={14} className="text-green-500 dark:text-green-400 mr-2" />
          ) : (
            <XCircle size={14} className="text-gray-400 dark:text-gray-500 mr-2" />
          )}
          <span className={`text-xs ${strength.requirements.length ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isAmharic ? 'ቢያንስ 8 ቁምፊ' : 'At least 8 characters'}
          </span>
        </div>
        
        <div className="flex items-center">
          {strength.requirements.lowercase ? (
            <CheckCircle size={14} className="text-green-500 dark:text-green-400 mr-2" />
          ) : (
            <XCircle size={14} className="text-gray-400 dark:text-gray-500 mr-2" />
          )}
          <span className={`text-xs ${strength.requirements.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isAmharic ? 'አንድ ትንሽ ፊደል' : 'One lowercase letter'}
          </span>
        </div>
        
        <div className="flex items-center">
          {strength.requirements.uppercase ? (
            <CheckCircle size={14} className="text-green-500 dark:text-green-400 mr-2" />
          ) : (
            <XCircle size={14} className="text-gray-400 dark:text-gray-500 mr-2" />
          )}
          <span className={`text-xs ${strength.requirements.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isAmharic ? 'አንድ ትልቅ ፊደል' : 'One uppercase letter'}
          </span>
        </div>
        
        <div className="flex items-center">
          {strength.requirements.number ? (
            <CheckCircle size={14} className="text-green-500 dark:text-green-400 mr-2" />
          ) : (
            <XCircle size={14} className="text-gray-400 dark:text-gray-500 mr-2" />
          )}
          <span className={`text-xs ${strength.requirements.number ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isAmharic ? 'አንድ ቁጥር' : 'One number'}
          </span>
        </div>
        
        <div className="flex items-center">
          {strength.requirements.specialChar ? (
            <CheckCircle size={14} className="text-green-500 dark:text-green-400 mr-2" />
          ) : (
            <XCircle size={14} className="text-gray-400 dark:text-gray-500 mr-2" />
          )}
          <span className={`text-xs ${strength.requirements.specialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {isAmharic ? 'አንድ ልዩ ቁምፊ' : 'One special character'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Validation composable
const useValidation = (validations, formData) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (fieldName, value) => {
    const fieldValidations = validations[fieldName];
    if (!fieldValidations) return [];

    const fieldErrors = [];
    
    for (const validation of fieldValidations) {
      if (!validation.$validator(value, formData)) {
        fieldErrors.push(validation.$message);
      }
    }
    
    return fieldErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validations).forEach(fieldName => {
      const value = formData[fieldName];
      const fieldErrors = validateField(fieldName, value);
      
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors[0];
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const value = formData[fieldName];
    const fieldErrors = validateField(fieldName, value);
    
    if (fieldErrors.length > 0) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldErrors[0] }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const resetValidation = () => {
    setErrors({});
    setTouched({});
  };

  return {
    errors,
    setErrors,
    touched,
    validateForm,
    handleBlur,
    resetValidation
  };
};

// Country Select Component with ReactCountryFlag
const CountrySelect = ({ 
  selectedCountry, 
  onSelect, 
  isOpen, 
  setIsOpen 
}) => {
  const dropdownRef = useRef(null);
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';
  const [searchTerm, setSearchTerm] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Filter countries based on search
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
      >
        <div className="flex items-center space-x-2">
          <ReactCountryFlag
            countryCode={selectedCountry.code}
            svg
            style={{
              width: '24px',
              height: '18px',
              borderRadius: '2px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
            title={selectedCountry.name}
          />
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{selectedCountry.dialCode}</span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {selectedCountry.code}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''} text-neutral-600 dark:text-neutral-400`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-80 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl dark:shadow-neutral-900/50 max-h-96 overflow-hidden"
        >
          {/* Search input */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAmharic ? 'አገር ይፈልጉ...' : 'Search country...'}
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-neutral-700 dark:text-white"
                autoFocus
              />
            </div>
          </div>

          {/* Country list */}
          <div className="overflow-y-auto max-h-72">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onSelect(country);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 ${
                    selectedCountry.code === country.code 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ReactCountryFlag
                      countryCode={country.code}
                      svg
                      style={{
                        width: '28px',
                        height: '21px',
                        borderRadius: '2px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                      title={country.name}
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{country.name}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {country.dialCode}
                      </span>
                    </div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  {isAmharic ? 'አገር አልተገኘም' : 'No country found'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Register = () => {
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default: Ethiopia
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  // Update phone number with only digits
  const updatePhoneNumber = (value) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      phoneNumber: numericValue
    }));
  };

  // Define validation rules
  const validationRules = {
    firstName: [
      validators.required(isAmharic ? 'ስም ያስፈልጋል' : 'First name is required')
    ],
    
    lastName: [
      validators.required(isAmharic ? 'የአባት ስም ያስፈልጋል' : 'Last name is required')
    ],
    
    email: [
      validators.required(isAmharic ? 'ኢሜይል ያስፈልጋል' : 'Email is required'),
      validators.email(isAmharic ? 'ትክክለኛ ኢሜይል ያስገቡ' : 'Please enter a valid email')
    ],
    
    phoneNumber: [
      validators.required(isAmharic ? 'ስልክ ቁጥር ያስፈልጋል' : 'Phone number is required'),
      validators.phone(isAmharic ? 'ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number (8-15 digits)')
    ],
    
    password: [
      validators.required(isAmharic ? 'የይለፍ ቃል ያስፈልጋል' : 'Password is required'),
      validators.passwordStrength(isAmharic ? 'የይለፍ ቃል ጠንካራ መሆን አለበት' : 'Password must be strong')
    ],
    
    confirmPassword: [
      validators.required(isAmharic ? 'የይለፍ ቃል ማረጋገጫ ያስፈልጋል' : 'Password confirmation is required'),
      validators.sameAs('password', isAmharic ? 'የይለፍ ቃሎች አይጣጣሙም' : 'Passwords do not match')
    ]
  };

  const {
    errors,
    setErrors,
    touched,
    validateForm,
    handleBlur,
    resetValidation
  } = useValidation(validationRules, formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      updatePhoneNumber(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Show password requirements when user starts typing in password field
    if (name === 'password' && value.length > 0) {
      setShowPasswordRequirements(true);
    } else if (name === 'password' && value.length === 0) {
      setShowPasswordRequirements(false);
    }
    
    // Clear error when user starts typing and field has been touched
    if (touched[name] && errors[name]) {
      const newFormData = { ...formData, [name]: value };
      const fieldErrors = validationRules[name] 
        ? validationRules[name].filter(rule => !rule.$validator(value, newFormData))
        : [];
      
      if (fieldErrors.length === 0 && setErrors) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    Object.keys(formData).forEach(field => {
      handleBlur(field);
    });
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementsByName(firstErrorField)[0];
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
          element.focus();
        }
      }
      return;
    }

    // Check password strength before submitting
    const passwordStrength = checkPasswordStrength(formData.password);
    if (passwordStrength.score < 3) {
      showToast(
        isAmharic ? 'እባክዎ የበለጠ ጠንካራ የይለፍ ቃል ይጠቀሙ' : 'Please use a stronger password',
        'error'
      )
      return;
    }

    setLoading(true);

    try {
      // Format full phone number with country code
      const fullPhoneNumber = `${selectedCountry.dialCode}${formData.phoneNumber}`;

      const registerResult = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: fullPhoneNumber,
        password: formData.password,
      });

      if (!registerResult.success) {
        if (registerResult.status === 409) {
          showToast(
            isAmharic
              ? 'ኢሜይል ወይም ስልክ ቁጥር ቀድሞ ተመዝግቧል'
              : 'Email or phone number is already registered',
            'error'
          )
          return
        }
        throw new Error(registerResult.error || 'Registration failed');
      }
      
      // Show success message
      showToast(
        isAmharic ? 'ተመዝግበዋል! ወደ መገልገያዎ ይዛወራሉ...' : 'Registered successfully! Redirecting...',
        'success'
      )
      
      // Reset form and validation
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
      });
      resetValidation();
      setShowPasswordRequirements(false);
      
      // Redirect based on actual role from backend
      if (registerResult.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      showToast(
        isAmharic
          ? (error?.message || 'የመመዝገቢያ ስህተት ተከስቷል')
          : (error?.message || 'Registration error occurred'),
        'error'
      )
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get field error state
  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  // Helper function for input classes
  const getInputClasses = (fieldName) => {
    const baseClasses = "w-full px-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-neutral-700 dark:text-neutral-100 transition-all duration-200";
    
    if (getFieldError(fieldName)) {
      return `${baseClasses} border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-400`;
    } else if (touched[fieldName] && !errors[fieldName]) {
      return `${baseClasses} border-green-500 focus:ring-green-500 dark:border-green-500 dark:focus:ring-green-400`;
    } else {
      return `${baseClasses} border-neutral-300 dark:border-neutral-600`;
    }
  };

  // Helper function for input classes (side by side)
  const getInputClassesSide = (fieldName) => {
    const baseClasses = "w-full px-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-neutral-700 dark:text-neutral-100 transition-all duration-200";
    
    if (getFieldError(fieldName)) {
      return `${baseClasses} border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-400`;
    } else if (touched[fieldName] && !errors[fieldName]) {
      return `${baseClasses} border-green-500 focus:ring-green-500 dark:border-green-500 dark:focus:ring-green-400`;
    } else {
      return `${baseClasses} border-neutral-300 dark:border-neutral-600`;
    }
  };

  // Get full phone number for display
  const getFullPhoneNumber = () => {
    if (!formData.phoneNumber) return '';
    return `${selectedCountry.dialCode} ${formData.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`;
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 font-display">
            {isAmharic ? 'መለያ ይፍጠሩ' : 'Create Account'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            {isAmharic 
              ? 'የበዓል አገልግሎት ለማግኘት ይመዝገቡ' 
              : 'Sign up to access our wedding services'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name and Last Name - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                  {isAmharic ? 'ስም' : 'First Name'} *
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getFieldError('firstName') ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`} size={18} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('firstName')}
                    className={getInputClassesSide('firstName')}
                    placeholder={isAmharic ? 'ስምዎን ያስገቡ' : 'Enter your first name'}
                  />
                </div>
                {getFieldError('firstName') && (
                  <div className="flex items-center mt-1">
                    <AlertCircle size={14} className="text-red-500 dark:text-red-400 mr-1" />
                    <p className="text-red-500 dark:text-red-400 text-xs">{errors.firstName}</p>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                  {isAmharic ? 'የአባት ስም' : 'Last Name'} *
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getFieldError('lastName') ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`} size={18} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('lastName')}
                    className={getInputClassesSide('lastName')}
                    placeholder={isAmharic ? 'የአባት ስምዎን ያስገቡ' : 'Enter your last name'}
                  />
                </div>
                {getFieldError('lastName') && (
                  <div className="flex items-center mt-1">
                    <AlertCircle size={14} className="text-red-500 dark:text-red-400 mr-1" />
                    <p className="text-red-500 dark:text-red-400 text-xs">{errors.lastName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Email - Full Width */}
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                Email *
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getFieldError('email') ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={getInputClasses('email')}
                  placeholder={isAmharic ? 'ኢሜይልዎን ያስገቡ' : 'Enter your email'}
                />
              </div>
              {getFieldError('email') && (
                <div className="flex items-center mt-1">
                  <AlertCircle size={14} className="text-red-500 dark:text-red-400 mr-1" />
                  <p className="text-red-500 dark:text-red-400 text-xs">{errors.email}</p>
                </div>
              )}
            </div>

            {/* Phone Number with Country Flag Selector - Full Width */}
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} *
              </label>
              <div className="flex space-x-3">
                <div className="w-32">
                  <CountrySelect
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                    isOpen={isCountryOpen}
                    setIsOpen={setIsCountryOpen}
                  />
                </div>
                <div className="flex-1 relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getFieldError('phoneNumber') ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`} size={18} />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phoneNumber')}
                    className={`w-full px-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-neutral-700 dark:text-neutral-100 transition-all duration-200 ${
                      getFieldError('phoneNumber') 
                        ? 'border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-400' 
                        : touched.phoneNumber && !errors.phoneNumber && formData.phoneNumber
                        ? 'border-green-500 focus:ring-green-500 dark:border-green-500 dark:focus:ring-green-400'
                        : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                    placeholder={isAmharic ? 'ቁጥርዎን ያስገቡ' : 'Enter phone number'}
                  />
                </div>
              </div>
              {getFieldError('phoneNumber') && (
                <div className="flex items-center mt-1">
                  <AlertCircle size={14} className="text-red-500 dark:text-red-400 mr-1" />
                  <p className="text-red-500 dark:text-red-400 text-xs">{errors.phoneNumber}</p>
                </div>
              )}
              {touched.phoneNumber && !errors.phoneNumber && formData.phoneNumber && (
                <div className="flex items-center mt-1 text-green-600 dark:text-green-400">
                  <div className="w-4 h-4 flex items-center justify-center mr-1">✓</div>
                  <p className="text-xs">
                    {isAmharic ? 'ስልክ ቁጥር' : 'Phone number'}: 
                    <span className="font-semibold ml-1">{getFullPhoneNumber()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Password and Confirm Password - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                  {isAmharic ? 'የይለፍ ቃል' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getFieldError('password') ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`} size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    className={`${getInputClassesSide('password')} pr-10`}
                    placeholder={isAmharic ? 'የይለፍ ቃልዎን ያስገቡ' : 'Enter your password'}
                    onFocus={() => formData.password.length > 0 && setShowPasswordRequirements(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator - Full width below password */}
                {showPasswordRequirements && (
                  <div className="md:col-span-2">
                    <PasswordRequirements 
                      password={formData.password} 
                      isAmharic={isAmharic} 
                    />
                  </div>
                )}
                
                {getFieldError('password') && (
                  <div className="flex items-center mt-1">
                    <AlertCircle size={14} className="text-red-500 dark:text-red-400 mr-1" />
                    <p className="text-red-500 dark:text-red-400 text-xs">{errors.password}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                  {isAmharic ? 'የይለፍ ቃል አረጋግጥ' : 'Confirm Password'} *
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getFieldError('confirmPassword') ? 'text-red-500 dark:text-red-400' : 'text-neutral-400 dark:text-neutral-500'}`} size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={getInputClassesSide('confirmPassword')}
                    placeholder={isAmharic ? 'የይለፍ ቃልዎን እንደገና ያስገቡ' : 'Re-enter your password'}
                  />
                </div>
                {getFieldError('confirmPassword') && (
                  <div className="flex items-center mt-1">
                    <AlertCircle size={14} className="text-red-500 dark:text-red-400 mr-1" />
                    <p className="text-red-500 dark:text-red-400 text-xs">{errors.confirmPassword}</p>
                  </div>
                )}
                {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center mt-1 text-green-600 dark:text-green-400">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">✓</div>
                    <p className="text-xs">
                      {isAmharic ? 'የይለፍ ቃሎች ይጣጣማሉ' : 'Passwords match'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Status Summary */}
            {Object.keys(errors).length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-800 rounded-lg p-3"
              >
                <div className="flex items-start">
                  <AlertCircle size={18} className="text-red-500 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">
                      {isAmharic ? 'እባክዎ ስህተቶችን ያረጋግጡ' : 'Please check the following errors:'}
                    </p>
                    <ul className="text-red-600 dark:text-red-400 text-xs list-disc pl-4 space-y-1">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              whileHover={{ scale: Object.keys(errors).length === 0 ? 1.02 : 1 }}
              whileTap={{ scale: Object.keys(errors).length === 0 ? 0.98 : 1 }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-700 dark:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg dark:shadow-neutral-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isAmharic ? 'በመመዝገብ ላይ...' : 'Creating Account...'}
                </div>
              ) : (
                isAmharic ? 'መለያ ይፍጠሩ' : 'Create Account'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
              {isAmharic ? 'ቀድሞውኑ መለያ አለዎት?' : 'Already have an account?'}{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold">
                {isAmharic ? 'ግባ' : 'Sign in'}
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Register;