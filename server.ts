import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false
      }
    })
  : null;

if (supabase) {
  console.log("=========================================");
  console.log("⚡ Supabase Client initialized successfully!");
  console.log(`URL: ${SUPABASE_URL}`);
  console.log("=========================================");
} else {
  console.log("=========================================");
  console.log("⚠️ Supabase credentials not found.");
  console.log("Falling back to local db.json storage.");
  console.log("Add SUPABASE_URL and SUPABASE_ANON_KEY to .env to connect to Supabase.");
  console.log("=========================================");
}

// Table presence flags to gracefully bypass missing Supabase tables and prevent noisy logs
let isLeadsTableMissing = false;
let isReviewsTableMissing = false;
let isContactsTableMissing = false;

interface Review {
  id: string;
  author: string;
  rating: number;
  timeAgo: string;
  text: string;
  avatarUrl?: string;
  category: "panel" | "solar" | "breaker" | "ceiling_fan" | "general";
  tags: string[];
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceNeeded: string;
  scopeSize: string;
  details: string;
  status: "pending" | "dispatched" | "completed";
  submittedAt: string;
  estimatedPrice: string;
  preferredTime: string;
  photoUrl?: string;
}

interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  submittedAt: string;
}

interface DBStructure {
  leads: Lead[];
  reviews: Review[];
  contacts?: ContactMessage[];
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "1",
    author: "Sophie Copeland",
    rating: 5,
    timeAgo: "4 months ago",
    text: "I highly recommend Phoenix Best Electricians! They provided quick and expert service when updating our electrical panel. Tracy was very knowledgeable, answered all of our questions, and took time to explain everything clearly. The pricing was fair and transparent.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    category: "panel",
    tags: ["Panel Upgrade", "Skilled", "Tracy"]
  },
  {
    id: "2",
    author: "Shirley A",
    rating: 5,
    timeAgo: "4 months ago",
    text: "I’m really happy I chose to have my solar panels installed by this electrical company in Phoenix. I had about six different electricians come out for consultations, and in the end, the solar panel options they offered just made the most sense and the savings have been incredible!",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    category: "solar",
    tags: ["Solar Panels", "Consultation", "Energy Savings"]
  },
  {
    id: "3",
    author: "Tracey Conner",
    rating: 5,
    timeAgo: "6 months ago",
    text: "I recently had an issue where one of my electrical breakers tripped and wouldn’t reset. After searching for electricians nearby, I found a company with great reviews and decided to give them a call. I was able to talk to someone right away and they dispatched Tracy within the hour. Outstanding service!",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    category: "breaker",
    tags: ["Breaker", "Emergency Dispatch", "Tracy"]
  },
  {
    id: "4",
    author: "Marcus Vance",
    rating: 5,
    timeAgo: "2 months ago",
    text: "Needed 14 smart switches and dimmers installed across our home in Phoenix. Tracy did a spectacular job setting them up, grouping them, and ensuring everything met safety standards. Clean workspace and extremely skilled.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    category: "ceiling_fan",
    tags: ["Switches", "Smart Home", "Skilled"]
  },
  {
    id: "5",
    author: "Elena Rojas",
    rating: 5,
    timeAgo: "1 month ago",
    text: "Phoenix heat is brutal, so when our primary living room ceiling fan stopped working, we needed a replacement immediately. Called Phoenix Best Electricians and they came out the same afternoon. Installed a gorgeous new fan and checked our panel, too.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    category: "ceiling_fan",
    tags: ["Ceiling Fans", "Same-Day Service"]
  },
  {
    id: "6",
    author: "David K.",
    rating: 5,
    timeAgo: "5 months ago",
    text: "Excellent condo work. Did a full electrical update for my unit in Midtown. They understood our complex building codes and completed everything on time with zero issues from the HOA. Pricing was very reasonable.",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    category: "general",
    tags: ["Condo Work", "HOA Compliant"]
  }
];

