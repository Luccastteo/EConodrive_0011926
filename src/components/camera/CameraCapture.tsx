import { useState, useRef, useCallback } from 'react';
// import Webcam from 'react-webcam'; // Temporarily disabled for debugging
import { Camera, X, RotateCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageData: string) => void;
    title: string;
    description?: string;
}

export default function CameraCapture({ isOpen, onClose, onCapture, title, description }: CameraCaptureProps) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const capture = useCallback(() => {
        // Mock capture - create a simple placeholder image
        const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
        setCapturedImage(mockImageData);
        setIsCapturing(true);
    }, []);

    const retake = useCallback(() => {
        setCapturedImage(null);
        setIsCapturing(false);
    }, []);

    const confirm = useCallback(() => {
        if (capturedImage) {
            onCapture(capturedImage);
            setCapturedImage(null);
            setIsCapturing(false);
            onClose();
        }
    }, [capturedImage, onCapture, onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}

                    <div className="relative">
                        {!isCapturing ? (
                            <div className="relative">
                                {/* Mock camera view */}
                                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="text-center">
                                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">Câmera simulada para desenvolvimento</p>
                                        <p className="text-sm text-gray-400 mt-1">Clique em "Capturar" para simular</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <img
                                    src={capturedImage || ''}
                                    alt="Captured"
                                    className="w-full rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 justify-center">
                        {!isCapturing ? (
                            <Button
                                onClick={capture}
                                className="gap-2"
                                size="lg"
                            >
                                <Camera className="h-4 w-4" />
                                Capturar
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={retake}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <RotateCw className="h-4 w-4" />
                                    Refazer
                                </Button>

                                <Button
                                    onClick={confirm}
                                    className="gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    Confirmar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
