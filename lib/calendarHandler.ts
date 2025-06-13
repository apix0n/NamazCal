import ical, { ICalEventData } from 'ical-generator';
import moment from 'moment-timezone';

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
    const calendar = ical({
        name: 'Namaz Vakitleri',
        prodId: 'apix/NamazCal',
    });

    data.forEach(vakti => {
        const events = createDayEvents(vakti, timezone);
        events.forEach(event => calendar.createEvent(event));
    });

    return calendar.toString();
}

function createDayEvents(vakti: Vakti, timezone: string): ICalEventData[] {
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
        const startTime = moment.tz(
            `${datePart} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
            'YYYY-MM-DD HH:mm',
            timezone
        );

        const endTime = startTime.clone().add(30, 'minutes');

        return {
            summary: prayer.name,
            start: startTime.toDate(),
            end: endTime.toDate(),
            id: `${startTime.format("YYYY-MM-DD-HHMM")}`
        };
    });
}