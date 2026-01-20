export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

export interface GasStation {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    distance: number; // em km
    fuels: {
        gasolina?: number;
        etanol?: number;
        diesel?: number;
    };
    rating?: number;
    lastUpdated: string;
    quality?: 'excelente' | 'bom' | 'regular' | 'ruim';
}

export class GeolocationService {
    private static instance: GeolocationService;
    private watchId: number | null = null;

    static getInstance(): GeolocationService {
        if (!GeolocationService.instance) {
            GeolocationService.instance = new GeolocationService();
        }
        return GeolocationService.instance;
    }

    async getCurrentPosition(): Promise<LocationData> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalização não suportada pelo navegador'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    });
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            reject(new Error('Permissão de geolocalização negada'));
                            break;
                        case error.POSITION_UNAVAILABLE:
                            reject(new Error('Informações de localização indisponíveis'));
                            break;
                        case error.TIMEOUT:
                            reject(new Error('Tempo esgotado ao obter localização'));
                            break;
                        default:
                            reject(new Error('Erro desconhecido ao obter localização'));
                            break;
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000 // 1 minuto
                }
            );
        });
    }

    startWatching(callback: (position: LocationData) => void): void {
        if (!navigator.geolocation) {
            console.error('Geolocalização não suportada');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                callback({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                console.error('Erro watching position:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000 // 30 segundos
            }
        );
    }

    stopWatching(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(value: number): number {
        return value * Math.PI / 180;
    }

    async findNearbyGasStations(
        userLocation: LocationData,
        radiusKm: number = 5
    ): Promise<GasStation[]> {
        // Mock de postos - em produção, viria de API externa
        const mockStations: GasStation[] = [
            {
                id: '1',
                name: 'Posto Shell',
                address: 'Av. Paulista, 1000',
                latitude: -23.5644,
                longitude: -46.6521,
                distance: 0,
                fuels: {
                    gasolina: 5.89,
                    etanol: 4.23,
                    diesel: 5.45
                },
                rating: 4.5,
                lastUpdated: new Date().toISOString(),
                quality: 'excelente'
            },
            {
                id: '2',
                name: 'Posto Ipiranga',
                address: 'Rua Augusta, 500',
                latitude: -23.5584,
                longitude: -46.6581,
                distance: 0,
                fuels: {
                    gasolina: 5.79,
                    etanol: 4.15,
                    diesel: 5.38
                },
                rating: 4.2,
                lastUpdated: new Date().toISOString(),
                quality: 'bom'
            },
            {
                id: '3',
                name: 'Posto Petrobras',
                address: 'Alameda Santos, 200',
                latitude: -23.5624,
                longitude: -46.6551,
                distance: 0,
                fuels: {
                    gasolina: 5.85,
                    etanol: 4.28,
                    diesel: 5.42
                },
                rating: 4.0,
                lastUpdated: new Date().toISOString(),
                quality: 'bom'
            },
            {
                id: '4',
                name: 'Posto BR',
                address: 'Rua Haddock Lobo, 300',
                latitude: -23.5664,
                longitude: -46.6491,
                distance: 0,
                fuels: {
                    gasolina: 5.75,
                    etanol: 4.10,
                    diesel: 5.35
                },
                rating: 3.8,
                lastUpdated: new Date().toISOString(),
                quality: 'regular'
            }
        ];

        // Calcular distâncias e filtrar por raio
        const nearbyStations = mockStations
            .map(station => ({
                ...station,
                distance: this.calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    station.latitude,
                    station.longitude
                )
            }))
            .filter(station => station.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);

        return nearbyStations;
    }

    async getBestGasStationForFuel(
        userLocation: LocationData,
        fuelType: 'gasolina' | 'etanol' | 'diesel'
    ): Promise<GasStation | null> {
        const stations = await this.findNearbyGasStations(userLocation);

        const stationsWithFuel = stations.filter(
            station => station.fuels[fuelType] !== undefined
        );

        if (stationsWithFuel.length === 0) {
            return null;
        }

        // Encontrar o posto com melhor preço (considerando distância)
        return stationsWithFuel.reduce((best, current) => {
            const bestScore = (best.fuels[fuelType] || 0) * (1 + best.distance * 0.1);
            const currentScore = (current.fuels[fuelType] || 0) * (1 + current.distance * 0.1);

            return currentScore < bestScore ? current : best;
        });
    }

    async getGasStationRanking(
        userLocation: LocationData,
        fuelType: 'gasolina' | 'etanol' | 'diesel'
    ): Promise<GasStation[]> {
        const stations = await this.findNearbyGasStations(userLocation);

        return stations
            .filter(station => station.fuels[fuelType] !== undefined)
            .sort((a, b) => {
                const priceA = a.fuels[fuelType] || 0;
                const priceB = b.fuels[fuelType] || 0;

                // Considerar preço, distância e qualidade
                const scoreA = priceA * (1 + a.distance * 0.05) - (a.rating || 0) * 0.1;
                const scoreB = priceB * (1 + b.distance * 0.05) - (b.rating || 0) * 0.1;

                return scoreA - scoreB;
            });
    }

    async reverseGeocode(latitude: number, longitude: number): Promise<string> {
        // Mock de reverse geocoding - em produção, usar API como Google Maps
        const mockAddresses = [
            'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
            'Rua Augusta, 500 - Consolação, São Paulo - SP',
            'Alameda Santos, 200 - Jardim Paulista, São Paulo - SP',
            'Rua Haddock Lobo, 300 - Higienópolis, São Paulo - SP'
        ];

        // Simular endereço baseado na localização
        const index = Math.floor(Math.random() * mockAddresses.length);
        return mockAddresses[index];
    }
}
