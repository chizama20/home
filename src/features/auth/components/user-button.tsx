"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronsUpDownIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

import { cn } from "@/lib/utils";
import { THEME_OPTIONS } from "@/lib/theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";

interface UserButtonProps {
    // "rail" sits on the navy sidebar and shows the name on wide screens.
    variant?: "header" | "rail";
    // Shown as a menu item when there's an org to open settings for.
    settingsHref?: string;
}

export const UserButton = ({ variant = "header", settingsHref }: UserButtonProps) => {
    const { signOut } = useAuthActions();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { data: user, isLoading } = useCurrentUser();
    const isRail = variant === "rail";

    if (isLoading) {
        return <UserButtonSkeleton variant={variant} />;
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
            <DropdownMenuTrigger
                className={cn(
                    "flex shrink-0 items-center outline-none transition-colors",
                    isRail
                        ? "h-11 w-full justify-center gap-2 rounded-md px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-popup-open:bg-sidebar-accent lg:justify-start"
                        : "size-11 justify-center rounded-full focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
            >
                <Avatar className="size-8">
                    <AvatarImage src={user.image ?? undefined} alt="" referrerPolicy="no-referrer" />
                    <AvatarFallback
                        aria-hidden="true"
                        className={cn(
                            isRail
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "bg-primary text-primary-foreground"
                        )}
                    >
                        {avatarLetter}
                    </AvatarFallback>
                </Avatar>
                <span className="sr-only">Account menu: </span>
                <span
                    className={cn(
                        "min-w-0 flex-1 truncate text-left text-sm font-medium",
                        isRail ? "sr-only lg:not-sr-only" : "sr-only"
                    )}
                >
                    {name || user.email}
                </span>
                {isRail && (
                    <ChevronsUpDownIcon aria-hidden="true" className="hidden size-4 shrink-0 lg:block" />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-60"
                side={isRail ? "right" : "bottom"}
                align="end"
            >
                <div className="flex flex-col gap-1 px-1.5 py-1.5">
                    {name && <p className="text-sm font-medium leading-none">{name}</p>}
                    {user.email && (
                        <p className="truncate text-xs leading-none text-muted-foreground">{user.email}</p>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Theme</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                        {THEME_OPTIONS.map((option) => (
                            <DropdownMenuRadioItem key={option.value} value={option.value}>
                                <option.icon aria-hidden="true" />
                                {option.label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {settingsHref && (
                    <DropdownMenuItem render={<Link href={settingsHref} />}>
                        <SettingsIcon aria-hidden="true" />
                        Settings
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onSignOut}>
                    <LogOutIcon aria-hidden="true" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const UserButtonSkeleton = ({ variant }: { variant: "header" | "rail" }) => {
    if (variant === "rail") {
        return (
            <div className="flex h-11 w-full items-center justify-center gap-2 px-2 lg:justify-start">
                <span role="status" className="sr-only">Loading account</span>
                <Skeleton className="size-8 shrink-0 rounded-full bg-sidebar-accent" />
                <Skeleton className="hidden h-4 flex-1 bg-sidebar-accent lg:block" />
            </div>
        );
    }

    return (
        <div className="flex size-11 shrink-0 items-center justify-center">
            <span role="status" className="sr-only">Loading account</span>
            <Skeleton className="size-8 rounded-full" />
        </div>
    );
};
