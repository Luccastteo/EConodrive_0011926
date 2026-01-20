import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
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
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const webcamRef = useRef<Webcam>(null);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
            setIsCapturing(true);
        }
    }, [webcamRef]);

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

    const switchCamera = useCallback(() => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    }, []);

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
                                <Webcam
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    screenshotQuality={0.9}
                                    videoConstraints={{
                                        facingMode,
                                        width: { ideal: 1280 },
                                        height: { ideal: 720 }
                                    }}
                                    className="w-full rounded-lg"
                                />

                                {/* Overlay para guiar o usuário */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                                        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                                        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                                        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                                        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
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
                            <>
                                <Button
                                    onClick={capture}
                                    className="gap-2"
                                    size="lg"
                                >
                                    <Camera className="h-4 w-4" />
                                    Capturar
                                </Button>

                                <Button
                                    onClick={switchCamera}
                                    variant="outline"
                                    size="lg"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                            </>
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
