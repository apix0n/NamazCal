const endpoints = [
    {
        "countries": "https://ezanvakti.metinsevindik.net/ulkeler",
        "cities": "https://ezanvakti.metinsevindik.net/sehirler/",
        "districts": "https://ezanvakti.metinsevindik.net/ilceler/",
        "prayers": "https://ezanvakti.metinsevindik.net/vakitler/"
    },
    {
        "countries": "https://ezanvakti.emushaf.net/ulkeler",
        "cities": "https://ezanvakti.emushaf.net/sehirler/",
        "districts": "https://ezanvakti.emushaf.net/ilceler/",
        "prayers": "https://ezanvakti.emushaf.net/vakitler/"
    },
    {
        "countries": "http://api.ezansaatim.com/ulkeler",
        "cities": "http://api.ezansaatim.com/sehirler?ulke=",
        "districts": "http://api.ezansaatim.com/ilceler?sehir=",
        "prayers": "http://api.ezansaatim.com/vakitler?ilce="
    }
]

export const endpointsCount = endpoints.length

export async function fetchPrayerTimesForCity(id: number, endpoint: number = 0) {
    try {
        const response = await fetch(endpoints[endpoint].prayers + id);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        throw error;
    }
}

export async function fetchCountries(endpoint: number = 0) {
    try {
        const response = await fetch(endpoints[endpoint].countries);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw error;
    }
}

export async function fetchCities(countryId: number, endpoint: number = 0) {
    try {
        const response = await fetch(endpoints[endpoint].cities + countryId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
    }
}

export async function fetchDistricts(cityId: number, endpoint: number = 0) {
    try {
        const response = await fetch(endpoints[endpoint].districts + cityId);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching districts:', error);
        throw error;
    }
}