const INITIAL_LEADS: Lead[] = [
  {
    id: "PBE-924103",
    name: "Sophie Copeland",
    phone: "(602) 780-1140",
    email: "sophie.copeland@example.com",
    serviceNeeded: "Electrical Panel Upgrade",
    scopeSize: "Standard 100A to 200A main service",
    details: "Needs old Zinsco panel replaced before house sale closing next month.",
    status: "completed",
    submittedAt: "Yesterday, 4:15 PM",
    estimatedPrice: "$1,800 - $2,400",
    preferredTime: "Flexible"
  },
  {
    id: "PBE-481029",
    name: "Tracey Conner",
    phone: "(602) 555-0192",
    email: "tconner@example.net",
    serviceNeeded: "Breaker Repair & Troubleshooting",
    scopeSize: "Single circuit breaker trips continuously",
    details: "Main bedroom breaker keeps clicking off. Unable to reset.",
    status: "completed",
    submittedAt: "2 days ago",
    estimatedPrice: "$150 - $280",
    preferredTime: "Same Day Emergency"
  },
  {
    id: "PBE-749104",
    name: "Marcus Vance",
    phone: "(602) 555-2244",
    email: "marcus@vancecreative.com",
    serviceNeeded: "Smart Switches & Outlets",
    scopeSize: "Install smart dimmers / custom Lutron switches",
    details: "Wants 14 dimmers installed in high-ceiling kitchen and dining room.",
    status: "dispatched",
    submittedAt: "Today, 10:30 AM",
    estimatedPrice: "$90 - $160",
    preferredTime: "Tomorrow Morning"
  }
];

// Read database
function getDB(): DBStructure {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { leads: INITIAL_LEADS, reviews: INITIAL_REVIEWS, contacts: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.contacts) parsed.contacts = [];
    return parsed;
  } catch (e) {
    console.error("Error reading db.json, recreating with initial datasets:", e);
    const initial = { leads: INITIAL_LEADS, reviews: INITIAL_REVIEWS, contacts: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}

// Save database
function saveDB(db: DBStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("Error saving db.json:", e);
  }
}

// Middlewares
app.use(express.json());

// --- Supabase Seeding Helper ---
async function seedSupabaseIfNeeded() {
  if (!supabase) return;
  try {
    // 1. Seed Leads
    const { data: existingLeads, error: leadsError } = await supabase
      .from("leads")
      .select("id")
      .limit(1);

    if (leadsError) {
      if (leadsError.message.includes("Could not find the table")) {
        isLeadsTableMissing = true;
        console.log("Supabase 'leads' table is missing from schema cache. Graceful local fallback active.");
      } else {
        console.log("Supabase 'leads' table check returned error:", leadsError.message);
      }
    } else {
      isLeadsTableMissing = false;
      if (!existingLeads || existingLeads.length === 0) {
        console.log("Supabase 'leads' table is empty. Seeding initial leads...");
        const { error: insertLeadsError } = await supabase
          .from("leads")
          .insert(INITIAL_LEADS);
        if (insertLeadsError) {
          console.log("Failed to seed initial leads in Supabase:", insertLeadsError.message);
        } else {
          console.log("Initial leads successfully seeded in Supabase!");
        }
      }
    }

    // 2. Seed Reviews
    const { data: existingReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id")
      .limit(1);

    if (reviewsError) {
      if (reviewsError.message.includes("Could not find the table")) {
        isReviewsTableMissing = true;
        console.log("Supabase 'reviews' table is missing from schema cache. Graceful local fallback active.");
      } else {
        console.log("Supabase 'reviews' table check returned error:", reviewsError.message);
      }
    } else {
      isReviewsTableMissing = false;
      if (!existingReviews || existingReviews.length === 0) {
        console.log("Supabase 'reviews' table is empty. Seeding initial reviews...");
        const { error: insertReviewsError } = await supabase
          .from("reviews")
          .insert(INITIAL_REVIEWS);
        if (insertReviewsError) {
          console.log("Failed to seed initial reviews in Supabase:", insertReviewsError.message);
        } else {
          console.log("Initial reviews successfully seeded in Supabase!");
        }
      }
    }

    // 3. Check Contacts
    const { error: contactsError } = await supabase
      .from("contacts")
      .select("id")
      .limit(1);

    if (contactsError) {
      if (contactsError.message.includes("Could not find the table")) {
        isContactsTableMissing = true;
        console.log("Supabase 'contacts' table is missing from schema cache. Graceful local fallback active.");
      } else {
        console.log("Supabase 'contacts' table check returned error:", contactsError.message);
      }
    } else {
      isContactsTableMissing = false;
    }
  } catch (err) {
    console.log("Unexpected error during Supabase schema discovery:", err);
  }
}

// --- API Endpoints ---

// Get all leads
app.get("/api/leads", async (req, res) => {
  if (supabase && !isLeadsTableMissing) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("submittedAt", { ascending: false });

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isLeadsTableMissing = true;
          console.log("Supabase 'leads' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase select leads info:", error.message);
        }
      } else {
        return res.json(data || []);
      }
    } catch (e) {
      console.log("Supabase select leads exception:", e);
    }
  }
  const db = getDB();
  res.json(db.leads);
});

