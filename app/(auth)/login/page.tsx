"use client";

import signup from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";

const SignUpPage = () => {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        const res = await signup(username, password);
        if (res.ok) {
            toast.success(res.message);
            router.push("/home");
        } else {
            toast.error(res.message);
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="w-[30rem] h-[20rem] border shadow-sm flex flex-col gap-4 rounded-2xl p-4">
                <section>
                    <h1> 
                        Sign Up
                    </h1>
                </section>
                {/* username section  */}
                <section>
                    <Label htmlFor="username" className="mb-2">Username</Label>
                    <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </section>

                {/* password section  */}
                <section>
                    <Label htmlFor="password" className="mb-2">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </section>
                <Button
                    onClick={handleSignup}
                >Sign Up</Button>
            </div>
        </div>
    );
};

export default SignUpPage;
