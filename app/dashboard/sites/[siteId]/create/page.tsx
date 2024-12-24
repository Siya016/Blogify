"use client";
import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle,Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Atom } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useActionState, useState } from "react"
import { UploadDropzone } from "@/app/utils/UploadthingComponents"
import Image from "next/image";
import { UploadButton } from "@/app/utils/UploadthingComponents";
import { toast } from "sonner";
import { parseWithZod } from "@conform-to/zod";
import { PostSchema } from "@/app/utils/zodSchemas";
import TailwindEditor from "@/app/components/dashboard/EditorWrapper";
import { JSONContent } from "novel";
import { CreatePostAction } from "@/app/actions";
import { useForm } from "@conform-to/react";
import slugify from "react-slugify"
import onClick from "react"
import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";



export default function ArticleCreationRoute({params}:{params:{siteId: string}}) {
    const[imageUrl, setImageUrl] = useState<undefined | string>(undefined);
    const [value, setValue] = useState<JSONContent | undefined>(undefined);
    const[slug, setSlugValue] = useState<undefined|string>(undefined);
    const[title, setTitle] = useState<undefined|string>(undefined);
    const[lastResult,action]= useActionState(CreatePostAction,undefined);
    
    const[form,fields]=useForm({
        lastResult: lastResult ? lastResult() : undefined,
        
        onValidate({formData}){
            return parseWithZod(formData, {schema: PostSchema});
        },
           

        shouldValidate:"onBlur",
        shouldRevalidate:"onInput"
    });

    function handleSlugGeneration(){
        const titleInput = title;

        if(titleInput?.length===0 || titleInput === undefined){
            return toast.error("Please enter a title to generate a slug");
        }

        setSlugValue(slugify(titleInput));

        return toast.success("Slug generated successfully");
    }



    return (

    <>
        <div className="flex items-center">
            <Button size='icon' variant='outline' className="mr-3" asChild>
                <Link href={`/dashboard/sites/${params.siteId}`}>
                <ArrowLeft className="mr-2 size-4" />

                </Link>
            </Button>
            <h1 className="text-xl font-semibold"> Create Article</h1>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Article Details </CardTitle>
                <CardDescription>
                    Create your Article here. Click the button
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-6" 
                id={form.id}
                onSubmit={form.onSubmit}
                action={action}
                >
                  <input type="hidden" name="siteId" value={params.siteId} />
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input key={fields.title.key} 
                    name={fields.title.name}
                    defaultValue={fields.title.initialValue}
                    placeholder="Blogging Application"
                    onChange={(e) => 
                        setTitle(e.target.value)}
                        value={title}
                     />    
                   </div> 
                   <p className="text-red-500 text-sm">{fields.title.errors}</p>

                   <div className="grid gap-2">
                    <Label>Slug</Label>
                    <Input
                    key={fields.slug.key}
                    name={fields.slug.name}
                    defaultValue={fields.slug.initialValue} 
                    placeholder="Article Slug" 
                    onChange = {(e) => setSlugValue(e.target.value)}
                    value={slug}
                     />
                    <Button onClick={handleSlugGeneration} 
                    className="w-fit" variant="secondary" type="button">
                        <Atom className="mr-2 size-4" />Generate Slug
                    </Button>
                    <p className="text-red-500 text-sm">{fields.slug.errors}</p>
                     </div>

                     <div className="grid gap-2">
                        <Label>Small Description</Label>
                        <textarea
                        key={fields.smallDescription.key}
                        name={fields.smallDescription.name}
                        defaultValue={fields.smallDescription.initialValue}
                         placeholder="Small Description for your blog article" 
                         className="h-32" />
                         <p className="text-red-500 text-sm">{fields.smallDescription.errors}</p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Cover Image</Label>
                        <input 
                        type="hidden"
                        name={fields.coverImage.name}
                        key={fields.coverImage.key}
                        defaultValue={fields.coverImage.initialValue}
                        value={imageUrl}
                        />
                        {imageUrl ? (
                            <Image src={imageUrl}
                            alt="uploaded image"
                            className="object-cover w-[200px] h-[200px] rounded-lg"
                            width={200}
                            height={200}
                            />
                        ) : (
                                <UploadDropzone
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    setImageUrl(res[0].url);
                                    toast.success("Image uploaded successfully");
                                }}
                                onUploadError={(error) => {
                                    toast.error("Upload failed");
                                }}
                                />
                            )}

                            <p className="text-red-500 text-sm">{fields.coverImage.errors}</p>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label>Article Content</Label>
                        <input type="hidden"
                         name={fields.articleContent.name} 
                         key={fields.articleContent.key}
                         defaultValue={fields.articleContent.initialValue} 
                         value={JSON.stringify(value)}
                         />
                        <TailwindEditor onChange={setValue} initialValue={value}/>
                        <p className="text-red-500 text-sm">{fields.articleContent.errors}</p>
                    </div>
                    <SubmitButton  text= "Create Article"/>
                    </form>
            </CardContent>
        </Card>

    </>
    )


}
