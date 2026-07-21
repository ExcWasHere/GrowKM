import { EnvBindings } from '../../types/env';
import { askAIJson } from '../../utils/ai.util';

export interface ParsedReceipt {
    merchant_name: string | null;
    total_amount: number;
    record_date: string | null;
    items: string[];
}

const RECEIPT_PROMPT = `Kamu adalah AI ahli akuntansi UMKM.
Tugas: Ekstrak informasi dari gambar nota/struk berikut ke dalam format JSON.
Aturan:
1. "merchant_name": Nama toko (null jika tidak terbaca).
2. "total_amount": Total akhir pembelanjaan dalam angka (wajib). Hapus tanda Rp/titik.
3. "record_date": Tanggal transaksi YYYY-MM-DD (null jika tidak ada).
4. "items": Array string dari barang-barang yang dibeli (opsional).

Format JSON WAJIB:
{
  "merchant_name": "Toko Abc",
  "total_amount": 50000,
  "record_date": "2026-07-21",
  "items": ["Beras 5kg", "Minyak Goreng"]
}`;

export const visionService = {
    async parseReceiptFromUrl(env: Partial<EnvBindings>, imageUrls: string[], userMessage: string): Promise<ParsedReceipt> {

        const visionPayload: any[] = [                                                                                                                                                                 
            { 
                type: "text", 
                text: `Catatan User: "${userMessage}"\n\nEkstrak transaksi dari gambar di bawah ini.`
            }                                                                                    
            ];  

        for (const url of imageUrls) {
            visionPayload.push({
                type: "image_url",
                image_url: {url: url}
            });
        }

        const result = await askAIJson<ParsedReceipt>(
            env,
            RECEIPT_PROMPT,
            visionPayload,
        );

        if (!result.total_amount || isNaN(result.total_amount)) {
            throw new Error('Failed to parse total_amount from receipt. Please ensure the receipt image is clear and contains a valid total amount.');
        }

        return result;
    }
}
