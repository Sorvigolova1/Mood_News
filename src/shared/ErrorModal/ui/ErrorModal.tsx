import ModalOverlay from "@/shared/ModalOverlay/ui/ModalOverlay";

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal = ({ message, onClose }: ErrorModalProps) => {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="
        bg-white 
        rounded-2xl 
        shadow-2xl 
        p-6 sm:p-8 
        max-w-md 
        w-full 
        mx-4
        animate-in 
        fade-in 
        zoom-in-95 
        duration-200
        max-h-[90vh]
        overflow-y-auto
      ">
        <div className="flex justify-center mb-4">
          <div className="
            w-16 h-16 
            bg-red-100 
            rounded-full 
            flex items-center justify-center
            flex-shrink-0
          ">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        <h3 className="
          text-xl sm:text-2xl 
          font-bold 
          text-center 
          text-gray-900 
          mb-2
        ">
          Что-то пошло не так 😕
        </h3>

        <p className="
          text-sm sm:text-base 
          text-gray-600 
          text-center 
          leading-relaxed
          mb-6
          break-words
          whitespace-pre-wrap
          overflow-wrap-anywhere
          max-w-full
        ">
          {message}
        </p>

        <button
          onClick={onClose}
          className="
            w-full 
            bg-red-500 
            hover:bg-red-600 
            active:bg-red-700
            text-white 
            font-medium 
            py-2.5 sm:py-3 
            px-4 
            rounded-xl 
            transition-all 
            duration-200
            shadow-lg 
            shadow-red-500/25
            hover:shadow-red-500/40
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          Понятно
        </button>
      </div>
    </ModalOverlay>
  );
};

export default ErrorModal;