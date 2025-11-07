import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { login } from '@/utils/authApi';
import { useToast } from '@/components/ui/use-toast';
import { isValidPhoneNumber } from 'react-phone-number-input';
import * as RPNInput from 'react-phone-number-input';
import Layout from '@/components/web/WebLayout';
import Logo from '@/components/react-svg/logo';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton';
import GooglePhoneNumberModal from '@/components/auth/GooglePhoneNumberModal';
import AppleOAuthButton from '@/components/auth/AppleOAuthButton';
import ApplePhoneNumberModal from '@/components/auth/ApplePhoneNumberModal';

const loginSchema = z.object({
  phone_number: z.string().refine(
    (value) => isValidPhoneNumber(value || ''),
    { message: 'Please enter a valid phone number' }
  ),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<any>(null);
  const [googleIdToken, setGoogleIdToken] = useState<string>('');
  const [showApplePhoneModal, setShowApplePhoneModal] = useState(false);
  const [appleProfile, setAppleProfile] = useState<any>(null);
  const [appleIdToken, setAppleIdToken] = useState<string>('');
  
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone_number: '',
      password: '',
    },
  });

  // Set default phone number only on initial mount
  useEffect(() => {
    form.setValue('phone_number', '+61');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await login({
        emailOrPhone: data.phone_number,
        password: data.password,
      });
      
      // LoginResponse includes accessToken and user
      authLogin(response.accessToken, response.user);
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      
      // Check if user came from booking flow or another page
      const returnUrl = localStorage.getItem('auth_return_url');
      if (returnUrl) {
        localStorage.removeItem('auth_return_url');
        navigate(returnUrl);
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid phone number or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Sign In - Fadelines Barber Shop</title>
        <meta name="description" content="Sign in to your Fadelines account to manage bookings and track appointments." />
      </Helmet>

      <section className="min-h-screen bg-[#010401] py-20">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center mb-8">
            <Logo className="w-32 h-auto mx-auto mb-6 opacity-90" />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">
              Sign in to book appointments and manage your account
            </p>
          </div>

          <div className="bg-theme-card border border-theme-border rounded-xl p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          value={field.value as RPNInput.Value}
                          className="bg-stone-950/50 [&_input]:border-stone-600 [&_input]:hover:border-stone-500 [&_input]:focus:border-[#04C600] [&_input]:transition-colors [&_input]:h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 bg-transparent border-stone-700"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#036901] hover:bg-[#025501] py-6 text-lg font-medium"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-[#04C600] hover:text-[#03A000] font-medium"
                >
                  Create Account
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-theme-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-theme-card text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <GoogleOAuthButton
                  onSuccess={() => {
                    toast({
                      title: "Success",
                      description: "You have successfully logged in with Google!"
                    });
                    const returnUrl = localStorage.getItem('auth_return_url');
                    if (returnUrl) {
                      localStorage.removeItem('auth_return_url');
                      navigate(returnUrl);
                    } else {
                      navigate('/');
                    }
                  }}
                  onError={(error) => {
                    toast({
                      title: "Error",
                      description: error,
                      variant: "destructive"
                    });
                  }}
                  onNeedPhoneNumber={(profile, idToken) => {
                    setGoogleProfile(profile);
                    setGoogleIdToken(idToken);
                    setShowPhoneModal(true);
                  }}
                />
                
                <AppleOAuthButton
                  onSuccess={() => {
                    toast({
                      title: "Success",
                      description: "You have successfully logged in with Apple!"
                    });
                    const returnUrl = localStorage.getItem('auth_return_url');
                    if (returnUrl) {
                      localStorage.removeItem('auth_return_url');
                      navigate(returnUrl);
                    } else {
                      navigate('/');
                    }
                  }}
                  onError={(error) => {
                    toast({
                      title: "Error",
                      description: error,
                      variant: "destructive"
                    });
                  }}
                  onNeedPhoneNumber={(profile, idToken) => {
                    setAppleProfile(profile);
                    setAppleIdToken(idToken);
                    setShowApplePhoneModal(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Google Phone Number Modal */}
      <GooglePhoneNumberModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        profile={googleProfile}
        idToken={googleIdToken}
        onSuccess={() => {
          setShowPhoneModal(false);
          toast({
            title: "Success",
            description: "You have successfully logged in with Google!"
          });
          const returnUrl = localStorage.getItem('auth_return_url');
          if (returnUrl) {
            localStorage.removeItem('auth_return_url');
            navigate(returnUrl);
          } else {
            navigate('/');
          }
        }}
      />

      {/* Apple Phone Number Modal */}
      <ApplePhoneNumberModal
        isOpen={showApplePhoneModal}
        onClose={() => setShowApplePhoneModal(false)}
        profile={appleProfile}
        idToken={appleIdToken}
        onSuccess={() => {
          setShowApplePhoneModal(false);
          toast({
            title: "Success",
            description: "You have successfully logged in with Apple!"
          });
          const returnUrl = localStorage.getItem('auth_return_url');
          if (returnUrl) {
            localStorage.removeItem('auth_return_url');
            navigate(returnUrl);
          } else {
            navigate('/');
          }
        }}
      />
    </Layout>
  );
}