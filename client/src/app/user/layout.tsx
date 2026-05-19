
import CopyRightArea from "@/components/copy-right/CopyRightArea";
import HeaderNav from "@/components/user/headerNav/HeaderNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <div className="bg-c-white-soft">
          <HeaderNav />
          <div className="flex-1 min-w-0 px-4 pt-3 pb-16 sm:pb-12 bg-dark min-h-[calc(100dvh-68px)] relative">
            {children}
            <CopyRightArea />
          </div>
        </div>
    </>
  );
}
