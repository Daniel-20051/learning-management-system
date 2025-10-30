import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { CreateVideoCall, type CreateVideoCallPayload } from '../../api/video';
import { toast } from 'sonner';

interface CreateVideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: number;
  onSuccess?: (callData: any) => void;
}

export const CreateVideoCallDialog: React.FC<CreateVideoCallDialogProps> = ({
  isOpen,
  onClose,
  courseId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateVideoCallPayload>({
    title: '',
    courseId: courseId || 0,
    callType: 'lecture', // hardcoded
    record: false,
    region: 'auto', // hardcoded
    startsAt: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof CreateVideoCallPayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the video call');
      return;
    }
    
    
    if (!formData.startsAt) {
      toast.error('Please select a start date and time');
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert the datetime-local input to ISO string
      const startsAtISO = new Date(formData.startsAt).toISOString();
      
      const payload = {
        ...formData,
        startsAt: startsAtISO
      };
      
      const response = await CreateVideoCall(payload);
      
      if (response.success) {
        toast.success('Video call created successfully!');
        onSuccess?.(response.data);
        onClose();
        // Reset form
        setFormData({
          title: '',
          courseId: courseId || 0,
          callType: 'lecture', // hardcoded
          record: false,
          region: 'auto', // hardcoded
          startsAt: ''
        });
      } else {
        toast.error(response.error || 'Failed to create video call');
      }
    } catch (error: any) {
      console.error('Error creating video call:', error);
      toast.error(error.message || 'Failed to create video call');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Video Call</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter video call title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>



          <div className="space-y-2">
            <Label htmlFor="startsAt">Start Date & Time *</Label>
            <Input
              id="startsAt"
              type="datetime-local"
              value={formData.startsAt}
              onChange={(e) => handleInputChange('startsAt', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="record"
              checked={formData.record}
              onCheckedChange={(checked) => handleInputChange('record', checked)}
            />
            <Label htmlFor="record">Record this call</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Video Call'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
