import React, { useState, useEffect, useCallback } from 'react';
import { subscribeToQueue, joinQueue, uploadDiagnosticLog } from '../../services/firebase';
import { Coffee, UserCheck, Clock, UploadCloud } from 'lucide-react';

interface QueueProps {
  facilityId: string;
  facilityName: string;
  userId: string;
}

const VirtualQueue: React.FC<QueueProps> = React.memo(({ facilityId, facilityName, userId }) => {
  const [position, setPosition] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToQueue(facilityId, (data) => {
      if (!data) return;
      const entries = Object.entries(data);
      entries.sort(([, a]: any, [, b]: any) => a.timestamp - b.timestamp);
      
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

  const handleUploadReceipt = useCallback(async () => {
    const blob = new Blob(["Order Receipt"], { type: 'text/plain' });
    await uploadDiagnosticLog(blob, `receipt-${userId}-${Date.now()}.txt`);
    alert("Receipt saved to Google Cloud Storage!");
  }, [userId]);

  return (
    <div className="glass-card p-6 animate-fade-in border-emerald-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Coffee size={20} />
        </div>
        <div>
          <h3 className="font-bold">{facilityName}</h3>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <UserCheck size={12} /> Virtual Line Active
          </div>
        </div>
      </div>

      {position ? (
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-400 mb-1">Your Position</div>
              <div className="text-4xl font-bold text-white">#{position}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-1 justify-end">
                <Clock size={12} /> Est. Wait
              </div>
              <div className="text-xl font-bold text-amber-400">{estimatedWait} min</div>
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-emerald-500 rounded-full w-1/3 animate-pulse" />
          </div>
          <button 
            onClick={handleUploadReceipt}
            className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 text-sm text-gray-300 transition-colors"
          >
            <UploadCloud size={16} /> Save Receipt to Cloud
          </button>
        </div>
      ) : (
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold transition-colors disabled:opacity-50"
        >
          {isJoining ? 'Securing Spot...' : 'Join Virtual Line'}
        </button>
      )}
    </div>
  );
});

export default VirtualQueue;
