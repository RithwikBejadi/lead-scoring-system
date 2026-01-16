/**
 * FILE: components/timeline/EventTimeline.jsx
 * PURPOSE: Vertical timeline showing lead activity events with icons and formatting
 */

function EventTimeline({ events }) {
  const getEventIcon = (eventType) => {
    const icons = {
      page_view: "visibility",
      pricing_view: "attach_money",
      signup: "person_add",
      demo_request: "rocket_launch",
      demo_attended: "videocam",
      pricing_page_visit: "payments",
      email_open: "mail_outline",
      email_response: "reply",
      webinar: "cast_for_education",
      webinar_signup: "cast",
      form_submit: "description",
      direct_call: "call",
      meeting_booked: "event",
      contract_signed: "handshake",
      unsubscribe: "person_off",
      download: "download",
    };
    return icons[eventType] || "event";
  };

  const getEventLabel = (eventType) => {
    const labels = {
      page_view: "Page View",
      pricing_view: "Pricing Page Visit",
      pricing_page_visit: "Pricing Page Visit",
      signup: "Account Signup",
      demo_request: "Demo Request",
      demo_attended: "Demo Attended",
      email_open: "Email Opened",
      email_response: "Email Response",
      webinar: "Webinar Attendance",
      webinar_signup: "Webinar Signup",
      form_submit: "Form Submission",
      direct_call: "Direct Call",
      meeting_booked: "Meeting Booked",
      contract_signed: "Contract Signed",
      unsubscribe: "Unsubscribed",
      download: "Content Download",
    };
    return (
      labels[eventType] ||
      eventType?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Event"
    );
  };

  const getEventColor = (points) => {
    if (points >= 20) return "bg-primary";
    if (points >= 10) return "bg-green-500";
    if (points > 0) return "bg-blue-400";
    if (points < 0) return "bg-red-500";
    return "bg-slate-300";
  };

  const getPointsBadgeColor = (points) => {
    if (points >= 20) return "bg-green-100 text-green-800";
    if (points >= 10) return "bg-green-50 text-green-700";
    if (points > 0) return "bg-green-50 text-green-600";
    if (points < 0) return "bg-red-100 text-red-800";
    return "bg-slate-100 text-slate-600";
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const eventDate = new Date(timestamp);
    const diffMs = now - eventDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${
        Math.floor(diffDays / 7) > 1 ? "s" : ""
      } ago`;
    return eventDate.toLocaleDateString();
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8 flex flex-col items-center gap-2">
        <span className="material-symbols-outlined text-4xl">event_busy</span>
        <p>No events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
        {events.slice(0, 10).map((event, idx) => (
          <div key={event._id || idx} className="relative pl-8">
            {/* Timeline dot */}
            <div
              className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                idx === 0 ? "bg-primary" : getEventColor(event.points || 0)
              }`}
            ></div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 group">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {getEventLabel(event.eventType)}
                  </h4>
                  <span className="material-symbols-outlined text-sm text-slate-400">
                    {getEventIcon(event.eventType)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {event.metadata?.description ||
                    event.metadata?.notes ||
                    `Event triggered for lead scoring.`}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getPointsBadgeColor(
                    event.points || 0
                  )}`}
                >
                  {(event.points || 0) > 0
                    ? `+${event.points}`
                    : event.points || 0}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {formatRelativeTime(event.timestamp || event.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {events.length > 10 && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <button className="text-xs text-slate-400 cursor-pointer hover:text-primary transition-colors">
            Show older history ({events.length - 10} more)
          </button>
        </div>
      )}
    </div>
  );
}

export default EventTimeline;
