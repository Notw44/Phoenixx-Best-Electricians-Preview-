import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

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
}

interface DBStructure {
  leads: Lead[];
  reviews: Review[];
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
    const initial = { leads: INITIAL_LEADS, reviews: INITIAL_REVIEWS };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading db.json, recreating with initial datasets:", e);
    const initial = { leads: INITIAL_LEADS, reviews: INITIAL_REVIEWS };
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

// --- API Endpoints ---

// Get all leads
app.get("/api/leads", (req, res) => {
  const db = getDB();
  res.json(db.leads);
});

// Create a new lead
app.post("/api/leads", (req, res) => {
  const { name, phone, email, serviceNeeded, scopeSize, details, estimatedPrice, preferredTime } = req.body;
  
  if (!name || !phone || !email) {
    return res.status(400).json({ error: "Name, phone, and email are required fields." });
  }

  const db = getDB();
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
    preferredTime: preferredTime || "Flexible"
  };

  db.leads.unshift(newLead);
  saveDB(db);

  res.status(201).json(newLead);
});

// Update lead status
app.patch("/api/leads/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "dispatched", "completed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
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
app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
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
app.post("/api/leads/purge", (req, res) => {
  const db = getDB();
  db.leads = [];
  saveDB(db);
  res.json({ success: true, message: "All leads successfully purged." });
});

// Reset leads back to original seed leads
app.post("/api/leads/reset", (req, res) => {
  const db = getDB();
  db.leads = [...INITIAL_LEADS];
  saveDB(db);
  res.json(db.leads);
});

// Get all reviews
app.get("/api/reviews", (req, res) => {
  const db = getDB();
  res.json(db.reviews);
});

// Create a review
app.post("/api/reviews", (req, res) => {
  const { author, rating, text, category, tags } = req.body;

  if (!author || !text) {
    return res.status(400).json({ error: "Author and review text are required fields." });
  }

  const db = getDB();
  const newReview: Review = {
    id: "REV-" + Math.floor(1000 + Math.random() * 9000),
    author,
    rating: typeof rating === "number" ? rating : 5,
    timeAgo: "Just now",
    text,
    category: category || "general",
    tags: Array.isArray(tags) ? tags : ["Verified", "Tracy"],
    avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=150`
  };

  db.reviews.unshift(newReview);
  saveDB(db);

  res.status(201).json(newReview);
});

// Delete a review
app.delete("/api/reviews/:id", (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const updatedReviews = db.reviews.filter((r) => r.id !== id);

  if (db.reviews.length === updatedReviews.length) {
    return res.status(404).json({ error: "Review not found." });
  }

  db.reviews = updatedReviews;
  saveDB(db);

  res.json({ success: true, message: "Review successfully deleted." });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
