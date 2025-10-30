import {StreamTheme,SpeakerLayout, CallControls, CallingState, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/Components/ui/button';
import { Home } from 'lucide-react';



const VideoCallUI = () => {
  const navigate = useNavigate();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  
  const handleGoHome = () => {
    navigate('/');
  };



  if (callingState !== CallingState.JOINED) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.5 1.5M21 21l-1.5-1.5M3 21l1.5-1.5M21 3l-1.5 1.5M12 12v.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Meeting Has Ended
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              The video call session has concluded. Thank you for participating!
            </p>
          </div>
          
          <div className="space-y-3">
            
            <Button 
              onClick={handleGoHome}
              className="w-full bg-primary text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact support .
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition='bottom' />
      <CallControls />
    </StreamTheme>
  )
}

export default VideoCallUI