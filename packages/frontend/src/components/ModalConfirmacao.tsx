import ReactModal from 'react-modal';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

// Define os tipos de 'variant'
type ModalVariant = 'danger' | 'success' | 'default';

interface ModalConfirmacaoProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
}

// Configuração de ícones e cores com base na variant
const variantsConfig = {
  danger: {
    icon: AlertTriangle,
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    iconClass: 'text-red-500',
  },
  success: {
    icon: CheckCircle,
    buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
    iconClass: 'text-green-500',
  },
  default: {
    icon: HelpCircle,
    buttonClass: 'bg-brand-blue hover:bg-brand-blue-dark text-white',
    iconClass: 'text-brand-blue',
  },
};

export function ModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
}: ModalConfirmacaoProps) {
  const config = variantsConfig[variant];
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <ReactModal
          isOpen={isOpen}
          onRequestClose={onClose}
          overlayClassName="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          className="outline-none"
          contentLabel={title}
          ariaHideApp={false}
        >
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4"
          >
            {/* Botão de Fechar */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <div className="flex space-x-4">
              {/* Ícone */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full ${config.iconClass} bg-opacity-10 bg-current flex items-center justify-center`}
              >
                <IconComponent size={28} className={config.iconClass} />
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-zinc-800">{title}</h3>
                <div className="text-sm text-zinc-600 mt-2">{message}</div>
              </div>
            </div>

            {/* Rodapé com Botões */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-lg font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 min-w-[120px] ${config.buttonClass} disabled:opacity-50`}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </motion.div>
        </ReactModal>
      )}
    </AnimatePresence>
  );
}