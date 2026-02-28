"use client";
import { useAuth } from "@/hooks/useAuth";
import InlineLink from "@/components/ui/InlineLink";
import { cn } from "@/lib/utils";
import {
  FaUsers,
  FaVoteYea,
  FaListOl,
  FaVideo,
  FaLink,
  FaComments,
  FaChartBar,
  FaRunning,
  FaDollarSign,
  FaUserFriends,
  FaTrophy,
} from "react-icons/fa";

interface AdminTool {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const adminTools: AdminTool[] = [
  {
    title: "Manage Players",
    description: "Add, edit, and manage tournament participants",
    href: "/admin/phasmoTourney5/manageplayers",
    icon: <FaUsers />,
    color: "#0d6efd",
  },
  {
    title: "Manage Vote Sessions",
    description: "Create and manage voting rounds",
    href: "/admin/phasmoTourney5/managevotesessions",
    icon: <FaVoteYea />,
    color: "#d63384",
  },
  {
    title: "Manage Eliminator",
    description: "Configure eliminator round settings",
    href: "/admin/phasmoTourney5/manageeliminator",
    icon: <FaRunning />,
    color: "#dc3545",
  },
  {
    title: "Manage Round 1 Runs",
    description: "View and manage Round 1 run submissions",
    href: "/admin/phasmoTourney5/round1-manage-runs",
    icon: <FaChartBar />,
    color: "#fd7e14",
  },
  {
    title: "Round 1: Standard",
    description: "Configure Round 1 settings and parameters",
    href: "/admin/phasmoTourney5/managerounds/round1",
    icon: <FaListOl />,
    color: "#6610f2",
  },
  {
    title: "Round 2: Money Round",
    description: "Configure Round 2 money round settings",
    href: "/admin/phasmoTourney5/managerounds/round2",
    icon: <FaDollarSign />,
    color: "#198754",
  },
  {
    title: "Round 3: Teams & Eliminator",
    description: "Configure Round 3 team and eliminator settings",
    href: "/admin/phasmoTourney5/managerounds/round3",
    icon: <FaUserFriends />,
    color: "#0dcaf0",
  },
  {
    title: "Round 4: Twitch Chat Round",
    description: "Configure Twitch chat voting rounds",
    href: "/admin/phasmoTourney5/manage-twitch-chat-round",
    icon: <FaComments />,
    color: "#17a2b8",
  },
  {
    title: "Round 5: Tourney 5 Special",
    description: "Configure Round 5 special settings",
    href: "/admin/phasmoTourney5/managerounds/round5",
    icon: <FaListOl />,
    color: "#e83e8c",
  },
  {
    title: "Round 6: Pick Your Friend",
    description: "Configure Round 6 friend selection settings",
    href: "/admin/phasmoTourney5/managerounds/round6",
    icon: <FaUserFriends />,
    color: "#fd7e14",
  },
  {
    title: "Round 7: Finale",
    description: "Configure finale round settings",
    href: "/admin/phasmoTourney5/managerounds/round7",
    icon: <FaTrophy />,
    color: "#ffc107",
  },
  {
    title: "Manage Videos",
    description: "Add and organize tournament videos",
    href: "/admin/phasmoTourney5/manage-videos",
    icon: <FaVideo />,
    color: "#6f42c1",
  },
  {
    title: "Manage Content Links",
    description: "Update content and resource links",
    href: "/admin/phasmoTourney5/manage-content-links",
    icon: <FaLink />,
    color: "#20c997",
  },
  {
    title: "Data Posters",
    description: "Generate and manage data visualizations",
    href: "/admin/phasmoTourney5/tourney-data-posters",
    icon: <FaChartBar />,
    color: "#28a745",
  },
];

export default function PhasmoTourney5AdminPage() {
  const { admin } = useAuth();

  if (!admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-xl border border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 px-4 py-3">
          Admin access required
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Phasmo Tourney 5 Admin
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage all aspects of Phasmo Tourney 5 from this central hub
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminTools.map((tool) => (
          <InlineLink
            key={tool.href}
            href={tool.href}
            className={cn(
              "group block h-full rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm",
              "no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
            )}
          >
            <div className="flex flex-col p-4 h-full">
              <div
                className="mb-3 flex items-center justify-center w-12 h-12 rounded-lg text-2xl"
                style={{
                  backgroundColor: `${tool.color}20`,
                  color: tool.color,
                }}
              >
                {tool.icon}
              </div>
              <h3 className="mb-2 text-[1.1rem] font-semibold text-foreground">
                {tool.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 flex-grow text-[0.9rem]">
                {tool.description}
              </p>
            </div>
          </InlineLink>
        ))}
      </div>
    </div>
  );
}
