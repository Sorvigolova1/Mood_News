const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => {
    return ( 
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-8 z-[1000]"
          onClick={onClose} 
        >
            {children}
        </div>
    );
};
export default ModalOverlay;