import { Card, CardContent } from "@/Components/ui/card";
import { Users, BookOpen, BarChart3, Calendar } from "lucide-react";

interface CourseStatsProps {
  totalModules: number;
  totalUnits: number;
}

const Stat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: string | number;
}) => (
  <Card className="border-1 border-gray-300 py-3 sm:py-4 bg-gradient-to-br from-background to-muted/50">
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
          {icon}
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-lg sm:text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CourseStats = ({ totalModules, totalUnits }: CourseStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Stat
        icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
        label="Enrolled Students"
        value="—"
      />
      <Stat
        icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
        label="Total Modules"
        value={totalModules}
      />
      <Stat
        icon={<BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
        label="Total Units"
        value={totalUnits}
      />
      <Stat
        icon={<Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />}
        label="Created"
        value="—"
      />
    </div>
  );
};

export default CourseStats;
