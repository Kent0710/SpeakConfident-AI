import Header from "@/components/reusables/header";

interface SiteLayoutProps {
    children: React.ReactNode;
}
const SiteLayout: React.FC<SiteLayoutProps> = ({ children }) => {
    return (
        <div className="h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
        </div>
    );
};

export default SiteLayout;
