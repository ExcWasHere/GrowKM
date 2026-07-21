import { EnvBindings } from '../../types/env';
import { askAIJson } from '../../utils/ai.util';

const SYSTEM_PROMPT = `Kamu adalah validator usaha UMKM Indonesia.
Tugasmu menilai apakah deskripsi produk atau jasa yang diberikan cukup jelas untuk menentukan kode KBLI (Klasifikasi Baku Lapangan Usaha Indonesia).

Kriteria deskripsi yang CUKUP JELAS:
1. Jenis produk atau jasa yang dijual disebutkan secara spesifik
2. Ada gambaran cara kerja, proses, atau segmen yang dilayani
3. Tidak terlalu generik (contoh buruk: "jual makanan", "jasa online", "dagang barang")

Berikan respons HANYA dalam format JSON, tanpa teks tambahan apapun:
- Jika cukup jelas: { "is_valid": true }
- Jika kurang jelas: { "is_valid": false, "feedback": "<1-2 kalimat: sebutkan apa yang kurang, lalu minta user melengkapi bagian tersebut. Gunakan Bahasa Indonesia informal dan to the point.>" }`;

export const validateDescription = async (
    description: string,
    env: Partial<EnvBindings>,
): Promise<{ is_valid: boolean; feedback?: string }> => {
    try {
        return await askAIJson<{ is_valid: boolean; feedback?: string }>(
            env,
            SYSTEM_PROMPT,
            `Deskripsi usaha: "${description}"`,
            0.1,
            150
        );
    } catch {
        return { is_valid: true };
    }
};
