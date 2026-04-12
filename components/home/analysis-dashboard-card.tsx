import { AnalysisResultType } from "@/types";
import { Video } from "lucide-react";
import Link from "next/link";

interface AnalysisDashboardCardProps {
    analysis: AnalysisResultType;
}

const AnalysisDashboardCard: React.FC<AnalysisDashboardCardProps> = ({
    analysis,
}) => {
    return (
        <Link 
            href={`/analysis/${analysis.id}`}
            className="group flex flex-col overflow-hidden border bg-card rounded-2xl shadow-sm hover:shadow-md transition-all flex-1 cursor-pointer hover:border-primary/50"
        >
            {/* Video Preview */}
            <div className="w-full h-40 bg-muted/50 flex overflow-hidden flex-col items-center text-center justify-center border-b group-hover:bg-muted/70 transition-colors">
                {analysis.recording_url ? (
                    <video 
                        src={analysis.recording_url} 
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                    />
                ) : (
                    <>
                        <Video className="text-muted-foreground/60 mb-2" />
                        <span className="text-xs font-medium text-muted-foreground/60 tracking-wider uppercase">Video Preview</span>
                    </>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Overall Score
                        </h3>
                        <div className="text-3xl font-bold tracking-tighter text-primary">
                            {analysis.overallScore}
                        </div>
                    </div>
                    
                    <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed mb-4">
                        {analysis.summary}
                    </p>
                </div>

                <div className="flex gap-2 text-xs font-medium mt-auto flex-wrap">
                    <span className="bg-green-500/10 text-green-600 dark:text-green-500 px-2 py-1 rounded-md border border-green-500/20">
                        {analysis.strengths?.length || 0} Strengths
                    </span>
                    <span className="bg-orange-500/10 text-orange-600 dark:text-orange-500 px-2 py-1 rounded-md border border-orange-500/20">
                        {analysis.improvements?.length || 0} Improvements
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default AnalysisDashboardCard;
