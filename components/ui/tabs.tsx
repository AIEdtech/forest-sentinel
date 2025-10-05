'use client';

import * as React from "react"

export const Tabs = ({ defaultValue, children, className = "", ...props }: any) => {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div className={className} {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeValue: value, setValue })
      )}
    </div>
  );
};

export const TabsList = ({ children, className = "", value, setValue }: any) => (
  <div className={`inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeValue: value, setValue })
    )}
  </div>
);

export const TabsTrigger = ({ value: tabValue, children, className = "", activeValue, setValue }: any) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeValue === tabValue ? 'bg-background text-foreground shadow-sm' : ''
    } ${className}`}
    onClick={() => setValue(tabValue)}
  >
    {children}
  </button>
);

export const TabsContent = ({ value: tabValue, children, className = "", activeValue }: any) => {
  if (activeValue !== tabValue) return null;
  return <div className={`mt-2 ${className}`}>{children}</div>;
};
