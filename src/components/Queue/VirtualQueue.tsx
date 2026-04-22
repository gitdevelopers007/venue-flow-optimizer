import React, { useState, useEffect, useCallback } from 'react';
import { subscribeToQueue, joinQueue } from '../../services/firebase';
import { Coffee, UserCheck, Clock, UploadCloud, Users } from 'lucide-react';

interface QueueProps {
  facilityId: string;
  facilityName: string;
  userId: string;
}

const VirtualQueue: React.FC<QueueProps> = React.memo(({ facilityId, facilityName, userId }) => {
  const [position, setPosition] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [totalInQueue, setTotalInQueue] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToQueue(facilityId, (data) => {
      if (!data) {
        setPosition(null);
        setTotalInQueue(0);
        return;
      }
      const entries = Object.entries(data);
      entries.sort(([, a]: any, [, b]: any) => a.timestamp - b.timestamp);
      setTotalInQueue(entries.length);

      const userIndex = entries.findIndex(([, val]: any) => val.userId === userId);
      if (userIndex !== -1) {
        setPosition(userIndex + 1);
        setEstimatedWait((userIndex + 1) * 2);
      }
    });

    return () => unsubscribe();
  }, [facilityId, userId]);

  const handleJoin = useCallback(async () => {
    setIsJoining(true);
    await joinQueue(userId, facilityId);
    setIsJoining(false);
  }, [userId, facilityId]);

  return (
    <div className="glass-card queue-panel panel-card animate-fade-in">
      <div className="queue-header">
        <div className="queue-icon-wrap">
          <Coffee size={20} />
        </div>
        <div>
          <div className="queue-name">{facilityName}</div>
          <div className="queue-status-text">
            <UserCheck size={12} /> Virtual Line Active
          </div>
        </div>
      </div>

      {position ? (
        <div>
          <div className="queue-info">
            <div>
              <div className="queue-info-label">Your Position</div>
              <div className="queue-position">#{position}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="queue-info-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Clock size={12} /> Est. Wait
              </div>
              <div className="queue-wait">{estimatedWait} min</div>
            </div>
          </div>

          <div className="queue-progress">
            <div className="queue-progress-fill" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
            <Users size={12} /> {totalInQueue} people in line
          </div>

          <button className="queue-btn queue-upload-btn">
            <UploadCloud size={16} /> Save Receipt to Cloud
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', lineHeight: 1.5 }}>
            Skip the physical line! Join virtually and get notified when it's your turn.
          </div>
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="queue-btn queue-join-btn"
          >
            {isJoining ? 'Securing Spot...' : 'Join Virtual Line'}
          </button>
        </div>
      )}
    </div>
  );
});

export default VirtualQueue;
