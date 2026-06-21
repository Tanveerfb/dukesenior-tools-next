"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import InlineLink from "@/components/ui/InlineLink";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  topPosts: Array<{
    postId: string;
    title: string;
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    createdAt: number;
  }>;
  tagUsage: Array<{
    tag: string;
    postCount: number;
    totalViews: number;
  }>;
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
}

export default function AnalyticsPage() {
  const { admin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;

      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/cms/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await res.json();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user]);

  if (!admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded border border-red-400/30 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-300">
          Admin only
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <svg
          className="animate-spin h-8 w-8 text-primary-500 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded border border-red-400/30 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded border border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 p-3 text-sm text-blue-800 dark:text-blue-200">
          No analytics data available
        </div>
      </div>
    );
  }

  // Prepare chart data
  const topPostsData = {
    labels: analytics.topPosts.map((p) => p.title.substring(0, 30) + "..."),
    datasets: [
      {
        label: "Views",
        data: analytics.topPosts.map((p) => p.views),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const tagUsageData = {
    labels: analytics.tagUsage.map((t) => t.tag),
    datasets: [
      {
        label: "Post Count",
        data: analytics.tagUsage.map((t) => t.postCount),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(199, 199, 199, 0.6)",
          "rgba(83, 102, 255, 0.6)",
          "rgba(255, 99, 255, 0.6)",
          "rgba(99, 255, 132, 0.6)",
        ],
      },
    ],
  };

  const viewsByDayData = {
    labels: analytics.viewsByDay.map((d) => d.date),
    datasets: [
      {
        label: "Views",
        data: analytics.viewsByDay.map((d) => d.views),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold text-foreground">CMS Analytics</h1>
        <InlineLink
          href="/admin/cms"
          className="ml-auto px-3 py-1.5 rounded border border-gray-500 text-gray-500 hover:bg-gray-500/10 text-sm"
        >
          Back to CMS
        </InlineLink>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center p-4">
          <h3 className="text-2xl font-bold text-primary-500">
            {analytics.totalPosts}
          </h3>
          <p className="text-foreground/60 mb-0">Total Posts</p>
        </div>
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center p-4">
          <h3 className="text-2xl font-bold text-green-600">
            {analytics.totalViews}
          </h3>
          <p className="text-foreground/60 mb-0">Total Views</p>
        </div>
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center p-4">
          <h3 className="text-2xl font-bold text-blue-500">
            {analytics.totalComments}
          </h3>
          <p className="text-foreground/60 mb-0">Total Comments</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
            <div className="px-4 py-3 border-b border-border dark:border-border-dark">
              <h5 className="font-semibold text-foreground">
                Top Posts by Views
              </h5>
            </div>
            <div className="p-4" style={{ height: "400px" }}>
              <Bar data={topPostsData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
            <div className="px-4 py-3 border-b border-border dark:border-border-dark">
              <h5 className="font-semibold text-foreground">Tag Usage</h5>
            </div>
            <div className="p-4" style={{ height: "400px" }}>
              <Pie data={tagUsageData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
          <div className="px-4 py-3 border-b border-border dark:border-border-dark">
            <h5 className="font-semibold text-foreground">
              Views by Day (Last 30 Days)
            </h5>
          </div>
          <div className="p-4" style={{ height: "300px" }}>
            <Line data={viewsByDayData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top Posts Table */}
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="px-4 py-3 border-b border-border dark:border-border-dark">
          <h5 className="font-semibold text-foreground">Top Posts Details</h5>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-foreground border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left font-semibold">Title</th>
                <th className="px-3 py-2 text-left font-semibold">Views</th>
                <th className="px-3 py-2 text-left font-semibold">Likes</th>
                <th className="px-3 py-2 text-left font-semibold">Dislikes</th>
                <th className="px-3 py-2 text-left font-semibold">Comments</th>
                <th className="px-3 py-2 text-left font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topPosts.map((post) => (
                <tr
                  key={post.postId}
                  className="border-b border-border even:bg-foreground/5 hover:bg-foreground/10"
                >
                  <td className="px-3 py-2">{post.title}</td>
                  <td className="px-3 py-2">{post.views}</td>
                  <td className="px-3 py-2">{post.likes}</td>
                  <td className="px-3 py-2">{post.dislikes}</td>
                  <td className="px-3 py-2">{post.comments}</td>
                  <td className="px-3 py-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
