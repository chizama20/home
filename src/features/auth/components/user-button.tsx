"use client";

import { useRouter } from "next/navigation";
import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";

export const UserButton = () => {
    const { signOut } = useAuthActions();
    const router = useRouter();
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) {
        return <Loader2Icon className="size-4 animate-spin text-muted-foreground" />;
    }

    if (!user) {
        return null;
    }

    const name = user.name ?? [user.firstName, user.lastName].filter(Boolean).join(" ");
    const avatarLetter = (user.firstName || name || user.email || "?")
        .charAt(0)
        .toUpperCase();

    const onSignOut = () => {
        signOut().then(() => router.replace("/auth"));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Avatar className="size-10 hover:opacity-75 transition cursor-pointer">
                    <AvatarImage src={user.image ?? undefined} alt={name} referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {avatarLetter}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end" side="bottom">
                <div className="flex flex-col gap-1 px-1.5 py-1.5">
                    {name && <p className="text-sm font-medium leading-none">{name}</p>}
                    {user.email && (
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>
                    <LogOutIcon className="size-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
