"use client";

import React, { useState, useEffect } from "react";
import { Container, Tabs, Tab, Card, Row, Col, Button, Form, Badge, Spinner } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/user/UserAvatar";
import type { Friend, FriendRequest, BlockedUser } from "@/types/friends";
import {
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  getBlockedUsers,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  unblockUser,
} from "@/lib/services/friends";

export default function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadAllData();
  }, [user, router]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendsList, incoming, outgoing, blocked] = await Promise.all([
        getFriends(user.uid),
        getIncomingFriendRequests(user.uid),
        getOutgoingFriendRequests(user.uid),
        getBlockedUsers(user.uid),
      ]);

      setFriends(friendsList);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      setBlockedUsers(blocked);
    } catch (error) {
      console.error("Error loading friends data:", error);
      alert("Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };

  // Filter friends by search term
  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      alert("Friend request accepted!");
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to accept friend request");
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      alert("Friend request declined");
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to decline friend request");
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      alert("Friend request cancelled");
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to cancel friend request");
    }
  };

  const handleRemove = async (friendUid: string, friendUsername: string) => {
    if (!user) return;
    if (!confirm(`Remove @${friendUsername} from friends?`)) return;
    try {
      await removeFriend(user.uid, friendUid);
      alert(`Removed @${friendUsername} from friends`);
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to remove friend");
    }
  };

  const handleUnblock = async (blockedUID: string, blockedUsername: string) => {
    if (!user) return;
    if (!confirm(`Unblock @${blockedUsername}?`)) return;
    try {
      await unblockUser(user.uid, blockedUID);
      alert(`Unblocked @${blockedUsername}`);
      await loadAllData();
    } catch (error: any) {
      alert(error.message || "Failed to unblock user");
    }
  };

  if (!user) {
    return (
      <Container className="py-4">
        <p>Please log in to view friends</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">Friends</h3>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading friends...</p>
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-3"
        >
          {/* All Friends Tab */}
          <Tab eventKey="all" title={`All Friends (${friends.length})`}>
            <Form.Control
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />

            {filteredFriends.length === 0 ? (
              <div className="text-center text-muted py-5">
                {searchTerm ? (
                  <p>No friends found matching "{searchTerm}"</p>
                ) : (
                  <p>You haven't added any friends yet. Find people to connect with!</p>
                )}
              </div>
            ) : (
              <Row className="g-3">
                {filteredFriends.map((friend) => (
                  <Col md={6} lg={4} key={friend.uid}>
                    <Card>
                      <Card.Body>
                        <div
                          className="d-flex align-items-center gap-2 mb-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => router.push(`/profile/${friend.username}`)}
                        >
                          <UserAvatar user={friend} size="medium" />
                          <div className="flex-grow-1">
                            <div>
                              <strong>{friend.displayName}</strong>
                            </div>
                            <div className="text-muted small">@{friend.username}</div>
                          </div>
                        </div>
                        {friend.bio && (
                          <p className="small text-muted mb-3">{friend.bio.substring(0, 60)}{friend.bio.length > 60 ? '...' : ''}</p>
                        )}
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => router.push(`/messages/${friend.username}`)}
                            className="flex-grow-1"
                          >
                            Message
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleRemove(friend.uid, friend.username)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="text-muted small mt-2">
                          Friends since {new Date(friend.since).toLocaleDateString()}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          {/* Incoming Requests Tab */}
          <Tab
            eventKey="incoming"
            title={
              <>
                Incoming{" "}
                {incomingRequests.length > 0 && (
                  <Badge bg="danger">{incomingRequests.length}</Badge>
                )}
              </>
            }
          >
            {incomingRequests.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p>No pending friend requests</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {incomingRequests.map((request) => (
                  <Card key={request.id}>
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => router.push(`/profile/${request.fromUsername}`)}
                        >
                          <UserAvatar
                            user={{
                              photoURL: request.fromPhotoURL,
                              displayName: request.fromDisplayName,
                            }}
                            size="medium"
                          />
                          <div>
                            <div>
                              <strong>{request.fromDisplayName}</strong>
                            </div>
                            <div className="text-muted small">@{request.fromUsername}</div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleAccept(request.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDecline(request.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                      <div className="text-muted small mt-2">
                        Sent {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Tab>

          {/* Outgoing Requests Tab */}
          <Tab
            eventKey="outgoing"
            title={`Outgoing (${outgoingRequests.length})`}
          >
            {outgoingRequests.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p>No outgoing friend requests</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {outgoingRequests.map((request) => (
                  <Card key={request.id}>
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => router.push(`/profile/${request.toUsername}`)}
                        >
                          <div>
                            <div>
                              <strong>@{request.toUsername}</strong>
                            </div>
                            <div className="text-muted small">Request pending</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleCancel(request.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                      <div className="text-muted small mt-2">
                        Sent {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Tab>

          {/* Blocked Users Tab */}
          <Tab eventKey="blocked" title={`Blocked (${blockedUsers.length})`}>
            {blockedUsers.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p>You haven't blocked anyone</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {blockedUsers.map((blocked) => (
                  <Card key={blocked.blockedUID}>
                    <Card.Body>
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                          <div>
                            <strong>@{blocked.blockedUsername}</strong>
                          </div>
                          <div className="text-muted small">
                            Blocked {new Date(blocked.blockedAt).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            handleUnblock(blocked.blockedUID, blocked.blockedUsername)
                          }
                        >
                          Unblock
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Tab>
        </Tabs>
      )}
    </Container>
  );
}
