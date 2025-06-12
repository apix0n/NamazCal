import { createEvents } from 'ics'
import moment from 'moment-timezone'

export interface Vakti {
    Imsak: string;
    Gunes: string;
    Ogle: string;
    Ikindi: string;
    Aksam: string;
    Yatsi: string;
    MiladiTarihUzunIso8601: string;
    [key: string]: string;
}

export function createCalendarFromVakti(data: Array<Vakti>, timezone: string) {
    const events = data.flatMap(vakti => createDayEvents(vakti, timezone));
    const { error, value } = createEvents(events, {
        calName: "Namaz Vakitleri",
        productId: "apix/namazVakitleri"
    });

    if (error) {
        throw error;
    }

    return value;
}

function createDayEvents(vakti: Vakti, timezone: string) {
    const [datePart] = vakti.MiladiTarihUzunIso8601.split('T');

    const prayers = [
        { name: 'Sabah Namazı / İmsak', time: vakti.Imsak },
        { name: 'Güneş', time: vakti.Gunes },
        { name: 'Öğle Namazı', time: vakti.Ogle },
        { name: 'İkindi Namazı', time: vakti.Ikindi },
        { name: 'Akşam Namazı', time: vakti.Aksam },
        { name: 'Yatsı Namazı', time: vakti.Yatsi }
    ];

    return prayers.map(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        
        // Create moment object in the specified timezone
        const prayerTime = moment.tz(
            `${datePart} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
            'YYYY-MM-DD HH:mm',
            timezone
        );

        // Convert to UTC
        const utcTime = prayerTime.utc();

        return {
            title: prayer.name,
            start: [
                utcTime.year(),
                utcTime.month() + 1, // moment months are 0-based
                utcTime.date(),
                utcTime.hours(),
                utcTime.minutes()
            ] as [number, number, number, number, number],
            duration: { minutes: 30 },
            startInputType: 'utc' as 'utc',
        };
    });
}