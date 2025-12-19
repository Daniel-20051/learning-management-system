import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Progress } from "@/Components/ui/progress";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
  Upload,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
  GraduationCap,
} from "lucide-react";
import { AuthApi } from "@/api/auth";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface UploadDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: () => void;
}

interface DocumentField {
  id: string;
  label: string;
  documentType: string;
  description: string;
  required: boolean;
}

interface DocumentStep {
  id: string;
  label: string;
  fields: DocumentField[];
}

const documentSteps: DocumentStep[] = [
  {
    id: "certificates",
    label: "Certificates",
    fields: [
      {
        id: "certificate",
        label: "Academic Certificate",
        documentType: "certificate_file",
        description: "Upload certificate of most recent school",
        required: true,
      },
      {
        id: "birth",
        label: "Birth Certificate",
        documentType: "birth_certificate",
        description: "Upload your birth certificate or age declaration",
        required: true,
      },
    ],
  },
  {
    id: "identification",
    label: "Identification & Reference",
    fields: [
      {
        id: "reference",
        label: "Reference Letter",
        documentType: "ref_letter",
        description: "Upload a reference letter from a recognized institution or professional",
        required: true,
      },
      {
        id: "id",
        label: "Valid ID",
        documentType: "valid_id",
        description: "Upload a valid means of identification (National ID, Driver's License, or International Passport)",
        required: true,
      },
    ],
  },
  {
    id: "optional",
    label: "Additional Documents (Optional)",
    fields: [
      {
        id: "resume",
        label: "Resume/CV",
        documentType: "resume_cv",
        description: "Upload your curriculum vitae or resume",
        required: false,
      },
      {
        id: "other",
        label: "Other Supporting Documents",
        documentType: "other_file",
        description: "Upload any other relevant documents",
        required: false,
      },
    ],
  },
];

interface SchoolInfo {
  school1: string;
  school1_date: string;
  school2: string;
  school2_date: string;
  school: string;
  school_date: string;
}

