import { Hono } from "hono";
import { supabase } from "../config/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { UpdateStatsRequest } from "../types/index.js";
import { HonoVariables, SupabaseUser } from "../types/supabase.js";

const player = new Hono<{ Variables: HonoVariables }>();

player.use("/*", authMiddleware);

player.get("/", async (c) => {
  const user = c.get("user");

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      const { data: newPlayer, error: createError } = await supabase
        .from("players")
        .insert({
          user_id: user.id,
          provider: user.app_metadata.provider || "unknown",
          email: user.email!,
          name:
            user.user_metadata.name ||
            user.user_metadata.full_name ||
            user.email!.split("@")[0],
          picture:
            user.user_metadata.avatar_url || user.user_metadata.picture || "",
        })
        .select()
        .single();

      if (createError) {
        console.error("Create player error:", createError);
        return c.json({ error: "Failed to create player" }, 500);
      }

      return c.json(newPlayer);
    }

    console.error("Get player error:", error);
    return c.json({ error: "Failed to get player data" }, 500);
  }

  return c.json(data);
});

player.post("/stats", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<UpdateStatsRequest>();

  const { data, error } = await supabase
    .from("players")
    .update({
      score: body.score,
      win_streak: body.win_streak,
      wins: body.wins,
      losses: body.losses,
      draws: body.draws,
      total_games: body.total_games,
      last_played: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Update stats error:", error);
    return c.json({ error: "Failed to update stats" }, 500);
  }

  return c.json(data);
});

player.post("/game-history", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const { data: playerData } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!playerData) {
    return c.json({ error: "Player not found" }, 404);
  }

  const { data, error } = await supabase
    .from("game_history")
    .insert({
      player_id: playerData.id,
      result: body.result,
      difficulty: body.difficulty,
      score_change: body.score_change,
    })
    .select()
    .single();

  if (error) {
    console.error("Save game history error:", error);
    return c.json({ error: "Failed to save game history" }, 500);
  }

  return c.json(data);
});

player.get("/game-history", async (c) => {
  const user = c.get("user");
  const limit = parseInt(c.req.query("limit") || "20");

  const { data: playerData } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!playerData) {
    return c.json({ error: "Player not found" }, 404);
  }

  const { data, error } = await supabase
    .from("game_history")
    .select("*")
    .eq("player_id", playerData.id)
    .order("played_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Get game history error:", error);
    return c.json({ error: "Failed to get game history" }, 500);
  }

  return c.json(data);
});

// Reset stats
player.post("/reset", async (c) => {
  const user = c.get("user");

  const { data, error } = await supabase
    .from("players")
    .update({
      score: 0,
      win_streak: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      total_games: 0,
      last_played: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Reset stats error:", error);
    return c.json({ error: "Failed to reset stats" }, 500);
  }

  return c.json(data);
});

export default player;
