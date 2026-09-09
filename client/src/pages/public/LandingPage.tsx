import { Link } from 'react-router-dom';
import { Car, Users, Calendar, BarChart3, ArrowRight } from 'lucide-react';
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 text-xl font-semibold">
          <Car className="text-[#D4AF37]" />
          DealerOS
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/login">Sign in</Link>
          <Link className="btn-primary" to="/register">
            Create account
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-20">
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs mb-6">
              Your dealership, connected
            </p>
            <h1 className="text-5xl lg:text-6xl font-semibold leading-tight">
              Every lead.
              <br />
              Every follow-up.
              <br />
              <span className="text-[#D4AF37]">One workspace.</span>
            </h1>
            <p className="text-gray-400 text-lg mt-6 max-w-lg">
              Manage your customers, inventory, appointments, and sales from the
              same dealership records. Keep your team informed as work moves
              forward.
            </p>
            <div className="flex gap-4 mt-8">
              <Link
                to="/register"
                className="btn-primary flex items-center gap-2"
              >
                Set up your dealership
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary">
                Open workspace
              </Link>
            </div>
          </div>
          <img
            src="/images/sedan.jpg"
            alt="Automotive showroom"
            className="w-full rounded-2xl border border-white/10 object-cover"
          />
        </section>
        <section className="grid md:grid-cols-3 gap-5 mt-24">
          {[
            {
              icon: Users,
              title: 'Customer relationships',
              text: 'Track customer records, conversations, and assigned follow-ups.',
            },
            {
              icon: Calendar,
              title: 'Daily accountability',
              text: 'Manage appointments, pending tasks, and team responsibilities.',
            },
            {
              icon: BarChart3,
              title: 'Recorded performance',
              text: 'Review sales, conversion, and financial results from your stored records.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <article
              className="p-6 rounded-xl border border-white/10 bg-white/[0.02]"
              key={title}
            >
              <Icon className="text-[#D4AF37] mb-4" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-gray-400 mt-2">{text}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-sm">
        DealerOS · Dealership management
      </footer>
    </div>
  );
}
