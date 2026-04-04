import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/reusables/wrappers";

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
        </PageWrapper>
    );
};

export default HomePage;
