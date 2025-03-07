
import { useState, useEffect } from 'react';

export function useGreeting(userName: string | null) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeGreeting = '';
      
      if (hour >= 5 && hour < 12) {
        timeGreeting = 'Bom dia';
      } else if (hour >= 12 && hour < 18) {
        timeGreeting = 'Boa tarde';
      } else {
        timeGreeting = 'Boa noite';
      }
      
      if (userName) {
        setGreeting(`${timeGreeting}, ${userName.split(' ')[0]}`);
      } else {
        setGreeting(timeGreeting);
      }
    };
    
    // Set initial greeting
    updateGreeting();
    
    // Update greeting every minute in case the user is online during a time transition
    const interval = setInterval(updateGreeting, 60000);
    
    return () => clearInterval(interval);
  }, [userName]);

  return { greeting };
}
