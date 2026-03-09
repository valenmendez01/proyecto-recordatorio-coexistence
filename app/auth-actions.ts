
"use server";

import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  
  redirect("/");
}

export async function logout() {
  
  redirect("/login");
}