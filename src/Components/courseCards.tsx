import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Link } from "react-router-dom";

interface CourseCardsProps {
  courseCode: string;
  courseTitle: string;
}

const CourseCards = ({ courseCode, courseTitle }: CourseCardsProps) => {
  return (
    <div>
      <Card className="overflow-hidden">
        <div className="w-full h-25 bg-primary relative overflow-hidden">
          {/* Abstract background elements */}
          {/* Course Code Text - Centered and White */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-2xl font-bold drop-shadow-lg">
              {courseCode}
            </span>
          </div>

          <div className="absolute inset-0 opacity-20">
            {/* Dots */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-8 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute bottom-8 left-6 w-2 h-2 bg-yellow-200 rounded-full"></div>
            <div className="absolute bottom-4 right-8 w-2 h-2 bg-white rounded-full"></div>

            {/* Star */}
            <div className="absolute top-2 right-2 w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border border-white/30 transform rotate-45"></div>
            </div>

            {/* Lightning/Checkmark shapes */}
            <div className="absolute bottom-4 left-4 w-6 h-6 border border-white/30 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-l-2 border-b-2 border-white/30 transform rotate-45"></div>
            </div>

            <div className="absolute bottom-8 left-8 w-4 h-4 border border-white/30 transform rotate-12"></div>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="uppercase">{courseTitle}</CardTitle>
          {/* <CardDescription className="uppercase">{courseTitle}</CardDescription> */}
        </CardHeader>
        <CardContent>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
            consectetur cumque exercitationem amet sint dolor
          </p>
        </CardContent>
        <CardFooter className="place-self-end">
          <Button asChild>
            <Link to={`/course/1`}>Start</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CourseCards;
