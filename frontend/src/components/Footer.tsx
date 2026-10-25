import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 border-t border-gray-800/80 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions / Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-850/60 border border-gray-800/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <span className="font-black text-lg">₹35</span>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Fixed ₹35 Per Poster</h4>
              <p className="text-xs text-gray-400 mt-1">Honest, straightforward pricing. 100% FREE delivery on all orders.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-850/60 border border-gray-800/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">300 GSM Matte Paper</h4>
              <p className="text-xs text-gray-400 mt-1">Ultra thick, glare-free gallery-grade art paper with vibrant HD colors.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-850/60 border border-gray-800/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Rigid Tube Packaging</h4>
              <p className="text-xs text-gray-400 mt-1">Zero wrinkles, zero bends. Arrives in heavy-duty cardboard craft tubes.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-dark-850/60 border border-gray-800/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Damage Replacement</h4>
              <p className="text-xs text-gray-400 mt-1">Hassle-free 7-day instant replacement guarantee if damaged during transit.</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-black text-sm">
                ₹35
              </div>
              <span className="font-display font-black text-xl text-white">
                POSTER<span className="text-amber-400">35</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              India’s premier poster destination. Transform your bedroom, dorm, workspace, or gaming den with iconic cinematic and sports art prints.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-dark-800 border border-amber-500/30 text-[11px] font-semibold text-amber-300">
                ⭐ Trusted by 10,000+ Poster Fans
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Featured Categories
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/posters?category=cr7" className="hover:text-amber-400 transition-colors">CR7 — Cristiano Ronaldo</Link></li>
              <li><Link to="/posters?category=dhoni" className="hover:text-amber-400 transition-colors">Dhoni — Captain Cool</Link></li>
              <li><Link to="/posters?category=english-movies" className="hover:text-amber-400 transition-colors">English Movies & Hollywood</Link></li>
              <li><Link to="/posters?category=messi" className="hover:text-amber-400 transition-colors">Messi — World Cup GOAT</Link></li>
              <li><Link to="/posters?category=music-poster" className="hover:text-amber-400 transition-colors">Music Posters & Rock Legends</Link></li>
              <li><Link to="/posters?category=tamil-movies" className="hover:text-amber-400 transition-colors">Tamil Movies & Kollywood</Link></li>
              <li><Link to="/posters?category=vijay" className="hover:text-amber-400 transition-colors">Thalapathy Vijay</Link></li>
              <li><Link to="/posters?category=virat-kohli" className="hover:text-amber-400 transition-colors">Virat Kohli — King Kohli</Link></li>
            </ul>
          </div>

          {/* Pricing Rules & Policies */}
          <div>
            <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Transparent Pricing (Free Shipping)
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex justify-between border-b border-gray-800/40 pb-1">
                <span>1 Poster</span>
                <span className="font-mono text-emerald-400 font-semibold">₹35 (FREE DELIVERY)</span>
              </li>
              <li className="flex justify-between border-b border-gray-800/40 pb-1">
                <span>2 Posters</span>
                <span className="font-mono text-emerald-400 font-semibold">₹70 (FREE DELIVERY)</span>
              </li>
              <li className="flex justify-between border-b border-gray-800/40 pb-1">
                <span>3 Posters</span>
                <span className="font-mono text-emerald-400 font-semibold">₹105 (FREE DELIVERY)</span>
              </li>
              <li className="flex justify-between border-b border-gray-800/40 pb-1 text-emerald-400 font-semibold">
                <span>5 Posters</span>
                <span className="font-mono">₹175 (FREE DELIVERY)</span>
              </li>
              <li className="flex justify-between text-emerald-400 font-semibold">
                <span>10 Posters</span>
                <span className="font-mono">₹350 (FREE DELIVERY)</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h5>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 98765 43210 (Mon-Sat, 10am-7pm)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>orders@poster35.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>T. Nagar Art Quarter, Chennai, Tamil Nadu, 600017</span>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-gray-700 text-xs transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Login</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Poster35. All rights reserved. Handcrafted with passion in India.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made for poster lovers with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            </span>
            <span>•</span>
            <span>₹35 Fixed Price Concept</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
