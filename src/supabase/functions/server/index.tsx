import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { defaultBeats, defaultServices } from "./seed-data.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Get admin password from environment variable (fallback to default for development)
const ADMIN_PASSWORD =
  Deno.env.get("ADMIN_PASSWORD") || "admin123";

if (!Deno.env.get("ADMIN_PASSWORD")) {
  console.warn(
    "⚠️ WARNING: Using default admin password. Set ADMIN_PASSWORD environment variable for production!",
  );
}

// Helper function to generate unique IDs
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// CREATE STORAGE BUCKETS ON STARTUP
// ============================================

async function initializeStorage() {
  try {
    // Create buckets if they don't exist
    const { data: buckets } =
      await supabase.storage.listBuckets();

    const audioBucketExists = buckets?.some(
      (bucket) => bucket.name === "make-fe24c337-audio",
    );
    if (!audioBucketExists) {
      await supabase.storage.createBucket(
        "make-fe24c337-audio",
        {
          public: false,
          fileSizeLimit: 52428800, // 50MB
        },
      );
      console.log("Created audio storage bucket");
    }

    const imageBucketExists = buckets?.some(
      (bucket) => bucket.name === "make-fe24c337-images",
    );
    if (!imageBucketExists) {
      await supabase.storage.createBucket(
        "make-fe24c337-images",
        {
          public: false,
          fileSizeLimit: 5242880, // 5MB
        },
      );
      console.log("Created image storage bucket");
    }

    // Create public bucket for email assets (logo, etc.)
    const emailAssetsBucketExists = buckets?.some(
      (bucket) => bucket.name === "make-fe24c337-email-assets",
    );
    if (!emailAssetsBucketExists) {
      await supabase.storage.createBucket(
        "make-fe24c337-email-assets",
        {
          public: true, // Public bucket for email assets
          fileSizeLimit: 2097152, // 2MB
        },
      );
      console.log("Created email assets storage bucket");
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
}

// Initialize storage on server start
initializeStorage();

// ============================================
// INITIALIZE DEFAULT DATA
// ============================================

async function initializeDefaultData() {
  try {
    // Check if data already exists
    const existingBeats = await kv.getByPrefix("beat:");
    const existingServices = await kv.getByPrefix("service:");

    // Add default beats if none exist
    if (!existingBeats || existingBeats.length === 0) {
      console.log("Initializing default beats...");
      for (const beat of defaultBeats) {
        const id = generateId();
        await kv.set(`beat:${id}`, {
          id,
          ...beat,
          listenCount: 0,
          createdAt: new Date().toISOString(),
        });
      }
      console.log("✅ Default beats initialized");
    }

    // Add default services if none exist
    if (!existingServices || existingServices.length === 0) {
      console.log("Initializing default services...");
      for (const service of defaultServices) {
        const id = generateId();
        await kv.set(`service:${id}`, {
          id,
          ...service,
          createdAt: new Date().toISOString(),
        });
      }
      console.log("✅ Default services initialized");
    }

    console.log("✅ Default data initialization complete");
  } catch (error) {
    console.error("❌ Error initializing default data:", error);
  }
}

// Initialize data on server start and wait for it
await initializeDefaultData();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

app.post("/make-server-fe24c337/admin-login", async (c) => {
  try {
    const { password } = await c.req.json();

    if (password === ADMIN_PASSWORD) {
      return c.json({ success: true });
    }

    return c.json(
      { success: false, message: "Invalid password" },
      401,
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// ============================================
// BEATS & REMIXES ENDPOINTS
// ============================================

// Get all beats
app.get("/make-server-fe24c337/beats", async (c) => {
  try {
    const beats = await kv.getByPrefix("beat:");

    // Sort beats by listen count (descending) and then by creation date (newest first)
    const sortedBeats = (beats || []).sort((a, b) => {
      // First, sort by listen count
      const listenCountA = a.listenCount || 0;
      const listenCountB = b.listenCount || 0;

      if (listenCountB !== listenCountA) {
        return listenCountB - listenCountA;
      }

      // If listen counts are equal, sort by creation date (newest first)
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return c.json({ beats: sortedBeats });
  } catch (error) {
    console.error("Error fetching beats:", error);
    return c.json({ error: "Failed to fetch beats" }, 500);
  }
});

// Add new beat
app.post("/make-server-fe24c337/beats", async (c) => {
  try {
    const beatData = await c.req.json();
    const id = generateId();
    const beat = {
      id,
      ...beatData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`beat:${id}`, beat);
    return c.json({ success: true, beat });
  } catch (error) {
    console.error("Error adding beat:", error);
    return c.json({ error: "Failed to add beat" }, 500);
  }
});

// Delete beat
app.delete("/make-server-fe24c337/beats/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`beat:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting beat:", error);
    return c.json({ error: "Failed to delete beat" }, 500);
  }
});

// Update beat
app.put("/make-server-fe24c337/beats/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const beatData = await c.req.json();
    
    // Get existing beat to preserve certain fields like createdAt and listenCount
    const existingBeat = await kv.get(`beat:${id}`);
    
    const updatedBeat = {
      ...existingBeat,
      ...beatData,
      id, // Ensure ID doesn't change
      createdAt: existingBeat?.createdAt || new Date().toISOString(),
      listenCount: existingBeat?.listenCount || 0,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`beat:${id}`, updatedBeat);
    return c.json({ success: true, beat: updatedBeat });
  } catch (error) {
    console.error("Error updating beat:", error);
    return c.json({ error: "Failed to update beat" }, 500);
  }
});

// Track listen count
app.post("/make-server-fe24c337/track-listen", async (c) => {
  try {
    const { beatId } = await c.req.json();

    // Get current beat data
    const beat = await kv.get(`beat:${beatId}`);

    if (beat) {
      // Increment listen count
      const updatedBeat = {
        ...beat,
        listenCount: (beat.listenCount || 0) + 1,
      };

      await kv.set(`beat:${beatId}`, updatedBeat);
      console.log(
        `🎵 Listen tracked for "${beat.title}" - Total listens: ${updatedBeat.listenCount}`,
      );

      return c.json({
        success: true,
        listenCount: updatedBeat.listenCount,
      });
    }

    return c.json({ error: "Beat not found" }, 404);
  } catch (error) {
    console.error("Error tracking listen:", error);
    return c.json({ error: "Failed to track listen" }, 500);
  }
});

// ============================================
// DOWNLOAD TRACKING & EMAIL COLLECTION
// ============================================

app.post("/make-server-fe24c337/download-beat", async (c) => {
  try {
    const { email, beatId, beatTitle, platform } =
      await c.req.json();

    // Store email in music mailing list
    const emailData = {
      email,
      type: "music",
      platform,
      beatId,
      beatTitle,
      subscribedAt: new Date().toISOString(),
    };

    await kv.set(`email:music:${email}`, emailData);

    // Send automatic thank you email
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");

      if (resendApiKey) {
        const emailResponse = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "shhmaart <onboarding@resend.dev>", // Change to your domain email after verification
              to: [email],
              subject: `Thank You for Downloading \"${beatTitle}\"! 🎵`,
              html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
                    .logo { text-align: center; padding: 20px 0; }
                    .logo img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #000; }
                    .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    .social-links { margin: 20px 0; }
                    .social-links a { margin: 0 10px; color: #000; text-decoration: none; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="logo">
                      <img src="https://via.placeholder.com/120/000000/FFFFFF/?text=shhmaart" alt="shhmaart Logo" />
                    </div>
                    <div class="header">
                      <h1>🎵 Thank You!</h1>
                    </div>
                    <div class="content">
                      <h2>Hi there! 👋</h2>
                      <p>Thank you so much for downloading <strong>"${beatTitle}"</strong>!</p>
                      <p>I'm thrilled that you're enjoying my music. Your support means the world to me and helps me continue creating amazing beats and remixes.</p>
                      
                      <h3>Stay Connected:</h3>
                      <div class="social-links">
                        <p>Follow me on social media for new releases and exclusive content:</p>
                        <a href="https://www.youtube.com/@shhmaart" target="_blank">🔴 YouTube</a>
                        <a href="https://open.spotify.com/artist/6nIsLjLEDuhdbJjpWGhQvn" target="_blank">🟢 Spotify</a>
                        <a href="https://www.tiktok.com/@shhmaart" target="_blank">⚫ TikTok</a>
                        <a href="https://www.instagram.com/shhmaart" target="_blank">📷 Instagram</a>
                      </div>
                      
                      <h3>Support My Work:</h3>
                      <p>If you'd like to support my music production, consider:</p>
                      <ul>
                        <li>☕ <a href="https://buymeacoffee.com/shhmaart">Buy Me a Coffee</a></li>
                        <li>💰 <a href="https://www.paypal.com/ncp/payment/ZF7ELGJA69UGW">PayPal Donation</a></li>
                        <li>📱 M-Pesa: 0701396160</li>
                      </ul>
                      
                      <p>You'll receive email updates about new releases, but you can unsubscribe anytime.</p>
                      
                      <p>Keep vibing! 🎶</p>
                      <p><strong>- shhmaart</strong><br>Music & Digital Solutions</p>
                    </div>
                    <div class="footer">
                      <p>© 2026 shhmaart. All rights reserved.</p>
                      <p><a href="#">Unsubscribe</a> from these emails</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
            }),
          },
        );

        if (emailResponse.ok) {
          console.log(
            `✅ Thank you email sent to ${email} for "${beatTitle}"`,
          );
        } else {
          const error = await emailResponse.text();
          console.error(`❌ Failed to send email: ${error}`);
        }
      } else {
        console.log(
          "⚠️ RESEND_API_KEY not set - email not sent",
        );
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the download if email fails
    }

    return c.json({
      success: true,
      message:
        "Download authorized. Check your email for updates!",
    });
  } catch (error) {
    console.error("Error processing download:", error);
    return c.json({ error: "Failed to process download" }, 500);
  }
});

