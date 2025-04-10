import * as cheerio from 'cheerio';
import type { Vakti } from "./calendarHandler"

const baseUrl = "https://namazvakitleri.diyanet.gov.tr/tr-TR/"

const turkishMonths: { [key: string]: string } = {
    'Ocak': '01',
    'Şubat': '02',
    'Mart': '03',
    'Nisan': '04',
    'Mayıs': '05',
    'Haziran': '06',
    'Temmuz': '07',
    'Ağustos': '08',
    'Eylül': '09',
    'Ekim': '10',
    'Kasım': '11',
    'Aralık': '12'
};

function convertTurkishDateToISO(turkishDate: string): string {
    // Example input: "01 Ocak 2025 Çarşamba"
    const [day, month, year] = turkishDate.split(' ');
    const monthNum = turkishMonths[month];
    return `${year}-${monthNum}-${day.padStart(2, '0')}T00:00:00.0000000+03:00`;
}

export async function fetchYearlyPrayerTimesForCity(cityId: number): Promise<Vakti[]> {
    try {
        const response = await fetch(`${baseUrl}${cityId}`);

        console.log(response)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const prayerTimes: Vakti[] = [];

        $('#yourTable tbody tr').each((_, row) => {
            const columns = $(row).find('td');

            if (columns.length == 8) {
                const prayerTime: Vakti = {
                    Imsak: $(columns[2]).text().trim(),
                    Gunes: $(columns[3]).text().trim(),
                    Ogle: $(columns[4]).text().trim(),
                    Ikindi: $(columns[5]).text().trim(),
                    Aksam: $(columns[6]).text().trim(),
                    Yatsi: $(columns[7]).text().trim(),
                    MiladiTarihUzunIso8601: convertTurkishDateToISO($(columns[0]).text().trim())
                };
                prayerTimes.push(prayerTime);
            }
        });

        return prayerTimes;
    } catch (error) {
        console.error('Error fetching yearly prayer times:', error);
        throw error;
    }
}