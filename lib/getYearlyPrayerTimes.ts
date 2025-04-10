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
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`${baseUrl}${cityId}`)}`, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'tr,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        if (!html) {
            throw new Error('Empty response received');
        }

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