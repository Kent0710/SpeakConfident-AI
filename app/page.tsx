import { Button } from "@/components/ui/button";
import Link from "next/link";

import STUDIOPREVIEWIMAGE from "@/public/images/studio-mode-preview.png";
import AICOACHCHATIMAGE from "@/public/images/ai-coach-chat-preview.png";
import DETAILEDAUDIOIMAGE from "@/public/images/detailed-audio-sample.png";
import DETAILVIDEOIMAGE from "@/public/images/detailed-visual-sample.png";
import SUMMARYIMAGE from "@/public/images/summary.png";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const LandingPage = () => {
    return (
        <div className="flex flex-col ">
            <header className="py-4 md:h-[5rem] flex flex-col md:flex-row justify-between items-center px-4 md:px-10 gap-4 md:gap-0">
                {/* Left Side  */}
                <div>
                    <p className="font-semibold text-center md:text-left">
                        SpeakConfident AI
                    </p>
                </div>
                {/* Right Side  */}
                <div>
                    <nav>
                        <ul className="flex flex-wrap justify-center items-center gap-2">
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
                                    <Button variant={"ghost"}>
                                        Video Demo
                                    </Button>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            {/* hero section */}
            <div className="flex flex-col h-[70dvh] items-center justify-center">
                {/* left section  */}
                <h1
                    className="text-5xl text-center md:text-7xl lg:text-8xl font-extrabold tracking-tight 
                    bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-6 max-w-4xl px-4"
                >
                    Sound confident <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                        before it matters.
                    </span>
                </h1>
                <p className="text-lg md:text-2xl text-center text-neutral-500 mb-10 max-w-4xl px-4">
                    Upload your practice presentation audio or video. Get
                    instant, actionable feedback on pacing, tone, and filler
                    words from our advanced AI.
                </p>

                <Link href={"/home"}>
                    <Button className="bg-gradient-to-r from-fuchsia-600 to-pink-600" size={'lg'}>
                        Start Analysis
                    </Button>
                </Link>
            </div>

            <AnalysisMarquee />

            {/* ai coach chat section  */}
            <div
                className="flex flex-col-reverse lg:flex-row items-center justify-center mt-[6rem] md:mt-[10rem] px-4
                bg-gradient-to-r from-fuchsia-600 to-pink-600 py-10 md:py-16 
            "
            >
                {/* left section: the ai chat image */}
                <section className="flex justify-center items-center w-full lg:w-1/2">
                    <Image
                        src={AICOACHCHATIMAGE}
                        alt="AI Coach Chat Preview"
                        className="w-[90%] md:w-[70%] rounded-lg shadow-lg object-cover -rotate-3"
                    />
                </section>

                {/* right section: the text */}
                <section className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <Badge className=" text-base p-3 mb-4">New Feature!</Badge>
                    <p
                        className="
                          text-4xl md:text-6xl font-bold mb-4 text-white
                        "
                    >
                        AI Chat <br className="hidden md:block" /> Presentation
                        Coach
                    </p>
                    <p className="text-base text-neutral-200 mb-10 max-w-xl px-4 lg:px-0">
                        Ask questions, get tips, and receive tailored advice to
                        improve your presentation skills both in general and for
                        each specific analysis.
                    </p>
                </section>
            </div>

            <div
                className="flex flex-col lg:flex-row items-center justify-center px-4
                bg-gradient-to-r from-fuchsia-600 to-pink-600 py-10 md:py-16 pb-12
            
            "
            >
                {/* left section: the text */}
                <section className="w-full lg:w-1/2 lg:pl-14 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <Badge className=" text-base p-3 mb-4">New Feature!</Badge>
                    <p
                        className="
                          text-4xl md:text-6xl font-bold 
                          text-white mb-4
                        "
                    >
                        Live Studio <br className="hidden md:block" /> Recording
                        Mode
                    </p>
                    <p className="text-base text-neutral-200 mb-10 max-w-xl px-4 lg:px-0">
                        Record your presentation directly on our platform with
                        our new Studio Mode to visualize yourself in front of a
                        virtual audience.
                    </p>
                </section>

                {/* right section: the image */}
                <section className="flex justify-center items-center w-full lg:w-1/2">
                    <Image
                        src={STUDIOPREVIEWIMAGE}
                        alt="Studio Mode Preview"
                        className="w-[95%] md:w-full max-w-2xl rounded-lg shadow-lg object-cover rotate-3"
                    />
                </section>
            </div>

            {/* strength and improvement  */}
            <div className="flex flex-col items-center mt-[6rem] md:mt-[10rem] px-4">
                <p
                    className="text-4xl md:text-6xl font-extrabold tracking-tight 
                    bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-4 max-w-4xl text-center"
                >
                    See How You Really Present.
                </p>
                <p className="text-base text-neutral-500 mb-10 max-w-md text-center">
                    Know your strengths and weaknesses with detailed feedback on
                    what you did well and where to improve.
                </p>
                <Image
                    src={SUMMARYIMAGE}
                    alt="Summary of Strengths and Improvements"
                    className="w-[90%] md:w-[80%] lg:w-[60%] rounded-lg shadow-lg object-cover border"
                />
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center mt-[6rem] md:mt-[10rem] px-4 gap-10 lg:gap-0">
                {/* public\video-sample-analysis.png */}
                <div className="flex flex-col text-center lg:text-left items-center lg:items-start justify-center w-full lg:w-[50%] lg:pl-10">
                    <p
                        className="
                    text-4xl md:text-6xl font-bold 
                    bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-4
                    "
                    >
                        Detailed analysis on every aspect.
                    </p>
                    <p className="text-base text-neutral-500 mb-10 max-w-xl">
                        Get in-depth feedback on your audio and video on every
                        aspect of your presentation.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center w-full lg:w-[50%] lg:pr-10 gap-4 md:gap-2">
                    <Image
                        src={DETAILEDAUDIOIMAGE}
                        alt="Detailed Audio Analysis Sample"
                        className="w-[90%] md:w-[48%] rounded-lg shadow-lg object-cover border"
                    />
                    <Image
                        src={DETAILVIDEOIMAGE}
                        alt="Detailed Video Analysis Sample"
                        className="w-[90%] md:w-[48%] rounded-lg shadow-lg object-cover border"
                    />
                </div>
            </div>

            <div className="flex flex-col mt-[6rem] md:mt-[10rem] items-center justify-center px-4 mb-[6rem] md:mb-[10rem]">
                <p
                    className="text-4xl md:text-6xl font-extrabold tracking-tight 
                    bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-4 max-w-4xl text-center"
                >
                    Your file recording is ready?
                </p>
                <p className="text-base text-neutral-500 mb-10 max-w-md text-center">
                    Upload your practice presentation audio or video now!
                </p>
                <Link href={"/home"}>
                    <Button className="bg-gradient-to-r from-fuchsia-600 to-pink-600" size={'lg'}>
                        Start Analysis
                    </Button>
                </Link>
            </div>
        </div>
    );
};

