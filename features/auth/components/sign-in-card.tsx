import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { SignInFlow } from "../types";

interface SignInCardProps {
    setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <Card className="w-full h-full p-8 shadow-xl">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-semibold">
                    Login to continue
                </CardTitle>
                <CardDescription>
                    Use your email or another service to continue
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-0 pb-0">
                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="h-10"
                        required
                    />
                    <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        className="h-10"
                        required
                    />
                    <Button type="submit" size="lg" className="w-full h-10">
                        Continue
                    </Button>
                </form>
                <Separator />
                <div className="flex flex-col gap-y-2.5">
                    <Button variant="outline" size="lg" className="w-full h-10 relative">
                        <FcGoogle className="size-5 absolute left-3" />
                        Continue with Google
                    </Button>
                    <Button variant="outline" size="lg" className="w-full h-10 relative">
                        <FaGithub className="size-5 absolute left-3" />
                        Continue with GitHub
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Don't have an account?{" "}
                    <span
                        onClick={() => setState("signUp")}
                        className="text-sky-700 hover:underline cursor-pointer"
                    >
                        Sign up
                    </span>
                </p>
            </CardContent>
        </Card>
    );
};
