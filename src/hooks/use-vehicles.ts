import { useState, useEffect } from 'react';

export type Vehicle = {
    id: string;
    name: string;
    plate: string;
    year: number;
    fuelType: string;
    color?: string;
    isDefault: boolean;
    createdAt: string;
};

const STORAGE_KEY = 'econodrive_vehicles';

export function useVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load from localStorage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Vehicle[];
                setVehicles(parsed);
            } else {
                // Set default vehicles if none exist
                const defaultVehicles: Vehicle[] = [
                    {
                        id: '1',
                        name: 'Honda Civic',
                        plate: 'ABC-1234',
                        year: 2022,
                        fuelType: 'Flex',
                        color: 'Preto',
                        isDefault: true,
                        createdAt: new Date().toISOString(),
                    },
                ];
                setVehicles(defaultVehicles);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVehicles));
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
            setVehicles([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveVehicles = (newVehicles: Vehicle[]) => {
        setVehicles(newVehicles);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newVehicles));
    };

    const createVehicle = (data: Omit<Vehicle, 'id' | 'createdAt' | 'isDefault'>) => {
        const newVehicle: Vehicle = {
            ...data,
            id: Date.now().toString(),
            isDefault: vehicles.length === 0,
            createdAt: new Date().toISOString(),
        };

        const updated = [...vehicles, newVehicle];
        saveVehicles(updated);
        return newVehicle;
    };

    const updateVehicle = (id: string, data: Partial<Vehicle>) => {
        const updated = vehicles.map(v =>
            v.id === id ? { ...v, ...data } : v
        );
        saveVehicles(updated);
        return updated.find(v => v.id === id);
    };

    const deleteVehicle = (id: string) => {
        const updated = vehicles.filter(v => v.id !== id);
        // If we deleted the default, make the first one default
        if (updated.length > 0 && vehicles.find(v => v.id === id)?.isDefault) {
            updated[0].isDefault = true;
        }
        saveVehicles(updated);
    };

    const setDefaultVehicle = (id: string) => {
        const updated = vehicles.map(v => ({
            ...v,
            isDefault: v.id === id,
        }));
        saveVehicles(updated);
    };

    const defaultVehicle = vehicles.find(v => v.isDefault) || vehicles[0];

    return {
        vehicles,
        isLoading,
        defaultVehicle,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        setDefaultVehicle,
    };
}
