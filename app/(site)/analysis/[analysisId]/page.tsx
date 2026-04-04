import AnalysisBoard from "@/components/analysis/analysis-board";
import PageWrapper from "@/components/reusables/wrappers";

interface AnalysisPageProps {
    params: Promise<{
        analysisId: string;
    }>;
}
const AnalysisPage: React.FC<AnalysisPageProps> = async ({ params }) => {
    const { analysisId } = await params;

    return (
        <PageWrapper
            title="Analysis Result"
            description="Lorem ipsum dolor sit amet consectetur, adipisicing elit."
        >
            <h1>Analysis Result for ID: {analysisId}</h1>
            <AnalysisBoard />
        </PageWrapper>
    );
};

export default AnalysisPage;
