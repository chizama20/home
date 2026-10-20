"use client";
import { useState } from "react"
import { SignInFlow } from "../../orgs/types"
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";

export const AuthScreen = () => {
    const [state, setState] = useState<SignInFlow>("signIn");

    return (
        <div className="flex h-full items-center justify-center bg-sidebar px-4 py-8 dark:bg-background">
            <div className="w-full max-w-md">
                {state === "signIn" ? <SignInCard setState={setState} /> : <SignUpCard setState={setState}/>}
            </div>
        </div>
    );
};

