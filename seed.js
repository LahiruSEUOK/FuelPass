import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let supaUrl = '';
let supaKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supaUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supaKey = line.split('=')[1].trim();
});

if (!supaUrl || !supaKey) {
  console.error('Error: Could not find Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supaUrl, supaKey);

const dummyStations = [
  { name: 'CEYPETCO Colombo 07', address: 'Town Hall, Colombo 07', lat: 6.9147, lng: 79.8655, district: 'Colombo', source: 'seed', fuel_petrol: true, fuel_diesel: true, fuel_kerosene: false },
  { name: 'LIOC Bambalapitiya', address: 'Galle Road, Bambalapitiya', lat: 6.8920, lng: 79.8550, district: 'Colombo', source: 'seed', fuel_petrol: true, fuel_diesel: true, fuel_kerosene: true },
  { name: 'CEYPETCO Nugegoda', address: 'High Level Road, Nugegoda', lat: 6.8649, lng: 79.8997, district: 'Colombo', source: 'seed', fuel_petrol: true, fuel_diesel: false, fuel_kerosene: false },
  { name: 'Sinopec Kandy City', address: 'Dalada Veediya, Kandy', lat: 7.2906, lng: 80.6337, district: 'Kandy', source: 'seed', fuel_petrol: true, fuel_diesel: true, fuel_kerosene: false },
  { name: 'LIOC Peradeniya', address: 'Peradeniya Road', lat: 7.2681, lng: 80.5936, district: 'Kandy', source: 'seed', fuel_petrol: true, fuel_diesel: true, fuel_kerosene: true },
  { name: 'CEYPETCO Galle Fort', address: 'Galle Fort Entrance', lat: 6.0328, lng: 80.2150, district: 'Galle', source: 'seed', fuel_petrol: true, fuel_diesel: true, fuel_kerosene: false },
  { name: 'Sinopec Unawatuna', address: 'Matara Road, Unawatuna', lat: 6.0125, lng: 80.2486, district: 'Galle', source: 'seed', fuel_petrol: false, fuel_diesel: true, fuel_kerosene: false },
  { name: 'LIOC Negombo', address: 'Chilaw Road, Negombo', lat: 7.2088, lng: 79.8358, district: 'Gampaha', source: 'seed', fuel_petrol: true, fuel_diesel: true, fuel_kerosene: false },
  { name: 'CEYPETCO Katunayake', address: 'Airport Road', lat: 7.1706, lng: 79.8820, district: 'Gampaha', source: 'seed', fuel_petrol: true, fuel_diesel: true, fuel_kerosene: false },
  { name: 'Sinopec Jaffna Town', address: 'Hospital Road, Jaffna', lat: 9.6615, lng: 80.0255, district: 'Jaffna', source: 'seed', fuel_petrol: true, fuel_diesel: true, fuel_kerosene: true },
];

const queueStatuses = ['no_queue', 'short', 'long', 'very_long'];
const openStatuses = ['open', 'closed', 'open', 'open']; // Bias towards open

async function seed() {
  console.log('Inserting dummy sheds...');
  
  // Insert Sheds
  const { data: sheds, error: shedError } = await supabase
    .from('sheds')
    .insert(dummyStations)
    .select();

  if (shedError) {
    console.error('Error inserting sheds:', shedError.message);
    return;
  }

  console.log(`Successfully added ${sheds.length} sheds.`);
  
  console.log('Generating dummy reports...');
  
  // Insert Reports for those sheds
  const dummyReports = sheds.map(shed => ({
    shed_id: shed.id,
    status: openStatuses[Math.floor(Math.random() * openStatuses.length)],
    queue: queueStatuses[Math.floor(Math.random() * queueStatuses.length)],
    fuel_type: 'petrol',
    created_at: new Date().toISOString()
  }));

  const { error: reportsError } = await supabase
    .from('fuel_updates')
    .insert(dummyReports);

  if (reportsError) {
    console.error('Error inserting reports:', reportsError.message);
    return;
  }
  
  console.log(`Successfully generated ${dummyReports.length} status reports.`);
  console.log('Seeding complete! You can open your Local Environment and see the map markers.');
}

seed();
