import Link from "next/link";
import { Button } from "../ui/button";

const Header = () => {
    return (
        <header className="flex items-center justify-between h-[10dvh] px-10 shadow-sm">
            {/* left section  */}
            <section className="flex items-center gap-12">
                <Link href={"/"}>
                    <p className="font-semibold">SpeakConfident AI</p>
                </Link>
                <nav>
                    <ul className="flex items-center gap-2">
                        <li>
                            <Link href={`/home`}>
                                <Button variant={"ghost"}>Home</Button>
                            </Link>
                        </li>
                          <li>
                            <Link href={`/upload`}>
                                <Button variant={"ghost"}>Upload</Button>
                            </Link>
                        </li>
                          <li>
                            <Link href={`/record`}>
                                <Button variant={"ghost"}>Record</Button>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </section>
            {/* right section  */}
            <section>
                <nav>
                    <ul className="flex items-center gap-2">
                        <li>
                            <Link href={`#`}>
                                <Button variant={"ghost"}>
                                    Devpost Submission
                                </Button>
                            </Link>
                        </li>
                        <li>
                            <Link href={`#`}>
                                <Button variant={"ghost"}>
                                    GitHub Repository
                                </Button>
                            </Link>
                        </li>
                        <li>
                            <Link href={`#`}>
                                <Button variant={"ghost"}>Video Demo</Button>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </section>
        </header>
    );
};

export default Header;
