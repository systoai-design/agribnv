import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional().nullable(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().nullable(),
  phone: z.string().optional().nullable(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
  avatar_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const { user, profile, refreshProfile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || '',
    }
  });

  const currentAvatarUrl = watch('avatar_url');

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      });
    } else if (user) {
      reset({
        full_name: user.user_metadata?.full_name || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        phone: user.user_metadata?.phone || '',
        bio: '',
        avatar_url: '',
      });
    }
  }, [profile, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name || null,
          username: data.username || null,
          phone: data.phone || null,
          bio: data.bio || null,
          avatar_url: data.avatar_url || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Also synchronize auth metadata
      await supabase.auth.updateUser({
        data: {
          full_name: data.full_name || null,
          username: data.username || null,
          phone: data.phone || null,
          avatar_url: data.avatar_url || null,
        }
      });

      await refreshProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to edit your profile.</p>
          <Button onClick={() => navigate('/auth')} className="rounded-full px-8">Sign In</Button>
        </div>
      </Layout>
    );
  }

  const initials = watch('full_name')
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-12 lg:gap-24"
        >
          {/* Left Column (Identity Anchor) */}
          <div className="flex flex-col gap-10 md:sticky md:top-24 h-fit">
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => navigate('/profile')} 
              className="w-fit rounded-full border-2 border-border/60 hover:bg-muted font-medium px-6 h-12"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>

            <div className="flex flex-col items-start gap-6">
              <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer group">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-lg group-hover:opacity-90 transition-opacity">
                      <AvatarImage src={currentAvatarUrl || undefined} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-4xl md:text-5xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar_url_input">Image URL</Label>
                      <Input 
                        id="avatar_url_input" 
                        defaultValue={currentAvatarUrl || ''} 
                        onChange={(e) => setValue('avatar_url', e.target.value, { shouldValidate: true })}
                        placeholder="https://example.com/image.jpg"
                        className="rounded-xl"
                      />
                      {errors.avatar_url && <p className="text-sm text-destructive">{errors.avatar_url.message}</p>}
                    </div>
                    <Button onClick={() => setIsAvatarDialogOpen(false)} className="w-full rounded-xl">Done</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {watch('full_name') || user.email?.split('@')[0]}
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                  {watch('username') ? `@${watch('username')}` : 'Update your profile'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Form Content) */}
          <div className="pt-4 md:pt-0 pb-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-primary mb-2">Personal Information</h2>
              <p className="text-muted-foreground text-lg">Update your identity and contact details.</p>
            </div>

            <div className="bg-white dark:bg-card border border-border/40 rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-2xl">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="full_name" className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">Full Name</Label>
                    <Input 
                      id="full_name" 
                      {...register('full_name')} 
                      className="rounded-xl h-14 text-lg bg-muted/30 border-2 border-transparent focus-visible:bg-white focus-visible:ring-0 focus-visible:border-primary hover:bg-muted/50 transition-all px-4" 
                      placeholder="e.g. Jane Doe"
                    />
                    {errors.full_name && <p className="text-sm text-destructive font-medium">{errors.full_name.message}</p>}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">Username</Label>
                    <Input 
                      id="username" 
                      {...register('username')} 
                      className="rounded-xl h-14 text-lg bg-muted/30 border-2 border-transparent focus-visible:bg-white focus-visible:ring-0 focus-visible:border-primary hover:bg-muted/50 transition-all px-4" 
                      placeholder="e.g. janedoe"
                    />
                    {errors.username && <p className="text-sm text-destructive font-medium">{errors.username.message}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">Phone Number</Label>
                  <Input 
                    id="phone" 
                    {...register('phone')} 
                    className="rounded-xl h-14 text-lg bg-muted/30 border-2 border-transparent focus-visible:bg-white focus-visible:ring-0 focus-visible:border-primary hover:bg-muted/50 transition-all px-4" 
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && <p className="text-sm text-destructive font-medium">{errors.phone.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">About Me (Bio)</Label>
                  <Textarea 
                    id="bio" 
                    {...register('bio')} 
                    className="rounded-xl min-h-[160px] text-lg bg-muted/30 border-2 border-transparent focus-visible:bg-white focus-visible:ring-0 focus-visible:border-primary hover:bg-muted/50 transition-all p-5 resize-none" 
                    placeholder="Tell us a little bit about yourself, your interests, and what you love about farming or nature."
                  />
                  {errors.bio && <p className="text-sm text-destructive font-medium">{errors.bio.message}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/40 mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/profile')} 
                    className="w-full sm:w-auto mt-6 rounded-xl border-2 h-14 px-10 text-base font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full sm:w-auto mt-6 rounded-xl h-14 px-12 text-base font-semibold ml-auto"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
