"use server";

import { createClient } from "@/lib/supabase/server";

export async function signup(username: string, password: string) {
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
                message:
                    "An unexpected error occurred during login. Please try again later.",
            };
        }

        return {
            ok: true,
            message: "User signed up successfully",
        };
    } catch (error) {
        console.error("Unexpected error signing up:", error);
        return {
            ok: false,
            message:
                "An unexpected error occurred during login. Please try again later.",
        };
    }
}

export async function login(username: string, password: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email: username.trim().toLowerCase() + "@gmail.com",
            password: password.trim(),
        });

        if (error) {
            console.error("Error logging in:", error);
            return {
                ok: false,
                message:
                    "An unexpected error occurred during login. Please try again later.",
            };
        }
        return {
            ok: true,
            message: "User logged in successfully",
        };
    } catch (error) {
        console.error("Unexpected error logging in:", error);
        return {
            ok: false,
            message:
                "An unexpected error occurred during login. Please try again later.",
        };
    }
}
