import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { TriangleAlertIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

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
    const { signIn } = useAuthActions();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setPending(true);

        signIn("password", { email, password, flow: "signIn" })
            .then(() => router.replace("/"))
            .catch(() => setError("Invalid email or password"))
            .finally(() => setPending(false));
    };

    const onProviderSignIn = (provider: "google") => {
        setError("");
        setPending(true);
        signIn(provider)
            .catch(() => setError("Could not sign in with Google"))
            .finally(() => setPending(false));
    };

    return (
        <Card className="w-full h-full p-8 shadow-sm">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-semibold">
                    Login to continue
                </CardTitle>
                <CardDescription>
                    Use your email or another service to continue
                </CardDescription>
            </CardHeader>
            {!!error && (
                <div className="flex items-center gap-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <TriangleAlertIcon className="size-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            <CardContent className="space-y-5 px-0 pb-0">
                <form className="space-y-3" onSubmit={onPasswordSignIn}>
                    <Input
                        disabled={pending}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="h-11"
                        required
                    />
                    <Input
                        disabled={pending}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        className="h-11"
                        required
                    />
                    <Button type="submit" size="lg" className="w-full h-11" disabled={pending}>
                        Continue
                    </Button>
                </form>
                <Separator />
                <div className="flex flex-col gap-y-2.5">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-11 relative"
                        disabled={pending}
                        onClick={() => onProviderSignIn("google")}
                    >
                        <FcGoogle className="size-5 absolute left-3" />
                        Continue with Google
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                        type="button"
                        onClick={() => setState("signUp")}
                        disabled={pending}
                        className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    >
                        Sign up
                    </button>
                </p>
            </CardContent>
        </Card>
    );
};
