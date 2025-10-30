import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {StreamCall, StreamVideo, StreamVideoClient, type User } from '@stream-io/video-react-sdk';
import VideoCallUI from './componenets/VideoCallUI';
import { Button } from '@/Components/ui/button';
import { Video, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


const apiKey = '9pg75epyxrar';

const VideoLecture = () => {
  const { callId } = useParams<{ callId: string }>();
  const { user: authUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'general' | 'call-not-found' | null>(null);

  const handleJoinMeeting = async () => {
    setIsJoining(true);
    setError(null);
    setErrorType(null);
    
    try {
      if (!authUser) {
        throw new Error('User data not available. Please log in again.');
      }

      if (!callId) {
        throw new Error('No call ID provided. Please create a video call first.');
      }

      // Create user object for Stream Video
      const streamUser: User = { 
        id: String(authUser.id),
        type: "guest",
        name: authUser.name,
        image: `https://getstream.io/random_svg/?id=oliver&name=Oliver`,
      };
      
      // Initialize client and call only when user wants to join
      const videoClient = new StreamVideoClient({ apiKey, user: streamUser,  });
      const videoCall = videoClient.call('default', callId);
      
      // Join the call - students can't create, only staff/admins can
      await videoCall.join({ create: isAdmin });
      
      setClient(videoClient);
      setCall(videoCall);
      setIsJoined(true);
    } catch (error: any) {
      console.error('Failed to join meeting:', error);
      
      // Check if it's a "call not found" error
      if (error?.message?.includes("Can't find call") || 
          error?.message?.includes("JoinCall failed") ||
          error?.code === 16) {
        setErrorType('call-not-found');
        setError('Meeting not found. Please check the meeting ID and try again.');
      } else {
        setErrorType('general');
        setError(error instanceof Error ? error.message : 'Failed to join meeting. Please try again.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setErrorType(null);
    handleJoinMeeting();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

 

  // Show error if no callId is provided
  if (!callId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Meeting ID Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please create a video call first or use a valid meeting link.
            </p>
          </div>
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Show error UI for call not found
  if (errorType === 'call-not-found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Meeting Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The meeting with ID <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{callId}</span> could not be found.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <p className="mb-2">Please check:</p>
              <ul className="text-left space-y-1">
                <li>• The meeting ID is correct</li>
                <li>• The meeting has been created by an instructor</li>
                <li>• The meeting hasn't been deleted</li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              disabled={isJoining}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isJoining ? 'animate-spin' : ''}`} />
              {isJoining ? 'Retrying...' : 'Try Again'}
            </Button>
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show general error UI
  if (errorType === 'general' && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              disabled={isJoining}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isJoining ? 'animate-spin' : ''}`} />
              {isJoining ? 'Retrying...' : 'Try Again'}
            </Button>
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Join Meeting?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Click the button below to join the video lecture. Your camera and microphone will be activated.
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Meeting ID: {callId}
            </p>
          </div>
          
          <Button 
            onClick={handleJoinMeeting}
            disabled={isJoining}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Video className="w-5 h-5" />
            {isJoining ? 'Joining...' : 'Join Meeting'}
          </Button>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Make sure your camera and microphone are working properly before joining.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Setting up your meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <VideoCallUI  />
      </StreamCall>
    </StreamVideo>
  );
}

export default VideoLecture