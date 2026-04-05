"use server";

import { createClient } from "@/lib/supabase/server";

export default async function signup(username: string, password: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.signUp({
            email: username.trim().toLowerCase() + "@gmail.com",
            password: password.trim(),
        });

        if (error) {
            console.error("Error signing up:", error);
            return {
                ok: false,
                message: error.message,
            }
        }

        return {
            ok: true,
            message: "User signed up successfully",
        }
    } catch (error) {
        console.error("Unexpected error signing up:", error);
        return {
            ok: false,
            message: error.message,
        }
    }
}
