import * as jwt from "jsonwebtoken";

const secret = process.env.ADMIN_JWT_SECRET || "test-secret";

const token = jwt.sign(
  {
    id: "manual-test-admin",
    email: "admin@yohpal.com",
    name: "Manual Test Admin",
    role: "SUPER_ADMIN",
  },
  secret,
  { expiresIn: "12h" },
);

console.log(token);