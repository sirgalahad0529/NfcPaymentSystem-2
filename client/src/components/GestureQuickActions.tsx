import React, { useState, useEffect } from 'react';
import { useSwipeGestures } from '@/hooks/useGestures';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, X } from 'lucide-react';

interface QuickAction {
  id: string;
  name: string;
  direction: 'left' | 'right' | 'up' | 'down';
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface GestureQuickActionsProps {
  enabled?: boolean;
  showTutorial?: boolean;
}

export const GestureQuickActions: React.FC<GestureQuickActionsProps> = ({ 
  enabled = true,
  showTutorial = false
}) => {
  const [, navigate] = useLocation();
  const [showHelp, setShowHelp] = useState(showTutorial);
  const [activeGesture, setActiveGesture] = useState<string | null>(null);
  
  // Define the quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'register',
      name: 'Register Customer',
      direction: 'left',
      icon: <ArrowLeft className="h-5 w-5" />,
      action: () => navigate('/register'),
      color: 'bg-blue-500'
    },
    {
      id: 'balance',
      name: 'Check Balance',
      direction: 'right',
      icon: <ArrowRight className="h-5 w-5" />,
      action: () => navigate('/balance'),
      color: 'bg-green-500'
    },
    {
      id: 'payment',
      name: 'New Payment',
      direction: 'up',
      icon: <ArrowUp className="h-5 w-5" />,
      action: () => navigate('/payment'),
      color: 'bg-purple-500'
    },
    {
      id: 'reload',
      name: 'Reload Account',
      direction: 'down',
      icon: <ArrowDown className="h-5 w-5" />,
      action: () => navigate('/reload'),
      color: 'bg-amber-500'
    }
  ];

  // Handle gestures
  const gestureHandlers = {
    onSwipeLeft: () => {
      if (!enabled) return;
      const action = quickActions.find(a => a.direction === 'left');
      if (action) {
        setActiveGesture(action.id);
        setTimeout(() => {
          action.action();
          setActiveGesture(null);
        }, 300);
      }
    },
    onSwipeRight: () => {
      if (!enabled) return;
      const action = quickActions.find(a => a.direction === 'right');
      if (action) {
        setActiveGesture(action.id);
        setTimeout(() => {
          action.action();
          setActiveGesture(null);
        }, 300);
      }
    },
    onSwipeUp: () => {
      if (!enabled) return;
      const action = quickActions.find(a => a.direction === 'up');
      if (action) {
        setActiveGesture(action.id);
        setTimeout(() => {
          action.action();
          setActiveGesture(null);
        }, 300);
      }
    },
    onSwipeDown: () => {
      if (!enabled) return;
      const action = quickActions.find(a => a.direction === 'down');
      if (action) {
        setActiveGesture(action.id);
        setTimeout(() => {
          action.action();
          setActiveGesture(null);
        }, 300);
      }
    }
  };

  const containerRef = useSwipeGestures(gestureHandlers);

  // Show tutorial hint based on user preference or first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('gesture_tutorial_seen');
    if (!hasSeenTutorial && !showTutorial) {
      setShowHelp(true);
    }
  }, [showTutorial]);

  // Save that the user has seen the tutorial
  const dismissTutorial = () => {
    localStorage.setItem('gesture_tutorial_seen', 'true');
    setShowHelp(false);
  };

  return (
    <div ref={containerRef} className="gesture-container w-full h-full">
      {/* Gesture feedback overlays */}
      <AnimatePresence>
        {quickActions.map(action => (
          activeGesture === action.id && (
            <motion.div
              key={action.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-50 flex items-center justify-center ${action.color}`}
            >
              <div className="text-white text-center">
                <div className="text-4xl mb-2">{action.icon}</div>
                <h3 className="text-xl font-bold">{action.name}</h3>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Tutorial overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Gesture Shortcuts</h3>
                <button onClick={dismissTutorial} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {quickActions.map(action => (
                  <div key={action.id} className="flex items-center">
                    <div className={`${action.color} text-white p-2 rounded-full mr-3`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-medium">{action.name}</p>
                      <p className="text-sm text-gray-500">
                        Swipe {action.direction} to access
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={dismissTutorial}
                className="w-full mt-4 bg-primary text-white py-2 rounded-md"
              >
                Got it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestureQuickActions;