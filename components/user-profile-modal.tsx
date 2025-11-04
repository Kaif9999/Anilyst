"use client";

import React from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  ExternalLink,
  Github,
  Chrome,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
      
      toast({
        title: "👋 Signed out successfully",
        description: "You have been logged out of your account",
      });
      
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout failed",
        description: "There was an error signing you out",
        variant: "destructive",
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'google':
        return <Chrome className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case 'github':
        return 'GitHub';
      case 'google':
        return 'Google';
      default:
        return provider || 'Email';
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  if (status === 'loading') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#1a1b1e] border-white/10 text-white max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#1a1b1e] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Not Signed In
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              You are currently browsing as a guest
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-400">Sign in to access your profile and save your chat history</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Continue as Guest
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  // You can add sign in logic here
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const user = session.user;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1b1e] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Profile Information
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Your account details and session information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg shadow-blue-500/20 flex-shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">
                {user.name || user.email?.split('@')[0] || 'User'}
              </h3>
              {user.name && user.email && (
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300">Email</p>
                <p className="text-sm text-white truncate">{user.email || 'Not provided'}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <User className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300">User ID</p>
                <p className="text-xs text-white font-mono truncate">{user.id || 'Not available'}</p>
              </div>
            </div>

            

            {/* Session Info */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-300">Session Expires</p>
                <p className="text-sm text-white">
                  {session.expires ? formatDate(session.expires) : 'No expiration'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
            
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}