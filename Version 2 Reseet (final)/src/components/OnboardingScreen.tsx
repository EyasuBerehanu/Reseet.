import React, { useState } from 'react';
import { Button } from './ui/button';
import { Receipt, FolderOpen, Scan, ArrowRight } from 'lucide-react';
import emptyBinImage from 'figma:asset/75ee92caa4397adaa3b4d0fc72642bbc45df3712.png';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Logo from '../imports/Logo1-33-381';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface OnboardingScreenProps {
  onComplete: (name: string) => void;
}

// Mock user database - in production, this would be a real database
const mockUserDatabase: { [email: string]: { name: string; password: string } } = {};

const steps = [
  {
    id: 1,
    title: 'Meet your all-in-one receipt companion.',
    description: 'Scan any receipt, extract the details, and keep everything neatly organized.',
    icon: Receipt,
  },
  {
    id: 2,
    title: 'Scan & Digitize',
    description: 'Take photos of receipts to create clean digital cards with smart categorization',
    icon: Scan,
  },
  {
    id: 3,
    title: 'Drag to Organize',
    description: 'Simply drag receipt cards into category bins to keep everything organized',
    icon: FolderOpen,
  },
  {
    id: 4,
    title: 'Track Write-Offs',
    description: 'Each receipt shows its tax deduction likelihood with a color-coded score',
    icon: Receipt,
  },
  {
    id: 5,
    title: 'Create Your Account',
    description: 'Sign up to start organizing your receipts',
    icon: Receipt,
  },
  {
    id: 6,
    title: 'Welcome Back',
    description: 'Log in to access your receipts',
    icon: Receipt,
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false);
  const isLastStep = currentStep === steps.length - 1 || (isLoginMode && currentStep === 5);
  const isSignUpStep = currentStep === 4;
  const isLoginStep = currentStep === 5 && isLoginMode;
  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    setError('');
    
    if (isSignUpStep) {
      // Validate sign-up form
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      
      // Check if email already exists
      if (mockUserDatabase[email]) {
        setError('An account with this email already exists');
        return;
      }
      
      // Check password length
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      // Create account
      mockUserDatabase[email] = { name, password };
      onComplete(name);
    } else if (isLoginStep) {
      // Validate login form
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      
      // Check if account exists
      const user = mockUserDatabase[email];
      if (!user) {
        setError('No account found with this email');
        return;
      }
      
      // Check password
      if (user.password !== password) {
        setError('Incorrect password');
        return;
      }
      
      // Login successful
      onComplete(user.name);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    // Skip takes you to the sign-up/login step, not bypass it
    setCurrentStep(4);
  };
  
  const handleSwitchToLogin = () => {
    setIsLoginMode(true);
    setCurrentStep(5);
    setError('');
  };
  
  const handleSwitchToSignUp = () => {
    setIsLoginMode(false);
    setCurrentStep(4);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip button - only show in orientation steps, not on auth steps */}
      {currentStep < 4 && (
        <div className="absolute top-12 right-4">
          <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
            Skip
          </Button>
        </div>
      )}
      
      {/* Back button - show on login screen */}
      {isLoginStep && (
        <div className="absolute top-12 left-4">
          <Button variant="ghost" onClick={handleSwitchToSignUp} className="text-gray-500">
            Back
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto">
        {isSignUpStep || isLoginStep ? (
          // Sign-up or Login form
          <>
            {/* Logo */}
            <div className="w-[161.853px] h-[125.937px] flex items-center justify-center mb-12">
              <Logo />
            </div>

            {/* Text */}
            <h2 className="text-[rgb(0,0,0)] text-center mb-4 text-[32px] font-bold leading-[1]">{step.title}</h2>
            <p className="text-[rgb(0,0,0)] text-center mb-8 max-w-sm text-[20px] leading-[1.2]">
              {step.description}
            </p>

            {/* Error message */}
            {error && (
              <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Auth form */}
            <div className="w-full space-y-6 mb-12">
              {isSignUpStep && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#558E00] focus:ring-[#558E00]"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-[#558E00] focus:ring-[#558E00]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-[#558E00] focus:ring-[#558E00]"
                />
              </div>
            </div>

            {/* Progress dots - only show on sign up, not login */}
            {isSignUpStep && (
              <div className="flex gap-2 mb-12">
                {steps.slice(0, 5).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-[#558E00]'
                        : index < currentStep
                        ? 'w-2 bg-[#558E00]/50'
                        : 'w-2 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Visual */}
            <div className="mb-12">
              {currentStep === 2 ? (
                // Show category bin for the organize step
                <div className="w-32 h-32 flex items-center justify-center">
                  <ImageWithFallback
                    src={emptyBinImage}
                    alt="Category"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : currentStep === 3 ? (
                // Show score bar for write-off step
                <div className="w-64 space-y-3">
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
                      style={{
                        width: '85%',
                        backgroundColor: '#558E00',
                      }}
                    />
                  </div>
                  <p className="text-center text-gray-600">High likelihood</p>
                </div>
              ) : (
                // Show logo for other steps
                <div className="w-[161.853px] h-[125.937px] flex items-center justify-center">
                  <Logo />
                </div>
              )}
            </div>

            {/* Text */}
            <h2 className="text-[rgb(0,0,0)] text-center mb-4 text-[32px] font-bold leading-[1]">{step.title}</h2>
            <p className="text-[rgb(0,0,0)] text-center mb-12 max-w-sm text-[20px] leading-[1.2]">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex gap-2 mb-12">
              {steps.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-[#558E00]'
                      : index < currentStep
                      ? 'w-2 bg-[#558E00]/50'
                      : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-8 pb-12 max-w-md mx-auto w-full">
        {isSignUpStep ? (
          <div className="space-y-4">
            <Button
              onClick={handleNext}
              className="w-full rounded-full py-7"
              size="lg"
              disabled={!name || !email || !password}
            >
              Create Account
            </Button>
            <p className="text-center text-gray-500 text-sm">
              Already have an account?{' '}
              <button
                onClick={handleSwitchToLogin}
                className="text-[#558E00] hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        ) : isLoginStep ? (
          <div className="space-y-4">
            <Button
              onClick={handleNext}
              className="w-full rounded-full py-7"
              size="lg"
              disabled={!email || !password}
            >
              Log In
            </Button>
            <p className="text-center text-gray-500 text-sm">
              Don't have an account?{' '}
              <button
                onClick={handleSwitchToSignUp}
                className="text-[#558E00] hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full rounded-full py-7 text-[20px]"
            size="lg"
          >
            {currentStep === 3 ? 'Continue' : 'Next'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
