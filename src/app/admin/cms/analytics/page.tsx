"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Table,
  Button,
} from "react-bootstrap";
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
  LineElement
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
      <Container className="py-5">
        <Alert variant="danger">Admin only</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container className="py-5">
        <Alert variant="info">No analytics data available</Alert>
      </Container>
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
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <h1 className="mb-0">CMS Analytics</h1>
        <Button
          as={InlineLink as any}
          href="/admin/cms"
          variant="outline-secondary"
          className="ms-auto"
        >
          Back to CMS
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{analytics.totalPosts}</h3>
              <p className="text-muted mb-0">Total Posts</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{analytics.totalViews}</h3>
              <p className="text-muted mb-0">Total Views</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{analytics.totalComments}</h3>
              <p className="text-muted mb-0">Total Comments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Posts by Views</h5>
            </Card.Header>
            <Card.Body style={{ height: "400px" }}>
              <Bar data={topPostsData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Tag Usage</h5>
            </Card.Header>
            <Card.Body style={{ height: "400px" }}>
              <Pie data={tagUsageData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Views by Day (Last 30 Days)</h5>
            </Card.Header>
            <Card.Body style={{ height: "300px" }}>
              <Line data={viewsByDayData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Posts Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Posts Details</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Dislikes</th>
                    <th>Comments</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPosts.map((post) => (
                    <tr key={post.postId}>
                      <td>{post.title}</td>
                      <td>{post.views}</td>
                      <td>{post.likes}</td>
                      <td>{post.dislikes}</td>
                      <td>{post.comments}</td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
