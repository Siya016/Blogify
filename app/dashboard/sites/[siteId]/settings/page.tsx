"use client";

import { DeleteSite } from "@/app/actions";
import { UploadImageForm } from "@/app/components/dashboard/forms/UploadImageForm";
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";


export default function Settings({params}:{params:{siteId: string}}) {
    return (
        <>
        <div className="flex items-center gap-x-2">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/dashboard/sites/${params.siteId}`}>
                <ChevronLeft className="size-4"/>
                </Link>
                
            </Button>
            <h3 className="text-xl font-semibold">Go Back</h3>
        </div>

        <UploadImageForm siteId={params.siteId}/>

        <Card className="border-red-500 bg-red-500/10">
            <CardHeader>
                <CardTitle className="text-red-500">Danger</CardTitle>
                <CardDescription>
                    This will delete your site and all its data. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <form action ={DeleteSite}>
                    <input type="hidden" name="siteId" value={params.siteId}/>
                
                <SubmitButton text="Delete Everything" variant="destructive"/>
                </form>
            </CardFooter>
        </Card>

    
        </>
    );
    }
