const api = '/api';
const selects = {
    countries: document.getElementById('countries'),
    cities: document.getElementById('cities'),
    districts: document.getElementById('districts'),
    timezone: document.getElementById('timezone')
};

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

async function loadCountries() {
    try {
        selects.countries.innerHTML = '<option value="">Yükleniyor... (Ülke seçiniz)</option>';
        const countries = await fetchData(`${api}/ulkeler`);
        selects.countries.innerHTML = '<option value="">Ülke seçiniz...</option>' +
            countries.map(country =>
                `<option value="${country.UlkeID}">${country.UlkeAdi}</option>`
            ).join('');
        selects.countries.disabled = false;
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

selects.countries.addEventListener('change', async (e) => {
    if (!e.target.value) return;
    document.getElementById('cityFeedback').textContent = '';
    selects.cities.innerHTML = '<option value="">Yükleniyor... (Şehir seçiniz)</option>';
    selects.cities.disabled = true;
    selects.cities.style.display = 'block';
    try {
        const cities = await fetchData(`${api}/sehirler/${e.target.value}`);
        if (cities.length === 1) {
            selects.cities.style.display = 'none';
            document.getElementById('cityFeedback').textContent = `Otomatik seçildi: ${cities[0].SehirAdi}`;
            loadDistricts(cities[0].SehirID);
        } else {
            selects.cities.innerHTML = '<option value="">Şehir seçiniz...</option>' +
                cities.map(city =>
                    `<option value="${city.SehirID}">${city.SehirAdi}</option>`
                ).join('');
            selects.cities.disabled = false;
        }
    } catch (error) {
        console.error('Error loading cities:', error);
    }
});

async function loadDistricts(cityId) {
    document.getElementById('districtFeedback').textContent = '';
    selects.districts.innerHTML = '<option value="">Yükleniyor... (İlçe seçiniz)</option>';
    selects.districts.disabled = true;
    try {
        const districts = await fetchData(`${api}/ilceler/${cityId}`);
        if (districts.length === 1) {
            selects.districts.style.display = 'none';
            document.getElementById('districtFeedback').textContent = `Otomatik seçildi: ${districts[0].IlceAdi}`;
            createCalendarLinks(districts[0].IlceID);
        } else {
            selects.districts.innerHTML = '<option value="">İlçe seçiniz...</option>' +
                districts.map(district =>
                    `<option value="${district.IlceID}">${district.IlceAdi}</option>`
                ).join('');
            selects.districts.disabled = false;
            selects.districts.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading districts:', error);
    }
}

selects.cities.addEventListener('change', async (e) => {
    if (!e.target.value) return;
    loadDistricts(e.target.value);
});

function createCalendarLinks(districtId) {
    const timezone = encodeURIComponent(selects.timezone.value);
    const calendarLinks = document.getElementById('calendarLinks');
    const isYearlyPrayerTimes = document.getElementById('yearlyPrayerTimes').checked;
    const baseUrl = isYearlyPrayerTimes
        ? `${api}/vakti/${districtId}/${timezone}/yillik`
        : `${api}/vakti/${districtId}/${timezone}`;
    const fullUrl = `${window.location.protocol}//${window.location.host}${baseUrl}`;

    if (isYearlyPrayerTimes) {
        calendarLinks.innerHTML = `
                    <a href="${baseUrl}" target="_blank" class="download">
                        Yıllık Vakitleri İndir
                    </a>
                `;
    } else {
        calendarLinks.innerHTML = `
                    <a href="${baseUrl}" target="_blank" class="download">
                        Takvimi İndir
                    </a>
                    <a href="webcal://${window.location.host}${baseUrl}" class="subscribe">
                        Takvime Abone Ol
                    </a>
                `;
    }

    calendarLinks.style.display = 'block';

    // Only show URL display for non-yearly prayer times
    const urlDisplay = document.getElementById('urlDisplay');
    if (!isYearlyPrayerTimes) {
        urlDisplay.innerHTML = `
                    Takvim URL'i:
                    <div class="url-display">
                        ${fullUrl}
                    </div>
                `;
        urlDisplay.style.display = 'block';
    } else {
        urlDisplay.style.display = 'none';
    }
}

selects.districts.addEventListener('change', (e) => {
    if (!e.target.value) return;
    createCalendarLinks(e.target.value);
});

function populateTimezones() {
    const timezoneSelect = selects.timezone;
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get all timezone options
    const timezonesRaw = Intl.supportedValuesOf('timeZone');

    // Create timezone objects with readable names
    const timezones = timezonesRaw.map(zone => {
        try {
            const readable = new Date().toLocaleString('tr-TR', { timeZone: zone, timeZoneName: 'long' });
            return { id: zone, name: `${zone} (${readable.split(' ').pop()})` };
        } catch (e) {
            return { id: zone, name: zone };
        }
    });

    // Sort timezones, putting the current timezone first
    timezones.sort((a, b) => {
        if (a.id === currentTimezone) return -1;
        if (b.id === currentTimezone) return 1;
        return a.name.localeCompare(b.name);
    });

    timezoneSelect.innerHTML = timezones.map(tz =>
        `<option value="${tz.id}" ${tz.id === currentTimezone ? 'selected' : ''}>${tz.name}</option>`
    ).join('');
}

selects.timezone.addEventListener('change', () => {
    const districtsSelect = selects.districts;
    if (districtsSelect.value) {
        createCalendarLinks(districtsSelect.value);
    }
});

document.getElementById('yearlyPrayerTimes').addEventListener('change', () => {
    const districtsSelect = selects.districts;
    if (districtsSelect.value) {
        createCalendarLinks(districtsSelect.value);
    }
});

populateTimezones();
loadCountries();