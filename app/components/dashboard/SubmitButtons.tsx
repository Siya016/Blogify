"use client";

import { Button } from "@/components/ui/button";
import { useFormState, useFormStatus } from "react-dom";
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react";
interface SubmitButtonProps {
    text:string;
    className?:string;
    variant?:"link"
    |"default"
    |"outline"
    |"ghost"
    |"secondary"
    |"destructive"
    |undefined;
}

export function SubmitButton({text, className, variant}:SubmitButtonProps) {
    const {pending} = useFormStatus()
    return (
        <>
        {pending ? (
            <Button disabled
            className={cn("w-fit", className)} 
            variant={variant}
            > 
            <Loader2 className="animate-spin mr-2 size-4" />

            </Button>
        ) : (
            <Button 
             className={cn("w-fit", className)}
             variant={variant}
             type="submit"
             >
             {text} 
            </Button>
        )}
        </>
    )
}