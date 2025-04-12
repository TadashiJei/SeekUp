
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const PageLayout = ({ children, hideFooter = false }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow mt-[72px]">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
