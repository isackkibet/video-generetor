import { redirect } from "next/navigation";
export function redirectSuccess(path: string, message: string): never {
  redirect(`${path}?success=${encodeURIComponent(message)}`);
}
export function redirectError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}
