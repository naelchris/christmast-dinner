import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, MapPin, Gift, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import posterImage from "@assets/fe8ae479-bddf-4f21-88ba-aa27d99ae26f_1765506337420.jpeg";

const GOOGLE_FORM_ID = "1MoGI5vO1x-T-2IHf7jkkULEnUUZVfCLH6V3k0Yvh_nc";
const GOOGLE_FORM_ACTION = `https://docs.google.com/forms/d/${GOOGLE_FORM_ID}/formResponse`;
const GOOGLE_FORM_VIEW = `https://docs.google.com/forms/d/${GOOGLE_FORM_ID}/viewform`;
const CG_OPTIONS = [
  "CG Angela",
  "CG Samuel",
  "CG Ezra",
  "CG William",
  "CG Marciella",
  "CG Felicia Clara",
  "CG Sherline",
];
const GITHUB_OWNER = "PETERSAMUELOPS12";
const GITHUB_REPO = "chrismastDinnerImg";
const GITHUB_PAT =
  import.meta.env.VITE_GITHUB_TOKEN ||
  import.meta.env.VITE_GITHUB_PAT ||
  "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";
const GITHUB_MAX_BYTES = 8 * 1024 * 1024; // GitHub API limit for contents endpoint

const GOOGLE_ENTRY_IDS = {
  name: "entry.1364157829",
  phoneNumber: "entry.1455060612",
  email: "entry.1706537260",
  joinCg: "entry.1460132900",
  fromCg: "entry.1071819399",
  makan: "entry.722588337",
  minuman: "entry.1917095034",
  bringGifts: "entry.1696718212",
  fileUploadLink: "entry.2135820848",
} as const;

