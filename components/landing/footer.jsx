"use client"

import { Twitter, Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo-single.png" 
                alt="Payollar Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 leading-relaxed">
              Connecting talented creators with media opportunities. Build your career, grow your network, and get paid
              for your passion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-emerald-900/30 hover:border-emerald-500/50 transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-emerald-900/30 hover:border-emerald-500/50 transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-emerald-900/30 hover:border-emerald-500/50 transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-emerald-900/30 hover:border-emerald-500/50 transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-300">How It Works</a>
              </li>
              <li>
                <a href="/#features" className="text-gray-400 hover:text-white transition-colors duration-300">Features</a>
              </li>
              <li>
                <a href="/pricing" className="text-gray-400 hover:text-white transition-colors duration-300">Pricing</a>
              </li>
              <li>
                <a href="/talents" className="text-gray-400 hover:text-white transition-colors duration-300">Find Talents</a>
              </li>
              <li>
                <a href="/campaigns" className="text-gray-400 hover:text-white transition-colors duration-300">Campaigns</a>
              </li>
              <li>
                <a href="/products" className="text-gray-400 hover:text-white transition-colors duration-300">Products</a>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">For Users</h3>
            <ul className="space-y-3">
              <li>
                <a href="/onboarding" className="text-gray-400 hover:text-white transition-colors duration-300">Join as Talent</a>
              </li>
              <li>
                <a href="/store" className="text-gray-400 hover:text-white transition-colors duration-300">Store</a>
              </li>
              <li>
                <a href="/help" className="text-gray-400 hover:text-white transition-colors duration-300">Help Center</a>
              </li>
              <li>
                <a href="/contact-support" className="text-gray-400 hover:text-white transition-colors duration-300">Contact Support</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">hello@payollar.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">+233 (55) 820-7902</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
                <span className="text-gray-400">
                  osabu link 
                  <br />
                  Accra Ghana, Adenta
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">© 2026 Payollar. All rights reserved.</div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
