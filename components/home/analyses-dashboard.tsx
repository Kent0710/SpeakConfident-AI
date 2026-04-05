import getAnalyses from "@/actions/analysis/get-analyses";

const AnalysesDashboard = async () => {
    const { data } = await getAnalyses();

    return (
        <div>
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>

        </div>
    )
};

export default AnalysesDashboard;