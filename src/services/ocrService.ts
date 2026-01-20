import Tesseract from 'tesseract.js';

export interface OCRResult {
    text: string;
    confidence: number;
    extractedData?: {
        odometer?: number;
        liters?: number;
        pricePerLiter?: number;
        total?: number;
        date?: string;
    };
}

export class OCRService {
    private static instance: OCRService;

    static getInstance(): OCRService {
        if (!OCRService.instance) {
            OCRService.instance = new OCRService();
        }
        return OCRService.instance;
    }

    async extractTextFromImage(imageData: string): Promise<OCRResult> {
        try {
            const result = await Tesseract.recognize(
                imageData,
                'por', // Português brasileiro
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            console.log(`Progresso OCR: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                }
            );

            const extractedData = this.extractStructuredData(result.data.text);

            return {
                text: result.data.text,
                confidence: result.data.confidence,
                extractedData
            };
        } catch (error) {
            console.error('Erro no OCR:', error);
            throw new Error('Falha ao processar imagem com OCR');
        }
    }

    private extractStructuredData(text: string): OCRResult['extractedData'] {
        const data: OCRResult['extractedData'] = {};

        // Extrair odômetro (padrões: 123.456 km, 123456, ODO: 123456)
        const odometerPatterns = [
            /(\d{1,3}[.,]?\d{3})\s*km/i,
            /odo[:\s]*(\d{1,3}[.,]?\d{3})/i,
            /odômetro[:\s]*(\d{1,3}[.,]?\d{3})/i,
            /(\d{5,7})/
        ];

        for (const pattern of odometerPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.odometer = parseInt(match[1].replace(/[.,]/g, ''));
                break;
            }
        }

        // Extrair litros (padrões: 45,23 L, 45.23, Litros: 45,23)
        const litersPatterns = [
            /(\d+[.,]\d{2})\s*l/i,
            /litros?[:\s]*(\d+[.,]\d{2})/i,
            /(\d{2,3}[.,]\d{2})/
        ];

        for (const pattern of litersPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.liters = parseFloat(match[1].replace(',', '.'));
                break;
            }
        }

        // Extrair preço por litro (padrões: R$ 5,89, 5.89, Preço: 5,89)
        const pricePatterns = [
            /r?\$?\s*(\d+[.,]\d{2})\s*\/l/i,
            /preço[:\s]*(\d+[.,]\d{2})/i,
            /(\d,\d{2})/
        ];

        for (const pattern of pricePatterns) {
            const match = text.match(pattern);
            if (match) {
                data.pricePerLiter = parseFloat(match[1].replace(',', '.'));
                break;
            }
        }

        // Extrair total (padrões: R$ 250,00, Total: 250,00)
        const totalPatterns = [
            /total[:\s]*r?\$?\s*(\d+[.,]\d{2})/i,
            /r?\$?\s*(\d+[.,]\d{2})\s*(?=total|valor)/i,
            /(\d{3}[.,]\d{2})/
        ];

        for (const pattern of totalPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.total = parseFloat(match[1].replace(',', '.'));
                break;
            }
        }

        // Extrair data (padrões: 15/01/2024, 15-01-2024, 15.01.2024)
        const datePatterns = [
            /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/,
            /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2})/
        ];

        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                data.date = match[1];
                break;
            }
        }

        return data;
    }

    async extractFromReceipt(imageData: string): Promise<OCRResult> {
        const result = await this.extractTextFromImage(imageData);

        // Para recibos, focar em valores e datas
        const receiptData = this.extractReceiptData(result.text);

        return {
            ...result,
            extractedData: {
                ...result.extractedData,
                ...receiptData
            }
        };
    }

    async extractFromPump(imageData: string): Promise<OCRResult> {
        const result = await this.extractTextFromImage(imageData);

        // Para bombas, focar em litros e preço
        const pumpData = this.extractPumpData(result.text);

        return {
            ...result,
            extractedData: {
                ...result.extractedData,
                ...pumpData
            }
        };
    }

    async extractFromOdometer(imageData: string): Promise<OCRResult> {
        const result = await this.extractTextFromImage(imageData);

        // Para odômetro, focar apenas na quilometragem
        const odometerData = this.extractOdometerData(result.text);

        return {
            ...result,
            extractedData: odometerData
        };
    }

    private extractReceiptData(text: string): OCRResult['extractedData'] {
        const data: OCRResult['extractedData'] = {};

        // Padrões específicos para recibos
        const totalMatch = text.match(/total.*?r?\$?\s*(\d+[.,]\d{2})/i);
        if (totalMatch) {
            data.total = parseFloat(totalMatch[1].replace(',', '.'));
        }

        const litersMatch = text.match(/(\d+[.,]\d{2})\s*l/i);
        if (litersMatch) {
            data.liters = parseFloat(litersMatch[1].replace(',', '.'));
        }

        return data;
    }

    private extractPumpData(text: string): OCRResult['extractedData'] {
        const data: OCRResult['extractedData'] = {};

        // Padrões específicos para bombas
        const litersMatch = text.match(/(\d+[.,]\d{2})\s*l/i);
        if (litersMatch) {
            data.liters = parseFloat(litersMatch[1].replace(',', '.'));
        }

        const priceMatch = text.match(/(\d+[.,]\d{2})\s*\/l/i);
        if (priceMatch) {
            data.pricePerLiter = parseFloat(priceMatch[1].replace(',', '.'));
        }

        return data;
    }

    private extractOdometerData(text: string): OCRResult['extractedData'] {
        const data: OCRResult['extractedData'] = {};

        // Padrões específicos para odômetro
        const odometerMatch = text.match(/(\d{5,7})/);
        if (odometerMatch) {
            data.odometer = parseInt(odometerMatch[1]);
        }

        return data;
    }
}
