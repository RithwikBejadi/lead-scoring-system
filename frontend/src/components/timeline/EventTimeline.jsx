/**
 * FILE: components/timeline/EventTimeline.jsx
 * PURPOSE: Vertical timeline showing lead activity events
 */

function EventTimeline({ events }) {
  const getEventIcon = (eventType) => {
    const icons = {
      page_view: 'visibility',
      signup: 'person_add',
      demo_request: 'rocket_launch',
      pricing_view: 'payments',
      email_open: 'mail',
      webinar: 'cast_for_education',
      form_submit: 'description'
    };
    return icons[eventType] || 'event';
  };

  const getEventColor = (points) => {
    if (points >= 20) return 'bg-[#2c5181] text-white';
    if (points >= 10) return 'bg-green-500 text-white';
    if (points > 0) return 'bg-blue-500 text-white';
    return 'bg-slate-300 text-slate-600';
  };

  const getPointsColor = (points) => {
    if (points >= 20) return 'bg-green-100 text-green-800';
    if (points >= 10) return 'bg-green-50 text-green-700';
    if (points > 0) return 'bg-green-50 text-green-700';
    return 'bg-red-100 text-red-800';
  };

  if (!events || events.length === 0) {
    return <div className="text-slate-400 text-center py-8">No events recorded yet</div>;
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
        {events.slice(0, 10).map((event, idx) => (
          <div key={event._id || idx} className="relative pl-8">
            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${getEventColor(event.points || 0)} shadow-sm`}></div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{event.eventType || 'Event'}</h4>
                    <span className="material-symbols-outlined text-sm text-slate-400">
                      {getEventIcon(event.eventType)}
                    </span>
                  </div>
                  {event.metadata?.description && (
                    <p className="text-sm text-slate-600 mt-1">{event.metadata.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getPointsColor(event.points || 0)}`}>
                    {event.points > 0 ? `+${event.points}` : event.points}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(event.timestamp || event.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {events.length > 10 && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-400">Showing 10 of {events.length} events</span>
        </div>
      )}
    </div>
  );
}

export default EventTimeline;