export default function UploadDocumentsDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: UploadDocumentsDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    school1: "",
    school1_date: "",
    school2: "",
    school2_date: "",
    school: "",
    school_date: "",
  });
  const [currentFiles, setCurrentFiles] = useState<Record<string, File | null>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, {
    url: string | null;
    status: string | null;
    rejection_reason: string | null;
    reviewed_at: string | null;
  }>>({});
  const { setUser } = useAuth();

  const authApi = new AuthApi();
  const totalSteps = 1 + documentSteps.length; // 1 for school info + document steps

  // Load existing documents when dialog opens
  useEffect(() => {
    if (open) {
      loadExistingDocuments();
    }
  }, [open]);

  const loadExistingDocuments = async () => {
    try {
      const response: any = await authApi.getKycDocuments();
      if (response?.data?.success && response?.data?.data?.documents) {
        // Transform the documents object to match our state structure
        const documents: Record<string, {
          url: string | null;
          status: string | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
        }> = {};
        
        Object.entries(response.data.data.documents).forEach(([key, value]: [string, any]) => {
          documents[key] = {
            url: value?.url || null,
            status: value?.status || null,
            rejection_reason: value?.rejection_reason || null,
            reviewed_at: value?.reviewed_at || null,
          };
        });
        
        setUploadedDocuments(documents);
        
        // Load school info if available
        if (response.data.data.schools) {
          const schools = response.data.data.schools;
          setSchoolInfo({
            school1: schools.school1?.name || "",
            school1_date: schools.school1?.date || "",
            school2: schools.school2?.name || "",
            school2_date: schools.school2?.date || "",
            school: schools.general_school?.name || "",
            school_date: schools.general_school?.date || "",
          });
        }
      }
    } catch (err: any) {
      console.error("Error loading documents:", err);
      // Don't show error, just continue
    }
  };

  const handleFileSelect = (documentType: string, file: File | null) => {
    setCurrentFiles((prev) => ({ ...prev, [documentType]: file }));
    setError(null);
  };

  const handleSchoolInfoChange = (field: keyof SchoolInfo, value: string) => {
    setSchoolInfo((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNext = async () => {
    setError(null);

    // Step 0: School Information
    if (currentStep === 0) {
      // Validate at least one school is provided
      const hasSchoolInfo =
        schoolInfo.school1.trim() ||
        schoolInfo.school2.trim() ||
        schoolInfo.school.trim();

      if (!hasSchoolInfo) {
        setError("Please provide at least one previous school information");
        return;
      }

      // Save school information
      try {
        setUploading(true);
        const response: any = await authApi.updateSchoolInformation({
          school1: schoolInfo.school1 || undefined,
          school1_date: schoolInfo.school1_date || undefined,
          school2: schoolInfo.school2 || undefined,
          school2_date: schoolInfo.school2_date || undefined,
          school: schoolInfo.school || undefined,
          school_date: schoolInfo.school_date || undefined,
        });

        if (response?.data?.success) {
          toast.success("School information saved successfully");
          setCurrentStep(1);
        } else {
          throw new Error(response?.data?.message || "Failed to save school information");
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save school information. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setUploading(false);
      }
      return;
    }

    // Document steps: Upload all files in current step before proceeding
    const documentIndex = currentStep - 1;
    const currentStepData = documentSteps[documentIndex];
    
    // Check if all required fields are uploaded or have files selected
    const requiredFields = currentStepData.fields.filter(f => f.required);
    const missingRequired = requiredFields.some(field => {
      const docData = uploadedDocuments[field.documentType];
      const hasFile = currentFiles[field.documentType] !== null;
      return !docData?.url && !hasFile;
    });

    if (missingRequired) {
      const missingFields = requiredFields
        .filter(f => !uploadedDocuments[f.documentType]?.url && !currentFiles[f.documentType])
        .map(f => f.label)
        .join(", ");
      setError(`Please upload: ${missingFields}`);
      return;
    }

    // Upload all files that are selected
    const filesToUpload = Object.entries(currentFiles).filter(([docType, file]) => 
      file !== null && currentStepData.fields.some(f => f.documentType === docType)
    );

    if (filesToUpload.length > 0) {
      // Upload files sequentially
      for (const [documentType, file] of filesToUpload) {
        if (!file) continue;

        const field = currentStepData.fields.find(f => f.documentType === documentType);
        if (!field) continue;

        const docData = uploadedDocuments[documentType];
        if (docData?.status === "approved") {
          setError(`${field.label} is approved and cannot be replaced.`);
          return;
        }

        if (docData?.status === "pending" && file) {
          setError(`${field.label} is under review. You cannot upload a new document until the review is complete.`);
          return;
        }

        try {
          setUploading(true);
          setUploadingField(documentType);
          setUploadProgress(0);

          const response: any = await authApi.uploadKycDocument(
            documentType,
            file,
            (progress) => {
              setUploadProgress(progress);
            }
          );

          if (response?.data?.success) {
            toast.success(`${field.label} uploaded successfully`);
            setUploadedDocuments((prev) => ({
              ...prev,
              [documentType]: {
                url: response.data.data.file_url,
                status: "pending",
                rejection_reason: null,
                reviewed_at: null,
              },
            }));
            setCurrentFiles((prev) => ({ ...prev, [documentType]: null }));
          } else {
            throw new Error(response?.data?.message || `Failed to upload ${field.label}`);
          }
        } catch (err: any) {
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            `Failed to upload ${field.label}. Please try again.`;
          setError(errorMessage);
          toast.error(errorMessage);
          setUploading(false);
          setUploadProgress(0);
          setUploadingField(null);
          return;
        }
      }

      setUploading(false);
      setUploadProgress(0);
      setUploadingField(null);
    }

    // Move to next step after all uploads complete
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentFiles({});
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentFiles({});
      setError(null);
    }
  };

  const handleComplete = async () => {
    try {
      // Refresh user data to update status
      const profileResponse = await authApi.getUserProfile();
      const profileData = profileResponse as any;
      if (profileData?.data?.success || profileData?.data?.status) {
        const userData = profileData?.data?.data?.user;
        if (userData) {
          setUser({
            id: String(userData.id),
            email: userData.email,
            name: userData.fname + " " + userData.lname,
            role: userData.userType || "student",
            status: userData.status,
          });
        }
      }

      toast.success("All documents uploaded successfully!");
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      // Reset and close
      setCurrentStep(0);
      setCurrentFiles({});
      setUploadProgress(0);
      setError(null);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error completing upload:", err);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setCurrentStep(0);
      setCurrentFiles({});
      setError(null);
      setUploadProgress(0);
      onOpenChange(false);
    }
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;
  const isSchoolInfoStep = currentStep === 0;
  const documentIndex = currentStep - 1;
  const currentDocument = documentIndex >= 0 ? documentSteps[documentIndex] : null;
  
  // Check if we can proceed
  let canProceed = true;
  if (isSchoolInfoStep) {
    canProceed = !!(schoolInfo.school1.trim() || schoolInfo.school2.trim() || schoolInfo.school.trim());
  } else if (currentDocument) {
    // Check all required fields in current step
    const requiredFields = currentDocument.fields.filter(f => f.required);
    canProceed = requiredFields.every(field => {
      const docData = uploadedDocuments[field.documentType];
      const hasFile = currentFiles[field.documentType] !== null;
      const isUploaded = docData?.url !== null;
      
      // Cannot proceed if trying to upload when approved
      if (docData?.status === "approved" && hasFile) {
        return false;
      }
      
      return isUploaded || hasFile;
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Application Process</DialogTitle>
          <DialogDescription>
            {isSchoolInfoStep
              ? "Step 1: Provide your previous school information"
              : `Step ${currentStep + 1} of ${totalSteps}: ${currentDocument?.label}`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className={`flex items-center ${currentStep === 0 ? "flex-1" : ""}`}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep > 0
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === 0
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-muted-foreground"
              }`}
            >
              {currentStep > 0 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
            </div>
            {documentSteps.length > 0 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep > 0 ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
          {documentSteps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span>{stepNumber + 1}</span>
                  )}
                </div>
                {index < documentSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Content */}
        <div className="space-y-4 py-4">
          {isSchoolInfoStep ? (
            /* School Information Form */
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Previous School Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please provide information about your previous schools (at least one is required)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school1">School 1</Label>
                  <Input
                    id="school1"
                    value={schoolInfo.school1}
                    onChange={(e) => handleSchoolInfoChange("school1", e.target.value)}
                    placeholder="School name"
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school1_date">Date/Period</Label>
                  <Input
                    id="school1_date"
                    value={schoolInfo.school1_date}
                    onChange={(e) => handleSchoolInfoChange("school1_date", e.target.value)}
                    placeholder="e.g., 2015-2020"
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school2">School 2 (Optional)</Label>
                  <Input
                    id="school2"
                    value={schoolInfo.school2}
                    onChange={(e) => handleSchoolInfoChange("school2", e.target.value)}
                    placeholder="School name"
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school2_date">Date/Period</Label>
                  <Input
                    id="school2_date"
                    value={schoolInfo.school2_date}
                    onChange={(e) => handleSchoolInfoChange("school2_date", e.target.value)}
                    placeholder="e.g., 2010-2015"
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">General School (Optional)</Label>
                  <Input
                    id="school"
                    value={schoolInfo.school}
                    onChange={(e) => handleSchoolInfoChange("school", e.target.value)}
                    placeholder="School name"
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_date">Date</Label>
                  <Input
                    id="school_date"
                    type="date"
                    value={schoolInfo.school_date}
                    onChange={(e) => handleSchoolInfoChange("school_date", e.target.value)}
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          ) : currentDocument ? (
            /* Document Upload - Multiple fields per step */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {currentDocument.label}
                </h3>
              </div>

              {/* Render each field in the current step */}
              {currentDocument.fields.map((field) => {
                const documentData = uploadedDocuments[field.documentType];
                const currentFile = currentFiles[field.documentType];
                const isPending = documentData?.status === "pending";
                const isApproved = documentData?.status === "approved";
                const isRejected = documentData?.status === "rejected";
                const isUploadingThis = uploadingField === field.documentType;

                return (
                  <div key={field.id} className="space-y-2">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {field.description}
                      </p>
                      {isApproved && (
                        <Alert className="mt-2 bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Document approved.
                          </AlertDescription>
                        </Alert>
                      )}
                      {isRejected && (
                        <Alert className="mt-2 bg-red-50 border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            Document rejected: {documentData.rejection_reason || "Please upload a new document."}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* File Upload Area */}
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      isApproved ? "opacity-50 pointer-events-none" : ""
                    }`}>
                      {isApproved ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                            <div className="text-left">
                              <p className="font-medium text-sm">Document approved</p>
                              <p className="text-xs text-muted-foreground">
                                This document has been approved and cannot be replaced
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : isPending && !currentFile ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <File className="h-8 w-8 text-amber-600" />
                            <div className="text-left">
                              <p className="font-medium text-sm">Document is under review</p>
                              <p className="text-xs text-muted-foreground">
                                You can proceed to other steps while this document is being reviewed
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : currentFile ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                            <File className="h-8 w-8 text-primary" />
                            <div className="text-left">
                              <p className="font-medium text-sm">{currentFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {currentFile.size / 1024 / 1024 > 1
                                  ? `${(currentFile.size / 1024 / 1024).toFixed(2)} MB`
                                  : `${(currentFile.size / 1024).toFixed(2)} KB`}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileSelect(field.documentType, null)}
                              disabled={uploading}
                              className="ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (file) {
                                // Validate file size (10MB max)
                                if (file.size > 10 * 1024 * 1024) {
                                  setError("File size must be less than 10MB");
                                  return;
                                }
                                // Validate file type
                                const validTypes = [
                                  "application/pdf",
                                  "image/jpeg",
                                  "image/jpg",
                                  "image/png",
                                ];
                                if (!validTypes.includes(file.type)) {
                                  setError("Only PDF, JPG, and PNG files are allowed");
                                  return;
                                }
                                handleFileSelect(field.documentType, file);
                              }
                            }}
                          />
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, JPG, PNG (Max 10MB)
                              </p>
                            </div>
                          </div>
                        </label>
                      )}
                      {isUploadingThis && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Uploading...</span>
                            <span className="font-medium">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploading && !uploadingField && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {isSchoolInfoStep ? "Saving..." : "Uploading..."}
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || uploading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isSchoolInfoStep ? "Saving..." : "Uploading..."}
              </>
            ) : isLastStep ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