const formSchema = z.object({
  name: z.string().min(1, "Please tell us your name."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  email: z.string().email("Enter a valid email."),
  joinCg: z.enum(["true", "false"], { required_error: "Please pick an option." }),
  fromCg: z.string().optional(),
  makan: z.string().optional(),
  minuman: z.string().optional(),
  bringGifts: z.enum(["true", "false"]).optional(),
  transferProofFile: z.custom<FileList | null | undefined>().optional(),
});

export default function Home() {
  const { toast } = useToast();
  const [proofPreview, setProofPreview] = useState<string | undefined>(undefined);
  const [proofUploadLink, setProofUploadLink] = useState<string | undefined>(undefined);
  const [proofUploading, setProofUploading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      joinCg: "true",
      fromCg: CG_OPTIONS[0],
      makan: "",
      minuman: "",
      bringGifts: "true",
      transferProofFile: undefined,
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchedName = form.watch("name");
  const watchedJoinCg = form.watch("joinCg");

  const snowflakePositions = useMemo(
    () =>
      [...Array(15)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
      })),
    [],
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let proofLink = proofUploadLink ?? "";

    const transferProofFile = values.transferProofFile?.item?.(0);
    if (transferProofFile && !proofLink) {
      try {
        setProofUploading(true);
        proofLink = await uploadProofToGithub(transferProofFile, values.name);
        setProofPreview(proofLink);
        setProofUploadLink(proofLink);
      } catch (error) {
        console.error("Upload failed", error);
        toast({
          title: "Upload failed",
          description: "Could not upload the file to GitHub. Please try again.",
          variant: "destructive",
        });
        setProofUploading(false);
        return;
      } finally {
        setProofUploading(false);
      }
    }

    const derivedFromCg = values.joinCg === "true" ? (values.fromCg || CG_OPTIONS[0]) : "-";

    const payload = new FormData();
    payload.append(GOOGLE_ENTRY_IDS.name, values.name);
    payload.append(GOOGLE_ENTRY_IDS.phoneNumber, values.phoneNumber);
    payload.append(GOOGLE_ENTRY_IDS.email, values.email);
    payload.append(GOOGLE_ENTRY_IDS.joinCg, values.joinCg);
    payload.append(GOOGLE_ENTRY_IDS.fromCg, derivedFromCg);
    payload.append(GOOGLE_ENTRY_IDS.makan, values.makan ?? "");
    payload.append(GOOGLE_ENTRY_IDS.minuman, values.minuman ?? "");
    payload.append(GOOGLE_ENTRY_IDS.bringGifts, values.bringGifts ?? "true");
    if (proofLink) {
      payload.append(GOOGLE_ENTRY_IDS.fileUploadLink, proofLink);
    }

    try {
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });

      toast({
        title: "Submitted!",
        description: "Your RSVP was sent to Google Forms. You can open the form to double-check.",
      });

      form.reset({
        name: "",
        phoneNumber: "",
        email: "",
        joinCg: "true",
        fromCg: CG_OPTIONS[0],
        makan: "",
        minuman: "",
        bringGifts: "true",
        transferProofFile: undefined,
      });
      setProofPreview(undefined);
      setProofUploadLink(undefined);
    } catch (error) {
      console.error("Failed to submit form", error);
      toast({
        title: "Submission failed",
        description: "Please try again or open the Google Form directly.",
        variant: "destructive",
      });
    }
  }

  async function uploadProofToGithub(file: File, personName: string): Promise<string> {
    if (!GITHUB_PAT) {
      throw new Error("GitHub token not configured.");
    }

    if (file.size > GITHUB_MAX_BYTES) {
      throw new Error("File too large. Please upload a file under 8MB.");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const prefix = personName
      ? personName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      : "guest";
    const path = `uploads/${Date.now()}-${prefix}-${safeName}`;
    const contentBase64 = await fileToBase64(file);

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${GITHUB_PAT}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: `Add upload ${safeName}`,
          content: contentBase64,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorBody.slice(0, 200)}`);
    }

    const json = (await response.json()) as {
      content?: { download_url?: string };
    };

    const downloadUrl = json.content?.download_url;
    if (!downloadUrl) {
      throw new Error("No download URL returned from GitHub.");
    }

    return downloadUrl;
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.replace(/^data:.*;base64,/, "");
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-red-950">
      {/* Decorative snowflakes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {snowflakePositions.map((pos, i) => (
          <div
            key={i}
            className="absolute animate-pulse opacity-20"
            style={{
              left: pos.left,
              top: pos.top,
              animationDelay: pos.delay,
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

      {/* Registration Section */}
      <section className="relative z-10 px-4 py-12 md:py-16">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              Register Now
            </h2>
            <p className="text-emerald-200/80 font-body">
              Fill the form below and we will send everything straight to our Google Form.
            </p>
          </div>

          <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-sm border-none shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                <p className="text-muted-foreground font-body text-center">
                  Tell us your details and preferences. We will also keep a shortcut to open the Google Form in case you prefer to submit there directly.
                </p>

                {/* <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-left">
                  <p className="text-sm font-medium">Menu for the Christmas Dinner</p>
                  <a
                    className="text-sm text-blue-600 hover:underline break-all"
                    href="https://drive.google.com/file/d/1csp7LlE2cr7Kv9JvYFgqoloVgVKte7k_/view?pli=1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open menu (Google Drive)
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Note: TRANSFER JUMLAH YANG KAMU PESAN DAN JANGAN LUPA UNTUK TULIS DI FIELD INI YA (contoh: AYAM SERUNDENG - 45000)
                  </p>
                </div> */}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                    encType="multipart/form-data"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="WhatsApp number" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </div>

                    <FormField
                      control={form.control}
                      name="joinCg"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Have you already joined CG? *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(val) => {
                                field.onChange(val);
                                if (val === "true" && !form.getValues("fromCg")) {
                                  form.setValue("fromCg", CG_OPTIONS[0]);
                                }
                                if (val === "false") {
                                  form.setValue("fromCg", "-");
                                }
                              }}
                              value={field.value}
                              className="grid grid-cols-2 gap-3 md:w-2/3"
                            >
                              <Label
                                htmlFor="join-yes"
                                className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:border-emerald-500"
                              >
                                <RadioGroupItem value="true" id="join-yes" />
                                Yes
                              </Label>
                              <Label
                                htmlFor="join-no"
                                className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:border-emerald-500"
                              >
                                <RadioGroupItem value="false" id="join-no" />
                                Not yet
                              </Label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedJoinCg === "true" && (
                      <FormField
                        control={form.control}
                        name="fromCg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From CG</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your CG" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CG_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="bringGifts"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Will you bring a gift?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-3 md:w-2/3"
                            >
                              <Label
                                htmlFor="gift-yes"
                                className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:border-amber-500"
                              >
                                <RadioGroupItem value="true" id="gift-yes" />
                                Yes, I will bring one
                              </Label>
                              <Label
                                htmlFor="gift-no"
                                className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:border-amber-500"
                              >
                                <RadioGroupItem value="false" id="gift-no" />
                                Not bringing a gift
                              </Label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                      <p className="text-sm font-medium">Menu for the Christmas Dinner</p>
                      <a
                        href="https://drive.google.com/file/d/1csp7LlE2cr7Kv9JvYFgqoloVgVKte7k_/view?pli=1"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        View menu (Google Drive)
                      </a>
                      <p className="text-sm text-muted-foreground">
                        Note: TRANSFER JUMLAH YANG KAMU PESAN DAN JANGAN LUPA UNTUK TULIS DI FIELD INI YA
                        (contoh: AYAM SERUNDENG - 45000)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="makan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Makan</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Food you plan to bring (e.g., AYAM SERUNDENG - 45000)"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minuman"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minuman</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Drinks you plan to bring (e.g., LEMON TEA - 20000)"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {proofPreview && (
                      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                        <p className="text-sm font-medium">Uploaded proof preview</p>
                        <div className="aspect-video overflow-hidden rounded-lg bg-black/5">
                          <img
                            src={proofPreview}
                            alt="Uploaded proof"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="transferProofFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transfer Proof (Felicia Clara BCA : 123123)</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={async (event) => {
                                const files = event.target.files;
                                field.onChange(files);
                                setProofPreview(undefined);
                                setProofUploadLink(undefined);
                                if (!files?.[0]) return;
                                try {
                                  setProofUploading(true);
                                  const link = await uploadProofToGithub(files[0], watchedName || "guest");
                                  setProofPreview(link);
                                  setProofUploadLink(link);
                                  toast({
                                    title: "Uploaded to GitHub",
                                    description: "Proof link attached to your RSVP.",
                                  });
                                } catch (error) {
                                  console.error("Upload failed", error);
                                  toast({
                                    title: "Upload failed",
                                    description: "Could not upload the file to GitHub. Please try again.",
                                    variant: "destructive",
                                  });
                                } finally {
                                  setProofUploading(false);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            {proofUploading
                              ? "Uploading to GitHub..."
                              : proofUploadLink
                                ? "Uploaded and ready to submit."
                                : "We will upload to GitHub and attach the link to your RSVP."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col md:flex-row gap-3">
                      <Button
                        type="submit"
                        className="h-12 px-6 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg font-body"
                        disabled={isSubmitting}
                        data-testid="button-register"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Gift className="w-5 h-5 mr-2" />
                            Register for Christmas Dinner
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
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
