
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }
          
          if (profile) {
            setUserRole(profile.role);
            setAvatarUrl(profile.photo);
            setUserName(`${profile.first_name} ${profile.last_name}`);
            setAccountType(profile.tipo_de_conta);
            setMentorId(profile.mentor_link_id);
            setUserId(profile.id);
          }
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  return { 
    userRole, 
    avatarUrl, 
    userName, 
    isLoading, 
    accountType,
    mentorId,
    userId
  };
}
