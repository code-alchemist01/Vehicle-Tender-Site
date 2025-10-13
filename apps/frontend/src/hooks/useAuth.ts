import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type { LoginFormData, RegisterFormData } from '@/lib/validations';

interface UseAuthReturn {
  // Session data
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth actions
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  
  // Loading states
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isLogoutLoading: boolean;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const user = session?.user;
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';

  const login = async (data: LoginFormData) => {
    try {
      setIsLoginLoading(true);
      
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Giriş başarısız', {
          description: 'Email veya şifre hatalı. Lütfen tekrar deneyin.',
        });
        return;
      }

      toast.success('Giriş başarılı', {
        description: 'Hoş geldiniz!',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Bir hata oluştu', {
        description: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      setIsRegisterLoading(true);
      
      const response = await apiClient.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      if (response.success) {
        toast.success('Kayıt başarılı', {
          description: 'Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.',
        });

        // Automatically log in after successful registration
        await login({
          email: data.email,
          password: data.password,
        });
      } else {
        toast.error('Kayıt başarısız', {
          description: response.message || 'Kayıt olurken bir hata oluştu.',
        });
      }
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error('Kayıt başarısız', {
        description: error.message || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLogoutLoading(true);
      
      // Call API logout endpoint
      await apiClient.logout();
      
      // Sign out from NextAuth
      await signOut({ redirect: false });
      
      toast.success('Çıkış yapıldı', {
        description: 'Güvenli bir şekilde çıkış yaptınız.',
      });

      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still sign out from NextAuth
      await signOut({ redirect: false });
      router.push('/');
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signIn('google', { redirect: false });
      
      if (result?.error) {
        toast.error('Google ile giriş başarısız', {
          description: 'Lütfen tekrar deneyin.',
        });
        return;
      }

      toast.success('Google ile giriş başarılı', {
        description: 'Hoş geldiniz!',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Bir hata oluştu', {
        description: 'Google ile giriş yapılırken bir hata oluştu.',
      });
    }
  };

  const loginWithGitHub = async () => {
    try {
      const result = await signIn('github', { redirect: false });
      
      if (result?.error) {
        toast.error('GitHub ile giriş başarısız', {
          description: 'Lütfen tekrar deneyin.',
        });
        return;
      }

      toast.success('GitHub ile giriş başarılı', {
        description: 'Hoş geldiniz!',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('GitHub login error:', error);
      toast.error('Bir hata oluştu', {
        description: 'GitHub ile giriş yapılırken bir hata oluştu.',
      });
    }
  };

  return {
    // Session data
    user,
    isAuthenticated,
    isLoading,
    
    // Auth actions
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithGitHub,
    
    // Loading states
    isLoginLoading,
    isRegisterLoading,
    isLogoutLoading,
  };
}