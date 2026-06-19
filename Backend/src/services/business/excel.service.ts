import * as xlsx from 'xlsx';

export function generateKurExcelBuffer(reportData: any): Buffer {
    const wb = xlsx.utils.book_new();

    // --- Sheet 1: Ringkasan Bulanan ---
    const summaryData = [
        ["Laporan Keuangan Bulanan"],
        [],
        ["Nama Usaha", reportData.business_name || "Tidak Diketahui"],
        ["Jenis Usaha", reportData.business_type],
        ["Periode Laporan", reportData.period],
        ["Tanggal Diunduh", new Date(reportData.report_generated_at).toLocaleString('id-ID')],
        [],
        ["--- RINGKASAN ---", ""],
        ["Total Pemasukan", reportData.summary.total_income],
        ["Total Pengeluaran", reportData.summary.total_expense],
        ["Laba Bersih", reportData.summary.gross_profit],
        ["Margin Laba Bersih (%)", reportData.summary.gross_margin_pct],
        ["Total Hari Mencatat", reportData.summary.recording_days],
        ["Tingkat Konsistensi (%)", reportData.summary.consistency_pct]
    ];

    const wsSummary = xlsx.utils.aoa_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(wb, wsSummary, "Ringkasan Bulanan");

    // --- Sheet 2: Detail Harian ---
    const dailyData = [
        ["Tanggal", "Pemasukan", "Pengeluaran", "Laba Bersih"]
    ];

    for (const d of reportData.daily_breakdown) {
        dailyData.push([
            d.date,
            d.income,
            d.expense,
            d.profit
        ]);
    }

    const wsDaily = xlsx.utils.aoa_to_sheet(dailyData);
    xlsx.utils.book_append_sheet(wb, wsDaily, "Detail Harian");

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
}
