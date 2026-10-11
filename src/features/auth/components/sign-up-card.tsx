import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { CheckIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";

import { cn } from "@/lib/utils";
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
import {
    meetsPasswordRequirements,
    passwordRequirements,
} from "../../../../convex/passwordRequirements";

interface SignUpCardProps {
    setState: (state: SignInFlow) => void;
}

export const SignUpCard = ({ setState }: SignUpCardProps) => {
    const { signIn } = useAuthActions();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    const passwordsMatch = password === confirmPassword;

    const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!firstName.trim() || !lastName.trim()) {
            setError("Please enter your first and last name");
            return;
        }

        if (!meetsPasswordRequirements(password)) {
            setError("Password does not meet the requirements");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }

        setPending(true);
        signIn("password", {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email,
            password,
            flow: "signUp",
        })
            .then(() => router.replace("/"))
            .catch((err) => {
                setError(
                    err instanceof ConvexError
                        ? String(err.data)
                        : "Could not create account. This email may already be in use."
                );
            })
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
                    Sign up to continue
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
                <form className="space-y-3" onSubmit={onPasswordSignUp}>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            disabled={pending}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First name"
                            autoComplete="given-name"
                            maxLength={50}
                            className="h-10"
                            required
                        />
                        <Input
                            disabled={pending}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                            autoComplete="family-name"
                            maxLength={50}
                            className="h-10"
                            required
                        />
                    </div>
                    <Input
                        disabled={pending}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="h-10"
                        required
                    />
                    <Input
                        disabled={pending}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        className="h-10"
                        required
                    />
                    <ul className="space-y-1 text-xs">
                        {passwordRequirements.map((requirement) => {
                            const met = requirement.test(password);
                            return (
                                <li
                                    key={requirement.label}
                                    className={cn(
                                        "flex items-center gap-x-1.5 transition-colors",
                                        met ? "text-success" : "text-muted-foreground"
                                    )}
                                >
                                    {met ? <CheckIcon className="size-3.5" /> : <XIcon className="size-3.5" />}
                                    {requirement.label}
                                </li>
                            );
                        })}
                    </ul>
                    <Input
                        disabled={pending}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        type="password"
                        className="h-10"
                        aria-invalid={!!confirmPassword && !passwordsMatch}
                        required
                    />
                    {!!confirmPassword && !passwordsMatch && (
                        <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                    <Button type="submit" size="lg" className="w-full h-10" disabled={pending}>
                        Continue
                    </Button>
                </form>
                <Separator />
                <div className="flex flex-col gap-y-2.5">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-10 relative"
                        disabled={pending}
                        onClick={() => onProviderSignIn("google")}
                    >
                        <FcGoogle className="size-5 absolute left-3" />
                        Continue with Google
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <span
                        onClick={() => setState("signIn")}
                        className="text-primary hover:underline cursor-pointer"
                    >
                        Sign in
                    </span>
                </p>
            </CardContent>
        </Card>
    );
};
