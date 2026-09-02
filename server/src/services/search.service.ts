import { supabase } from '../config/supabase';

export interface SearchResult {
  type: 'lead' | 'customer' | 'vehicle';
  id: string;
  title: string;
  subtitle: string;
  link: string;
  badge?: string;
}

export class SearchService {
  async searchAll(dealershipId: string, query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const trimmed = query.trim();
    const s = `%${trimmed}%`;
    const results: SearchResult[] = [];

    // 1. Search Customers
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .eq('dealership_id', dealershipId)
      .is('deleted_at', null)
      .or(`first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s},phone.ilike.${s}`)
      .limit(5);

    (customers || []).forEach((c) => {
      results.push({
        type: 'customer',
        id: c.id,
        title: `${c.first_name} ${c.last_name}`,
        subtitle: `${c.phone || ''} • ${c.email || ''}`,
        link: `/customers/${c.id}`,
        badge: 'Customer',
      });
    });

    // 2. Search Vehicles
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*')
      .eq('dealership_id', dealershipId)
      .is('deleted_at', null)
      .or(`make.ilike.${s},model.ilike.${s},vin.ilike.${s},stock_number.ilike.${s}`)
      .limit(5);

    (vehicles || []).forEach((v) => {
      results.push({
        type: 'vehicle',
        id: v.id,
        title: `${v.year} ${v.make} ${v.model}`,
        subtitle: `Stock #${v.stock_number || 'N/A'} • VIN: ${v.vin}`,
        link: `/vehicles/${v.id}`,
        badge: v.status ? v.status.toUpperCase() : 'Vehicle',
      });
    });

    // 3. Search Leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*, customer:customers(*), vehicle:vehicles(*)')
      .eq('dealership_id', dealershipId)
      .is('deleted_at', null)
      .or(`notes.ilike.${s}`)
      .limit(5);

    (leads || []).forEach((l) => {
      const cust = l.customer as any;
      const veh = l.vehicle as any;
      results.push({
        type: 'lead',
        id: l.id,
        title: cust ? `${cust.first_name} ${cust.last_name}` : 'Lead Opportunity',
        subtitle: veh ? `${veh.year} ${veh.make} ${veh.model}` : `Status: ${l.status}`,
        link: `/leads/${l.id}`,
        badge: l.temperature ? l.temperature.toUpperCase() : 'Lead',
      });
    });

    return results;
  }
}

export const searchService = new SearchService();
