import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Calendar, MapPin, Gift, Upload, CheckCircle2, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { connectGroups } from "@shared/schema";
import posterImage from "@assets/fe8ae479-bddf-4f21-88ba-aa27d99ae26f_1765506337420.jpeg";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  hasJoinedCG: z.boolean(),
  connectGroup: z.string().nullable(),
  transferProof: z.string().min(1, "Please upload transfer proof"),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      hasJoinedCG: false,
      connectGroup: null,
      transferProof: "",
    },
  });

  const hasJoinedCG = form.watch("hasJoinedCG");

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/registrations", data);
      return response;
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Registration Successful!",
        description: "We can't wait to see you at the Christmas Dinner!",
      });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      form.setValue("transferProof", base64);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("transferProof", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-red-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300/30" />
            </div>
          ))}
        </div>
        <Card className="max-w-md w-full bg-white/95 dark:bg-card/95 backdrop-blur-sm border-none shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-emerald-800 dark:text-emerald-400 mb-3">
              You're Registered!
            </h2>
            <p className="text-muted-foreground mb-6 font-body">
              Thank you for registering for Coach Nael & Shella's Christmas Dinner. We'll see you on December 18th!
            </p>
            <div className="bg-gradient-to-r from-red-50 to-emerald-50 dark:from-red-950/30 dark:to-emerald-950/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Don't forget to bring a</p>
              <p className="font-semibold text-foreground flex items-center justify-center gap-2">
                <Gift className="w-4 h-4 text-red-500" />
                Small Gift (20-30k) for exchange!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Dress code:</span>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Red
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Green
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                  Brown
                </span>
              </div>
            </div>
            <Button
              onClick={() => {
                setIsSuccess(false);
                form.reset();
                setImagePreview(null);
              }}
              variant="outline"
              className="font-body"
              data-testid="button-register-another"
            >
              Register Another Person
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-red-950">
      {/* Decorative snowflakes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-200" />
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />
        
        {/* Poster Image */}
        <div className="relative z-20 w-full max-w-sm mx-auto mb-8">
          <div className="relative rounded-lg overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
            <img
              src={posterImage}
              alt="Christmas Dinner Invitation"
              className="w-full h-auto"
              data-testid="img-poster"
            />
          </div>
        </div>

        {/* Event Details Card */}
        <Card className="relative z-20 w-full max-w-2xl bg-white/95 dark:bg-card/95 backdrop-blur-sm border-none shadow-2xl -mt-4">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-body">Date & Time</p>
                  <p className="font-semibold text-foreground font-body" data-testid="text-event-datetime">Thu, 18 Dec | 7:00 PM</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-body">Location</p>
                  <p className="font-semibold text-foreground font-body" data-testid="text-event-location">Auntie Lim's</p>
                  <p className="text-xs text-muted-foreground font-body">Ruko Aniva Grande FA1-FA2, Gading Serpong</p>
                </div>
              </div>

              {/* Gift Exchange */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-body">Gift Exchange</p>
                  <p className="font-semibold text-foreground font-body" data-testid="text-gift-info">Bring a small gift</p>
                  <p className="text-xs text-muted-foreground font-body">Budget: 20-30k</p>
                </div>
              </div>
            </div>

            {/* Dress Code */}
            <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground font-body">Dress Code:</span>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Red
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  Green
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                  <span className="w-3 h-3 rounded-full bg-amber-700"></span>
                  Brown
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Registration Form Section */}
      <section className="relative z-10 px-4 py-12 md:py-16">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              Register Now
            </h2>
            <p className="text-emerald-200/80 font-body">
              Fill out the form below to secure your spot at our Christmas celebration
            </p>
          </div>

          <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-sm border-none shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium uppercase tracking-wide text-muted-foreground font-body">
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            className="h-12 px-4 font-body"
                            data-testid="input-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium uppercase tracking-wide text-muted-foreground font-body">
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-12 px-4 font-body"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Connect Group Checkbox */}
                  <FormField
                    control={form.control}
                    name="hasJoinedCG"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (!checked) {
                                form.setValue("connectGroup", null);
                              }
                            }}
                            data-testid="checkbox-joined-cg"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-body font-medium cursor-pointer">
                            I have joined a Connect Group community
                          </FormLabel>
                          <p className="text-sm text-muted-foreground font-body">
                            Check this if you're part of a CG
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Connect Group Dropdown - Conditional */}
                  {hasJoinedCG && (
                    <FormField
                      control={form.control}
                      name="connectGroup"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-top-2 duration-300">
                          <FormLabel className="text-sm font-medium uppercase tracking-wide text-muted-foreground font-body">
                            Select Your Connect Group <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 px-4 font-body" data-testid="select-connect-group">
                                <SelectValue placeholder="Choose your Connect Group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {connectGroups.map((group) => (
                                <SelectItem key={group} value={group} className="font-body">
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Transfer Proof Upload */}
                  <FormField
                    control={form.control}
                    name="transferProof"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium uppercase tracking-wide text-muted-foreground font-body">
                          Transfer Proof <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {!imagePreview ? (
                              <label
                                htmlFor="transfer-proof"
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {isUploading ? (
                                    <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                                  ) : (
                                    <>
                                      <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                                      <p className="mb-1 text-sm text-foreground font-medium font-body">
                                        Click to upload transfer proof
                                      </p>
                                      <p className="text-xs text-muted-foreground font-body">
                                        PNG, JPG up to 5MB
                                      </p>
                                    </>
                                  )}
                                </div>
                                <input
                                  id="transfer-proof"
                                  ref={fileInputRef}
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  data-testid="input-transfer-proof"
                                />
                              </label>
                            ) : (
                              <div className="relative rounded-lg overflow-hidden border">
                                <img
                                  src={imagePreview}
                                  alt="Transfer proof preview"
                                  className="w-full h-48 object-contain bg-muted/20"
                                  data-testid="img-transfer-preview"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={removeImage}
                                  data-testid="button-remove-image"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg font-body"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5 mr-2" />
                        Register for Christmas Dinner
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-emerald-200/60 text-sm font-body">
              Hosted by Coach Nael & Shella
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
