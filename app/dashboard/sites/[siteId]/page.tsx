import {Button} from "@/components/ui/button";
import { Book, MoreHorizontal, Plus,Settings } from "lucide-react";
import Link from "next/link";
import prisma from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { FileIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/app/components/dashboard/EmptyState";

async function getData(userId: string,siteId: string) {
    const data = await prisma.site.findUnique({
        where: {
            userId: userId,
            id: siteId,
        },
        select: {
         subdirectory: true,
         posts: {
                select: {
                    id: true,
                    title: true,
                    image: true,
                    createdAt: true,
                },
            },

        },
    });

    return data;
}
 
export default async function SiteIdRoute({params}:{params:{siteId: string}}) { 
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if(!user){
        return redirect("/api/auth/login");
    }

    const data = await getData(user.id, params.siteId);
    return (
        <>
        <div className = "flex w- full justify-end gap-x-4">
            <Button asChild variant ="secondary">
                <Link href = {`/blog/${data?.subdirectory}`} >
                <Book className = "mr-2 size-4"/>
                View Blog</Link>
            </Button>
            <Button asChild variant ="secondary">
                <Link href = {`/dashboard/sites/${params.siteId}/settings`}>
                <Settings  className = "mr-2 size-4"/>
                Settings
                </Link>
            </Button>
            <Button asChild variant ="secondary">
                <Link href = {`/dashboard/sites/${params.siteId}/create`}>
                <Plus className = "mr-2 size-4" />
                Create Article</Link>
            </Button>
        
        </div>
        {data?.posts === undefined || data.posts.length=== 0 ? (

           <EmptyState title="You dont have any articles here" 
           description="You currently dont have any articles.please create some so that you can see them here "
           buttonText="Create Article"
           href="/dashboard/sites/${params.siteId}/create"
           />

            ) : (
              <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Articles</CardTitle>
                        <CardDescription>
                            Manage your articles in simple and intutive interface
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.posts.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Image src={item.image} 
                                            width={64} 
                                            height={64} 
                                            alt="Article Cover Image"
                                            className="size-16 rounded-md object-cover"
                                            />

                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {item.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline"
                                            className="bg-green-500/10 text-green-500"
                                            >Published</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Intl.DateTimeFormat("en-US", {
                                                dateStyle: "medium",    
                                            }).format(new Date(item.createdAt))}
                                            
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>

                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent  align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator/>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/sites/${params.siteId}/${item.id}`}>
                                                            Edit

                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/sites/${params.siteId}/${item.id}/delete`}>
                                                            Delete
                                                        </Link>
                                                           
                                                        
                                                    </DropdownMenuItem>

                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              </div>         
            )}
        </> 
        )}
       
  

                
