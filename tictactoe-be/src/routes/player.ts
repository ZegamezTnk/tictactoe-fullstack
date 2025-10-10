import { Hono } from "hono";
import { supabase } from "../config/supabase";
import type { HonoVariables } from "../types/supabase";

const app = new Hono<{ Variables: HonoVariables }>();

// ✅ Auth middleware
app.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    // ✔ เก็บ user object
    c.set("user", user);
    await next();
  } catch (error) {
    console.error("Auth error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
});

// ✅ Get or create player (ส่ง user object)
async function getOrCreatePlayer(user: any) {
  try {
    const { data: player, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error?.code === "PGRST116") {
      console.log("🆕 Creating new player for:", user.id);

      const { data: newPlayer, error: createError } = await supabase
        .from("players")
        .insert({
          user_id: user.id,
          provider: user.app_metadata?.provider || "unknown",
          email: user.email || null,
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            null,
          picture:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
          score: 0,
          win_streak: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          total_games: 0,
          last_played: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      return newPlayer;
    }

    if (error) throw error;
    return player;
  } catch (error) {
    console.error("❌ getOrCreatePlayer error:", error);
    throw error;
  }
}

// ✅ GET /api/player/stats — ใช้ user จาก middleware
app.get("/stats", async (c) => {
  try {
    const user = c.get("user");
    const player = await getOrCreatePlayer(user);
    return c.json(player);
  } catch (error) {
    console.error("❌ Get stats error:", error);
    return c.json({ error: "Failed to get stats" }, 500);
  }
});

// ✅ POST /api/player/stats — ไม่ต้องส่ง userId
app.post("/stats", async (c) => {
  try {
    const user = c.get("user");
    const { result, difficulty } = await c.req.json();

    if (!result || !difficulty) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const player = await getOrCreatePlayer(user);

    let { score, win_streak, wins, losses, draws } = player;

    if (result === "win") {
      score += 1;
      win_streak += 1;
      wins += 1;
    } else if (result === "lose") {
      score = Math.max(0, score - 1);
      win_streak = 0;
      losses += 1;
    } else if (result === "draw") {
      win_streak = 0;
      draws += 1;
    }

    const { data, error } = await supabase
      .from("players")
      .update({
        score,
        win_streak,
        wins,
        losses,
        draws,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("❌ Update stats error:", error);
    return c.json({ error: "Failed to update stats" }, 500);
  }
});

export default app;
