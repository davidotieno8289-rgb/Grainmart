import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/ui';

const phoneSchema = z.object({
  phone: z.string().regex(/^(?:254|\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan phone number'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

const PhoneAuth: React.FC = () => {
  const { sendPhoneOtp, verifyPhoneOtp, confirmationResult, loading, error } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp' && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  const onSubmitPhone = async (data: PhoneFormData) => {
    let phone = data.phone;
    if (phone.startsWith('0')) {
      phone = '+254' + phone.slice(1);
    } else if (phone.startsWith('254')) {
      phone = '+' + phone;
    } else if (!phone.startsWith('+')) {
      phone = '+254' + phone;
    }
    
    await sendPhoneOtp(phone, 'recaptcha-container');
    if (!error) {
      setStep('otp');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    await verifyPhoneOtp(otpCode);
  };

  if (step === 'otp') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7 text-green" />
          </div>
          <h3 className="font-display font-semibold text-xl text-dark">Enter OTP</h3>
          <p className="text-sm text-muted mt-1">
            We've sent a 6-digit code to your phone
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { otpRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-semibold border border-border rounded-lg focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber-pale"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-terra">{error}</p>
        )}

        <Button
          fullWidth
          loading={loading}
          onClick={() => handleVerifyOtp(otp.join(''))}
          disabled={otp.some(d => !d)}
        >
          Verify OTP
        </Button>

        <button
          type="button"
          onClick={() => setStep('phone')}
          className="w-full text-center text-sm text-muted hover:text-amber transition-colors"
        >
          Change phone number
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitPhone)} className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-amber-pale rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-7 h-7 text-amber" />
        </div>
        <h3 className="font-display font-semibold text-xl text-dark">Sign in with Phone</h3>
        <p className="text-sm text-muted mt-1">
          Enter your M-Pesa registered number
        </p>
      </div>

      <Input
        {...register('phone')}
        type="tel"
        placeholder="0712 345 678"
        leftIcon={<span className="text-sm text-muted">+254</span>}
        error={errors.phone?.message}
      />

      <Button
        type="submit"
        fullWidth
        loading={loading}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Send OTP
      </Button>

      <div id="recaptcha-container" />

      <p className="text-center text-xs text-muted">
        We'll send a one-time password to this number
      </p>
    </form>
  );
};

export default PhoneAuth;
