'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Card } from '@/components/common/Cards';
import { registrationSchema } from '@/utils/validation';
import { Eye, EyeOff, Database } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error: authError, isDemoMode, user } = useUnifiedAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'support' as 'admin' | 'partner' | 'support',
  });
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-redirect after successful registration
  useEffect(() => {
    if (registrationSuccess && user) {
      // Wait 2 seconds before redirecting to show the success message
      const redirectTimer = setTimeout(() => {
        if (user.role === 'admin') {
          router.push('/admin/home');
        } else if (user.role === 'partner') {
          router.push('/merchants');
        } else {
          router.push('/customers');
        }
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [registrationSuccess, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');
    setFieldErrors({});

    try {
      // Validate form data
      const validated = registrationSchema.parse(formData);

      // Call register method with role (role is handled by unified hook)
      await register(
        validated.firstName,
        validated.lastName,
        validated.email,
        validated.phoneNumber,
        validated.password,
        validated.role
      );

      // Show success message
      setSuccessEmail(validated.email);
      setRegistrationSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        role: 'support',
      });
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        // Zod validation errors
        const errors: Record<string, string> = {};
        err.errors.forEach((error: any) => {
          const path = error.path[0] as string;
          errors[path] = error.message;
        });
        setFieldErrors(errors);
      } else if (err.message) {
        setValidationError(err.message);
      } else {
        setValidationError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4">
      {/* Background blur effect */}
      <div className="absolute inset-0 backdrop-blur-3xl opacity-10" />

      {/* Registration Card */}
      <Card className="w-full max-w-md relative z-10">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
            <Database size={16} className="text-yellow-600" />
            <p className="text-yellow-700 text-xs font-semibold">📱 Demo Mode (localStorage)</p>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">AD</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-sm text-gray-600 mt-2">ADJIL ADMIN PORTAL</p>
        </div>

        {/* Error Messages */}
        {(authError || validationError) && !registrationSuccess && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{authError || validationError}</p>
          </div>
        )}

        {/* Success Message */}
        {registrationSuccess && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-green-800 font-semibold">Registration Successful!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    Welcome to Adjil Admin Portal. You are now logged in as <strong>{user?.role}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-800 font-semibold text-sm mb-2">You have been automatically redirected:</h4>
              <p className="text-blue-700 text-sm">
                {user?.role === 'admin' && '👨‍💼 Admin Dashboard - Full system access'}
                {user?.role === 'partner' && '🏪 Merchant Panel - View and manage merchant services'}
                {user?.role === 'support' && '📞 Customer Support - Assist customers'}
              </p>
            </div>

            <button
              onClick={() => {
                // Redirect based on user role
                if (user) {
                  if (user.role === 'admin') {
                    router.push('/admin/home');
                  } else if (user.role === 'partner') {
                    router.push('/merchants');
                  } else {
                    router.push('/customers');
                  }
                } else {
                  router.push('/login');
                }
              }}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              {user ? `Go to ${user.role === 'admin' ? 'Dashboard' : user.role === 'partner' ? 'Merchant Panel' : 'Support'}` : 'Back to Login'}
            </button>
          </div>
        )}

        {/* Registration Form */}
        {!registrationSuccess && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className={`w-full mt-1 px-4 py-2 rounded-lg border bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                fieldErrors.firstName ? 'border-red-500' : 'border-white/20'
              }`}
              disabled={loading}
            />
            {fieldErrors.firstName && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className={`w-full mt-1 px-4 py-2 rounded-lg border bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                fieldErrors.lastName ? 'border-red-500' : 'border-white/20'
              }`}
              disabled={loading}
            />
            {fieldErrors.lastName && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john.doe@adjil.com"
              className={`w-full mt-1 px-4 py-2 rounded-lg border bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                fieldErrors.email ? 'border-red-500' : 'border-white/20'
              }`}
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1 234 567 8900"
              className={`w-full mt-1 px-4 py-2 rounded-lg border bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                fieldErrors.phoneNumber ? 'border-red-500' : 'border-white/20'
              }`}
              disabled={loading}
            />
            {fieldErrors.phoneNumber && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              User Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, role: e.target.value as 'admin' | 'partner' | 'support' }));
                setValidationError('');
              }}
              className="w-full mt-1 px-4 py-2 rounded-lg border border-white/20 bg-white/20 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            >
              <option value="support">Support Staff</option>
              <option value="partner">Partner/Merchant</option>
              <option value="admin">Administrator</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              {formData.role === 'admin' && '👨‍💼 Full system access and management capabilities'}
              {formData.role === 'partner' && '🏪 Access to merchant panel and transaction overview'}
              {formData.role === 'support' && '📞 Customer support and basic transaction viewing'}
            </p>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full mt-1 px-4 py-2 pr-10 rounded-lg border bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  fieldErrors.password ? 'border-red-500' : 'border-white/20'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Min 8 characters, 1 uppercase, 1 number
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full mt-1 px-4 py-2 pr-10 rounded-lg border bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-white/20'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                disabled={loading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        )}

        {/* Login Link */}
        {!registrationSuccess && (
        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
        )}

        {/* Demo Mode Info */}
        {isDemoMode && !registrationSuccess && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            <p className="font-semibold mb-2">Demo Mode:</p>
            <p>Testing locally? New users are saved to localStorage and can log in right away.</p>
            <Link
              href="/admin/local-db"
              className="block mt-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Manage Database →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
