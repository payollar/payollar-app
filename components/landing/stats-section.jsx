"use client"

import { TrendingUp, Users, ShoppingBag, Award, Calendar } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "10K+",
      label: "Active Talents",
      change: "+25% this month",
      color: "text-emerald-400",
    },
    {
      icon: Calendar,
      value: "50K+",
      label: "Bookings Completed",
      change: "+40% this month",
      color: "text-blue-400",
    },
    {
      icon: ShoppingBag,
      value: "5K+",
      label: "Products Sold",
      change: "+60% this month",
      color: "text-purple-400",
    },
    {
      icon: Award,
      value: "98%",
      label: "Satisfaction Rate",
      change: "Top rated platform",
      color: "text-yellow-400",
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-y border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className={`inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 group-hover:border-emerald-500/40 transition-colors`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 mb-1">{stat.label}</div>
              <div className="text-sm text-emerald-400 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Scrollable Slider */}
        <div className="md:hidden overflow-x-auto scrollbar-hide pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex space-x-6 min-w-max">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center flex-shrink-0 w-64 bg-slate-800/50 border border-emerald-900/30 rounded-xl p-6"
              >
                <div className={`inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 mb-1 text-sm">{stat.label}</div>
                <div className="text-xs text-emerald-400 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  )
}
