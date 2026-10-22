import { afterAll, describe, it, expect, mock } from "bun:test";
import * as realDb from "@/lib/supabase/server";
import { awardXp } from "./actions";

// mock.module is global in Bun: without this, every test file that runs after this one
// gets the fake database too (that broke 6 "without Supabase" tests). Put the real one back.
const realDbCopy = { ...realDb };
afterAll(() => {
  mock.module("@/lib/supabase/server", () => realDbCopy);
});

mock.module("@/lib/supabase/server", () => {
  const events = new Map();
  const profiles = new Map([
    ["user-123", { xp: 100, streak: 2, last_active_date: "2026-10-21" }]
  ]);

  return {
    getDb: async () => ({
      from: (table: string) => ({
        select: (columns: string) => ({
          eq: (field: string, val: any) => ({
            eq: (field2: string, val2: any) => ({
              single: async () => {
                if (table === "xp_events") {
                  return { data: events.get(val2) || null };
                }
                return { data: null };
              },
            }),
            single: async () => {
              if (table === "profiles") {
                return { data: profiles.get(val) || { xp: 100, streak: 2, last_active_date: "2026-10-21" } };
              }
              return { data: null };
            },
          }),
        }),
        insert: async (data: any) => {
          if (table === "xp_events" && data.idempotency_key) {
            events.set(data.idempotency_key, data);
          }
          return { error: null };
        },
        update: (data: any) => ({
          eq: async (field: string, val: any) => {
            if (table === "profiles" && profiles.has(val)) {
              const current = profiles.get(val);
              profiles.set(val, { ...current, ...data });
            }
            return { error: null };
          },
        }),
      }),
    }),
  };
});

describe("awardXp Action & Idempotency (F2)", () => {
  it("should prevent duplicate XP award when same idempotencyKey is used", async () => {
    const userId = "user-123";
    const key = "event-key-999";

    // Эхний удаад XP амжилттай өгнө
    const res1 = await awardXp(userId, 50, "Test Quest", key);
    expect(res1.success).toBe(true);

    // Хоёр дахь удаад ижил key-г явуулахад duplicate: true буцааж давхар тоолохгүй байхыг шалгана
    const res2 = await awardXp(userId, 50, "Test Quest", key);
    expect(res2.success).toBe(true);
    expect(res2.duplicate).toBe(true);
  });
});