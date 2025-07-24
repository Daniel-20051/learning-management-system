import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import {
  getAdminConfig,
  setAdminConfig,
  defaultAdminConfig,
} from "@/lib/adminConfig";
import { resetQuizAttempts } from "@/lib/quizResults";
import { toast } from "sonner";

const AdminPanel = () => {
  const [config, setConfig] = useState(getAdminConfig());
  const [moduleToReset, setModuleToReset] = useState<number>(0);

  const handleConfigChange = (key: keyof typeof config, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveConfig = () => {
    setAdminConfig(config);
    toast.success("Admin configuration saved successfully!", {
      duration: 3000,
    });
  };

  const handleResetConfig = () => {
    setConfig(defaultAdminConfig);
    setAdminConfig(defaultAdminConfig);
    toast.success("Admin configuration reset to defaults!", {
      duration: 3000,
    });
  };

  const handleResetAttempts = () => {
    resetQuizAttempts(moduleToReset);
    toast.success(
      `Quiz attempts for Module ${moduleToReset + 1} have been reset!`,
      {
        duration: 3000,
      }
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="grid gap-6">
        {/* Quiz Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Configuration</CardTitle>
            <CardDescription>
              Configure quiz settings for all modules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="requireQuizPass">Require Quiz Pass</Label>
              <Switch
                id="requireQuizPass"
                checked={config.requireQuizPass}
                onCheckedChange={(checked) =>
                  handleConfigChange("requireQuizPass", checked)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="requireQuizAttempt">Require Quiz Attempt</Label>
                <Switch
                  id="requireQuizAttempt"
                  checked={config.requireQuizAttempt}
                  onCheckedChange={(checked) =>
                    handleConfigChange("requireQuizAttempt", checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={config.maxAttempts}
                  onChange={(e) =>
                    handleConfigChange("maxAttempts", parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testDuration">Test Duration (minutes)</Label>
                <Input
                  id="testDuration"
                  type="number"
                  min="1"
                  max="180"
                  value={config.testDuration}
                  onChange={(e) =>
                    handleConfigChange("testDuration", parseInt(e.target.value))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowRetake">Allow Retake</Label>
                <Switch
                  id="allowRetake"
                  checked={config.allowRetake}
                  onCheckedChange={(checked) =>
                    handleConfigChange("allowRetake", checked)
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveConfig}>Save Configuration</Button>
              <Button variant="outline" onClick={handleResetConfig}>
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Management */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Management</CardTitle>
            <CardDescription>Manage quiz attempts and results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="moduleToReset">Reset Attempts for Module:</Label>
              <Input
                id="moduleToReset"
                type="number"
                min="0"
                max="9"
                value={moduleToReset}
                onChange={(e) => setModuleToReset(parseInt(e.target.value))}
                className="w-20"
              />
              <Button variant="destructive" onClick={handleResetAttempts}>
                Reset Attempts
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              This will clear all quiz attempts for the selected module,
              allowing students to retake the quiz.
            </p>
          </CardContent>
        </Card>

        {/* Current Configuration Display */}
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
