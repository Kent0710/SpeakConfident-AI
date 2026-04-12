"use client";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditIcon } from "lucide-react";
import { useState } from "react";
import saveTitleAndDescription from "@/actions/analysis/save-title-and-description";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditTitleAndDescriptionDialogProps {
    analysisId: string;
    initialTitle?: string;
    initialDescription?: string;
}

const EditTitleAndDescriptionDialog = ({ 
    analysisId, 
    initialTitle = "", 
    initialDescription = "" 
}: EditTitleAndDescriptionDialogProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            const res = await saveTitleAndDescription(analysisId, title, description);
            if (res.success) {
                toast.success("Saved successfully");
                setIsOpen(false);
                router.refresh(); // Refresh the page to show the updated data
            } else {
                toast.error(res.error || "Failed to save changes");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"}>
                    <EditIcon /> Edit title and description
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit title and description</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="title" className="mb-1">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Type title here..."
                        />
                    </div>
                    <div>
                        <Label htmlFor="description" className="mb-1">
                            Description
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Type description here..."
                        />
                    </div>
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditTitleAndDescriptionDialog;
