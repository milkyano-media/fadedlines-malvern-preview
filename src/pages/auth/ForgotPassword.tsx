import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/web/WebLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Phone, ChevronLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { forgotPassword } from '@/utils/authApi';

const phoneSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  const normalizePhoneNumber = (input: string): string => {
    const trimmed = input.trim();
    
    // Already has + prefix
    if (trimmed.startsWith('+')) {
      return trimmed;
    }
    
    // 11 digits starting with 61 (Australian mobile without +)
    if (/^61\d{9}$/.test(trimmed)) {
      return '+' + trimmed;
    }
    
    // 10 digits starting with 04 (Australian mobile format)
    // Allow spaces in the input but remove them for validation
    else if (/^04\d{8}$/.test(trimmed.replace(/\s/g, ''))) {
      return '+614' + trimmed.replace(/\s/g, '').substring(2);
    }
    
    // Default: assume it's already in correct format
    return trimmed;
  };

  const onSubmit = async (data: PhoneFormData) => {
    try {
      setIsLoading(true);
      
      const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
      
      // Call the forgot-password API to validate phone and send OTP
      await forgotPassword(normalizedPhone);
      
      // If successful, navigate to OTP verification with forgot password context
      navigate(`/verify-otp?phone=${encodeURIComponent(normalizedPhone)}&redirect=${encodeURIComponent('/account/security?reset=true')}&context=forgot-password`);
      
      toast({
        title: 'Verification Code Sent',
        description: `We've sent a verification code to ${normalizedPhone}`,
      });
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error && error.message.includes('404')) {
        toast({
          title: 'Phone Number Not Found',
          description: 'This phone number is not registered. Please check and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to send verification code',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Forgot Password - Fadelines Barber Shop</title>
        <meta name="description" content="Reset your Fadelines account password" />
      </Helmet>

      <section className="min-h-screen bg-[#010401] flex items-center justify-center py-20">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="bg-theme-card border-theme-border">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
              <CardDescription>
                Enter your phone number and we'll send you a verification code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              {...field}
                              type="tel"
                              placeholder="+61 4XX XXX XXX"
                              className="pl-10 bg-transparent border-stone-700"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the phone number associated with your account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#036901] hover:bg-[#025501]"
                  >
                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </Button>

                  <div className="text-center space-y-2">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Home
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}