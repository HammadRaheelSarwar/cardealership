import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car, Plus, Search, Filter, DollarSign, Tag, CheckCircle2,
  Clock, ShieldAlert, Sparkles, ExternalLink
} from 'lucide-react';
import api from '@/services/api';

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    year: 2024,
    make: '',
    model: '',
    trim: '',
    price: 34995,
    mileage: 4800,
    stockNumber: 'P24-105',
    vin: '',
    status: 'available',
  });

  const { data: remoteVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicles');
      return res.data.data?.vehicles;
    },
  });

  const fallbackVehicles = [
    {
      _id: '1',
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
      fuelType: 'Mild Hybrid V8',
      image: '/images/sedan.jpg',
    },
    {
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
      exteriorColor: 'Santorini Black',
      fuelType: 'Turbocharged I6',
      image: '/images/suv.jpg',
    },
    {
      _id: '3',
      year: 2024,
      make: 'Toyota',
      model: 'Camry',
      trim: 'XSE V6 Sport',
      price: 34995,
      mileage: 4800,
      stockNumber: 'P24-103',
      vin: '4T1BZ1HK5RU102948',
      status: 'available',
      exteriorColor: 'Wind Chill Pearl',
      fuelType: 'Gasoline V6',
      image: '/images/sedan.jpg',
    },
    {
      _id: '4',
      year: 2024,
      make: 'Ford',
      model: 'F-150',
      trim: 'Lariat 4x4 SuperCrew',
      price: 64500,
      mileage: 8200,
      stockNumber: 'P24-304',
      vin: '1FTFW1ED4RFB83910',
      status: 'reserved',
      exteriorColor: 'Agate Black',
      fuelType: 'Twin-Turbo EcoBoost',
      image: '/images/suv.jpg',
    },
  ];

  const vehicles = remoteVehicles && remoteVehicles.length > 0 ? remoteVehicles : fallbackVehicles;

  const availableCount = vehicles.filter((v: any) => v.status === 'available').length;
  const totalInventoryValue = vehicles.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0);

  const filteredVehicles = vehicles.filter((v: any) => {
    const matchesSearch =
      `${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin} ${v.stockNumber}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">Dealership Inventory</h1>
          <p className="text-xs text-[#B8B8B8] mt-0.5">
            Manage lot vehicles, pricing, stock numbers, and customer interest links in real-time.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary btn-sm text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card py-4 px-5">
          <span className="text-[11px] text-[#7D7D7D] font-semibold uppercase tracking-wider">Units on Lot</span>
          <div className="text-2xl font-extrabold text-white mt-1 font-display">{availableCount} Available</div>
          <p className="text-xs text-[#B8B8B8] mt-0.5">Ready for showroom test drive</p>
        </div>
        <div className="metric-card py-4 px-5 border-[rgba(212,175,55,0.25)] shadow-gold-sm">
          <span className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider">Total Lot Valuation</span>
          <div className="text-2xl font-extrabold text-[#E6C85C] mt-1 font-display font-mono">
            ${totalInventoryValue.toLocaleString()}
          </div>
          <p className="text-xs text-[#B8B8B8] mt-0.5">Active retail inventory value</p>
        </div>
        <div className="metric-card py-4 px-5">
          <span className="text-[11px] text-[#7D7D7D] font-semibold uppercase tracking-wider">Pending Deals</span>
          <div className="text-2xl font-extrabold text-white mt-1 font-display">1 Reserved</div>
          <p className="text-xs text-[#B8B8B8] mt-0.5">Under contract or deposit hold</p>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D7D7D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search make, model, stock#, VIN..."
            className="crm-input pl-9 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="crm-input py-1.5 text-xs w-full sm:w-40 bg-[#0D0D0D] text-white"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      {/* ── Inventory Grid with Real Photos & High Contrast ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((v: any, idx: number) => {
          const carImg = v.image || (idx % 2 === 0 ? '/images/sedan.jpg' : '/images/suv.jpg');

          return (
            <div
              key={v._id || idx}
              onClick={() => navigate(`/vehicles/${v._id || idx + 1}`)}
              className="bg-[#111111] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(212,175,55,0.4)] hover:shadow-card-hover rounded-xl overflow-hidden transition-all flex flex-col group cursor-pointer"
            >
              {/* Photo Container */}
              <div className="h-48 bg-[#0D0D0D] relative overflow-hidden">
                <img
                  src={carImg}
                  alt={`${v.year} ${v.make} ${v.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  {v.status === 'available' && (
                    <span className="badge badge-success font-bold text-xs">Available</span>
                  )}
                  {v.status === 'reserved' && (
                    <span className="badge badge-warm font-bold text-xs">Reserved</span>
                  )}
                  {v.status === 'sold' && (
                    <span className="badge badge-neutral font-bold text-xs">Sold</span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-mono border border-[rgba(255,255,255,0.1)]">
                  {v.stockNumber}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-bold text-base text-white truncate font-display group-hover:text-[#E6C85C] transition-colors">
                      {v.year} {v.make} {v.model}
                    </h3>
                    <span className="text-lg font-extrabold text-[#E6C85C] font-mono">
                      ${v.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8B8B8] mt-0.5 truncate">{v.trim}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#B8B8B8] pt-2 border-t border-[rgba(255,255,255,0.06)]">
                  <div>
                    <span className="text-[#7D7D7D]">Mileage: </span>
                    <span className="font-semibold text-white">{v.mileage?.toLocaleString()} mi</span>
                  </div>
                  <div>
                    <span className="text-[#7D7D7D]">Engine: </span>
                    <span className="font-semibold text-white truncate">{v.fuelType}</span>
                  </div>
                  <div className="col-span-2 truncate">
                    <span className="text-[#7D7D7D]">VIN: </span>
                    <span className="font-mono text-white text-[11px]">{v.vin}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[rgba(255,255,255,0.06)]">
                  <span className="text-xs text-[#22C55E] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Clean CarFax
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/vehicles/${v._id || idx + 1}`);
                    }}
                    className="text-xs font-bold text-[#D4AF37] group-hover:text-[#F0D879] hover:underline flex items-center gap-1"
                  >
                    <span>View Lot Details</span>
                    <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
