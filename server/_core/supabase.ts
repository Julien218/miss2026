/**
 * Supabase Configuration for Miss & Mister Dour 2026
 * 
 * This file configures the Supabase client for:
 * - Authentication (email/password + magic links)
 * - Database (PostgreSQL with RLS)
 * - Storage (media files)
 * 
 * Created by JS-Innov.IA - All rights reserved
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/supabase-types';

// Supabase credentials (to be set in environment variables)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper: Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
}

// Helper: Get user profile with role
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
  return data;
}

// Helper: Check if user has role
export async function hasRole(userId: string, allowedRoles: string[]) {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  return allowedRoles.includes((profile as any).role);
}

// Helper: Upload file to Supabase Storage
export async function uploadFile(bucket: string, path: string, file: File | Blob) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  return { path: data.path, url: publicUrl };
}

// Helper: Delete file from Supabase Storage
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    console.error('Error deleting file:', error);
    return false;
  }
  return true;
}

// Helper: Create audit log
export async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, any>,
  ipHash: string
) {
  const { error } = await (supabase as any)
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details_json: details,
      ip_hash: ipHash,
    });
  
  if (error) {
    console.error('Error creating audit log:', error);
    return false;
  }
  return true;
}

export default supabase;