// Create a new lead
app.post("/api/leads", async (req, res) => {
  const { name, phone, email, serviceNeeded, scopeSize, details, estimatedPrice, preferredTime, photoUrl } = req.body;
  
  if (!name || !phone || !email) {
    return res.status(400).json({ error: "Name, phone, and email are required fields." });
  }

  const newLead: Lead = {
    id: "PBE-" + Math.floor(100000 + Math.random() * 900000),
    name,
    phone,
    email,
    serviceNeeded: serviceNeeded || "General Consultation",
    scopeSize: scopeSize || "Custom Scope",
    details: details || "No additional details provided",
    status: "pending",
    submittedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) + " " + new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    estimatedPrice: estimatedPrice || "Custom Quote",
    preferredTime: preferredTime || "Flexible",
    photoUrl: photoUrl || ""
  };

  if (supabase && !isLeadsTableMissing) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([newLead])
        .select()
        .single();

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isLeadsTableMissing = true;
          console.log("Supabase 'leads' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase insert lead info:", error.message);
        }
      } else {
        return res.status(201).json(data);
      }
    } catch (e) {
      console.log("Supabase insert lead exception:", e);
    }
  }

  const db = getDB();
  db.leads.unshift(newLead);
  saveDB(db);
  res.status(201).json(newLead);
});

// Update lead status
app.patch("/api/leads/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "dispatched", "completed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  if (supabase && !isLeadsTableMissing) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isLeadsTableMissing = true;
          console.log("Supabase 'leads' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase update lead status info:", error.message);
        }
      } else {
        return res.json(data);
      }
    } catch (e) {
      console.log("Supabase update lead status exception:", e);
    }
  }

  const db = getDB();
  const leadIndex = db.leads.findIndex((l) => l.id === id);

  if (leadIndex === -1) {
    return res.status(404).json({ error: "Lead not found." });
  }

  db.leads[leadIndex].status = status;
  saveDB(db);
  res.json(db.leads[leadIndex]);
});

// Delete a lead
app.delete("/api/leads/:id", async (req, res) => {
  const { id } = req.params;

  if (supabase && !isLeadsTableMissing) {
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isLeadsTableMissing = true;
          console.log("Supabase 'leads' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase delete lead info:", error.message);
        }
      } else {
        return res.json({ success: true, message: "Lead successfully deleted from Supabase." });
      }
    } catch (e) {
      console.log("Supabase delete lead exception:", e);
    }
  }

  const db = getDB();
  const updatedLeads = db.leads.filter((l) => l.id !== id);

  if (db.leads.length === updatedLeads.length) {
    return res.status(404).json({ error: "Lead not found." });
  }

  db.leads = updatedLeads;
  saveDB(db);
  res.json({ success: true, message: "Lead successfully deleted." });
});

// Purge all leads / Reset
app.post("/api/leads/purge", async (req, res) => {
  if (supabase && !isLeadsTableMissing) {
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .neq("id", "");

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isLeadsTableMissing = true;
          console.log("Supabase 'leads' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase purge leads info:", error.message);
        }
      } else {
        return res.json({ success: true, message: "All leads successfully purged from Supabase." });
      }
    } catch (e) {
      console.log("Supabase purge leads exception:", e);
    }
  }

  const db = getDB();
  db.leads = [];
  saveDB(db);
  res.json({ success: true, message: "All leads successfully purged." });
});

