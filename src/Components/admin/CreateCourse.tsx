import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Separator } from "@/Components/ui/separator";
import { Textarea } from "@/Components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { BookOpen, Plus } from "lucide-react";

const CreateCourse = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create New Course</h2>
        <p className="text-muted-foreground">
          Build a comprehensive course with modules and units
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-title">Course Title</Label>
              <Input id="course-title" placeholder="Enter course title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              placeholder="Enter detailed course description"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-objectives">Learning Objectives</Label>
            <Textarea
              id="course-objectives"
              placeholder="What will students learn from this course?"
              rows={3}
            />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Course Structure</h3>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No modules added yet. Start by adding your first module.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Save as Draft</Button>
            <Button>Publish Course</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;
