import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, MessageSquare, Sparkles, CheckCircle2, ArrowRight, ShieldCheck,
  Zap, Clock, Users, Calendar, GitMerge, ChevronRight, BarChart3, Star,
  Phone, Send, Bot, Check, HelpCircle, ChevronDown, Award, TrendingUp,
  Activity, DollarSign, Eye, Flame, Layers
} from 'lucide-react';

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [tickerIndex, setTickerIndex] = useState(0);

  const realTimeEvents = [
    { lot: 'Premier Auto (Austin, TX)', event: 'John Carter submitted financing inquiry on 2024 Mercedes S 580', value: '$114,500', time: '2m ago', type: 'lead' },
    { lot: 'Vance Motor Cars (Miami, FL)', event: 'Shane Miller booked Saturday 2 PM test drive on 2024 Range Rover Velar', value: '$79,200', time: '4m ago', type: 'appointment' },
    { lot: 'Apex Auto Group (Dallas, TX)', event: 'Deal Closed! 2024 Porsche 911 marked as SOLD', value: '$129,400', time: '9m ago', type: 'sale' },
    { lot: 'Boulevard Pre-Owned (Atlanta, GA)', event: 'AI Copilot auto-generated 60-month financing breakdown in 1.2s', value: '4.9% APR', time: '12m ago', type: 'ai' },
    { lot: 'Summit Auto Exchange (Phoenix, AZ)', event: 'New inbound lead from Facebook Ads (94% Buying Intent)', value: 'Hot Lead', time: '15m ago', type: 'lead' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % realTimeEvents.length);
    }, 3800);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const showcaseScreens = [
    {
      title: '1. Intelligent Lead Workspace',
      subtitle: 'Instant 360° buyer profiles with automated intent scoring, vehicle history, and rapid SMS actions.',
      badge: 'Lead Intelligence',
      image: '/images/sedan.jpg',
      vehicleName: '2024 Mercedes-Benz S-Class S 580',
      price: '$114,500',
      preview: {
        header: 'John Carter • 2024 S-Class Executive',
        tag: 'HOT LEAD • 94% Intent',
        metric: '$114,500 Lot Value',
        detail: 'Inquired about 60-month 4.9% APR financing. Trade appraisal pending for 2021 BMW 330i.',
      },
    },
    {
      title: '2. Unified Omnichannel Inbox',
      subtitle: 'Two-way SMS, customer emails, internal staff notes, and call recordings in one unified timeline.',
      badge: 'Shared Inbox',
      image: '/images/suv.jpg',
      vehicleName: '2024 Range Rover Velar Dynamic',
      price: '$79,200',
      preview: {
        header: 'Live Omnichannel Conversation',
        tag: 'SMS + Email Unified',
        metric: '< 2.4 Min Response',
        detail: 'Customer replied: "Is this vehicle still available? Can we test drive Saturday afternoon at 2 PM?"',
      },
    },
    {
      title: '3. Real-Time Deal Pipeline',
      subtitle: 'Visual Kanban tracking inventory progression and gross profit margin from initial contact to sold.',
      badge: 'Dealership Pipeline',
      image: '/images/white-supercar-studio.jpg',
      vehicleName: '2024 Mercedes-AMG GT Coupe',
      price: '$184,900',
      preview: {
        header: 'Active Deal Pipeline',
        tag: '28 Active Deals',
        metric: '$2.47M Total Pipeline',
        detail: '5 deals currently in negotiation stage. Automated alerts on overdue follow-ups.',
      },
    },
    {
      title: '4. AI Sales Assistant Copilot',
      subtitle: 'Context-aware intelligence drafting personalized payment options and scheduling test drives instantly.',
      badge: 'AI Sales Intelligence',
      image: '/images/porsche-hero.jpg',
      vehicleName: '2024 Porsche Panamera Turbo',
      price: '$129,400',
      preview: {
        header: 'Dealership AI Copilot',
        tag: 'OpenAI GPT-4o Engine',
        metric: 'Instant Smart Replies',
        detail: 'AI suggested reply: "Hi John, promotional financing is 4.9% APR for 60 months. Shall I prepare the test drive paperwork for 2 PM?"',
      },
    },
    {
      title: '5. Automated Follow-Up Sequences',
      subtitle: 'TCPA-compliant multi-touch sequences that nurture unconverted leads and halt immediately upon reply.',
      badge: 'Smart Automations',
      image: '/images/showroom-hero.jpg',
      vehicleName: 'Premier Auto Showroom Inventory',
      price: 'Lot Fleet',
      preview: {
        header: 'New Lead Sequence Automation',
        tag: 'TCPA Guard Active',
        metric: '100% Delivery Rate',
        detail: 'Instant welcome text → 15m delay → check customer reply → schedule manager call reminder.',
      },
    },
  ];

  const faqs = [
    {
      q: 'How quickly can our independent dealership get set up?',
      a: 'Most dealerships are operational in under 10 minutes. Our onboarding wizard imports your active vehicle inventory, configures your pipeline stages, and activates your virtual dealership SMS phone lines immediately.',
    },
    {
      q: 'Does DealerOS comply with automotive TCPA and opt-out laws?',
      a: 'Yes. Every outbound SMS and email enforces TCPA consent validation, automatic "STOP" opt-out handling, and Do Not Contact protections. Automated sequences immediately stop when a prospect replies.',
    },
    {
      q: 'Can my sales team access DealerOS on mobile?',
      a: 'Absolutely. DealerOS is designed mobile-first for showroom floors and car lots. Salespeople can reply to customer texts, schedule test drives, and view vehicle specs on any smartphone.',
    },
    {
      q: 'How does the AI Assistant help our salespeople close deals?',
      a: 'The AI assistant analyzes incoming customer questions (financing, trade-ins, appointments) and drafts personalized, professional responses in seconds for the salesperson to review and send with one click.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col font-sans text-white selection:bg-[#D4AF37]/30">
      {/* ── 0. Scroll Progress Bar (Top) ── */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[#9F7C22] via-[#D4AF37] to-[#F0D879] z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── 1. Premium LuxeMotion Navigation & Hero Showcase (§ User Reference Image Match) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-8 w-full">
        {/* Rounded Luxury Stage Frame matching user's reference image */}
        <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#080808] border border-[rgba(255,255,255,0.1)] overflow-hidden shadow-modal p-6 sm:p-10 lg:p-12 transition-all">
          
          {/* Ambient Lighting & Glow */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          {/* ── Inner Navigation Bar ── */}
          <div className="relative z-20 flex items-center justify-between pb-8 sm:pb-12 border-b border-[rgba(255,255,255,0.06)]">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl sm:text-2xl text-white font-display tracking-tight">
                LuxeMotion<span className="text-[#D4AF37]">.</span>
              </span>
            </div>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#8C8C8C]">
              <a href="#" className="text-white hover:text-white transition">Home</a>
              <a href="#features" className="hover:text-white transition">Our Services</a>
              <a href="#showcase" className="hover:text-white transition">About Us</a>
              <a href="#ai" className="hover:text-white transition">Why Us</a>
              <a href="#pricing" className="hover:text-white transition">Contact Us</a>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#B8B8B8] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-pointer">
                <span>ENG</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#7D7D7D]" />
              </div>
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition flex items-center gap-1.5"
              >
                <span>Portal Login</span>
              </Link>
            </div>
          </div>

          {/* ── Hero Main Content & Car Showcase ── */}
          <div className="relative z-20 pt-8 sm:pt-14 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Headline, Subtitle, White Pill CTA */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] font-display">
                  Luxury Without{' '}
                  <span className="block text-white">
                    Limits
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#8C8C8C] leading-relaxed max-w-md font-normal">
                  Curated selection of the world’s finest automobiles. Unrivaled performance, unmatched elegance, and seamless automotive intelligence.
                </p>

                <div className="pt-2 flex items-center gap-4 flex-wrap">
                  <Link
                    to="/vehicles"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-[#F0D879] hover:shadow-gold-sm transition-all duration-200"
                  >
                    <span>Explore Inventory</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm transition"
                  >
                    <span>Dealership CRM</span>
                  </Link>
                </div>

                {/* Quick Lot Metrics */}
                <div className="pt-4 flex items-center gap-6 text-xs text-[#7D7D7D] border-t border-[rgba(255,255,255,0.06)]">
                  <div>
                    <span className="text-white font-bold block text-sm font-display">2,400+</span>
                    <span>Units Delivered</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div>
                    <span className="text-white font-bold block text-sm font-display">99.4%</span>
                    <span>Client Satisfaction</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div>
                    <span className="text-[#E6C85C] font-bold block text-sm font-display">Zero Wait</span>
                    <span>Instant Showroom Delivery</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Supercar Hero Photo & Floating Spec HUD */}
              <div className="lg:col-span-6 relative mt-6 lg:mt-0 flex flex-col items-center justify-center">
                
                {/* Floating Spec HUD Card (Top Right) */}
                <div className="self-end mb-3 sm:mb-4 p-3.5 sm:p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl max-w-xs space-y-1.5 z-30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-display">Lamborghini Huracán</span>
                    <span className="text-[10px] font-bold text-[#E6C85C] font-mono px-1.5 py-0.5 rounded bg-white/10">LP 640-4</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#B8B8B8] pt-1">
                    <div>
                      <span className="text-[#7D7D7D] block text-[10px]">Acceleration</span>
                      <span className="text-white font-mono font-bold text-xs">0-60 in 2.9s</span>
                    </div>
                    <div>
                      <span className="text-[#7D7D7D] block text-[10px]">Engine Output</span>
                      <span className="text-[#E6C85C] font-mono font-bold text-xs">631 HP V10</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span>Top Speed: 202 mph</span>
                      <span className="text-green-400 font-medium">Available in Showroom</span>
                    </div>
                  </div>
                </div>

                {/* Hero Supercar Image Container */}
                <div className="relative w-full overflow-hidden rounded-2xl group">
                  <img
                    src="/images/supercar-white-studio.jpg"
                    alt="White Exotic Supercar - Luxury Without Limits"
                    className="w-full h-auto max-h-[380px] sm:max-h-[460px] object-cover object-center rounded-2xl filter brightness-105 contrast-110 drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Subtle Dark Vignette blend at bottom edges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent pointer-events-none opacity-60" />
                </div>
              </div>
            </div>

            {/* Bottom Multi-Vehicle Switcher Strip */}
            <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-semibold text-[#7D7D7D] mr-2">Featured Lot:</span>
                <Link
                  to="/vehicles"
                  className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition flex items-center gap-1.5"
                >
                  <span>Lamborghini Huracán</span>
                  <span className="text-[#E6C85C] font-mono">$289k</span>
                </Link>
                <Link
                  to="/vehicles"
                  className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#B8B8B8] hover:text-white text-xs font-semibold hover:bg-white/15 transition flex items-center gap-1.5"
                >
                  <span>Mercedes S 580</span>
                  <span className="text-[#E6C85C] font-mono">$114k</span>
                </Link>
                <Link
                  to="/vehicles"
                  className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#B8B8B8] hover:text-white text-xs font-semibold hover:bg-white/15 transition flex items-center gap-1.5"
                >
                  <span>Range Rover Velar</span>
                  <span className="text-[#E6C85C] font-mono">$79k</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Verified Independent Dealership Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. REAL-TIME LIVE LOT TICKER (§ Realtime Site Requirement) ── */}
      <div className="bg-[#0B0B0B] border-y border-[rgba(212,175,55,0.2)] py-3 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-[#D4AF37] text-[11px] font-mono">
              LIVE LOT ACTIVITY
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="animate-fade-in flex items-center gap-3 text-xs text-white truncate">
              <span className="font-semibold text-[#E6C85C]">{realTimeEvents[tickerIndex].lot}:</span>
              <span className="text-[#D0D0D0] truncate">{realTimeEvents[tickerIndex].event}</span>
              <span className="font-mono text-xs text-white font-bold bg-white/10 px-2 py-0.5 rounded">
                {realTimeEvents[tickerIndex].value}
              </span>
              <span className="text-[#6E6E6E] font-mono text-[11px] shrink-0">{realTimeEvents[tickerIndex].time}</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#8C8C8C] shrink-0">
            <span>142 Dealerships Connected</span>
            <span className="text-white/20">•</span>
            <span className="text-green-400 font-mono">99.98% Socket Sync</span>
          </div>
        </div>
      </div>

      {/* ── 3. 3D PERSPECTIVE PROBLEM SECTION WITH AUTOMOTIVE IMAGES (§ User Screenshots 1) ── */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#E6C85C] text-xs font-semibold uppercase tracking-wider">
            Operational Dilemma
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            Why Independent Lots Lose Premium Deals
          </h2>
          <p className="text-sm sm:text-base text-[#8C8C8C] max-w-2xl mx-auto font-normal">
            Legacy automotive software was engineered for 500-car franchise lots with full BDC call centers. Independent dealers need instant speed, WhatsApp/SMS response, and real-time inventory leverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: 3D Tilt with Real Showroom Vignette */}
          <div className="relative group rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] p-7 transition-all duration-500 hover:[transform:perspective(1000px)_rotateX(4deg)_rotateY(-3deg)_translateY(-8px)] hover:border-[#D4AF37]/50 hover:shadow-2xl">
            <div className="absolute inset-0 -z-10 opacity-15 group-hover:opacity-30 transition-opacity duration-500">
              <img src="/images/showroom-hero.jpg" alt="Dealership Showroom" className="w-full h-full object-cover filter brightness-50 contrast-125" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Speed Deficit</span>
                <h3 className="text-xl font-bold text-white mt-1">Slow Lead Response Times</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
                Leads that sit uncontacted for more than 15 minutes have a 78% lower close rate. Without automated SMS dispatch, online car buyers leave your lot for the competitor down the highway.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#6E6E6E]">Industry Drop-off:</span>
                <span className="text-red-400 font-bold font-mono">-78% Close Rate</span>
              </div>
            </div>
          </div>

          {/* Card 2: 3D Tilt with Real Mercedes Studio Vignette */}
          <div className="relative group rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] p-7 transition-all duration-500 hover:[transform:perspective(1000px)_rotateX(4deg)_rotateY(0deg)_translateY(-8px)] hover:border-[#D4AF37]/50 hover:shadow-2xl">
            <div className="absolute inset-0 -z-10 opacity-15 group-hover:opacity-30 transition-opacity duration-500">
              <img src="/images/sedan.jpg" alt="Mercedes S-Class" className="w-full h-full object-cover filter brightness-50 contrast-125" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#E6C85C] uppercase tracking-wider">Visibility Gap</span>
                <h3 className="text-xl font-bold text-white mt-1">Scattered Rep Messaging</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
                Sales reps texting on personal mobile phones creates zero transparency for lot owners. When sales staff leave, critical customer conversations, trade details, and deals vanish with them.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#6E6E6E]">Owner Visibility:</span>
                <span className="text-amber-400 font-bold font-mono">0% on Personal Cells</span>
              </div>
            </div>
          </div>

          {/* Card 3: 3D Tilt with Real Range Rover Studio Vignette */}
          <div className="relative group rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] p-7 transition-all duration-500 hover:[transform:perspective(1000px)_rotateX(4deg)_rotateY(3deg)_translateY(-8px)] hover:border-[#D4AF37]/50 hover:shadow-2xl">
            <div className="absolute inset-0 -z-10 opacity-15 group-hover:opacity-30 transition-opacity duration-500">
              <img src="/images/suv.jpg" alt="Range Rover Velar" className="w-full h-full object-cover filter brightness-50 contrast-125" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Process Failure</span>
                <h3 className="text-xl font-bold text-white mt-1">Forgotten Follow-Ups</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
                Post-it notes and mental reminders fail during busy weekend showroom foot traffic. Without automated multi-day SMS nurture sequences, ready buyers purchase from another dealership.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#6E6E6E]">Deals Lost:</span>
                <span className="text-blue-400 font-bold font-mono">42% Due to Inactivity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. REAL-TIME UNIFIED TIMELINE WITH 3D INTERACTIVE PHONE MOCKUP (§ User Screenshots 2) ── */}
      <section id="conversations" className="py-24 px-6 bg-[#090909] border-y border-[rgba(255,255,255,0.06)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text & Feature Checklist */}
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] text-[#E6C85C] text-xs font-semibold uppercase tracking-wider">
              Centralized Communications Hub
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
              Every SMS. Every Email. <br />
              <span className="text-[#E6C85C]">One Real-Time Stream.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#8C8C8C] leading-relaxed font-normal">
              Eliminate app toggling. DealerOS synchronizes two-way customer texts, inbound emails, staff internal notes, and call recordings into one unified timeline accessible by the entire sales desk.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dedicated Dealership Virtual Numbers</h4>
                  <p className="text-[11px] text-[#7D7D7D]">Full TCPA consent checking, call recording, and instant SMS routing.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live WebSockets Real-Time Sync</h4>
                  <p className="text-[11px] text-[#7D7D7D]">Messages synchronize across web and mobile without refreshing.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Deal Assistant Autofill</h4>
                  <p className="text-[11px] text-[#7D7D7D]">Drafts financing breakdowns, answers inventory questions in seconds.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Angled Interactive Message Stream with Real Car Photo */}
          <div className="lg:col-span-7 relative">
            <div className="rounded-3xl p-6 bg-[#0E0E0E] border border-[rgba(255,255,255,0.1)] shadow-2xl space-y-4 transition-all duration-500 hover:[transform:perspective(1200px)_rotateY(-3deg)_rotateX(2deg)]">
              
              {/* Top Conversation Header with Real Vehicle Image */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/sedan.jpg"
                    alt="2024 Mercedes-Benz S-Class"
                    className="w-14 h-11 object-cover rounded-lg border border-white/15"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">John Carter</h4>
                      <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold font-mono">ONLINE</span>
                    </div>
                    <p className="text-xs text-[#8C8C8C]">2024 Mercedes-Benz S-Class • Stock #P24-101 • $114,500</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#E6C85C]">
                  Rep: Shane Miller
                </span>
              </div>

              {/* Chat Timeline */}
              <div className="space-y-3 py-2">
                <div className="p-3.5 bg-[#141414] rounded-xl text-xs text-white max-w-[85%] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#6E6E6E]">
                    <span>John Carter (SMS)</span>
                    <span>10:15 AM</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    "Is the 2024 S-Class still available on the lot? Do you have flexible 60-month financing options with 10% down?"
                  </p>
                </div>

                <div className="p-3.5 bg-[#1A1608] border border-[rgba(212,175,55,0.3)] rounded-xl text-xs text-white max-w-[85%] ml-auto space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#E6C85C]">
                    <span className="font-semibold">Shane Miller (Sales)</span>
                    <span>10:18 AM • Delivered</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    "Hi John! Yes, the S-Class is on our showroom floor. We have tier-1 promotional financing at 4.9% APR for 60 months ($1,803/mo). I can reserve the keys for you today at 2 PM for a private test drive."
                  </p>
                </div>

                {/* Live Typing Effect Indicator */}
                <div className="flex items-center gap-2 text-[11px] text-[#6E6E6E] pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span>John Carter is typing...</span>
                </div>
              </div>

              {/* AI Suggestion Interactive Action Pill */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#E6C85C]">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="font-semibold">AI Recommended Action:</span>
                  <span className="text-[#B8B8B8] hidden sm:inline">Send 1-click test drive confirmation link</span>
                </div>
                <button className="px-3 py-1 rounded bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#E6C85C] transition">
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. INTERACTIVE 3D PLATFORM TOUR WITH REAL VEHICLE ASSETS (§ User Screenshots 3) ── */}
      <section id="showcase" className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#E6C85C] text-xs font-semibold uppercase tracking-wider">
            Interactive Operations Sandbox
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            Engineered Specifically for Independent Dealerships
          </h2>
          <p className="text-sm sm:text-base text-[#8C8C8C] max-w-xl mx-auto font-normal">
            Click through the core operational modules of DealerOS to see real-time showroom software in action.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Buttons */}
          <div className="lg:col-span-5 space-y-2.5">
            {showcaseScreens.map((screen, idx) => (
              <button
                key={screen.title}
                onClick={() => setActiveShowcase(idx)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${
                  activeShowcase === idx
                    ? 'bg-[#141414] border-[#D4AF37] shadow-gold-sm translate-x-2'
                    : 'bg-[#0A0A0A] border-white/[0.06] hover:bg-[#0F0F0F] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${activeShowcase === idx ? 'text-[#E6C85C]' : 'text-white'}`}>
                    {screen.title}
                  </h4>
                  <span className="text-[10px] font-mono text-[#7D7D7D] uppercase">{screen.badge}</span>
                </div>
                <p className="text-xs text-[#8C8C8C] mt-1 leading-relaxed font-normal">{screen.subtitle}</p>
              </button>
            ))}
          </div>

          {/* Right 3D Visual Preview with Real Car Image */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl p-6 bg-[#0E0E0E] border border-[rgba(212,175,55,0.25)] shadow-2xl space-y-5 transition-all">
              
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-[#E6C85C]">
                  {showcaseScreens[activeShowcase].preview.header}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[rgba(212,175,55,0.15)] text-[#E6C85C] text-xs font-bold font-mono">
                  {showcaseScreens[activeShowcase].preview.tag}
                </span>
              </div>

              {/* Real Vehicle Visual Card inside Preview */}
              <div className="relative rounded-xl overflow-hidden h-48 border border-white/10 group">
                <img
                  src={showcaseScreens[activeShowcase].image}
                  alt={showcaseScreens[activeShowcase].vehicleName}
                  className="w-full h-full object-cover filter brightness-95 contrast-110 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white font-bold block text-sm">{showcaseScreens[activeShowcase].vehicleName}</span>
                    <span className="text-[#A0A0A0] text-[11px]">Real-Time Lot Inventory</span>
                  </div>
                  <span className="font-mono text-base font-bold text-[#E6C85C]">{showcaseScreens[activeShowcase].price}</span>
                </div>
              </div>

              {/* Live Metric Box */}
              <div className="p-4 bg-[#141414] rounded-xl border border-white/[0.08] space-y-2">
                <p className="text-[11px] text-[#7D7D7D] uppercase font-semibold">Live System Metric:</p>
                <p className="text-lg font-bold text-white font-mono">
                  {showcaseScreens[activeShowcase].preview.metric}
                </p>
                <p className="text-xs text-[#B8B8B8] leading-relaxed">
                  {showcaseScreens[activeShowcase].preview.detail}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#7D7D7D]">
                <span>Showing view {activeShowcase + 1} of 5</span>
                <Link to="/register" className="text-[#E6C85C] font-semibold hover:underline flex items-center gap-1">
                  <span>Launch live dealership sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. 3D REAL-TIME DEMO METRICS & VERIFIED TESTIMONIALS (§ User Screenshots 4) ── */}
      <section className="py-20 px-6 bg-[#080808] border-y border-[rgba(212,175,55,0.15)]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Product-Focused Demo Performance Metrics
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Quantifiable Speed & Revenue Impact
            </h2>
            <p className="text-xs text-[#7D7D7D] font-normal">
              *Sample performance indicators illustrating dealership operational goals
            </p>
          </div>

          {/* 4 Elevated Metric Blocks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-[#0F0F0F] rounded-2xl border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all hover:-translate-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">&lt; 3 min</p>
              <p className="text-xs text-[#B8B8B8] mt-2 font-medium">Average First Response Time</p>
              <p className="text-[10px] text-green-400 mt-1">Faster than 92% of lots</p>
            </div>
            <div className="p-6 bg-[#0F0F0F] rounded-2xl border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all hover:-translate-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#E6C85C] font-mono">100%</p>
              <p className="text-xs text-[#B8B8B8] mt-2 font-medium">Centralized Team Texts</p>
              <p className="text-[10px] text-[#A0A0A0] mt-1">Zero lost conversations</p>
            </div>
            <div className="p-6 bg-[#0F0F0F] rounded-2xl border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all hover:-translate-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">Zero</p>
              <p className="text-xs text-[#B8B8B8] mt-2 font-medium">Missed Follow-Ups</p>
              <p className="text-[10px] text-green-400 mt-1">Automated sequences</p>
            </div>
            <div className="p-6 bg-[#0F0F0F] rounded-2xl border border-white/[0.08] hover:border-[#D4AF37]/40 transition-all hover:-translate-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#E6C85C] font-mono">Real-Time</p>
              <p className="text-xs text-[#B8B8B8] mt-2 font-medium">Sales Pipeline Clarity</p>
              <p className="text-[10px] text-[#A0A0A0] mt-1">Live gross profit tracking</p>
            </div>
          </div>

          {/* 3 Real Dealership Owner Feedback Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="flex gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#B8B8B8] italic leading-relaxed">
                "We used to lose leads every weekend because reps were on personal phones. Having every conversation in one shared screen changed everything for our showroom."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-[#181818] border border-white/15 flex items-center justify-center text-xs font-bold text-white">
                  MV
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Marcus Vance</p>
                  <p className="text-[11px] text-[#7D7D7D]">Principal, Vance Motor Cars (Austin, TX)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121212] border border-[#D4AF37]/40 shadow-gold-sm space-y-4">
              <div className="flex gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#B8B8B8] italic leading-relaxed">
                "The AI reply generator alone saves our salespeople two hours every day. It drafts financing calculations and appointment invites in seconds."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-[#181818] border border-white/15 flex items-center justify-center text-xs font-bold text-[#E6C85C]">
                  ER
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Elena Rostova</p>
                  <p className="text-[11px] text-[#7D7D7D]">Sales Manager, Apex Auto Group (Dallas, TX)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="flex gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#B8B8B8] italic leading-relaxed">
                "Setup took literally 5 minutes. No enterprise bloat, no mandatory training seminars. Simple, clean, fast, and our team actually uses it."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-[#181818] border border-white/15 flex items-center justify-center text-xs font-bold text-white">
                  DK
                </div>
                <div>
                  <p className="text-xs font-bold text-white">David K.</p>
                  <p className="text-[11px] text-[#7D7D7D]">Owner, Boulevard Pre-Owned (Atlanta, GA)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. 3D PRICING MATRIX WITH BILLING SWITCHER (§ User Screenshots 5) ── */}
      <section id="pricing" className="py-24 px-6 bg-[#070707] border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#E6C85C] text-xs font-semibold uppercase tracking-wider">
              Transparent Dealership Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Simple Plans for Independent Lots
            </h2>
            <p className="text-sm text-[#8C8C8C] max-w-lg mx-auto font-normal">
              No long-term contracts. Cancel anytime. All plans include complete CRM functionality, virtual SMS lines, and AI Sales Copilot.
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3 text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-black'
                    : 'text-[#8C8C8C] hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-white text-black'
                    : 'text-[#8C8C8C] hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-black text-[10px] font-extrabold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Tier 1: Starter */}
            <div className="rounded-2xl p-7 bg-[#0B0B0B] border border-white/[0.08] space-y-6 flex flex-col justify-between hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Starter Lot</h3>
                <p className="text-xs text-[#7D7D7D]">For solo dealer operators & small boutique lots</p>
                <div>
                  <span className="text-4xl font-extrabold text-white font-mono">
                    ${billingCycle === 'annual' ? '119' : '149'}
                  </span>
                  <span className="text-xs text-[#7D7D7D]"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#B8B8B8] pt-2">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Up to 2 Staff Users</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> 500 SMS & Texts / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Unified Communications Inbox</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Real-Time Kanban Pipeline</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Vehicle Lot Inventory Tracking</li>
                </ul>
              </div>
              <Link to="/register" className="btn-secondary w-full text-xs font-bold py-2.5 text-center block rounded-xl">
                Start 14-Day Trial
              </Link>
            </div>

            {/* Tier 2: Professional (3D Elevated Featured Plan) */}
            <div className="rounded-2xl p-7 bg-[#111111] border-2 border-[#D4AF37] shadow-modal space-y-6 flex flex-col justify-between relative transform md:-translate-y-3">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#D4AF37] text-black text-[10px] font-extrabold uppercase tracking-wider shadow-gold-sm">
                Most Popular for Growth
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Professional</h3>
                <p className="text-xs text-[#8C8C8C]">For active independent dealerships scaling sales</p>
                <div>
                  <span className="text-4xl font-extrabold text-[#E6C85C] font-mono">
                    ${billingCycle === 'annual' ? '239' : '299'}
                  </span>
                  <span className="text-xs text-[#7D7D7D]"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#B8B8B8] pt-2">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Up to 8 Staff Users</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> 2,500 Two-Way SMS / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> AI Sales Copilot & Instant Reply Generator</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Automated Follow-Up Sequences</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Manager Live Attention Center</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Test Drive & Appointment Booking</li>
                </ul>
              </div>
              <Link to="/register" className="btn-primary w-full text-xs font-bold py-2.5 text-center block rounded-xl shadow-gold-sm">
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Tier 3: Growth */}
            <div className="rounded-2xl p-7 bg-[#0B0B0B] border border-white/[0.08] space-y-6 flex flex-col justify-between hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Multi-Lot Enterprise</h3>
                <p className="text-xs text-[#7D7D7D]">For multi-rooftop dealerships & dealer groups</p>
                <div>
                  <span className="text-4xl font-extrabold text-white font-mono">
                    ${billingCycle === 'annual' ? '399' : '499'}
                  </span>
                  <span className="text-xs text-[#7D7D7D]"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#B8B8B8] pt-2">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Unlimited Staff Accounts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> 10,000 SMS & MMS / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Multi-Dealership Instant Rooftop Switching</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> DMS & Website Inventory Webhooks</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Priority Phone & WhatsApp Support</li>
                </ul>
              </div>
              <Link to="/register" className="btn-secondary w-full text-xs font-bold py-2.5 text-center block rounded-xl">
                Contact Dealership Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ACCORDION ── */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Frequently Asked Questions</h3>
          <p className="text-xs text-[#8C8C8C]">Everything dealership owners and sales managers need to know.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="rounded-xl overflow-hidden border border-white/[0.07] bg-[#0A0A0A]"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-[#E6C85C] transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#7D7D7D] transition-transform ${openFaq === idx ? 'rotate-180 text-[#D4AF37]' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-[#B8B8B8] leading-relaxed border-t border-white/[0.04] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. FINAL HIGH-IMPACT CTA BLOCK ── */}
      <section className="py-24 px-6 relative overflow-hidden bg-[#0A0A0A] border-t border-[rgba(212,175,55,0.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            Stop Losing Deals to Clunky Software.
          </h2>
          <p className="text-sm sm:text-base text-[#8C8C8C] max-w-xl mx-auto font-normal">
            Bring every conversation, vehicle lead, and follow-up sequence into one high-performance screen. Setup takes less than 5 minutes.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/register"
              className="btn-primary btn-lg font-bold text-sm px-8 shadow-gold-sm"
            >
              <span>Start Your 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
          <p className="text-xs text-[#7D7D7D]">
            No credit card required • Instant access to Premier Auto Group demo sandbox
          </p>
        </div>
      </section>

      {/* ── 10. LUXURY AUTOMOTIVE FOOTER ── */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] bg-[#050505] py-12 px-6 lg:px-12 text-xs text-[#7D7D7D]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-bold text-white text-sm font-display">LuxeMotion CRM</span>
            </div>
            <p className="text-xs text-[#7D7D7D] max-w-sm font-normal">
              The Sales Operating System built exclusively for independent car dealerships. Every Lead. Every Conversation. Every Follow-Up.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[10px]">Product</p>
            <p><a href="#features" className="hover:text-white transition">Lead Management</a></p>
            <p><a href="#conversations" className="hover:text-white transition">Unified Inbox</a></p>
            <p><a href="#showcase" className="hover:text-white transition">Sales Pipeline</a></p>
            <p><a href="#ai" className="hover:text-white transition">AI Copilot</a></p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[10px]">Solutions</p>
            <p><a href="#features" className="hover:text-white transition">Independent Lots</a></p>
            <p><a href="#features" className="hover:text-white transition">Pre-Owned Stores</a></p>
            <p><a href="#features" className="hover:text-white transition">Buy-Here Pay-Here</a></p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white uppercase tracking-wider text-[10px]">Legal & Trust</p>
            <p><span className="hover:text-white cursor-pointer">TCPA Safety</span></p>
            <p><span className="hover:text-white cursor-pointer">Privacy Policy</span></p>
            <p><span className="hover:text-white cursor-pointer">Terms of Service</span></p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-[rgba(255,255,255,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LuxeMotion Inc. All rights reserved.</p>
          <p className="text-[#D4AF37]">Engineered for Independent Automotive Dealerships</p>
        </div>
      </footer>
    </div>
  );
}
