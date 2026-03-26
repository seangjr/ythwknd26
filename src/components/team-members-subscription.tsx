"use client";

import { useEffect } from "react";

interface TeamMembersSubscriptionProps {
  teamId: number;
  onNewMember: () => void;
}

export function TeamMembersSubscription({
  teamId,
  onNewMember,
}: TeamMembersSubscriptionProps) {
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/team-updates?teamId=${teamId}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_member") {
          onNewMember();
        }
      } catch (err) {
        console.error("[TeamMembersSubscription] failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("[TeamMembersSubscription] SSE error, will auto-reconnect:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [teamId, onNewMember]);

  // This component doesn't render anything
  return null;
}
