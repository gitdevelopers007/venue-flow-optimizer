import React, { useState, useEffect } from 'react';
import { subscribeToQueue, joinQueue } from '../../services/firebase';
import { Coffee, UserCheck, Clock } from 'lucide-react';

interface QueueProps {
  facilityId: string;
  facilityName: string;
  userId: string;
}

const VirtualQueue: React.FC<QueueProps> = ({ facilityId, facilityName, userId }) => {
  const [queueData, setQueueData] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [myPosition, setMyPosition] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToQueue(facilityId, (data) => {
      setQueueData(data);
      if (data) {
        const entries = Object.values(data) as any[];
        const sorted = entries.sort((a, b) => a.timestamp - b.timestamp);
        const index = sorted.findIndex(e => e.userId === userId);
        setMyPosition(index !== -1 ? index + 1 : null);
      }
    });
    return () => unsubscribe();
  }, [facilityId, userId]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await joinQueue(userId, facilityId);
    } catch (error) {
      console.error("Failed to join queue", error);
    } finally {
      setIsJoining(false);
    }
  };

  const waitTime = myPosition ? (myPosition - 1) * 3 : 0; // Approx 3 mins per person

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <Coffee size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">{facilityName}</h3>
            <p className="text-sm text-gray-400">Virtual Line Active</p>
          </div>
        </div>
        {myPosition && (
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">#{myPosition}</div>
            <p className="text-xs text-gray-500">Your Spot</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <UserCheck size={14} /> Total Waiting
          </div>
          <div className="text-xl font-semibold">
            {queueData ? Object.keys(queueData).length : 0}
          </div>
        </div>
        <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Clock size={14} /> Est. Wait
          </div>
          <div className="text-xl font-semibold">{waitTime}m</div>
        </div>
      </div>

      {!myPosition ? (
        <button 
          onClick={handleJoin}
          disabled={isJoining}
          className="btn-primary w-full justify-center"
        >
          {isJoining ? 'Securing Spot...' : 'Join Virtual Queue'}
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-sm font-medium">
          You are in line! We will notify you when it's your turn.
        </div>
      )}
    </div>
  );
};

export default VirtualQueue;
