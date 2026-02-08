"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button, Dropdown, Spinner } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/user/UserAvatar";
import RoleBadge from "@/components/user/RoleBadge";
import SocialLinks from "@/components/user/SocialLinks";
import type { UserDoc } from "@/lib/services/users";
import type { FriendStatus } from "@/types/friends";
import {
  getRelationshipStatus,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  blockUser,
  getMutualFriends,
} from "@/lib/services/friends";

interface Props {
  uid?: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  createdAt?: number;
  lastSeen?: number;
  signInCount?: number;
  bannerURL?: string;
  accentColor?: string;
  pronouns?: string;
  location?: string;
  timezone?: string;
  socialLinks?: UserDoc["socialLinks"];
  roles?: string[];
}

export default function ProfileHeader({
  uid,
  username,
  displayName,
  photoURL,
  bio,
  createdAt,
  lastSeen,
  signInCount: _signInCount,
  bannerURL,
  accentColor = "#5865F2",
  pronouns,
  location,
  timezone,
  socialLinks,
  roles = [],
}: Props) {
  const { user } = useAuth();
  const isOwner = !!(user?.uid && uid && user.uid === uid);
  const router = useRouter();

  // Friend status state
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [mutualFriendsCount, setMutualFriendsCount] = useState<number>(0);
  const [requestId, setRequestId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  function toMillis(v?: any) {
    if (!v) return null;
    if (typeof v === "number") return v;
    if (v && typeof v.toMillis === "function") return v.toMillis();
    if (typeof v === "string") {
      const p = Date.parse(v);
      if (!Number.isNaN(p)) return p;
    }
    return null;
  }

  const ms = toMillis(createdAt as any);
  const memberSince = ms ? new Date(ms).toLocaleDateString() : null;
  const lastSeenMs = toMillis(lastSeen as any) || null;

  const userProfile: Partial<UserDoc> = {
    uid,
    username,
    displayName,
    photoURL,
    accentColor,
  };

  // Check relationship status on mount
  useEffect(() => {
    if (!user || !uid || isOwner) return;

    async function checkRelationship() {
      setLoading(true);
      try {
        const result = await getRelationshipStatus(user.uid, uid);
        setFriendStatus(result.status);
        setRequestId(result.requestId);

        // Get mutual friends count if they are friends
        if (result.status === 'friends') {
          const mutuals = await getMutualFriends(user.uid, uid);
          setMutualFriendsCount(mutuals.length);
        }
      } catch (error) {
        console.error('Error checking relationship:', error);
      } finally {
        setLoading(false);
      }
    }

    checkRelationship();
  }, [user, uid, isOwner]);

  // Handler functions
  const handleSendRequest = async () => {
    if (!user || !uid || !username) return;
    setActionLoading(true);
    try {
      await sendFriendRequest(
        user.uid,
        user.username || '',
        user.displayName || user.username || '',
        user.photoURL,
        uid,
        username
      );
      setFriendStatus('pending_sent');
      alert('Friend request sent!');
    } catch (error: any) {
      alert(error.message || 'Failed to send friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await acceptFriendRequest(requestId);
      setFriendStatus('friends');
      alert(`You are now friends with @${username}!`);
      
      // Refresh mutual friends count
      if (user && uid) {
        const mutuals = await getMutualFriends(user.uid, uid);
        setMutualFriendsCount(mutuals.length);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to accept friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await declineFriendRequest(requestId);
      setFriendStatus('none');
      alert('Friend request declined');
    } catch (error: any) {
      alert(error.message || 'Failed to decline friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await cancelFriendRequest(requestId);
      setFriendStatus('none');
      alert('Friend request cancelled');
    } catch (error: any) {
      alert(error.message || 'Failed to cancel friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!user || !uid) return;
    if (!confirm(`Remove @${username} from friends?`)) return;
    setActionLoading(true);
    try {
      await removeFriend(user.uid, uid);
      setFriendStatus('none');
      setMutualFriendsCount(0);
      alert(`Removed @${username} from friends`);
    } catch (error: any) {
      alert(error.message || 'Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!user || !uid || !username) return;
    if (!confirm(`Block @${username}? This will remove them from your friends and prevent future interactions.`)) return;
    setActionLoading(true);
    try {
      await blockUser(user.uid, uid, username);
      setFriendStatus('blocked');
      setMutualFriendsCount(0);
      alert(`Blocked @${username}`);
    } catch (error: any) {
      alert(error.message || 'Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  // Fallback gradient for banner
  const bannerStyle = bannerURL
    ? { backgroundImage: `url(${bannerURL})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${accentColor}99, ${accentColor}33)` };

  return (
    <div className="card mb-4" style={{ overflow: "hidden" }}>
      {/* Banner Section */}
      <div
        style={{
          height: 200,
          width: "100%",
          position: "relative",
          borderBottom: `4px solid ${accentColor}`,
          ...bannerStyle,
        }}
      />

      <div className="card-body" style={{ marginTop: -48 }}>
        <div className="d-flex flex-column flex-md-row align-items-start">
          {/* Avatar overlapping banner */}
          <div className="me-3 mb-3 mb-md-0" style={{ marginTop: -48 }}>
            <UserAvatar user={userProfile} size="xlarge" showStatus />
          </div>

          <div className="flex-grow-1 w-100">
            <div className="d-flex align-items-start justify-content-between flex-wrap">
              <div className="mb-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h2 className="mb-0">{displayName || username}</h2>
                  {roles && roles.length > 0 && (
                    <div className="d-flex gap-1">
                      {roles.map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-muted">
                  @{username}
                  {pronouns && <span className="ms-2 small">({pronouns})</span>}
                </div>
                {socialLinks && (
                  <div className="mt-2">
                    <SocialLinks socialLinks={socialLinks} />
                  </div>
                )}
              </div>
              <div className="d-flex gap-2 align-items-center">
                {isOwner ? (
                  <>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => router.push("/profile")}
                      style={{ 
                        borderColor: accentColor, 
                        color: accentColor,
                        transition: "all 0.2s",
                      }}
                      className="profile-edit-btn"
                    >
                      Edit Profile
                    </Button>
                    <style jsx>{`
                      .profile-edit-btn:hover {
                        background: ${accentColor} !important;
                        color: white !important;
                        border-color: ${accentColor} !important;
                      }
                    `}</style>
                  </>
                ) : loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    {friendStatus === 'none' && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleSendRequest}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Spinner animation="border" size="sm" /> : 'Add Friend'}
                      </Button>
                    )}
                    {friendStatus === 'pending_sent' && (
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={handleCancelRequest}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Spinner animation="border" size="sm" /> : 'Request Sent'}
                      </Button>
                    )}
                    {friendStatus === 'pending_received' && (
                      <>
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={handleAcceptRequest}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Spinner animation="border" size="sm" /> : 'Accept Friend'}
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={handleDeclineRequest}
                          disabled={actionLoading}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {friendStatus === 'friends' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(`/messages/${username}`)}
                          style={{ background: accentColor, borderColor: accentColor }}
                        >
                          Message
                        </Button>
                        <Dropdown>
                          <Dropdown.Toggle size="sm" variant="outline-secondary" disabled={actionLoading}>
                            •••
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={handleRemoveFriend}>
                              Remove Friend
                            </Dropdown.Item>
                            <Dropdown.Item onClick={handleBlock}>
                              Block
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </>
                    )}
                    {friendStatus === 'blocked' && (
                      <span className="text-muted small">Profile unavailable</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {bio ? <p className="mt-3 mb-1">{bio}</p> : null}

            {/* Mutual friends count */}
            {!isOwner && friendStatus === 'friends' && mutualFriendsCount > 0 && (
              <div className="text-muted small mt-2">
                {mutualFriendsCount} mutual friend{mutualFriendsCount !== 1 ? 's' : ''}
              </div>
            )}

            <div className="d-flex gap-3 text-muted mt-2 small flex-wrap">
              <div>
                <strong>0</strong> posts
              </div>
              <div>
                <strong>0</strong> followers
              </div>
              <div>
                <strong>0</strong> following
              </div>
              {location && <div>📍 {location}</div>}
              {timezone && <div>🕐 {timezone}</div>}
              {memberSince && <div>Member since {memberSince}</div>}
              {lastSeenMs && (
                <div>Last seen {new Date(lastSeenMs).toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
