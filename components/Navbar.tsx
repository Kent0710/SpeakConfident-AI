import React, { useMemo } from "react";
import { Github, ExternalLink } from "lucide-react";

export const Header: React.FC = () => {
    const navs = useMemo(
        () => [
            {
                href: "https://devpost.com/software/speakconfident-ai",
                icon: <ExternalLink size={24} />,
                label: "Devpost Submission",
            },
            {
                href: "https://github.com/Kent0710/SpeakConfident-AI",
                icon: <Github size={24} />,
                label: "GitHub Repository",
            },
        ],
        [],
    );

    return (
        <header className="flex justify-between px-2 md:px-16 py-4 items-center">
            <a href="/">
                <h1 className="font-semibold text-xl">SpeakConfident AI</h1>
            </a>
            <nav className="flex items-center gap-2">
                {navs.map((nav) => (
                    <Link key={nav.href} href={nav.href}>
                        {nav.icon}
                        <span className="hidden sm:inline">{nav.label}</span>
                    </Link>
                ))}
            </nav>
        </header>
    );
};

const Link: React.FC<{ href: string; children: React.ReactNode }> = ({
    href,
    children,
}) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-neutral-300 shadow-sm rounded-full px-4 py-2 font-semibold  hover:bg-neutral-100 transition-all"
        >
            {children}
        </a>
    );
};