const AnalysisMarquee = () => {
    return (
        <>
            <div className="mt-16 overflow-x-hidden w-full">
                <div className="flex gap-6 min-w-max animate-marquee">
                    {/* Original cards */}
                    {[
                        "Confidence",
                        "Clarity",
                        "Engagement",
                        "Content Structure",
                        "Filler Words",
                    ].map((title, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex-shrink-0 w-72"
                        >
                            <h3 className="font-bold text-gray-900">
                                {title} Analysis
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {title === "Confidence" &&
                                    "Are you projecting authority? We'll show how confident and credible your delivery comes across."}
                                {title === "Clarity" &&
                                    "Is every word clear? Get tips on enunciation and pacing to make sure your audience understands you."}
                                {title === "Engagement" &&
                                    "Keeping attention is key. See how dynamic and expressive your delivery is, and how well you hold the audience."}
                                {title === "Content Structure" &&
                                    "Is your message easy to follow? We'll highlight the flow of your introduction, main points, and conclusion."}
                                {title === "Filler Words" &&
                                    "Do you say “um” or “like” too often? We'll detect filler words and show how to minimize them for a polished delivery."}
                            </p>
                        </div>
                    ))}

                    {/* Duplicate cards for seamless infinite scroll */}
                    {[
                        "Confidence",
                        "Clarity",
                        "Engagement",
                        "Content Structure",
                        "Filler Words",
                    ].map((title, i) => (
                        <div
                            key={i + 5}
                            className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm flex-shrink-0 w-72"
                        >
                            <h3 className="font-bold text-gray-900">
                                {title} Analysis
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {title === "Confidence" &&
                                    "Are you projecting authority? We'll show how confident and credible your delivery comes across."}
                                {title === "Clarity" &&
                                    "Is every word clear? Get tips on enunciation and pacing to make sure your audience understands you."}
                                {title === "Engagement" &&
                                    "Keeping attention is key. See how dynamic and expressive your delivery is, and how well you hold the audience."}
                                {title === "Content Structure" &&
                                    "Is your message easy to follow? We'll highlight the flow of your introduction, main points, and conclusion."}
                                {title === "Filler Words" &&
                                    "Do you say “um” or “like” too often? We'll detect filler words and show how to minimize them for a polished delivery."}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .animate-marquee {
                    display: flex;
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </>
    );
};

export default LandingPage;
