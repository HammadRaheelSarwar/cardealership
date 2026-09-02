import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

async function seed() {
  logger.info('Running Supabase Database Seed Script...');
  const { data: dealership } = await supabase
    .from('dealerships')
    .select('*')
    .eq('slug', 'premier-auto')
    .single();

  if (dealership) {
    logger.info(`Demo dealership ${dealership.name} already exists.`);
  } else {
    logger.info('Demo seed data can be applied via supabase/seed.sql migration file.');
  }
}

seed().catch((err) => {
  logger.error('Seed error:', err);
});
