import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Car, ShieldCheck, CheckCircle2, DollarSign, Calendar,
  Clock, User, Phone, MessageSquare, Plus, ExternalLink, Copy,
  Check, Fuel, Settings, Activity, Sparkles, ChevronRight, FileText
} from 'lucide-react';
import api from '@/services/api';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copiedVin, setCopiedVin] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState(0);

  // Fetch Vehicle Data from API or fallback
  const { data: vehicleData, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/vehicles/${id}`);
        return res.data.data.vehicle;
      } catch (err) {
        // Fallback realistic demo matching the id
        if (id === '2') {
          return {
            _id: '2',
            year: 2024,
            make: 'Range Rover',
            model: 'Velar',
            trim: 'Dynamic SE P400 AWD',
            price: 79900,
            mileage: 6400,
            stockNumber: 'P24-202',
            vin: 'SALYA2D70RA102914',
            status: 'available',
            exteriorColor: 'Santorini Black Metallic',
            interiorColor: 'Ebony Perforated Windsor Leather',
            fuelType: 'Turbocharged I6 Mild Hybrid',
            transmission: '8-Speed Automatic',
            drivetrain: 'All-Wheel Drive (AWD)',
            engine: '3.0L i6 Turbocharged MHEV (395 hp)',
            image: '/images/suv.jpg',
            description:
              'Pristine condition 2024 Range Rover Velar Dynamic SE with Meridian 3D Surround Sound, Panoramic Roof, 21" Gloss Dark Diamond Wheels, and full Driver Assistance suite.',
            features: [
              'Meridian™ 3D Surround Sound System (750W)',
              'Sliding Panoramic Sunroof with Power Blind',
              'Adaptive Cruise Control with Steering Assist',
              '3D Surround Camera & ClearSight Ground View',
              'Heated & Ventilated 14-Way Power Front Seats',
              'Wireless Apple CarPlay & Android Auto',
              'Configurable Ambient Interior Lighting',
              'Keyless Entry & Hands-Free Powered Tailgate',
            ],
            history: {
              owners: 1,
              accidents: 0,
              serviceRecords: 3,
              inspectionStatus: '165-Point Certified Passed',
            },
          };
        }

        // Default Mercedes S-Class or Toyota Camry
        return {
          _id: id || '1',
          year: 2024,
          make: 'Mercedes-Benz',
          model: 'S-Class',
          trim: 'S 580 4MATIC Executive',
          price: 114500,
          mileage: 3200,
          stockNumber: 'P24-101',
          vin: 'WDD2231761A092819',
          status: 'available',
          exteriorColor: 'Obsidian Black Metallic',
          interiorColor: 'Exclusive Nappa Leather in Carmine Red / Black',
          fuelType: '4.0L V8 Biturbo with EQ Boost',
          transmission: '9G-TRONIC 9-Speed Automatic',
          drivetrain: '4MATIC All-Wheel Drive',
          engine: '4.0L V8 Twin-Turbo Mild Hybrid (496 hp / 516 lb-ft)',
          image: '/images/sedan.jpg',
          description:
            'Flagship executive luxury sedan with Executive Rear Seat Package, Burmester 3D Surround Audio, Rear Axle Steering, 3D Technology Display, and MBUX Augmented Reality Head-Up Display.',
          features: [
            'Burmester® 3D High-End Surround Sound System',
            'Executive Rear Seat Package with Calf Rest & Massage',
            'Rear-Axle Steering (4.5 Degree Angle)',
            'MBUX Augmented Reality Head-Up Display',
            'Active Ambient Lighting with 64 Color Presets',
            'Panoramic Sunroof & Power Rear Sunblinds',
            'Driver Assistance Package with Level 2 Autonomous Drive',
            'AIRMATIC Air Suspension with Adaptive Damping',
          ],
          history: {
            owners: 1,
            accidents: 0,
            serviceRecords: 2,
            inspectionStatus: 'Certified Pre-Owned Inspection Passed',
          },
        };
      }
    },
  });

  const v = vehicleData || {};
  const isSuv = v.model?.includes('Velar') || v.model?.includes('SUV') || v.model?.includes('F-150');
  const heroImage = v.image || (isSuv ? '/images/suv.jpg' : '/images/sedan.jpg');

  const handleCopyVin = () => {
    if (v.vin) {
      navigator.clipboard.writeText(v.vin);
      setCopiedVin(true);
      setTimeout(() => setCopiedVin(false), 2000);
    }
  };

  // Associated prospective leads looking at this car
  const associatedLeads = [
    {
      id: '1',
      customerName: 'John Carter',
      phone: '+1 (555) 301-4492',
      stage: 'Follow-Up',
      temperature: 'hot',
      assignedTo: 'Shane Miller',
      note: 'Inquired about 60-month financing terms and trade-in value.',
    },
    {
      id: '2',
      customerName: 'Sarah Jenkins',
      phone: '+1 (555) 849-1029',
      stage: 'Contacted',
      temperature: 'warm',
      assignedTo: 'Alex Vance',
      note: 'Scheduled showroom test drive for Saturday morning.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto text-white pb-12">
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/vehicles')}
            className="p-2 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[#D4AF37] hover:text-[#E6C85C] text-[#B8B8B8] transition bg-[#111111]"
            title="Back to Inventory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
                {v.year} {v.make} {v.model}
              </h1>
              <span className="badge badge-success font-bold text-xs">
                {v.status ? v.status.toUpperCase() : 'AVAILABLE'}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#181818] border border-[rgba(255,255,255,0.1)] text-[#D4AF37] text-xs font-mono font-bold">
                Stock #{v.stockNumber}
              </span>
            </div>
            <p className="text-xs text-[#B8B8B8] mt-0.5 font-medium">
              {v.trim} • Lot Location: Front Display Bay 04
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/leads')}
            className="btn-secondary btn-sm text-xs gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Create Lead for Car</span>
          </button>
          <button
            onClick={() => alert(`Window sticker PDF generated for ${v.stockNumber}`)}
            className="btn-secondary btn-sm text-xs gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>Print Spec Sheet</span>
          </button>
          <button
            onClick={() => alert(`Vehicle marked as reserved for customer inquiry.`)}
            className="btn-primary btn-sm text-xs gap-1.5 font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Hold / Reserve Unit</span>
          </button>
        </div>
      </div>

      {/* ── Main Vehicle Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT 60% (7 cols): Real Photography Gallery & Technical Specs ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Card */}
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden shadow-card">
            <div className="relative h-80 sm:h-96 w-full bg-black overflow-hidden group">
              <img
                src={heroImage}
                alt={`${v.year} ${v.make} ${v.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-[rgba(212,175,55,0.4)] text-[#E6C85C] font-mono text-xs font-bold shadow-gold-sm">
                  {v.stockNumber}
                </span>
                <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-green-500/40 text-green-400 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Clean Title • 0 Accidents
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <span className="text-white font-medium bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-[rgba(255,255,255,0.1)]">
                  Studio Commercial Photography
                </span>
                <span className="text-[#E6C85C] font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-[rgba(212,175,55,0.3)]">
                  HD Lot Inspection Verified
                </span>
              </div>
            </div>

            {/* Photo Thumbnails Switcher */}
            <div className="p-3 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)] flex items-center gap-3 overflow-x-auto">
              {[heroImage, '/images/showroom-hero.jpg', heroImage].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoTab(idx)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                    activePhotoTab === idx
                      ? 'border-[#D4AF37] shadow-gold-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Installed Equipment & Features */}
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Factory Options & Key Equipment
              </h3>
              <span className="text-xs text-[#B8B8B8]">Verified Window Sticker</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(v.features || [
                'Panoramic Power Sunroof',
                'Surround View 360° Camera',
                'Nappa Leather Seats',
                'Premium Sound System',
                'Adaptive Cruise Control',
                'Wireless Apple CarPlay',
              ]).map((feat: string, i: number) => (
                <div
                  key={i}
                  className="p-2.5 bg-[#0D0D0D] rounded-lg border border-[rgba(255,255,255,0.06)] flex items-center gap-2.5 text-xs text-white"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span className="font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Description */}
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Dealership Lot Overview
            </h3>
            <p className="text-xs text-[#B8B8B8] leading-relaxed">
              {v.description ||
                'This vehicle is fully inspected, detailed, and available for immediate showroom demonstration or delivery. Includes multi-point inspection warranty.'}
            </p>
          </div>
        </div>

        {/* ── RIGHT 40% (5 cols): Pricing, Specs & Customer Interest ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price & Financing Calculator Card */}
          <div className="bg-[#111111] border border-[rgba(212,175,55,0.3)] rounded-2xl p-6 shadow-gold-sm space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-[#7D7D7D] uppercase font-bold tracking-wider">
                  Asking Lot Price
                </span>
                <div className="text-3xl font-extrabold text-[#E6C85C] font-mono tracking-tight mt-1">
                  ${v.price?.toLocaleString()}
                </div>
              </div>
              <span className="badge badge-gold font-bold text-xs">Certified Retail</span>
            </div>

            {/* Estimated Finance Payment */}
            <div className="p-3 bg-[#0D0D0D] rounded-xl border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
              <div>
                <p className="text-[#7D7D7D]">Estimated Monthly</p>
                <p className="text-sm font-bold text-white font-mono">
                  ${Math.round(((v.price || 50000) * 0.9 * 1.05) / 60)} / mo
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#7D7D7D]">Terms</p>
                <p className="text-xs font-semibold text-[#E6C85C]">60 mos @ 4.9% APR</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <button
                onClick={() => alert(`Financing pre-approval link copied for ${v.stockNumber}`)}
                className="btn-secondary py-2 text-xs font-semibold text-center justify-center"
              >
                Share Quote Link
              </button>
              <button
                onClick={() => navigate('/leads')}
                className="btn-primary py-2 text-xs font-bold text-center justify-center"
              >
                Assign Customer Lead
              </button>
            </div>
          </div>

          {/* Vehicle Specifications Table */}
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-card space-y-3">
            <h3 className="text-xs font-bold text-[#E6C85C] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
              Vehicle Specifications
            </h3>

            <div className="space-y-2 text-xs divide-y divide-[rgba(255,255,255,0.06)]">
              <div className="flex justify-between py-1.5 pt-0">
                <span className="text-[#B8B8B8]">VIN Number</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-white font-semibold">{v.vin}</span>
                  <button
                    onClick={handleCopyVin}
                    className="text-[#D4AF37] hover:text-[#E6C85C] p-0.5"
                    title="Copy VIN"
                  >
                    {copiedVin ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#B8B8B8]">Odometer Mileage</span>
                <span className="font-semibold text-white font-mono">{v.mileage?.toLocaleString()} miles</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#B8B8B8]">Powertrain / Engine</span>
                <span className="font-medium text-white truncate max-w-[200px]">{v.engine || v.fuelType}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#B8B8B8]">Transmission</span>
                <span className="font-medium text-white">{v.transmission || 'Automatic'}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#B8B8B8]">Drivetrain</span>
                <span className="font-semibold text-white">{v.drivetrain || 'All-Wheel Drive (AWD)'}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#B8B8B8]">Exterior Color</span>
                <span className="font-medium text-white">{v.exteriorColor || 'Obsidian Black'}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-[#B8B8B8]">Interior Trim</span>
                <span className="font-medium text-white truncate max-w-[200px]">
                  {v.interiorColor || 'Leather Executive'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Prospective Leads for this Vehicle */}
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#E6C85C] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                Active Leads for this Car
              </h3>
              <span className="badge badge-hot font-bold text-[10px]">
                {associatedLeads.length} Inquiries
              </span>
            </div>

            <div className="space-y-2.5">
              {associatedLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className="p-3 bg-[#0D0D0D] border border-[rgba(255,255,255,0.06)] hover:border-[#D4AF37] rounded-xl cursor-pointer transition space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white group-hover:text-[#E6C85C] transition-colors">
                      {lead.customerName}
                    </span>
                    <span className="badge badge-gold text-[10px]">{lead.stage}</span>
                  </div>
                  <p className="text-[11px] text-[#B8B8B8] leading-tight">{lead.note}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#7D7D7D] pt-1 border-t border-[rgba(255,255,255,0.04)]">
                    <span>Rep: {lead.assignedTo}</span>
                    <span className="text-[#D4AF37] font-semibold group-hover:underline flex items-center gap-0.5">
                      Open Workspace →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
