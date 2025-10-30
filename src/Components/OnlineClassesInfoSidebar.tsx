import { Card, CardContent } from "@/Components/ui/card";
import { Video, Info, CheckCircle, Camera, Mic, Phone } from "lucide-react";

const OnlineClassesInfoSidebar = () => {
  return (
    <div className="w-80 space-y-6">
      {/* How to Join Section */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Video className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
                How to Join Online Classes
              </h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Click "Join Now" for live classes to participate immediately</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Use the meeting ID provided by your instructor to join specific sessions</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Make sure your camera and microphone are working before joining</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Contact your instructor if you have trouble accessing a class</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Technical Requirements */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg">
                Technical Requirements
              </h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-green-800 dark:text-green-200">
                <Camera className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Working camera (optional but recommended)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-green-800 dark:text-green-200">
                <Mic className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Working microphone for participation</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-green-800 dark:text-green-200">
                <Phone className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Stable internet connection</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-amber-600" />
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-lg">
                Quick Tips
              </h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Join a few minutes early to test your setup</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Use headphones to avoid echo</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Mute yourself when not speaking</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200">
                <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Have good lighting for your camera</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineClassesInfoSidebar;