// ============================================
// SERVICES ENDPOINTS
// ============================================

// Get all services
app.get("/make-server-fe24c337/services", async (c) => {
  try {
    const services = await kv.getByPrefix("service:");
    return c.json({ services: services || [] });
  } catch (error) {
    console.error("Error fetching services:", error);
    return c.json({ error: "Failed to fetch services" }, 500);
  }
});

// Add new service
app.post("/make-server-fe24c337/services", async (c) => {
  try {
    const serviceData = await c.req.json();
    const id = generateId();
    const service = {
      id,
      ...serviceData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`service:${id}`, service);
    return c.json({ success: true, service });
  } catch (error) {
    console.error("Error adding service:", error);
    return c.json({ error: "Failed to add service" }, 500);
  }
});

// Delete service
app.delete("/make-server-fe24c337/services/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`service:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return c.json({ error: "Failed to delete service" }, 500);
  }
});

// ============================================
// SERVICE BOOKING ENDPOINT
// ============================================

app.post("/make-server-fe24c337/book-service", async (c) => {
  try {
    const bookingData = await c.req.json();
    const id = generateId();

    // Store booking
    const booking = {
      id,
      ...bookingData,
      bookedAt: new Date().toISOString(),
    };

    await kv.set(`booking:${id}`, booking);

    // Store email in marketing mailing list
    const emailData = {
      email: bookingData.email,
      type: "marketing",
      serviceId: bookingData.serviceId,
      serviceName: bookingData.serviceName,
      subscribedAt: new Date().toISOString(),
    };

    await kv.set(
      `email:marketing:${bookingData.email}`,
      emailData,
    );

    // Send automatic booking confirmation email
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");

      if (resendApiKey) {
        const emailResponse = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "shhmaart <onboarding@resend.dev>", // Change to your domain email after verification
              to: [bookingData.email],
              subject: `Service Booking Confirmed: ${bookingData.serviceName} 🎯`,
              html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-left: 4px solid #000; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🎯 Booking Confirmed!</h1>
                    </div>
                    <div class="content">
                      <h2>Hi ${bookingData.name}! 👋</h2>
                      <p>Thank you for booking <strong>"${bookingData.serviceName}"</strong> with shhmaart!</p>
                      
                      <div class="booking-details">
                        <h3>📅 Your Booking Details:</h3>
                        <p><strong>Service:</strong> ${bookingData.serviceName}</p>
                        <p><strong>Name:</strong> ${bookingData.name}</p>
                        <p><strong>Email:</strong> ${bookingData.email}</p>
                        <p><strong>Date:</strong> ${bookingData.date}</p>
                        <p><strong>Time:</strong> ${bookingData.time}</p>
                        ${bookingData.message ? `<p><strong>Message:</strong> ${bookingData.message}</p>` : ""}
                      </div>
                      
                      <h3>What's Next?</h3>
                      <p>I'll review your booking and get back to you within 24 hours to confirm the meeting details and next steps.</p>
                      
                      <h3>Need to Make Changes?</h3>
                      <p>Just reply to this email and let me know!</p>
                      
                      <p>Looking forward to working with you! 💼</p>
                      <p><strong>- shhmaart</strong><br>Music & Digital Solutions</p>
                    </div>
                    <div class="footer">
                      <p>© 2026 shhmaart. All rights reserved.</p>
                      <p><a href="#">Unsubscribe</a> from these emails</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
            }),
          },
        );

        if (emailResponse.ok) {
          console.log(
            `✅ Booking confirmation email sent to ${bookingData.email} for "${bookingData.serviceName}"`,
          );
        } else {
          const error = await emailResponse.text();
          console.error(
            `❌ Failed to send booking email: ${error}`,
          );
        }
      } else {
        console.log(
          "⚠️ RESEND_API_KEY not set - booking email not sent",
        );
      }
    } catch (emailError) {
      console.error("Error sending booking email:", emailError);
      // Don't fail the booking if email fails
    }

    console.log(
      `New booking from ${bookingData.email} for ${bookingData.serviceName}`,
    );
    console.log(
      `Meeting scheduled for ${bookingData.date} at ${bookingData.time}`,
    );

    return c.json({
      success: true,
      message:
        "Booking confirmed! Check your email for details.",
      booking,
    });
  } catch (error) {
    console.error("Error processing booking:", error);
    return c.json({ error: "Failed to process booking" }, 500);
  }
});

