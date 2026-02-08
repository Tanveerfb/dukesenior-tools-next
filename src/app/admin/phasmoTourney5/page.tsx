"use client";
import { Container, Card, Row, Col, Alert } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import InlineLink from "@/components/ui/InlineLink";
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
      <Container className="py-5">
        <Alert variant="danger">Admin access required</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1 className="mb-2">Phasmo Tourney 5 Admin</h1>
        <p className="text-muted">
          Manage all aspects of Phasmo Tourney 5 from this central hub
        </p>
      </div>

      <Row className="g-4">
        {adminTools.map((tool) => (
          <Col key={tool.href} xs={12} sm={6} lg={4}>
            <Card
              as={InlineLink}
              href={tool.href}
              className="h-100 admin-tool-card"
              style={{
                textDecoration: "none",
                transition: "all 0.2s ease",
                cursor: "pointer",
                border: "1px solid rgba(0,0,0,0.125)",
              }}
            >
              <Card.Body className="d-flex flex-column">
                <div
                  className="mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    backgroundColor: `${tool.color}20`,
                    color: tool.color,
                    fontSize: "24px",
                  }}
                >
                  {tool.icon}
                </div>
                <Card.Title className="mb-2" style={{ fontSize: "1.1rem" }}>
                  {tool.title}
                </Card.Title>
                <Card.Text
                  className="text-muted flex-grow-1"
                  style={{ fontSize: "0.9rem" }}
                >
                  {tool.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx global>{`
        .admin-tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Container>
  );
}
