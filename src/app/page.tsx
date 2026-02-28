"use client";
import HeroSection from "@/components/home/HeroSection";
import StatsOverview from "@/components/home/StatsOverview";
import FeaturedPosts from "@/components/home/FeaturedPosts";
import QuickActions from "@/components/home/QuickActions";
import ActivityFeed from "@/components/home/ActivityFeed";

export default function HomePage() {
  return (
    <main>
      {/* Hero Section - Full Width */}
      <HeroSection />

      {/* Stats Overview - Full Width */}
      <StatsOverview />

      {/* Main Content - Two Column Layout */}
      <div className="py-8 md:py-12 bg-background dark:bg-background-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Featured Posts */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded bg-secondary text-white text-xs font-semibold uppercase tracking-wide">
                    Latest Updates
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground dark:text-foreground-dark mb-1">
                  Community Posts & Resource Drops
                </h2>
                <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted mb-6">
                  Stay current on announcements, guides, and match recaps from
                  the DukeSenior team.
                </p>
              </div>

              <FeaturedPosts maxFeatured={6} showSampleFallback={false} />
            </div>

            {/* Right Column - Quick Actions & Activity Feed */}
            <div className="space-y-8">
              <QuickActions />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
