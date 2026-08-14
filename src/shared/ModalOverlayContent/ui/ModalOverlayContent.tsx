'use client'
const ModalContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return(
      <div 
        className={`bg-white rounded-2xl relative shadow-2xl flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {children} 
      </div>
  );
};
export default ModalContent