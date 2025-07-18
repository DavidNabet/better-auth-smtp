import dynamic from "next/dynamic";
import { memo } from "react";
import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

// const fallback = (
//   <div style={{ background: "#262626", width: 24, height: 24 }} />
// );

interface IconProps extends Omit<LucideProps, "ref"> {
  name: keyof typeof dynamicIconImports;
}

const Icon = memo(({ name, ...props }: IconProps) => {
  const LucideIcon = dynamic(dynamicIconImports[name]);

  return <LucideIcon size={18} {...props} />;
});

export default Icon;
