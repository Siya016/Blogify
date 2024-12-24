"use server";

import { conformZodMessage, parseWithZod } from "@conform-to/zod";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation";
import {  SiteCreationSchema, siteSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { requireUser } from "./utils/requireUser";
import { PostSchema } from "./utils/zodSchemas";
import { z } from "zod";
import { stripe } from "./utils/stripe";







export async function CreateSiteAction(prevState: any, formData: FormData) {
   const user = await requireUser();



    // Check if the user exists in the database
  let existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  // Create user if not found
  if (!existingUser) {
    console.log("User not found. Creating new user...");
    existingUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        firstName: user.given_name || "DefaultFirstName",
        lastName: user.family_name || "DefaultLastName",
        profileImage: user.picture || "default-image-url",
      },
    });
  }

  const [subStatus, sites] = await Promise.all([
    prisma.subscription.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        status: true,
      },
    }),
    prisma.site.findMany({
      where: {
        userId: user.id,
      },
    }),
  ]);

  if (!subStatus || subStatus.status !== "active") {
    if (sites.length < 1) {
      // Allow creating a site
      const submission = await parseWithZod(formData, {
        schema: SiteCreationSchema({
          async isSubdirectoryUnique() {
            const exisitngSubDirectory = await prisma.site.findUnique({
              where: {
                subdirectory: formData.get("subdirectory") as string,
              },
            });
            return !exisitngSubDirectory;
          },
        }),
        async: true,
      });

      if (submission.status !== "success") {
        return submission.reply();
      }

      const response = await prisma.site.create({
        data: {
          description: submission.value.description,
          name: submission.value.name,
          subdirectory: submission.value.subdirectory,
          userId: user.id,
        },
      });

      return redirect("/dashboard/sites");
    } else {
      // user alredy has one site dont allow
      return redirect("/dashboard/pricing");
    }
  } else if (subStatus.status === "active") {
    // User has a active plan he can create sites...
    const submission = await parseWithZod(formData, {
      schema: SiteCreationSchema({
        async isSubdirectoryUnique() {
          const exisitngSubDirectory = await prisma.site.findUnique({
            where: {
              subdirectory: formData.get("subdirectory") as string,
            },
          });
          return !exisitngSubDirectory;
        },
      }),
      async: true,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const response = await prisma.site.create({
      data: {
        description: submission.value.description,
        name: submission.value.name,
        subdirectory: submission.value.subdirectory,
        userId: user.id,
      },
    });
    return redirect("/dashboard/sites");
  }
}




   


export async function CreatePostAction( prevState:any,formData: FormData) {
    const user = await requireUser();

    const submission = parseWithZod(formData, {
        schema: PostSchema,
    });

    if (submission.status !== "success") {
        return submission.reply;
    }

    const data = await prisma.post.create({
      data: {
        title: submission.value.title,
        slug: submission.value.slug,
        image: submission.value.coverImage,
        smallDescription: submission.value.smallDescription,
        articleContent: JSON.parse(submission.value.articleContent),
        userId: user.id,
        siteId: formData.get("siteId") as string,
         
      },
    });

    return redirect(`/dashboard/sites/${formData.get("siteId")}`);
}


export async function EditPostAction(prevState: any, formData: FormData) {
    const user = await requireUser();

    const submission = parseWithZod(formData, {
        schema: PostSchema,
    });

    if (submission.status !== "success") {
        return submission.reply;
    }

    const data = await prisma.post.update({
        where: {
            userId: user.id,
            id: formData.get("articleId") as string,
        },
        data: {
            title: submission.value.title,
            slug: submission.value.slug,
            image: submission.value.coverImage,
            smallDescription: submission.value.smallDescription,
            articleContent: JSON.parse(submission.value.articleContent),
        },
    });

    return redirect(`/dashboard/sites/${formData.get("siteId")}`);
}

export async function DeletePostAction( formData: FormData) {
    const user = await requireUser();

    const data = await prisma.post.delete({
        where: {
            userId: user.id,
            id: formData.get("articleId") as string,
        },
    });

    return redirect(`/dashboard/sites/${formData.get("siteId")}`);
}


export async function UpdateImage(formData: FormData) {
    const user = await requireUser();
    const data = await prisma.site.update({
        where:{
            userId: user.id,
            id: formData.get("siteId") as string,
        },
        data:{
            imageUrl: formData.get("imageUrl") as string,
        },
    });

    return redirect(`/dashboard/sites/${formData.get("siteId")}`);
}
   

export async function DeleteSite( formData: FormData) {
    const user = await requireUser();

    const data = await prisma.site.delete({
        where: {
            userId: user.id,
            id: formData.get("siteId") as string,
        },
    });

    return redirect(`/dashboard/sites`);
}

export async function CreateSubscription() {
  const user = await requireUser();

  let stripeUserId = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      customerID: true,
      email: true,
      firstName: true,
    },
  });

  if (!stripeUserId?.customerID) {
    const stripeCustomer = await stripe.customers.create({
      email: stripeUserId?.email,
      name: stripeUserId?.firstName,
    });

    stripeUserId = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        customerID: stripeCustomer.id,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeUserId.customerID as string,
    mode: "subscription",
    billing_address_collection: "auto",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    customer_update: {
      address: "auto",
      name: "auto",
    },
    success_url:'http://localhost:3000/dashboard/payment/success',

      
    cancel_url:'http://localhost:3000/dashboard/payment/cancelled',
    
      
  });

  return redirect(session.url as string);
}
    