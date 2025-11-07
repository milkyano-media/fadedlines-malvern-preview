import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { isValidPhoneNumber } from "react-phone-number-input";
import * as RPNInput from "react-phone-number-input";
import { register as registerUser } from "@/utils/authApi";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { trackNeedVerification } from "@/utils/eventTracker";
import Layout from "@/components/web/WebLayout";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import GoogleOAuthButton from "@/components/auth/GoogleOAuthButton";
import GooglePhoneNumberModal from "@/components/auth/GooglePhoneNumberModal";
import AppleOAuthButton from "@/components/auth/AppleOAuthButton";
import ApplePhoneNumberModal from "@/components/auth/ApplePhoneNumberModal";
import { useFeatureFlag } from "@/hooks/useParameter";

const registerSchema = z
  .object({
    given_name: z.string().min(1, "First name is required"),
    family_name: z.string().min(1, "Last name is required"),
    email_address: z.string().email("Invalid email address"),
    phone_number: z
      .string()
      .refine((value) => isValidPhoneNumber(value || ""), {
        message: "Please enter a valid phone number",
      }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<any>(null);
  const [googleIdToken, setGoogleIdToken] = useState<string>("");
  const [showApplePhoneModal, setShowApplePhoneModal] = useState(false);
  const [appleProfile, setAppleProfile] = useState<any>(null);
  const [appleIdToken, setAppleIdToken] = useState<string>("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();

  // Feature flags for OAuth providers
  const isGoogleOAuthEnabled = useFeatureFlag('google_oauth_enabled');
  const isAppleOAuthEnabled = useFeatureFlag('apple_oauth_enabled');

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      given_name: "",
      family_name: "",
      email_address: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Set default values from localStorage or defaults on initial mount
  useEffect(() => {
    // Try to load saved booking form data
    const savedFormData = localStorage.getItem("booking_form_data");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        form.setValue("given_name", parsedData.given_name || "");
        form.setValue("family_name", parsedData.family_name || "");
        form.setValue("email_address", parsedData.email_address || "");
        form.setValue("phone_number", parsedData.phone_number || "+61");
      } catch (error) {
        console.error("Error loading saved form data:", error);
        form.setValue("phone_number", "+61");
      }
    } else {
      form.setValue("phone_number", "+61");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      // Track need verification event before API call
      await trackNeedVerification(
        {
          firstName: data.given_name,
          lastName: data.family_name,
          email: data.email_address,
          phoneNumber: data.phone_number,
        },
        {
          page: "/register",
          referrer: document.referrer,
          registrationTrigger: localStorage.getItem("booking_form_data")
            ? "booking_flow"
            : "manual",
        }
      );

      const response = await registerUser({
        phoneNumber: data.phone_number,
        password: data.password,
        firstName: data.given_name,
        lastName: data.family_name,
        email: data.email_address,
      });

      // Registration successful, automatically log the user in
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      authLogin(response.accessToken, response.user);

      // Since new users are always unverified, redirect to OTP verification page
      const redirectTo = searchParams.get("redirect") || "/";
      navigate(
        `/verify-otp?phone=${encodeURIComponent(
          data.phone_number
        )}&redirect=${encodeURIComponent(redirectTo)}&registration=true`
      );
    } catch (error) {
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Create Account - Fadelines Barber Shop</title>
        <meta
          name="description"
          content="Create an account to save time on future bookings at Fadelines Barber Shop."
        />
      </Helmet>

      <section className="min-h-screen bg-[#010401] py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 mt-4 pt-8 md:pt-0">
              Create Your Account
            </h1>
            <p className="text-gray-400 text-sm">
              Save time on future bookings and track your appointments
            </p>
          </div>

          <div className="bg-theme-card/50 backdrop-blur-sm border border-stone-700/50 rounded-2xl p-6 shadow-2xl">
            {/* OAuth Buttons - controlled by feature flags */}
            {(isGoogleOAuthEnabled || isAppleOAuthEnabled) && (
              <div className="mb-3 space-y-3">
                {isGoogleOAuthEnabled && (
                  <GoogleOAuthButton
                    onSuccess={() => {
                      toast({
                        title: "Success",
                        description:
                          "You have successfully registered with Google!",
                      });
                      const redirect = searchParams.get("redirect");
                      navigate(redirect || "/");
                    }}
                    onError={(error) => {
                      toast({
                        title: "Error",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    onNeedPhoneNumber={(profile, idToken) => {
                      setGoogleProfile(profile);
                      setGoogleIdToken(idToken);
                      setShowPhoneModal(true);
                    }}
                  />
                )}

                {isAppleOAuthEnabled && (
                  <AppleOAuthButton
                    onSuccess={() => {
                      toast({
                        title: "Success",
                        description: "You have successfully registered with Apple!",
                      });
                      const redirect = searchParams.get("redirect");
                      navigate(redirect || "/");
                    }}
                    onError={(error) => {
                      toast({
                        title: "Error",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    onNeedPhoneNumber={(profile, idToken) => {
                      setAppleProfile(profile);
                      setAppleIdToken(idToken);
                      setShowApplePhoneModal(true);
                    }}
                  />
                )}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-stone-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-theme-card/50 px-2 text-stone-400">
                  Or register with email
                </span>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 mt-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="given_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-stone-300">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              {...field}
                              placeholder="John"
                              className="pl-10 bg-stone-950/50 border-stone-600 hover:border-stone-500 focus:border-[#04C600] transition-colors"
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
                        <FormLabel className="text-xs uppercase tracking-wider text-stone-300">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              {...field}
                              placeholder="Doe"
                              className="pl-10 bg-stone-950/50 border-stone-600 hover:border-stone-500 focus:border-[#04C600] transition-colors"
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
                      <FormLabel className="text-xs uppercase tracking-wider text-stone-300">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="john.doe@example.com"
                            className="pl-10 bg-stone-950/50 border-stone-600 hover:border-stone-500 focus:border-[#04C600] transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-stone-300">
                        Phone Number
                      </FormLabel>
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
                      <FormLabel className="text-xs uppercase tracking-wider text-stone-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="pl-10 pr-10 bg-stone-950/50 border-stone-600 hover:border-stone-500 focus:border-[#04C600] transition-colors"
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-stone-300">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10 bg-stone-950/50 border-stone-600 hover:border-stone-500 focus:border-[#04C600] transition-colors"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#04C600] hover:bg-[#03A000] py-3 text-base font-medium text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t border-theme-border text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-[#04C600] hover:text-[#03A000] font-medium transition-colors"
                  onClick={() => setShowLoginModal(true)}
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By creating an account, you agree to our{" "}
              <Link
                to="/privacy-policy"
                className="underline hover:text-gray-300"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          // Redirect to the intended page or home after successful login
          const redirect = searchParams.get("redirect");
          navigate(redirect || "/");
        }}
        onForgotPassword={() => {
          setShowLoginModal(false);
          navigate("/forgot-password");
        }}
      />

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
            description: "You have successfully registered with Google!",
          });
          const redirect = searchParams.get("redirect");
          navigate(redirect || "/");
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
            description: "You have successfully registered with Apple!",
          });
          const redirect = searchParams.get("redirect");
          navigate(redirect || "/");
        }}
      />
    </Layout>
  );
}
