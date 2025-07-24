import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Link } from "react-router-dom";

const CourseCards = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <img
            src="/assets/login-image.jpg"
            alt="Image"
            className="object-cover w-full h-30"
          />

          <CardTitle>Course 1</CardTitle>
          <CardDescription>Intro to Tech</CardDescription>
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
