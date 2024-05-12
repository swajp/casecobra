import MaxWidthWrapper from "@/components/max-width-wrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MaxWidthWrapper className="flex-1 flex flex-col">
      {children}
    </MaxWidthWrapper>
  );
}
