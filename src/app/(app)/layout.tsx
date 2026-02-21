import { BootstrapData } from "@/components/Bootstrap";
import { RoleSidebar } from "@/components/RoleSidebar";
import { RoleProvider } from "@/lib/role-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <div className="page-fade mx-auto flex w-full max-w-[1400px] gap-6 px-6 py-10">
        <BootstrapData />
        <div className="hidden lg:block">
          <RoleSidebar />
        </div>
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">FleetFlow</p>
              <h1 className="mt-1 font-[family:var(--font-fraunces)] text-2xl">Command Core</h1>
            </div>
            <a
              href="/login"
              className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Login
            </a>
          </div>
          {children}
        </div>
      </div>
    </RoleProvider>
  );
}
