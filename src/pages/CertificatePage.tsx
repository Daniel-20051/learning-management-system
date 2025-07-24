import React from "react";
import { modules } from "@/lib/modulesData";
import { getAdminConfig } from "@/lib/adminConfig";
import { getQuizResult } from "@/lib/quizResults";
import { Button } from "@/Components/ui/button";
import Navbar from "@/Components/navbar";
import { useNavigate } from "react-router-dom";

const CertificatePage: React.FC = () => {
  const adminConfig = getAdminConfig();
  const navigate = useNavigate();
  const passingScore = adminConfig.passingScore || 75;

  // Gather all module quiz results
  const quizModules = modules.filter((mod) => mod.quiz && mod.quiz.length > 0);
  const quizResults = quizModules.map((mod) => {
    const moduleIndex = modules.indexOf(mod);
    const quizResult = getQuizResult(moduleIndex);
    return quizResult ? quizResult.percentage : null;
  });

  // Calculate average score
  const attemptedAll = quizResults.every((score) => score !== null);
  const averageScore =
    attemptedAll && quizResults.length > 0
      ? Math.round(
          quizResults.reduce((a, b) => a + (b as number), 0) /
            quizResults.length
        )
      : 0;

  const eligible = attemptedAll && averageScore >= passingScore;

  const handleDownload = () => {
    const blob = new Blob(
      [
        `Certificate of Completion\n\nThis certifies that you have successfully completed the course with an average score of ${averageScore}%.`,
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
        <div className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <div className="font-semibold text-lg">Full Course</div>
            <div className="text-sm text-muted-foreground">
              Average Quiz Score:{" "}
              <span className={eligible ? "text-green-600" : "text-red-600"}>
                {averageScore}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Required: {passingScore}% to download certificate
            </div>
          </div>
          <Button
            disabled={!eligible}
            onClick={handleDownload}
            variant={eligible ? "default" : "outline"}
          >
            {attemptedAll
              ? eligible
                ? "Download Certificate"
                : "Not Eligible"
              : "Attempt All Quizzes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
