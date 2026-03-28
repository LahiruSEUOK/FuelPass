import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSheds() {
  const [sheds, setSheds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheds();

    const shedsSubscription = supabase
      .channel('public-sheds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sheds' }, () => {
        fetchSheds();
      })
      .subscribe();

    const updatesSubscription = supabase
      .channel('public-fuel_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_updates' }, () => {
        fetchSheds(); // Re-fetch to get latest status
      })
      .subscribe();

    return () => {
      supabase.removeChannel(shedsSubscription);
      supabase.removeChannel(updatesSubscription);
    };
  }, []);

  const fetchSheds = async () => {
    setLoading(true);
    // Fetch sheds with their LATEST valid report
    const { data: shedsData, error: shedsError } = await supabase
      .from('sheds')
      .select(`
        *,
        fuel_updates (
          status,
          queue,
          fuel_type,
          created_at
        )
      `);
      
    if (shedsError) {
      console.error(shedsError);
    } else {
      const processed = shedsData.map(shed => {
        const validUpdates = shed.fuel_updates || [];
        validUpdates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        const latestReport = validUpdates[0] || null;
        
        return {
          ...shed,
          latestReport
        };
      });
      setSheds(processed);
    }
    setLoading(false);
  };

  return { sheds, loading, refresh: fetchSheds };
}
