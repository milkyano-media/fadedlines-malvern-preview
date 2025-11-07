import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/web/WebLayout';
import { User, Mail, Phone, Calendar, Lock, LogOut } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const profileSchema = z.object({
  given_name: z.string().min(1, 'First name is required'),
  family_name: z.string().min(1, 'Last name is required'),
  email_address: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Account() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // This page is protected by ProtectedRoute, so user is guaranteed to exist
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      given_name: user?.firstName || '',
      family_name: user?.lastName || '',
      email_address: user?.email || '',
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        given_name: user.firstName || '',
        family_name: user.lastName || '',
        email_address: user.email || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (_data: ProfileFormData) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would call an API to update the profile
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <Layout>
      <Helmet>
        <title>My Account - Fadelines Barber Shop</title>
        <meta name="description" content="Manage your Fadelines account, view booking history, and update your profile." />
      </Helmet>

      <section className="min-h-screen bg-[#010401] py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
            <p className="text-gray-400">Manage your profile and booking preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-theme-card">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-theme-card border-theme-border">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information used for bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="given_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    className="pl-10 bg-transparent border-stone-700"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="family_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    className="pl-10 bg-transparent border-stone-700"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  {...field}
                                  type="email"
                                  className="pl-10 bg-transparent border-stone-700"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-theme-card rounded-lg p-4">
                        <div className="flex items-center gap-3 text-gray-400">
                          <Phone className="w-4 h-4" />
                          <div>
                            <p className="text-sm font-medium">Phone Number</p>
                            <p className="text-white">{user?.phoneNumber}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#036901] hover:bg-[#025501]"
                      >
                        {isLoading ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card className="bg-theme-card border-theme-border">
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                  <CardDescription>
                    View your past and upcoming appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No bookings yet</p>
                    <p className="text-sm mt-2">Your booking history will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-theme-card border-theme-border">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-stone-700"
                    disabled
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>

                  <div className="pt-4 border-t border-theme-border">
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="w-full justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}