export function calculateDistance(coord1: L.LatLngTuple, coord2: L.LatLngTuple) {
    const R = 6371;

    const lat1 = toRadians(coord1[0]);
    const lon1 = toRadians(coord1[1]);
    const lat2 = toRadians(coord2[0]);
    const lon2 = toRadians(coord2[1]);

    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a =
        Math.sin(dlat / 2) * Math.sin(dlat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return parseFloat(distance.toFixed(2));
}

export function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
}

export function getTodaysDate() {
    const today = new Date();

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);

    return `${dd}/${mm}/${yy}`;
}

export function isValidDate(dateString: string) {
    const dateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return false;
    }
    const [day, month, year] = dateString.split('/').map(Number);
    const currentYear = new Date().getFullYear() % 100;
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < currentYear) {
        return false;
    }
    const date = new Date(year + 2000, month - 1, day);
    return (
        date.getFullYear() === year + 2000 &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

export function compareDates(dateString1: string, dateString2: string): number {
    const [day1, month1, year1] = dateString1.split('/').map(Number);
    const [day2, month2, year2] = dateString2.split('/').map(Number);

    const date1 = new Date(year1 + 2000, month1 - 1, day1);
    const date2 = new Date(year2 + 2000, month2 - 1, day2);

    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        console.error("Invalid date strings");
        return 0;
    }

    if (date1 < date2) {
        return -1;
    } else if (date1 > date2) {
        return 1;
    } else {
        return 0;
    }
}

export function getNumberOfDays(startDateStr: string, endDateStr: string): number {
    const [day1, month1, year1] = startDateStr.split('/').map(Number);
    const [day2, month2, year2] = endDateStr.split('/').map(Number);

    const startDate = new Date(year1 + 2000, month1 - 1, day1);
    const endDate = new Date(year2 + 2000, month2 - 1, day2);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid date strings");
        return 0;
    }
    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.floor(daysDifference);
}