import getAnalysisById from "@/actions/analysis/get-analysis-by-id";
import AnalysisBoard from "@/components/analysis/analysis-board";
import EditTitleAndDescriptionDialog from "@/components/analysis/edit-title-and-description-dialog";

interface AnalysisPageProps {
    params: Promise<{
        analysisId: string;
    }>;
}
const AnalysisPage: React.FC<AnalysisPageProps> = async ({ params }) => {
    const { analysisId } = await params;
    const { data } = await getAnalysisById(analysisId);

    return (
        <div className="px-10 pt-8 pb-4 h-full max-h-full flex flex-col overflow-hidden">
            {/* header part  */}
            <section className="flex items-center justify-between mb-2 shrink-0">
                {/* header left section  */}
                <div>
                    <h1 className="text-lg font-medium"> 
                        {data?.name || "Untitled Analysis"}
                    </h1>
                    <p className="text-muted-foreground">
                        {data?.description || "No description provided."}
                    </p>
                </div>
                {/* header right section  */}
                <div>
                   <EditTitleAndDescriptionDialog 
                        analysisId={analysisId}
                        initialTitle={data?.name}
                        initialDescription={data?.description}
                   />
                </div>
            </section>
            {/* main content part  */}
            <section className="flex-1 min-h-0 overflow-hidden">
                <AnalysisBoard data={data!} />
            </section>
        </div>
    );
};

export default AnalysisPage;
