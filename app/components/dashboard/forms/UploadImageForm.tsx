

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDropzone } from "@/app/utils/UploadthingComponents";
import { useState } from "react";
import Image from "next/image";
import { SubmitButton } from "../SubmitButtons";
import { toast } from "sonner";
import { UpdateImage } from "@/app/actions";

interface UploadImageFormProps {
    siteId: string;
}


export function UploadImageForm({siteId}: UploadImageFormProps) {
    const [imageUrl, setImageUrl] = useState<undefined | string>(undefined);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Image</CardTitle>
                <CardDescription>
                    This is the image of your site.You can upload a new image here.
                </CardDescription>
            
            </CardHeader>
            <CardContent>
                {imageUrl ? (
                    <Image  src={imageUrl} alt="Uploaded Image" width={200} height={200}
                    className="size-[200px] object-cover rounded-lg" />
                ) : (
                    <UploadDropzone endpoint="imageUploader" 
                    onClientUploadComplete={(res) => {
                        setImageUrl(res[0].url);
                        toast.success("Image uploaded successfully");
                    }}
                    onUploadError={(error) => {
                        toast.error("Upload failed");
                    }
                    }
                    
                    />
                )}
                
            </CardContent>
            <CardFooter>
                <form action={UpdateImage}>
                   <input type="hidden" name="siteId" value={siteId} /> 
                   <input type="hidden" name="imageUrl" value={imageUrl} />
                <SubmitButton text="Change Image" />
                </form>
            </CardFooter>
        </Card>
    );
}