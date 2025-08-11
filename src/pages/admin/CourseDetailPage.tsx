import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Video,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Play,
  FileCheck,
} from "lucide-react";
import { dummyCourses } from "@/lib/adminData";
import type { Course } from "@/types/admin";

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  // Find the course by ID
  const course = dummyCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The course you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>
    );
  }

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTotalUnits = () => {
    return course.modules.reduce(
      (total, module) => total + module.units.length,
      0
    );
  };

  const getUnitTypeCounts = () => {
    const counts = { video: 0, text: 0, quiz: 0 };
    course.modules.forEach((module) => {
      module.units.forEach((unit) => {
        if (counts[unit.type as keyof typeof counts] !== undefined) {
          counts[unit.type as keyof typeof counts]++;
        }
      });
    });
    return counts;
  };

  const unitCounts = getUnitTypeCounts();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl" />
        <div className="relative p-8">
          <Button
            variant="outline"
            size="sm"
            className="mb-6 hover:bg-background/80 backdrop-blur-sm"
            onClick={() => navigate("/admin/courses")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                      {course.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    course.status === "published" ? "default" : "secondary"
                  }
                  className="text-sm px-4 py-2"
                >
                  {course.status}
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Title
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Enrolled Students
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {course.enrolledStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Total Modules
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {course.modules.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Total Units
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {getTotalUnits()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Created
                </p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Type Breakdown */}

      {/* Course Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Modules & Units</h2>
          <p className="text-muted-foreground text-lg">
            Manage the content structure of your course
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
              <DialogDescription>
                Add a new module to {course.title}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="module-title">Module Title</Label>
                <Input id="module-title" placeholder="Enter module title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="module-description">Description</Label>
                <Textarea
                  id="module-description"
                  placeholder="Enter module description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Add Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {course.modules.map((module, index) => (
          <Card
            key={module.id}
            className="border-0 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl text-primary font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription className="text-base">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {module.units.length} units
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleModuleExpansion(module.id)}
                    className="hover:bg-primary/10"
                  >
                    {expandedModules.has(module.id) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {expandedModules.has(module.id) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Units</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Unit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Unit</DialogTitle>
                          <DialogDescription>
                            Add a new unit to {module.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="unit-title">Unit Title</Label>
                            <Input
                              id="unit-title"
                              placeholder="Enter unit title"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="unit-type">Unit Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="unit-content">Content</Label>
                            <Textarea
                              id="unit-content"
                              placeholder="Enter unit content or description"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button>Add Unit</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3">
                    {module.units.map((unit, unitIndex) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-muted/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg text-primary font-medium text-sm">
                            {unitIndex + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            {getUnitIcon(unit.type)}
                            <div>
                              <span className="font-medium">{unit.title}</span>
                              {unit.duration && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  {unit.duration}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseDetailPage;
