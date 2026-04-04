interface WrapperProps {
    children: React.ReactNode;
    className?: string;
    title: string;
    description: string;
}
const PageWrapper: React.FC<WrapperProps> = ({
    children,
    className,
    title,
    description,
}) => {
    return (
        <div className={`${className} px-10 py-8 h-full flex flex-col`}>
            {/* header section  */}
            <section className="mb-2 shrink-0">
                <h1 className="text-lg font-medium">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </section>
            {/* main content children */}
            <div className="flex-1">{children}</div>
        </div>
    );
};

export default PageWrapper;
