import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/ui';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^(?:254|\+254|0)[17]\d{8}$/, 'Enter a valid Kenyan phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

interface EmailAuthProps {
  mode: 'signin' | 'signup';
}

const EmailAuth: React.FC<EmailAuthProps> = ({ mode }) => {
  const { signInWithEmail, signUpWithEmail, loading, error } = useAuth();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: false },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSignIn = async (data: SignInFormData) => {
    await signInWithEmail(data.email, data.password, data.rememberMe);
  };

  const onSignUp = async (data: SignUpFormData) => {
    await signUpWithEmail(data.name, data.email, data.password, data.phone);
  };

  if (mode === 'signup') {
    return (
      <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
        <Input
          {...signUpForm.register('name')}
          label="Full Name"
          placeholder="John Doe"
          leftIcon={<User className="w-4 h-4" />}
          error={signUpForm.formState.errors.name?.message}
        />

        <Input
          {...signUpForm.register('email')}
          type="email"
          label="Email Address"
          placeholder="john@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={signUpForm.formState.errors.email?.message}
        />

        <Input
          {...signUpForm.register('phone')}
          type="tel"
          label="Phone Number"
          placeholder="0712 345 678"
          leftIcon={<Phone className="w-4 h-4" />}
          error={signUpForm.formState.errors.phone?.message}
          hint="Your M-Pesa registered number"
        />

        <Input
          {...signUpForm.register('password')}
          type="password"
          label="Password"
          placeholder="Create a strong password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={signUpForm.formState.errors.password?.message}
        />

        <Input
          {...signUpForm.register('confirmPassword')}
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={signUpForm.formState.errors.confirmPassword?.message}
        />

        {error && (
          <p className="text-sm text-terra bg-terra/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <Button
          type="submit"
          fullWidth
          loading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
      <Input
        {...signInForm.register('email')}
        type="email"
        label="Email Address"
        placeholder="john@example.com"
        leftIcon={<Mail className="w-4 h-4" />}
        error={signInForm.formState.errors.email?.message}
      />

      <Input
        {...signInForm.register('password')}
        type="password"
        label="Password"
        placeholder="Enter your password"
        leftIcon={<Lock className="w-4 h-4" />}
        error={signInForm.formState.errors.password?.message}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...signInForm.register('rememberMe')}
            className="w-4 h-4 rounded border-border text-amber focus:ring-amber"
          />
          <span className="text-sm text-muted">Remember me</span>
        </label>
        <a href="/forgot-password" className="text-sm text-amber hover:underline">
          Forgot password?
        </a>
      </div>

      {error && (
        <p className="text-sm text-terra bg-terra/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <Button
        type="submit"
        fullWidth
        loading={loading}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Sign In
      </Button>
    </form>
  );
};

export default EmailAuth;
