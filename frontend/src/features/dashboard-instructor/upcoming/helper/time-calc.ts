export interface MeetingStatus {
  isArrived: boolean;
  isStartingSoon: boolean;
  timeLabel: string;
}

export function calculateMeetingStatus(dateTime: string): MeetingStatus {
  try {
    const meetingDate = new Date(dateTime);
    const now = new Date();
    
    if (isNaN(meetingDate.getTime())) {
      return { isArrived: false, isStartingSoon: false, timeLabel: "Date Error" };
    }

    const diffMs = meetingDate.getTime() - now.getTime();
    
    // Arrived/Live
    if (diffMs <= 0) {
      const diffMin = Math.round(Math.abs(diffMs) / 60000);
      return { 
        isArrived: true, 
        isStartingSoon: false,
        timeLabel: diffMin > 0 ? `${diffMin} min+` : "Just started" 
      };
    }

    const diffMin = Math.round(diffMs / 60000);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Large Gaps
    if (diffDays > 7) {
      return { isArrived: false, isStartingSoon: false, timeLabel: "Later" };
    }
    if (diffDays >= 1) {
      return { isArrived: false, isStartingSoon: false, timeLabel: `${diffDays} day${diffDays > 1 ? 's' : ''}` };
    }
    if (diffHours >= 1) {
      return { isArrived: false, isStartingSoon: false, timeLabel: `${diffHours} hour${diffHours > 1 ? 's' : ''}` };
    }

    // Starting Soon (within 30 mins)
    return { 
      isArrived: false, 
      isStartingSoon: diffMin <= 30,
      timeLabel: `Start in ${diffMin} min` 
    };
  } catch (e) {
    return { isArrived: false, isStartingSoon: false, timeLabel: "Error" };
  }
}
