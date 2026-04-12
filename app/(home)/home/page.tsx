import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/reusables/wrappers";
import AnalysesDashboard from "@/components/home/analyses-dashboard";
import { Suspense } from "react";

const HomePage = () => {
    return (
        <PageWrapper
            title="Home"
            description="Lorem ipsum dolor sit amet consectetur, adipisicing elit."
        >
            <Link href={"/upload"}>
                <Button>Upload</Button>
            </Link>

            <Link href={`/record`}>
                <Button>Record</Button>
            </Link>

            <Suspense fallback={<div>Loading analyses...</div>}>
                <AnalysesDashboard />
            </Suspense>
        </PageWrapper>
    );
};

export default HomePage;
