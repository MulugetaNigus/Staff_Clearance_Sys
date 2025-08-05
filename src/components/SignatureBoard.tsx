import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureBoardProps {
  onSave: (signature: string) => void;
}

const SignatureBoard: React.FC<SignatureBoardProps> = ({ onSave }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    if (sigCanvas.current) {
        if (sigCanvas.current.isEmpty()) {
            alert("Please provide a signature first.");
            return;
        }
        const signature = sigCanvas.current.toDataURL('image/png');
        onSave(signature);
    }
  };

  return (
    <div className="signature-board">
        <p>Please draw your signature below:</p>
        <div className="canvas-container">
            <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ className: 'sigCanvas' }}
            />
        </div>
        <div className="signature-board-actions">
            <button onClick={clear} className="button-secondary">Clear</button>
            <button onClick={save} className="button-primary">Save Signature</button>
        </div>
        <style>{`
            .signature-board {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .canvas-container {
                border: 1px solid #e2e8f0;
                border-radius: 0.375rem;
                overflow: hidden;
            }
            .sigCanvas {
                width: 100%;
                height: 200px;
                background-color: #f7fafc;
            }
            .signature-board-actions {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }
            /* Basic button styling */
            .button-primary {
                background-color: #4f46e5;
                color: white;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
            }
            .button-primary:hover {
                background-color: #4338ca;
            }
            .button-secondary {
                background-color: #e2e8f0;
                color: #1a202c;
                padding: 0.5rem 1rem;
                border: 1px solid #cbd5e0;
                border-radius: 0.375rem;
                cursor: pointer;
            }
            .button-secondary:hover {
                background-color: #cbd5e0;
            }
        `}</style>
    </div>
  );
};

export default SignatureBoard;