// Reset leads back to original seed leads
app.post("/api/leads/reset", async (req, res) => {
  if (supabase && !isLeadsTableMissing) {
    try {
      // Delete existing
      await supabase.from("leads").delete().neq("id", "");
      // Re-insert
      const { data, error } = await supabase
        .from("leads")
        .insert(INITIAL_LEADS)
        .select();

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isLeadsTableMissing = true;
          console.log("Supabase 'leads' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase reset leads info:", error.message);
        }
      } else {
        return res.json(data || []);
      }
    } catch (e) {
      console.log("Supabase reset leads exception:", e);
    }
  }

  const db = getDB();
  db.leads = [...INITIAL_LEADS];
  saveDB(db);
  res.json(db.leads);
});

// Get all reviews
app.get("/api/reviews", async (req, res) => {
  if (supabase && !isReviewsTableMissing) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("approved", true)
        .order("id", { ascending: false });

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isReviewsTableMissing = true;
          console.log("Supabase 'reviews' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase select reviews info:", error.message);
        }
      } else {
        const mapped = (data || []).map((row: any) => ({
          id: String(row.id),
          author: row.name || row.customer_name || 'Anonymous',
          rating: row.rating,
          timeAgo: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now',
          text: row.review || row.text || '',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.name || row.customer_name || 'Anonymous')}`,
          category: row.service || 'general',
          tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? row.tags.split(',') : ['Verified Customer'])
        }));
        return res.json(mapped);
      }
    } catch (e) {
      console.log("Supabase select reviews exception:", e);
    }
  }
  const db = getDB();
  res.json(db.reviews);
});

// Create a review
app.post("/api/reviews", async (req, res) => {
  const { name, service, rating, review, tags, author, text, skipSupabase } = req.body;
  const authorVal = name || author;
  const reviewVal = review || text;
  const ratingVal = typeof rating === "number" ? rating : 5;
  const serviceVal = service || "general";
  const tagsVal = Array.isArray(tags) ? tags : [];

  if (!authorVal || !reviewVal) {
    return res.status(400).json({ error: "Author name and review comments are required fields." });
  }

  if (supabase && !isReviewsTableMissing && !skipSupabase) {
    try {
      // Try to insert with exact mapped fields first
      let insertResult = await supabase
        .from("reviews")
        .insert([{
          name: authorVal.trim(),
          service: serviceVal,
          rating: ratingVal,
          review: reviewVal.trim(),
          tags: tagsVal,
          approved: false
        }])
        .select()
        .single();

      let data = insertResult.data;
      let error = insertResult.error;

      if (error && (error.message.includes('column') || error.message.includes('does not exist'))) {
        console.warn("New schema columns missing on server insert, trying legacy columns fallback.");
        const fallbackResult = await supabase
          .from("reviews")
          .insert([{
            customer_name: authorVal.trim(),
            rating: ratingVal,
            review: reviewVal.trim(),
            approved: false
          }])
          .select()
          .single();
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isReviewsTableMissing = true;
          console.log("Supabase 'reviews' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase insert review info:", error.message);
        }
      } else {
        const mapped = {
          id: String(data.id),
          author: data.name || data.customer_name || 'Anonymous',
          rating: data.rating,
          timeAgo: 'Just now',
          text: data.review || data.text || '',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || data.customer_name || 'Anonymous')}`,
          category: data.service || 'general',
          tags: Array.isArray(data.tags) ? data.tags : ['Verified Customer']
        };
        return res.status(201).json(mapped);
      }
    } catch (e) {
      console.log("Supabase insert review exception:", e);
    }
  }

  const newReview: Review = {
    id: "REV-" + Math.floor(1000 + Math.random() * 9000),
    author: authorVal,
    rating: ratingVal,
    timeAgo: "Just now",
    text: reviewVal,
    category: serviceVal,
    tags: tagsVal.length > 0 ? tagsVal : ["Verified", "Tracy"],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorVal)}`
  };

  const db = getDB();
  db.reviews.unshift(newReview);
  saveDB(db);
  res.status(201).json(newReview);
});

// Delete a review
app.delete("/api/reviews/:id", async (req, res) => {
  const { id } = req.params;

  if (supabase && !isReviewsTableMissing) {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isReviewsTableMissing = true;
          console.log("Supabase 'reviews' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase delete review info:", error.message);
        }
      } else {
        return res.json({ success: true, message: "Review successfully deleted from Supabase." });
      }
    } catch (e) {
      console.log("Supabase delete review exception:", e);
    }
  }

  const db = getDB();
  const updatedReviews = db.reviews.filter((r) => r.id !== id);

  if (db.reviews.length === updatedReviews.length) {
    return res.status(404).json({ error: "Review not found." });
  }

  db.reviews = updatedReviews;
  saveDB(db);
  res.json({ success: true, message: "Review successfully deleted." });
});

// --- Contacts API Endpoints ---

// Get all contacts
app.get("/api/contacts", async (req, res) => {
  if (supabase && !isContactsTableMissing) {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isContactsTableMissing = true;
          console.log("Supabase 'contacts' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase select contacts info:", error.message);
        }
      } else {
        const mapped = (data || []).map((c: any) => ({
          id: 'CON-' + c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || 'No phone provided',
          message: c.message,
          submittedAt: c.created_at ? new Date(c.created_at).toLocaleString() : 'Just now'
        }));
        return res.json(mapped);
      }
    } catch (e) {
      console.log("Supabase select contacts exception:", e);
    }
  }
  const db = getDB();
  res.json(db.contacts || []);
});

// Create a new contact message
app.post("/api/contacts", async (req, res) => {
  const { name, email, message, submittedAt, phone, skipSupabase } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required fields." });
  }

  const phoneValue = phone ? phone.trim() : null;

  const newContact: ContactMessage = {
    id: "CON-" + Math.floor(100000 + Math.random() * 900000),
    name: name.trim(),
    email: email.trim(),
    phone: phoneValue || undefined,
    message: message.trim(),
    submittedAt: submittedAt || new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) + " " + new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  if (supabase && !isContactsTableMissing && !skipSupabase) {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .insert([{
          name: name.trim(),
          email: email.trim(),
          phone: phoneValue,
          message: message.trim()
        }])
        .select()
        .single();

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isContactsTableMissing = true;
          console.log("Supabase 'contacts' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase insert contact info:", error.message);
        }
      } else {
        const responseData = {
          id: 'CON-' + data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || 'No phone provided',
          message: data.message,
          submittedAt: data.created_at ? new Date(data.created_at).toLocaleString() : new Date().toLocaleString()
        };
        return res.status(201).json(responseData);
      }
    } catch (e) {
      console.log("Supabase insert contact exception:", e);
    }
  }

  const db = getDB();
  if (!db.contacts) db.contacts = [];
  db.contacts.unshift(newContact);
  saveDB(db);
  res.status(201).json(newContact);
});

// Delete a contact
app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = id.startsWith("CON-") ? id.replace("CON-", "") : id;

  if (supabase && !isContactsTableMissing) {
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", numericId);

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isContactsTableMissing = true;
          console.log("Supabase 'contacts' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase delete contact info:", error.message);
        }
      } else {
        return res.json({ success: true, message: "Contact successfully deleted from Supabase." });
      }
    } catch (e) {
      console.log("Supabase delete contact exception:", e);
    }
  }

  const db = getDB();
  if (!db.contacts) db.contacts = [];
  const updatedContacts = db.contacts.filter((c) => c.id !== id);

  if (db.contacts.length === updatedContacts.length) {
    return res.status(404).json({ error: "Contact message not found." });
  }

  db.contacts = updatedContacts;
  saveDB(db);
  res.json({ success: true, message: "Contact message successfully deleted." });
});

// Purge all contacts
app.post("/api/contacts/purge", async (req, res) => {
  if (supabase && !isContactsTableMissing) {
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .neq("id", 0);

      if (error) {
        if (error.message.includes("Could not find the table")) {
          isContactsTableMissing = true;
          console.log("Supabase 'contacts' table is missing. Falling back to local database.");
        } else {
          console.log("Supabase purge contacts info:", error.message);
        }
      } else {
        return res.json({ success: true, message: "All contacts successfully purged from Supabase." });
      }
    } catch (e) {
      console.log("Supabase purge contacts exception:", e);
    }
  }

  const db = getDB();
  db.contacts = [];
  saveDB(db);
  res.json({ success: true, message: "All contacts successfully purged." });
});


// --- Full-Stack Vite Dev Server / Static Assets handling ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Run seed checking asynchronously so it doesn't block server startup
    if (supabase) {
      await seedSupabaseIfNeeded();
    }
  });
}

startServer();
