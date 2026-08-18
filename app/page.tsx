import { auth,currentUser  } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../app/lib/prisma";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const user = await currentUser();

  await prisma.user.upsert({
    where: {
      id: userId,
    },
    update: {},
    create: {
      id: userId,
      email: user!.emailAddresses[0].emailAddress,
      firstName: user!.firstName,
      lastName: user!.lastName,
      imageUrl: user!.imageUrl,
    },
  });


  redirect("/dashboard");
}