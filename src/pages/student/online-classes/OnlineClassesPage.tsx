import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Video, Calendar, Clock, Search, Loader2 } from "lucide-react";
import { Badge } from "@/Components/ui/badge";
import UserCard from "@/Components/user-card";
import OnlineClassesInfoSidebar from "@/Components/OnlineClassesInfoSidebar";
import { toast } from "sonner";
import { GetVideoCalls, type VideoCall } from "@/api/video";

const OnlineClassesPage = () => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [videoCalls, setVideoCalls] = useState<VideoCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch video calls from API
  useEffect(() => {
    const fetchVideoCalls = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await GetVideoCalls();
        if (response.success) {
          setVideoCalls(response.data);
        } else {
          setError("Failed to fetch video calls");
        }
      } catch (err: any) {
        console.error("Error fetching video calls:", err);
        setError(err.message || "Failed to fetch video calls");
        toast.error("Failed to load online classes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoCalls();
  }, []);

  const handleJoinClass = async (videoCall: VideoCall) => {
    const status = getCallStatus(videoCall);
    if (status === "upcoming") {
      toast.info("This class hasn't started yet. Please wait for the scheduled time.");
      return;
    }

    setIsJoining(true);
    try {
      // Navigate to the meeting page using streamCallId
      navigate(`/meeting/${videoCall.streamCallId}`);
    } catch (error) {
      console.error("Error joining class:", error);
      toast.error("Failed to join the class. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinWithId = async () => {
    if (!meetingId.trim()) {
      toast.error("Please enter a meeting ID");
      return;
    }

    setIsJoining(true);
    try {
      navigate(`/meeting/${meetingId.trim()}`);
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast.error("Failed to join the meeting. Please check the meeting ID.");
    } finally {
      setIsJoining(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "No scheduled time";
    return new Date(dateString).toLocaleString();
  };

  const getCallStatus = (videoCall: VideoCall): "live" | "upcoming" | "ended" | "scheduled" => {
    const now = new Date();
    
    if (videoCall.endedAt) {
      return "ended";
    }
    
    if (!videoCall.startsAt) {
      return "scheduled";
    }
    
    const startTime = new Date(videoCall.startsAt);
    const timeDiff = startTime.getTime() - now.getTime();
    
    // If start time is within 10 minutes or has passed, consider it live
    if (timeDiff <= 10 * 60 * 1000 && timeDiff >= -60 * 60 * 1000) {
      return "live";
    }
    
    // If start time is in the future
    if (timeDiff > 10 * 60 * 1000) {
      return "upcoming";
    }
    
    // If start time was more than 1 hour ago, consider it ended
    return "ended";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-500 text-white";
      case "upcoming":
        return "bg-blue-500 text-white";
      case "ended":
        return "bg-gray-500 text-white";
      case "scheduled":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 px-5 w-full border-b bg-white dark:bg-background border-sidebar-border">
        <div className="container flex h-auto py-2 items-center justify-between min-h-[84px]">
          <div className="flex items-center gap-4">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-67  h-20 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-semibold">Online Classes</h1>
            </div>
          </div>
          <UserCard sidebar={false} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex gap-8 max-w-7xl mx-auto">
          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
          

          {/* Join with Meeting ID */}
          <Card className="pt-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Join with Meeting ID
                  </CardTitle>
                  <CardDescription>
                    Enter a meeting ID provided by your instructor to join a class
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter meeting ID (e.g., math101-session)"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleJoinWithId}
                      disabled={isJoining || !meetingId.trim()}
                      className="px-6"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {isJoining ? "Joining..." : "Join"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

          {/* Available Classes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Available Classes</h2>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2 text-lg">Loading online classes...</span>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && videoCalls.length === 0 && (
              <Card className="p-6">
                <div className="text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Online Classes Available</h3>
                  <p className="text-muted-foreground">
                    There are currently no online classes scheduled. Check back later or contact your instructor.
                  </p>
                </div>
              </Card>
            )}

            {/* Video Calls Grid */}
            {!isLoading && !error && videoCalls.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {videoCalls.map((videoCall) => {
                  const status = getCallStatus(videoCall);
                  return (
                    <Card key={videoCall.id} className="transition-shadow pt-3 hover:shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-lg">{videoCall.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {videoCall.callType} • ID: {videoCall.streamCallId.slice(-8)}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatTime(videoCall.startsAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Created: {new Date(videoCall.createdAt).toLocaleDateString()}</span>
                          </div>
                          {videoCall.endedAt && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Ended: {formatTime(videoCall.endedAt)}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleJoinClass(videoCall)}
                          disabled={isJoining || status === "ended"}
                          className="w-full"
                          variant={status === "live" ? "default" : "outline"}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          {status === "live" ? "Join Now" : 
                           status === "ended" ? "Class Ended" : 
                           status === "upcoming" ? "Join When Live" : "Join Class"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          </div>
          
          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-[100px] h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
              <OnlineClassesInfoSidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnlineClassesPage;
