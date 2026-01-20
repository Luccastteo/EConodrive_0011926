import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fuel, Car, MapPin, DollarSign, Gauge, Calendar, Loader2, Camera, Zap, Map } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRefuels } from "@/hooks/use-refuels";
import { useVehicles } from "@/hooks/use-vehicles";
import { useAuth } from "@/hooks/use-auth";
import { useCameraOCR } from "@/hooks/use-camera-ocr";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/budget-utils";
import CameraCapture from "@/components/camera/CameraCapture";
import GasStationRanking from "@/components/stations/GasStationRanking";

const fuelTypes = [
    { id: "gasolina", label: "Gasolina", color: "warning" },
    { id: "etanol", label: "Etanol", color: "accent" },
    { id: "diesel", label: "Diesel", color: "info" },
];

export default function Abastecer() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { vehicles, defaultVehicle } = useVehicles();
    const { createRefuel } = useRefuels();
    const { toast } = useToast();
    const { processImage, isProcessing, ocrResult, getCurrentLocation, location } = useCameraOCR();
    const { canUseFeature, showUpgradePrompt, incrementUsage } = useSubscription();

    const [selectedFuel, setSelectedFuel] = useState("gasolina");
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
    const [station, setStation] = useState("");
    const [liters, setLiters] = useState("");
    const [pricePerLiter, setPricePerLiter] = useState("");
    const [odometer, setOdometer] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Camera states
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraType, setCameraType] = useState<'odometer' | 'pump' | 'receipt'>('odometer');
    const [showRanking, setShowRanking] = useState(false);

    useEffect(() => {
        // ProtectedRoute handles authentication redirect
        // Just set default vehicle if available
        if (defaultVehicle) {
            setSelectedVehicleId(defaultVehicle.id);
        } else if (vehicles.length > 0) {
            setSelectedVehicleId(vehicles[0].id);
        }
    }, [defaultVehicle, vehicles]);

    // Auto-fill OCR results when available
    useEffect(() => {
        if (ocrResult && ocrResult.extractedData) {
            const data = ocrResult.extractedData;

            if (data.odometer && !odometer) {
                setOdometer(data.odometer.toString());
            }
            if (data.liters && !liters) {
                setLiters(data.liters.toString());
            }
            if (data.pricePerLiter && !pricePerLiter) {
                setPricePerLiter(data.pricePerLiter.toString());
            }
            if (data.total && !liters && !pricePerLiter) {
                // If we have total but not individual values, estimate
                const estimatedPricePerLiter = selectedFuel === 'gasolina' ? 5.89 : selectedFuel === 'etanol' ? 4.23 : 5.45;
                const estimatedLiters = data.total / estimatedPricePerLiter;
                setLiters(estimatedLiters.toFixed(2));
                setPricePerLiter(estimatedPricePerLiter.toFixed(2));
            }

            toast({
                title: "Dados Extraídos",
                description: "Preenchimento automático realizado com sucesso!",
                variant: "default"
            });
        }
    }, [ocrResult, odometer, liters, pricePerLiter, selectedFuel, toast]);

    const openCamera = (type: 'odometer' | 'pump' | 'receipt') => {
        if (!canUseFeature('ocrScans')) {
            showUpgradePrompt('ocrScans');
            return;
        }

        setCameraType(type);
        setCameraOpen(true);
    };

    const handleCameraCapture = async (imageData: string) => {
        const result = await processImage(imageData, cameraType);
        if (result) {
            incrementUsage('ocrScans');
        }
    };

    const getCurrentLocationAndStation = async () => {
        if (!canUseFeature('stationRanking')) {
            showUpgradePrompt('stationRanking');
            return;
        }

        try {
            await getCurrentLocation();
            toast({
                title: "Localização Obtida",
                description: "Sua localização foi capturada com sucesso",
                variant: "default"
            });
        } catch (error) {
            console.error('Erro ao obter localização:', error);
        }
    };

    const calculateTotal = () => {
        const litersNum = parseFloat(liters) || 0;
        const priceNum = parseFloat(pricePerLiter) || 0;
        return litersNum * priceNum;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            navigate('/auth');
            return;
        }

        if (!selectedVehicleId || !station || !liters || !pricePerLiter) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha todos os campos obrigatórios",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await createRefuel.mutateAsync({
                station,
                fuel_type: selectedFuel,
                liters: parseFloat(liters),
                price_per_liter: parseFloat(pricePerLiter),
                total_cost_cents: Math.round(calculateTotal() * 100),
                odometer: odometer ? parseInt(odometer) : null,
            });

            toast({
                title: "Abastecimento registrado!",
                description: "Seu abastecimento foi salvo com sucesso",
                variant: "default"
            });

            // Reset form
            setStation("");
            setLiters("");
            setPricePerLiter("");
            setOdometer("");
            setDate(new Date().toISOString().split('T')[0]);

            navigate('/');
        } catch (error) {
            console.error('Error creating refuel:', error);
            toast({
                title: "Erro ao registrar",
                description: "Não foi possível salvar seu abastecimento",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                        Abastecer
                    </h1>
                    <p className="text-foreground-tertiary mt-1">
                        Registre seu abastecimento com foto e localização
                    </p>
                </div>

                {/* Camera Capture Component */}
                <CameraCapture
                    isOpen={cameraOpen}
                    onClose={() => setCameraOpen(false)}
                    onCapture={handleCameraCapture}
                    title={`Tirar foto do ${cameraType === 'odometer' ? 'odômetro' : cameraType === 'pump' ? 'bomba' : 'recibo'}`}
                    description={cameraType === 'odometer' ? 'Posicione a câmera para capturar a quilometragem' :
                        cameraType === 'pump' ? 'Capture a bomba com os litros e preço' :
                            'Tire uma foto clara da nota fiscal'}
                />

                {/* Gas Station Ranking */}
                {showRanking && (
                    <GasStationRanking
                        onStationSelect={(station) => {
                            setStation(station.name);
                            setShowRanking(false);
                        }}
                        showMapButton={false}
                    />
                )}

                {/* Form */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Vehicle Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="vehicle">Veículo</Label>
                                <select
                                    id="vehicle"
                                    value={selectedVehicleId}
                                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
                                    {vehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.name} ({vehicle.plate})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Enhanced Station Input */}
                            <div className="space-y-2">
                                <Label htmlFor="station">Posto de combustível</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="station"
                                        value={station}
                                        onChange={(e) => setStation(e.target.value)}
                                        placeholder="Nome do posto"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={getCurrentLocationAndStation}
                                        className="gap-2"
                                        disabled={isProcessing}
                                    >
                                        <MapPin className="h-4 w-4" />
                                        Localizar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowRanking(!showRanking)}
                                        className="gap-2"
                                    >
                                        <Map className="h-4 w-4" />
                                        Ranking
                                    </Button>
                                </div>
                            </div>

                            {/* Fuel Selection */}
                            <div className="space-y-2">
                                <Label>Tipo de combustível</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {fuelTypes.map((fuel) => (
                                        <Button
                                            key={fuel.id}
                                            type="button"
                                            variant={selectedFuel === fuel.id ? "default" : "outline"}
                                            onClick={() => setSelectedFuel(fuel.id)}
                                            className="gap-2"
                                        >
                                            <Fuel className="h-4 w-4" />
                                            {fuel.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Odometer with Camera */}
                            <div className="space-y-2">
                                <Label htmlFor="odometer">Odômetro (km)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="odometer"
                                        type="number"
                                        value={odometer}
                                        onChange={(e) => setOdometer(e.target.value)}
                                        placeholder="0"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => openCamera('odometer')}
                                        className="gap-2"
                                        disabled={isProcessing}
                                    >
                                        <Camera className="h-4 w-4" />
                                        Foto
                                    </Button>
                                </div>
                                {isProcessing && cameraType === 'odometer' && (
                                    <p className="text-xs text-muted-foreground">Processando imagem do odômetro...</p>
                                )}
                            </div>

                            {/* Liters and Price with Camera */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="liters">Litros</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="liters"
                                            type="number"
                                            step="0.01"
                                            value={liters}
                                            onChange={(e) => setLiters(e.target.value)}
                                            placeholder="0.00"
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => openCamera('pump')}
                                            className="gap-2 px-3"
                                            disabled={isProcessing}
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pricePerLiter">Preço/L</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="pricePerLiter"
                                            type="number"
                                            step="0.01"
                                            value={pricePerLiter}
                                            onChange={(e) => setPricePerLiter(e.target.value)}
                                            placeholder="0.00"
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => openCamera('receipt')}
                                            className="gap-2 px-3"
                                            disabled={isProcessing}
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {isProcessing && (cameraType === 'pump' || cameraType === 'receipt') && (
                                <p className="text-xs text-muted-foreground">
                                    Processando imagem da {cameraType === 'pump' ? 'bomba' : 'nota fiscal'}...
                                </p>
                            )}

                            {/* Date Input */}
                            <div className="space-y-2">
                                <Label htmlFor="date">Data do abastecimento</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Total Display */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Total:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || isProcessing}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registrando...
                                    </>
                                ) : (
                                    <>
                                        <Fuel className="mr-2 h-4 w-4" />
                                        Registrar Abastecimento
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
