import z from "zod";

export const modEnerNamespaceSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
});
