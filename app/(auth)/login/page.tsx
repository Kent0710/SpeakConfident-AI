"use client";

import {signup, login} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { toast } from "sonner";

const AuthPage = () => {
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        const action = isLogin ? login : signup;
        const res = await action(username, password);
        
        if (res.ok) {
            toast.success(res.message);
            router.push("/home");
        } else {
            toast.error(res.message);
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="w-[30rem] border shadow-sm flex flex-col gap-4 rounded-2xl p-6">
                <section>
                    <h1 className="text-2xl font-bold tracking-tight"> 
                        {isLogin ? "Login" : "Sign Up"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isLogin ? "Enter your credentials to access your account." : "Create a new account to get started."}
                    </p>
                </section>
                
                {/* username section  */}
                <section>
                    <Label htmlFor="username" className="mb-1 block">Username</Label>
                    <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                    />
                </section>

                {/* password section  */}
                <section>
                    <Label htmlFor="password" className="mb-1 block">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                </section>
                
                <Button onClick={handleSubmit} className="w-full mt-2">
                    {isLogin ? "Login" : "Sign Up"}
                </Button>

                <div className="text-center text-sm text-muted-foreground mt-2">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="underline underline-offset-4 hover:text-primary font-medium"
                    >
                        {isLogin ? "Sign up" : "Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
