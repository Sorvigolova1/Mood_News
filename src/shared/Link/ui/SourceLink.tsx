interface SourceLinkProps {
  url: string;
  children?: React.ReactNode;
}
const SourceLink = ({ url, children, ...props }: SourceLinkProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer" 
      className="
        relative inline-flex items-center gap-1.5 
        text-sm font-medium text-gray-500 
        transition-colors duration-200 
        hover:text-blue-600 
        group
      "
      {...props}
    >
      {children || "Читать далее"}
      
    </a>
  );
};
export default SourceLink;
