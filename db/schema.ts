import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 32 }).unique().notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 10 }).notNull().default("user"),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Todos ────────────────────────────────────────────────────────────────────
export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  priority: varchar("priority", { length: 10 }).notNull().default("normal"), // low | normal | high
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Login Attempts ────────────────────────────────────────────────────────────
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  ip: varchar("ip", { length: 64 }),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

// ─── Tryon Results ───────────────────────────────────────────────────────────────
export const tryonResults = pgTable("tryon_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  personImgUrl: text("person_img_url").notNull(),
  garmentImgUrl: text("garment_img_url").notNull(),
  resultImgUrl: text("result_img_url").notNull(),
  category: varchar("category", { length: 20 }).notNull(), // upper_body | lower_body | dress
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos),
  tryonResults: many(tryonResults),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, { fields: [todos.userId], references: [users.id] }),
}));

export const tryonResultsRelations = relations(tryonResults, ({ one }) => ({
  user: one(users, { fields: [tryonResults.userId], references: [users.id] }),
}));

// ─── Types ─────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type TryonResult = typeof tryonResults.$inferSelect;
export type NewTryonResult = typeof tryonResults.$inferInsert;
