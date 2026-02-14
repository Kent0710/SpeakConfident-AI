import React from "react";

interface HeroProps {
    onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
    return (
        <div className="flex flex-col mt-[6rem]">
            {/* hero section */}
            <div className="flex md:flex-row flex-wrap items-center min-h-[70dvh] mt-[7rem] md:mt-[0rem] px-4">
                {/* left section  */}
               <section className="w-full md:w-1/2 flex flex-col pl-0 md:pl-16 mb-12 md:mb-0">
                    <h1
                        className="text-5xl md:text-7xl font-extrabold tracking-tight 
                    bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-6 max-w-4xl text-center md:text-left"
                    >
                        Sound confident <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                            before it matters.
                        </span>
                    </h1>
                    <p className="text-base text-neutral-500 mb-10 max-w-xl text-center md:text-left">
                        Upload your practice presentation audio or video. Get
                        instant, actionable feedback on pacing, tone, and filler
                        words from our advanced AI.
                    </p>

                    <button
                        onClick={onStart}
                        className="
                            bg-gradient-to-r from-fuchsia-600 to-pink-600
                            px-8 py-4 rounded-full text-white font-semibold 
                            flex items-center gap-2 place-self-center md:place-self-start 
                        "
                    >
                        Start Analysis
                    </button>
                </section>

                {/* right section  */}
                <section className="w-full md:w-1/2 flex flex-col items-center justify-center">
                    <img
                        src="/sample-analysis.png"
                        alt="Sample Analysis Screenshot"
                        className="w-full max-w-2xl rounded-lg shadow-lg object-cover rotate-3"
                    />
                    <p className="mt-8 font-medium text-neutral-500 rotate-3">
                        {" "}
                        Sample Overall Analysis
                    </p>
                </section>
            </div>

            <AnalysisMarquee />

            {/* sample video analysis section  */}
            <div className="flex flex-col items-center justify-center mt-[10rem] px-4">
                {/* public\video-sample-analysis.png */}
                <p
                    className="
                    text-4xl font-bold text-center
                    bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-2
                "
                >
                    Not limited to audio.
                </p>
                <p className="text-base text-neutral-500 mb-10 max-w-xl text-center">
                    Upload a video and receive feedback on your full
                    presentation.
                </p>
                <img
                    src="/video-sample-analysis.png"
                    alt="Sample Video Analysis"
                    className="w-full max-w-4xl rounded-lg shadow-lg object-cover"
                />
                <p className="mt-8 font-medium text-neutral-500">
                    {" "}
                    Sample Visual Analysis
                </p>
            </div>

            {/* strength and improvement  */}
            <div className="flex flex-col items-center mt-[10rem] px-4">
                <p
                    className="text-4xl font-extrabold tracking-tight 
                    bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-2  max-w-4xl text-center"
                >
                    See How You Really Present
                </p>
                <p className="text-base text-neutral-500 mb-10 max-w-md text-center">
                    Know your strengths and weaknesses with detailed feedback on
                    what you did well and where to improve.
                </p>
                <img
                    // public\strength-and-improvement.png
                    src="/strength-and-improvement.png"
                    alt="Strength and Improvement Analysis"
                    className="w-full max-w-xl rounded-lg shadow-lg object-cover"
                />
            </div>

            <div className="flex flex-col mt-[10rem] items-center justify-center px-4">
                <p
                    className="text-4xl font-extrabold tracking-tight 
                    bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-2 max-w-4xl text-center"
                >
                    Your file recording is ready? 
                </p>
                  <p className="text-base text-neutral-500 mb-10 max-w-md text-center">
                   Upload your practice presentation audio or video now!
                </p>
                <button
                    onClick={onStart}
                    className="
                            bg-gradient-to-r from-fuchsia-600 to-pink-600
                            px-8 py-4 rounded-full text-white font-semibold 
                            flex items-center gap-2 
                        "
                >
                    Start Analysis
                </button>
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
