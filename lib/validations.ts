import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "至少 3 個字元")
  .max(32, "最多 32 個字元")
  .regex(/^[a-zA-Z0-9_]+$/, "只允許英數字與底線");

const passwordSchema = z
  .string()
  .min(6, "密碼至少 6 個字元")
  .max(72, "密碼最多 72 個字元");

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  cfTurnstileToken: z.string().min(1, "請完成人機驗證"),
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const todoCreateSchema = z.object({
  title: z.string().min(1, "請輸入內容").max(500, "最多 500 字元"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  dueDate: z.string().nullable().optional(),
});

export const todoUpdateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  done: z.boolean().optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TodoCreateInput = z.infer<typeof todoCreateSchema>;
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>;
