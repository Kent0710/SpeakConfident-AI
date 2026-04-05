import Header from "@/components/reusables/header";

interface SiteLayoutProps {
    children: React.ReactNode;
}
const SiteLayout: React.FC<SiteLayoutProps> = ({ children }) => {
    return (
        <div className="h-screen max-h-screen flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </div>
    );
};

export default SiteLayout;
