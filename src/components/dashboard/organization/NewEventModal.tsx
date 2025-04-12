
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, ImageIcon, Link, Bold, Italic, Underline, Heading2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { v4 as uuidv4 } from "uuid";

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

interface EventFormValues {
  title: string;
  slug: string;
  location: string;
  description: string;
  maxVolunteers: number;
  time: string;
}

export function NewEventModal({ open, onClose, onEventCreated }: NewEventModalProps) {
  const [date, setDate] = React.useState<Date>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [coverImage, setCoverImage] = React.useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = React.useState<string>("");
  const { user } = useAuth();
  
  const form = useForm<EventFormValues>({
    defaultValues: {
      title: "",
      slug: "",
      location: "",
      description: "",
      maxVolunteers: 10,
      time: "09:00"
    }
  });

  // Rich text formatting state
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isHeading, setIsHeading] = React.useState(false);
  
  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      form.reset();
      setDate(undefined);
      setCoverImage(null);
      setCoverImagePreview("");
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setIsHeading(false);
    }
  }, [open, form]);
  
  // Generate slug from title
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  };
  
  // Handle title change to auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("title", e.target.value);
    if (!form.getValues("slug")) {
      form.setValue("slug", generateSlug(e.target.value));
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Format description with selected styles
  const applyStyle = (style: 'bold' | 'italic' | 'underline' | 'heading') => {
    const textArea = document.getElementById('description') as HTMLTextAreaElement;
    if (!textArea) return;
    
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, end);
    let formattedText = selectedText;
    
    switch (style) {
      case 'bold':
        setIsBold(!isBold);
        formattedText = !isBold ? `**${selectedText}**` : selectedText;
        break;
      case 'italic':
        setIsItalic(!isItalic);
        formattedText = !isItalic ? `*${selectedText}*` : selectedText;
        break;
      case 'underline':
        setIsUnderline(!isUnderline);
        formattedText = !isUnderline ? `__${selectedText}__` : selectedText;
        break;
      case 'heading':
        setIsHeading(!isHeading);
        formattedText = !isHeading ? `## ${selectedText}` : selectedText;
        break;
    }
    
    const newText = textArea.value.substring(0, start) + formattedText + textArea.value.substring(end);
    form.setValue("description", newText);
  };

  const onSubmit = async (data: EventFormValues) => {
    if (!date) {
      toast.error("Please select a date for the event");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to create an event");
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert time string to hours and minutes
      const [hours, minutes] = data.time.split(':').map(Number);
      
      // Set the time on the selected date
      const startTime = new Date(date);
      startTime.setHours(hours, minutes);
      
      // End time is 2 hours after start by default
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);
      
      let imageUrl = null;
      
      // Upload cover image if one was selected
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('event-covers')
          .upload(fileName, coverImage);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('event-covers')
          .getPublicUrl(fileName);
          
        if (urlData) {
          imageUrl = urlData.publicUrl;
        }
      }
      
      // Create the event in Supabase
      const { error } = await supabase.from('events').insert({
        title: data.title,
        description: data.description,
        location: data.location,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        max_volunteers: Number(data.maxVolunteers),
        organization_id: user.id,
        status: 'draft',
        image_url: imageUrl,
        slug: data.slug || generateSlug(data.title)
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Event created successfully! It will appear in your drafts.");
      
      // Call the callback if provided
      if (onEventCreated) {
        onEventCreated();
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(`Failed to create event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new volunteer event.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Cover Image */}
              <div className="grid gap-2">
                <FormLabel className="text-sm font-medium">Event Cover</FormLabel>
                <div className="flex flex-col gap-2">
                  {coverImagePreview ? (
                    <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={coverImagePreview} 
                        alt="Event cover preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverImagePreview("");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label 
                      htmlFor="cover-image" 
                      className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
                    >
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Click to upload cover image</span>
                      <input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter event title" 
                        {...field} 
                        onChange={handleTitleChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Event Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Link className="h-4 w-4" /> Web Page Slug
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="bg-gray-100 px-3 py-2 rounded-l-md text-gray-500 border border-r-0">
                          seekup.com/events/
                        </span>
                        <Input 
                          className="rounded-l-none"
                          placeholder="your-event-slug" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal pointer-events-auto",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-white">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Description with rich text formatting */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <div className="flex items-center gap-1 mb-1 bg-gray-50 rounded p-1 border">
                      <Button 
                        type="button" 
                        variant={isBold ? "default" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => applyStyle('bold')}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant={isItalic ? "default" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => applyStyle('italic')}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant={isUnderline ? "default" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => applyStyle('underline')}
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant={isHeading ? "default" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => applyStyle('heading')}
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        id="description"
                        placeholder="Describe the event..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Use markdown formatting: **bold**, *italic*, __underline__, ## heading
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxVolunteers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Volunteers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter maximum number of volunteers"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-seekup-blue hover:bg-seekup-blue/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
