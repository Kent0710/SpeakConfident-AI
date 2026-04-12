import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/reusables/wrappers";
import AnalysesDashboard from "@/components/home/analyses-dashboard";
import { Suspense } from "react";

const HomePage = () => {
    return (
        <PageWrapper
            title="Home"
            description="Your dashboard for all your presentation analyses. "
        >
            <Link href={"/upload"}>
                <Button className="px-4 mr-2">Upload</Button>
            </Link>

            <Link href={`/record`}>
                <Button className="px-4">Record</Button>
            </Link>

            <Suspense fallback={<div>Loading analyses...</div>}>
                <AnalysesDashboard />
            </Suspense>
        </PageWrapper>
    );
};

export default HomePage;