// ============================================
// EMAIL LISTS ENDPOINT
// ============================================

app.get("/make-server-fe24c337/emails", async (c) => {
  try {
    const musicEmails = await kv.getByPrefix("email:music:");
    const marketingEmails = await kv.getByPrefix(
      "email:marketing:",
    );

    return c.json({
      musicEmails: musicEmails || [],
      marketingEmails: marketingEmails || [],
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return c.json({ error: "Failed to fetch emails" }, 500);
  }
});

// ============================================
// UNSUBSCRIBE ENDPOINT
// ============================================

app.post("/make-server-fe24c337/unsubscribe", async (c) => {
  try {
    const { email, type } = await c.req.json();

    if (type === "music") {
      await kv.del(`email:music:${email}`);
    } else if (type === "marketing") {
      await kv.del(`email:marketing:${email}`);
    }

    return c.json({
      success: true,
      message: "You have been unsubscribed successfully.",
    });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return c.json({ error: "Failed to unsubscribe" }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/make-server-fe24c337/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// FILE UPLOAD TO STORAGE
// ============================================

app.post("/make-server-fe24c337/upload-file", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Determine bucket based on type
    const bucketName =
      type === "audio"
        ? "make-fe24c337-audio"
        : "make-fe24c337-images";

    // Get file extension
    const fileExtension = file.name.split(".").pop();

    // Create filename using original name with timestamp for uniqueness
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_",
    );
    const fileName = `${timestamp}-${sanitizedName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return c.json(
        { error: "Failed to upload file to storage" },
        500,
      );
    }

    // Create a signed URL that expires in 10 years
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 315360000); // 10 years in seconds

    if (signedUrlError) {
      console.error(
        "Error creating signed URL:",
        signedUrlError,
      );
      return c.json(
        { error: "Failed to create signed URL" },
        500,
      );
    }

    console.log(
      `File uploaded successfully: ${fileName} to ${bucketName}`,
    );

    return c.json({
      success: true,
      url: signedUrlData.signedUrl,
      fileName: fileName,
      bucketName: bucketName,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return c.json({ error: "Failed to upload file" }, 500);
  }
});

// ============================================
// LOGO UPLOAD FOR EMAILS
// ============================================

app.post("/make-server-fe24c337/upload-logo", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Get file extension
    const fileExtension = file.name.split(".").pop();
    const fileName = `email-logo.${fileExtension}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to public email assets bucket
    const { data, error } = await supabase.storage
      .from("make-fe24c337-email-assets")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true, // Replace existing logo
      });

    if (error) {
      console.error("Supabase logo upload error:", error);
      return c.json({ error: "Failed to upload logo" }, 500);
    }

    // Get public URL (no expiration for public bucket)
    const { data: publicUrlData } = supabase.storage
      .from("make-fe24c337-email-assets")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    console.log(`Logo uploaded successfully: ${publicUrl}`);

    // Store logo URL in KV for easy retrieval
    await kv.set("email:logo", publicUrl);

    return c.json({
      success: true,
      publicUrl: publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return c.json({ error: "Failed to upload logo" }, 500);
  }
});

// Set logo URL
app.post("/make-server-fe24c337/set-logo", async (c) => {
  try {
    const { logoUrl } = await c.req.json();
    await kv.set("email:logo", logoUrl);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error setting logo:", error);
    return c.json({ error: "Failed to set logo" }, 500);
  }
});

// Get logo URL
app.get("/make-server-fe24c337/get-logo", async (c) => {
  try {
    const logoUrl = await kv.get("email:logo");
    return c.json({ logoUrl: logoUrl || "" });
  } catch (error) {
    console.error("Error getting logo:", error);
    return c.json({ error: "Failed to get logo" }, 500);
  }
});

// ============================================
// STRIPE PAYMENT INTEGRATION
// ============================================

// Create Stripe Checkout Session
app.post("/make-server-fe24c337/create-checkout", async (c) => {
  try {
    const { beatId, beatTitle, price, email } =
      await c.req.json();
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      return c.json({ error: "Stripe not configured" }, 500);
    }

    // Create Stripe checkout session
    const checkoutResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          mode: "payment",
          customer_email: email,
          success_url: `${c.req.header("origin") || "http://localhost:5173"}?payment=success&beat=${beatId}`,
          cancel_url: `${c.req.header("origin") || "http://localhost:5173"}?payment=cancelled`,
          "line_items[0][price_data][currency]": "usd",
          "line_items[0][price_data][product_data][name]":
            beatTitle,
          "line_items[0][price_data][product_data][description]":
            "Beat License - Instant Download",
          "line_items[0][price_data][unit_amount]": String(
            Math.round(price * 100),
          ), // Convert to cents
          "line_items[0][quantity]": "1",
          "metadata[beatId]": beatId,
          "metadata[beatTitle]": beatTitle,
        }).toString(),
      },
    );

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.text();
      console.error("Stripe checkout error:", error);
      return c.json(
        { error: "Failed to create checkout session" },
        500,
      );
    }

    const session = await checkoutResponse.json();
    console.log(
      `💳 Stripe checkout session created for "${beatTitle}"`,
    );

    return c.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating Stripe checkout:", error);
    return c.json(
      { error: "Failed to create checkout session" },
      500,
    );
  }
});

// Verify Stripe Payment (webhook or manual check)
app.post("/make-server-fe24c337/verify-payment", async (c) => {
  try {
    const { sessionId } = await c.req.json();
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      return c.json({ error: "Stripe not configured" }, 500);
    }

    // Retrieve session from Stripe
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      },
    );

    if (!sessionResponse.ok) {
      return c.json({ error: "Failed to verify payment" }, 500);
    }

    const session = await sessionResponse.json();

    return c.json({
      success: true,
      paid: session.payment_status === "paid",
      customerEmail: session.customer_email,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return c.json({ error: "Failed to verify payment" }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);