import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

export async function POST(req) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { clerkUserId: id },
      });

      if (existingUser) {
        console.log("User already exists:", id);
        return new Response("User already exists", { status: 200 });
      }

      // Create new user
      const name = first_name && last_name 
        ? `${first_name} ${last_name}`
        : email_addresses[0]?.email_address || "User";

      await db.user.create({
        data: {
          clerkUserId: id,
          email: email_addresses[0]?.email_address || "",
          name,
          imageUrl: image_url || null,
          role: "UNASSIGNED", // Default role, user will choose during onboarding
        },
      });

      console.log("User created successfully:", id);
      return new Response("User created", { status: 200 });
    } catch (error) {
      console.error("Error creating user:", error);
      
      // If it's a unique constraint error, user might already exist
      if (error.code === "P2002") {
        console.log("User already exists (unique constraint):", id);
        return new Response("User already exists", { status: 200 });
      }
      
      return new Response("Error creating user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      const user = await db.user.findUnique({
        where: { clerkUserId: id },
      });

      if (!user) {
        // User doesn't exist, create them
        const name = first_name && last_name 
          ? `${first_name} ${last_name}`
          : email_addresses[0]?.email_address || "User";

        await db.user.create({
          data: {
            clerkUserId: id,
            email: email_addresses[0]?.email_address || "",
            name,
            imageUrl: image_url || null,
            role: "UNASSIGNED",
          },
        });
      } else {
        // Update existing user
        const name = first_name && last_name 
          ? `${first_name} ${last_name}`
          : user.name || email_addresses[0]?.email_address || "User";

        await db.user.update({
          where: { clerkUserId: id },
          data: {
            email: email_addresses[0]?.email_address || user.email,
            name,
            imageUrl: image_url || user.imageUrl,
          },
        });
      }

      return new Response("User updated", { status: 200 });
    } catch (error) {
      console.error("Error updating user:", error);
      return new Response("Error updating user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await db.user.delete({
        where: { clerkUserId: id },
      });

      return new Response("User deleted", { status: 200 });
    } catch (error) {
      console.error("Error deleting user:", error);
      // User might not exist, that's okay
      return new Response("User deleted or not found", { status: 200 });
    }
  }

  return new Response("", { status: 200 });
}

