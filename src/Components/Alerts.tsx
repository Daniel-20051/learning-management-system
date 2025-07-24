import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
const Alerts = () => {
  return (
    <div>
      <Alert>
        <AlertTitle>Success! Your changes have been saved</AlertTitle>
        <AlertDescription>
          This is an alert with icon, title and description.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Alerts;
