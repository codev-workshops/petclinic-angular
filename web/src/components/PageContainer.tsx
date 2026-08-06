import type { ReactNode } from "react";

export interface PageContainerProps {
  title?: string;
  children?: ReactNode;
}

export function PageContainer({ title, children }: PageContainerProps) {
  return (
    <div className="container-fluid">
      <div className="container xd-container">
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
