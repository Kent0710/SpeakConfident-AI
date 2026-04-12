import Header from "@/components/reusables/header";

interface HomeLayoutProps {
    children: React.ReactNode;
}
const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
    return (
        <div className="h-screen max-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
        </div>
    );
};

export default HomeLayout;
