"use server";

import prisma from "./db";

export async function isSubdirectoryUnique(subdirectory: string): Promise<boolean> {
  const existingSubDirectory = await prisma.site.findUnique({
    where: { subdirectory },
  });
  return !existingSubDirectory;
}