import React from "react";
import { Button } from "@/Components/ui/button";
import Navbar from "@/Components/navbar";
import { useNavigate } from "react-router-dom";

const CertificatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleDownload = () => {
    const blob = new Blob(
      [
        `Certificate of Completion\n\nThis certifies that you have successfully completed the course.`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Course-certificate.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar sidebar={false} />
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Course Certificate</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Courses
          </Button>
        </div>
        <div className="border rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="font-semibold text-2xl mb-2">
              Course Certificate
            </div>
            <div className="text-muted-foreground mb-4">
              Congratulations on completing the course!
            </div>
          </div>
          <Button onClick={handleDownload} variant="default" size="lg">
            Download Certificate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
