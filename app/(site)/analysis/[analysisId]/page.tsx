import getAnalysisById from "@/actions/analysis/get-analysis-by-id";
import AnalysisBoard from "@/components/analysis/analysis-board";
import PageWrapper from "@/components/reusables/wrappers";

interface AnalysisPageProps {
    params: Promise<{
        analysisId: string;
    }>;
}
const AnalysisPage: React.FC<AnalysisPageProps> = async ({ params }) => {
    const { analysisId } = await params;
    const { data } = await getAnalysisById(analysisId);
    
    return (
        <PageWrapper
            title="Analysis Result"
            description="Lorem ipsum dolor sit amet consectetur, adipisicing elit."
        >
            <AnalysisBoard data={data!} />
        </PageWrapper>
    );
};

export default AnalysisPage;
