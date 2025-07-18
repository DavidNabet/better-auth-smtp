interface WrapperProps {
  children: React.ReactNode;
  title: string;
}

export default function Wrapper({ children, title }: WrapperProps) {
  return (
    <div className="w-full">
      <h3 className="pt-10 pb-4 font-bold text-2xl md:text-3xl tracking-tight text-primary">
        {title}
      </h3>
      {children}
    </div>
  );
}
