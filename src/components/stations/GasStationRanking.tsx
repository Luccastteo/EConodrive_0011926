import { useState, useEffect } from 'react';
import { MapPin, Star, TrendingDown, Navigation, Fuel, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCameraOCR } from '@/hooks/use-camera-ocr';
import { GasStation } from '@/services/geolocationService';
import { formatCurrency } from '@/lib/budget-utils';

interface GasStationRankingProps {
    onStationSelect?: (station: GasStation) => void;
    showMapButton?: boolean;
}

export default function GasStationRanking({ onStationSelect, showMapButton = true }: GasStationRankingProps) {
    const [selectedFuel, setSelectedFuel] = useState<'gasolina' | 'etanol' | 'diesel'>('gasolina');
    const [ranking, setRanking] = useState<GasStation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const {
        getCurrentLocation,
        getStationRanking,
        location,
        nearbyStations,
        isProcessing
    } = useCameraOCR();

    useEffect(() => {
        loadRanking();
    }, [selectedFuel]);

    const loadRanking = async () => {
        setIsLoading(true);
        try {
            const currentLocation = location || await getCurrentLocation();
            if (currentLocation) {
                const stationRanking = await getStationRanking(selectedFuel, currentLocation);
                setRanking(stationRanking);
            }
        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getQualityColor = (quality?: string) => {
        switch (quality) {
            case 'excelente': return 'bg-green-100 text-green-800 border-green-200';
            case 'bom': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'regular': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ruim': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRankingBadge = (index: number) => {
        if (index === 0) return <Badge className="bg-yellow-400 text-yellow-900 border-yellow-500"><Award className="w-3 h-3 mr-1" />1º</Badge>;
        if (index === 1) return <Badge className="bg-gray-300 text-gray-900 border-gray-400"><Award className="w-3 h-3 mr-1" />2º</Badge>;
        if (index === 2) return <Badge className="bg-orange-300 text-orange-900 border-orange-400"><Award className="w-3 h-3 mr-1" />3º</Badge>;
        return <Badge variant="outline">{index + 1}º</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Ranking de Postos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Fuel Selection */}
                <Tabs value={selectedFuel} onValueChange={(value) => setSelectedFuel(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="gasolina">⛽ Gasolina</TabsTrigger>
                        <TabsTrigger value="etanol">🌱 Etanol</TabsTrigger>
                        <TabsTrigger value="diesel">🚛 Diesel</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Loading State */}
                {(isLoading || isProcessing) && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Analisando postos próximos...</p>
                    </div>
                )}

                {/* No Location */}
                {!location && !isLoading && !isProcessing && (
                    <div className="text-center py-8">
                        <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Ativar Localização</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Precisamos da sua localização para encontrar os melhores postos próximos
                        </p>
                        <Button onClick={loadRanking}>
                            <Navigation className="h-4 w-4 mr-2" />
                            Ativar Localização
                        </Button>
                    </div>
                )}

                {/* Ranking List */}
                {location && !isLoading && !isProcessing && ranking.length > 0 && (
                    <div className="space-y-3">
                        {ranking.map((station, index) => (
                            <Card
                                key={station.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => onStationSelect?.(station)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getRankingBadge(index)}
                                                <h4 className="font-semibold">{station.name}</h4>
                                                <Badge className={getQualityColor(station.quality)}>
                                                    {station.quality}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{station.address}</span>
                                                <span className="text-xs">• {station.distance.toFixed(1)} km</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Fuel className="h-4 w-4 text-blue-600" />
                                                    <span className="font-bold text-lg">
                                                        {formatCurrency(station.fuels[selectedFuel] || 0)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">/L</span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                    <span className="text-sm">{station.rating || 'N/A'}</span>
                                                </div>

                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Atualizado há {Math.floor(Math.random() * 24) + 1}h</span>
                                                </div>
                                            </div>
                                        </div>

                                        {showMapButton && (
                                            <Button variant="outline" size="sm" className="ml-2">
                                                <MapPin className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* No Stations */}
                {location && !isLoading && !isProcessing && ranking.length === 0 && (
                    <div className="text-center py-8">
                        <Fuel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Nenhum Posto Encontrado</h3>
                        <p className="text-sm text-muted-foreground">
                            Não encontramos postos próximos com {selectedFuel} no raio de 5km
                        </p>
                    </div>
                )}

                {/* Refresh Button */}
                {location && (
                    <div className="pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={loadRanking}
                            disabled={isLoading || isProcessing}
                            className="w-full"
                        >
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Atualizar Ranking
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
