import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
console.log("URL:", process.env.SUPABASE_URL);
console.log("SERVICE ROLE:", process.env.SUPABASE_SERVICE_ROLE ? "Loaded" : "NOT LOADED");

const app = express();
app.use(
  cors({
    origin: [
      "https://s3-cloud-2.onrender.com",  // your deployed frontend
      "http://localhost:5500",            // local testing
      "http://localhost:3000"             // optional
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);
app.get("/", (req, res) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
  res.send("Cloud File Upload Backend Running ✔");
});
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    const fileName = Date.now() + "-" + file.originalname;

    const { data, error } = await supabase.storage
      .from("files")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/files/${fileName}`;

    res.json({ success: true, url: publicUrl });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.listen(8080, () => console.log("Server running on 8080"));
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});