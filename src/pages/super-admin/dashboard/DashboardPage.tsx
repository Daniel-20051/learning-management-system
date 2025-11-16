import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Users, UserCheck, UserX, GraduationCap, TrendingUp } from "lucide-react";
import { Skeleton } from "@/Components/ui/skeleton";
import { getStudentStatistics, type StudentStatistics } from "@/api/admin";
import { toast } from "sonner";

// Helper function to safely get object keys
const safeObjectKeys = (obj: any): string[] => {
  if (!obj || obj === null || Array.isArray(obj) || typeof obj !== 'object') {
    return [];
  }
  return Object.keys(obj);
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StudentStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await getStudentStatistics();
      if (response.success && response.data) {
        // Transform the API response array format to object format
        const studentsByLevel: { [key: string]: number } = {};
        if (Array.isArray(response.data.byLevel)) {
          response.data.byLevel.forEach((item) => {
            const level = item.level || 'Unknown';
            studentsByLevel[level] = parseInt(item.count, 10) || 0;
          });
        }

        const studentsByProgram: { [key: string]: number } = {};
        if (Array.isArray(response.data.byProgram)) {
          response.data.byProgram.forEach((item) => {
            const programName = item["program.title"] || `Program ${item.program_id}`;
            studentsByProgram[programName] = parseInt(item.count, 10) || 0;
          });
        }

        setStats({
          totalStudents: response.data.total || 0,
          activeStudents: response.data.active || 0,
          inactiveStudents: response.data.inactive || 0,
          studentsByLevel,
          studentsByProgram,
        });
      }
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      toast.error(error.response?.data?.message || "Failed to load statistics");
      // Set empty stats on error to prevent crashes
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
        studentsByLevel: {},
        studentsByProgram: {},
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your system</p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="pt-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats?.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All students in the system
            </p>
          </CardContent>
        </Card>

        <Card className="pt-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <Skeleton className="h-8 w-16" /> : stats?.activeStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card className="pt-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats?.inactiveStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Not currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card className="pt-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : stats?.totalStudents ? (
                `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}%`
              ) : (
                "0%"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Active/Total ratio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Level */}
        <Card className="pt-3">
          <CardHeader>
            <CardTitle>Students by Level</CardTitle>
            <CardDescription>Distribution across academic levels</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats && safeObjectKeys(stats.studentsByLevel).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.studentsByLevel)
                  .sort(([a], [b]) => {
                    // Handle "Unknown" level - put it at the end
                    if (a === 'Unknown') return 1;
                    if (b === 'Unknown') return -1;
                    // Sort numerically
                    const numA = Number(a);
                    const numB = Number(b);
                    if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
                    return numA - numB;
                  })
                  .map(([level, count]) => {
                    const percentage = stats.totalStudents
                      ? (count / stats.totalStudents) * 100
                      : 0;
                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {level === 'Unknown' ? 'No Level Assigned' : `${level} Level`}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {count} students ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No level data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students by Program */}
        <Card className="pt-3">
          <CardHeader>
            <CardTitle>Students by Program</CardTitle>
            <CardDescription>Distribution across programs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats && safeObjectKeys(stats.studentsByProgram).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.studentsByProgram)
                  .sort(([, a], [, b]) => b - a)
                  .map(([program, count], index) => {
                    const percentage = stats.totalStudents
                      ? (count / stats.totalStudents) * 100
                      : 0;
                    const colors = [
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-purple-500",
                      "bg-orange-500",
                      "bg-pink-500",
                    ];
                    const bgColor = colors[index % colors.length];
                    return (
                      <div key={program} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate flex-1 pr-2">
                            {program}
                          </span>
                          <span className="text-muted-foreground whitespace-nowrap">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bgColor} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No program data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="pt-3">
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Quick summary of key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {safeObjectKeys(stats.studentsByLevel).length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Academic Levels
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {safeObjectKeys(stats.studentsByProgram).length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Programs
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.totalStudents > 0 && safeObjectKeys(stats.studentsByLevel).length > 0
                    ? Math.round(stats.totalStudents / safeObjectKeys(stats.studentsByLevel).length)
                    : 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Avg. Students/Level
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
