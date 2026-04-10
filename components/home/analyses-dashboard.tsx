import getAnalyses from "@/actions/analysis/get-analyses";
import AnalysisDashboardCard from "./analysis-dashboard-card";

const AnalysesDashboard = async () => {
    const { data } = await getAnalyses();

    if (!data || data.length === 0) {
        return <div>No analyses found.</div>;
    }

    return (
        <div
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            {data.map((analysis) => (
                <AnalysisDashboardCard key={analysis.id} analysis={analysis} />
            ))}
        </div>
    )
};

export default AnalysesDashboard;