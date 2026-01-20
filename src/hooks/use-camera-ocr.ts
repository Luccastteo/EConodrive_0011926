import { useState, useCallback } from 'react';
import { OCRService, OCRResult } from '@/services/ocrService';
import { GeolocationService, LocationData, GasStation } from '@/services/geolocationService';
import { useToast } from '@/hooks/use-toast';

export interface CameraOCRState {
    isProcessing: boolean;
    ocrResult: OCRResult | null;
    location: LocationData | null;
    nearbyStations: GasStation[];
    bestStation: GasStation | null;
    error: string | null;
}

export type ImageType = 'odometer' | 'pump' | 'receipt';

export function useCameraOCR() {
    const [state, setState] = useState<CameraOCRState>({
        isProcessing: false,
        ocrResult: null,
        location: null,
        nearbyStations: [],
        bestStation: null,
        error: null
    });

    const { toast } = useToast();
    const ocrService = OCRService.getInstance();
    const geoService = GeolocationService.getInstance();

    const processImage = useCallback(async (
        imageData: string,
        imageType: ImageType
    ): Promise<OCRResult | null> => {
        setState(prev => ({ ...prev, isProcessing: true, error: null }));

        try {
            let result: OCRResult;

            switch (imageType) {
                case 'odometer':
                    result = await ocrService.extractFromOdometer(imageData);
                    break;
                case 'pump':
                    result = await ocrService.extractFromPump(imageData);
                    break;
                case 'receipt':
                    result = await ocrService.extractFromReceipt(imageData);
                    break;
                default:
                    result = await ocrService.extractTextFromImage(imageData);
            }

            setState(prev => ({
                ...prev,
                isProcessing: false,
                ocrResult: result
            }));

            toast({
                title: "OCR Processado",
                description: `Confiança: ${Math.round(result.confidence)}%`,
                variant: "default"
            });

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

            setState(prev => ({
                ...prev,
                isProcessing: false,
                error: errorMessage
            }));

            toast({
                title: "Erro no OCR",
                description: errorMessage,
                variant: "destructive"
            });

            return null;
        }
    }, [ocrService, toast]);

    const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
        try {
            const location = await geoService.getCurrentPosition();

            setState(prev => ({
                ...prev,
                location,
                error: null
            }));

            return location;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao obter localização';

            setState(prev => ({
                ...prev,
                error: errorMessage
            }));

            toast({
                title: "Erro de Localização",
                description: errorMessage,
                variant: "destructive"
            });

            return null;
        }
    }, [geoService, toast]);

    const findNearbyStations = useCallback(async (
        location?: LocationData,
        radiusKm: number = 5
    ): Promise<GasStation[]> => {
        let currentLocation = location || state.location;

        if (!currentLocation) {
            const newLocation = await getCurrentLocation();
            if (!newLocation) return [];
            currentLocation = newLocation;
        }

        try {
            const stations = await geoService.findNearbyGasStations(currentLocation, radiusKm);

            setState(prev => ({
                ...prev,
                nearbyStations: stations
            }));

            return stations;
        } catch (error) {
            console.error('Erro ao buscar postos:', error);
            return [];
        }
    }, [geoService, state.location, getCurrentLocation]);

    const getBestStationForFuel = useCallback(async (
        fuelType: 'gasolina' | 'etanol' | 'diesel',
        location?: LocationData
    ): Promise<GasStation | null> => {
        let currentLocation = location || state.location;

        if (!currentLocation) {
            const newLocation = await getCurrentLocation();
            if (!newLocation) return null;
            currentLocation = newLocation;
        }

        try {
            const bestStation = await geoService.getBestGasStationForFuel(currentLocation, fuelType);

            setState(prev => ({
                ...prev,
                bestStation
            }));

            return bestStation;
        } catch (error) {
            console.error('Erro ao buscar melhor posto:', error);
            return null;
        }
    }, [geoService, state.location, getCurrentLocation]);

    const getStationRanking = useCallback(async (
        fuelType: 'gasolina' | 'etanol' | 'diesel',
        location?: LocationData
    ): Promise<GasStation[]> => {
        let currentLocation = location || state.location;

        if (!currentLocation) {
            const newLocation = await getCurrentLocation();
            if (!newLocation) return [];
            currentLocation = newLocation;
        }

        try {
            const ranking = await geoService.getGasStationRanking(currentLocation, fuelType);
            return ranking;
        } catch (error) {
            console.error('Erro ao obter ranking:', error);
            return [];
        }
    }, [geoService, state.location, getCurrentLocation]);

    const resetState = useCallback(() => {
        setState({
            isProcessing: false,
            ocrResult: null,
            location: null,
            nearbyStations: [],
            bestStation: null,
            error: null
        });
    }, []);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        // State
        ...state,

        // Methods
        processImage,
        getCurrentLocation,
        findNearbyStations,
        getBestStationForFuel,
        getStationRanking,
        resetState,
        clearError
    };
}
