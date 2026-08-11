/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';

  const MINUTES_PER_DAY = 24 * 60;
  const MONTHS_PER_YEAR = 11;
  const DAYS_PER_MONTH = 30;
  const CIVIL_DAYS_PER_YEAR = MONTHS_PER_YEAR * DAYS_PER_MONTH;
  const LEAP_INTERVAL_YEARS = 7;
  const ASTRONOMICAL_DAYS_PER_YEAR = 330.15;
  const EARTH_DAYS_PER_EQUIVALENT_YEAR = 365.2422;

  const DEFAULT_MERIDIANS = [
    { longitude: -180, label: '180° W / −180°', name: "Thalunesh's Reversed Track", utcOffsetMinutes: -720 },
    { longitude: -150, label: '150° W', name: "Freyseth's Crossroads Meridian", utcOffsetMinutes: -600 },
    { longitude: -120, label: '120° W', name: "Nefarokir's Funeral Meridian", utcOffsetMinutes: -480 },
    { longitude: -90, label: '90° W', name: "Eirzunet's Shadow Meridian", utcOffsetMinutes: -360 },
    { longitude: -60, label: '60° W', name: "Bastveig's Tidegate Meridian", utcOffsetMinutes: -240 },
    { longitude: -30, label: '30° W', name: "Horundar's Storm Meridian", utcOffsetMinutes: -120 },
    { longitude: 0, label: '0°', name: 'UTC', utcOffsetMinutes: 0 },
    { longitude: 30, label: '30° E', name: "Raeshkul's Calculation Meridian", utcOffsetMinutes: 120 },
    { longitude: 60, label: '60° E', name: "Sokhivar's Sunroad Meridian", utcOffsetMinutes: 240 },
    { longitude: 90, label: '90° E', name: "Ishtanora's Hearth Meridian", utcOffsetMinutes: 360 },
    { longitude: 120, label: '120° E', name: "Marduthor's Deepforge Meridian", utcOffsetMinutes: 480 },
    { longitude: 150, label: '150° E', name: "Valkhamesh's Thunder Meridian", utcOffsetMinutes: 600 }
  ];

  const DEFAULT_PARALLELS = [
    { latitude: 60, label: '60° N', name: "Fleysetl's Northern Underworld Gate" },
    { latitude: 25, label: '25° N', name: "Raeshkul's Thoughtline" },
    { latitude: 0, label: '0°', name: 'Equator' },
    { latitude: -30, label: '30° S', name: "Bastveg's Deepwater Passage" },
    { latitude: -65, label: '65° S', name: "Thoryn-Rahek's Southern Underworld Gate" }
  ];

  const DAYPARTS = [
    { id: 'deep-night', name: 'Deep Night', start: 0, end: 4, visibility: 'dark', scheduleState: 'sleep cycle, night watch, covert movement, or nocturnal activity', tags: ['darkness', 'reduced-civilian-traffic', 'night-watch'] },
    { id: 'dawn', name: 'Dawn', start: 4, end: 7, visibility: 'dim-to-growing', scheduleState: 'watch change, opening gates, early labor, prayer, and departing travelers', tags: ['watch-change', 'opening-routines', 'low-angle-light'] },
    { id: 'morning', name: 'Morning', start: 7, end: 12, visibility: 'daylight', scheduleState: 'markets, work shifts, travel, patrols, and public services becoming active', tags: ['public-activity', 'commerce', 'travel'] },
    { id: 'midday', name: 'Midday', start: 12, end: 14, visibility: 'bright', scheduleState: 'peak public movement, meals, exchanges, and exposed travel', tags: ['crowds', 'high-visibility', 'shift-overlap'] },
    { id: 'afternoon', name: 'Afternoon', start: 14, end: 18, visibility: 'daylight', scheduleState: 'active work, return journeys, deliveries, and institutional business', tags: ['work-cycle', 'deliveries', 'return-travel'] },
    { id: 'dusk', name: 'Dusk', start: 18, end: 21, visibility: 'fading', scheduleState: 'closing gates and shops, returning workers, evening rites, and predators becoming active', tags: ['closing-routines', 'watch-change', 'fading-light'] },
    { id: 'night', name: 'Night', start: 21, end: 24, visibility: 'dark', scheduleState: 'reduced public access, guarded routes, nightlife, smuggling, and nocturnal movement', tags: ['darkness', 'limited-services', 'night-patrols'] }
  ];

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, number(value, minimum)));
  }

  function isLeapYear(year) {
    const safe = Math.max(1, Math.trunc(number(year, 1)));
    return safe % LEAP_INTERVAL_YEARS === 0;
  }

  function daysInYear(year) {
    return CIVIL_DAYS_PER_YEAR + (isLeapYear(year) ? 1 : 0);
  }

  function daysBeforeYear(year) {
    const prior = Math.max(0, Math.trunc(number(year, 1)) - 1);
    return prior * CIVIL_DAYS_PER_YEAR + Math.floor(prior / LEAP_INTERVAL_YEARS);
  }

  function normalizeDate(value = {}) {
    const year = Math.max(1, Math.trunc(number(value.year, 1)));
    const leapDay = Boolean(value.leapDay || value.intercalaryDay);
    if (leapDay && !isLeapYear(year)) throw new Error(`Universal year ${year} is not a leap year; the intercalary leap day is unavailable.`);
    const month = leapDay ? 11 : Math.trunc(clamp(value.month, 1, MONTHS_PER_YEAR));
    const day = leapDay ? 30 : Math.trunc(clamp(value.day, 1, DAYS_PER_MONTH));
    const hour = Math.trunc(clamp(value.hour, 0, 23));
    const minute = Math.trunc(clamp(value.minute, 0, 59));
    return { year, month, day, hour, minute, leapDay };
  }

  function dateToAbsoluteMinutes(value) {
    const date = normalizeDate(value);
    const dayOfYear = date.leapDay ? CIVIL_DAYS_PER_YEAR : ((date.month - 1) * DAYS_PER_MONTH + (date.day - 1));
    return (daysBeforeYear(date.year) + dayOfYear) * MINUTES_PER_DAY + date.hour * 60 + date.minute;
  }

  function absoluteMinutesToDate(value) {
    let total = Math.max(0, Math.trunc(number(value, 0)));
    const absoluteDay = Math.floor(total / MINUTES_PER_DAY);
    const minuteOfDay = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    let year = Math.max(1, Math.floor(absoluteDay / (CIVIL_DAYS_PER_YEAR + 1 / LEAP_INTERVAL_YEARS)) + 1);
    while (daysBeforeYear(year + 1) <= absoluteDay) year += 1;
    while (daysBeforeYear(year) > absoluteDay) year -= 1;
    const dayOfYear = absoluteDay - daysBeforeYear(year);
    const leapDay = isLeapYear(year) && dayOfYear === CIVIL_DAYS_PER_YEAR;
    const month = leapDay ? 11 : Math.floor(dayOfYear / DAYS_PER_MONTH) + 1;
    const day = leapDay ? 30 : (dayOfYear % DAYS_PER_MONTH) + 1;
    return {
      year,
      month,
      day,
      hour: Math.floor(minuteOfDay / 60),
      minute: minuteOfDay % 60,
      leapDay
    };
  }

  function addMinutes(value, minutes) {
    return absoluteMinutesToDate(dateToAbsoluteMinutes(value) + Math.trunc(number(minutes, 0)));
  }

  function offsetLabel(minutes) {
    const safe = Math.trunc(number(minutes, 0));
    if (safe === 0) return 'UTC';
    const sign = safe < 0 ? '−' : '+';
    const absolute = Math.abs(safe);
    const hours = Math.floor(absolute / 60);
    const remainder = absolute % 60;
    return `UTC${sign}${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }

  function formatDate(value) {
    const date = normalizeDate(value);
    const dayText = date.leapDay ? 'Intercalary Leap Day' : `Month ${date.month}, Day ${date.day}`;
    return `Year ${date.year}, ${dayText}, ${String(date.hour).padStart(2, '0')}:${String(date.minute).padStart(2, '0')}`;
  }

  function nearestByCoordinate(values, coordinate, key) {
    if (!values.length || !Number.isFinite(Number(coordinate))) return null;
    return values.reduce((best, entry) => Math.abs(number(entry[key]) - number(coordinate)) < Math.abs(number(best[key]) - number(coordinate)) ? entry : best, values[0]);
  }

  function daypartFor(hour) {
    const safe = ((Math.trunc(number(hour, 0)) % 24) + 24) % 24;
    return DAYPARTS.find((entry) => safe >= entry.start && safe < entry.end) || DAYPARTS[0];
  }

  function parseOffset(value, unit = 'auto') {
    if (value === '' || value == null || value === 'inherit' || value === 'auto') return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;
    const asMinutes = unit === 'hours' ? parsed * 60 : unit === 'minutes' ? parsed : (Math.abs(parsed) <= 24 ? parsed * 60 : parsed);
    return Math.trunc(clamp(asMinutes, -720, 720));
  }

  function firstOffset(...values) {
    return values.find((value) => value !== null && value !== undefined) ?? null;
  }

  class TimeSystem {
    constructor(config = {}) {
      this.config = config || {};
      this.meridians = config.world_clock?.coordinate_lines?.meridians || config.coordinate_lines?.meridians || DEFAULT_MERIDIANS;
      this.parallels = config.world_clock?.coordinate_lines?.parallels || config.coordinate_lines?.parallels || DEFAULT_PARALLELS;
      this.dayparts = config.world_clock?.encounter_dayparts || DAYPARTS;
    }

    offsetFromLongitude(longitude) {
      if (!Number.isFinite(Number(longitude))) return 0;
      return Math.trunc(clamp(Math.round(number(longitude) / 15) * 60, -720, 720));
    }

    resolveZone(location = {}) {
      const settlementOffset = firstOffset(
        parseOffset(location.settlementUtcOffsetMinutes, 'minutes'),
        parseOffset(location.settlementUtcOffsetHours, 'hours'),
        parseOffset(location.settlementOffset, 'auto')
      );
      const provinceOffset = firstOffset(
        parseOffset(location.provinceUtcOffsetMinutes, 'minutes'),
        parseOffset(location.provinceUtcOffsetHours, 'hours'),
        parseOffset(location.provinceOffset, 'auto')
      );
      const explicitOffset = firstOffset(
        parseOffset(location.utcOffsetMinutes, 'minutes'),
        parseOffset(location.utcOffsetHours, 'hours'),
        parseOffset(location.timezoneOffset, 'auto')
      );
      const longitude = Number.isFinite(Number(location.longitude)) ? Number(location.longitude) : null;
      let offsetMinutes = 0;
      let source = 'utc';
      if (settlementOffset !== null) { offsetMinutes = settlementOffset; source = 'settlement'; }
      else if (provinceOffset !== null) { offsetMinutes = provinceOffset; source = 'province'; }
      else if (explicitOffset !== null) { offsetMinutes = explicitOffset; source = 'explicit'; }
      else if (longitude !== null) { offsetMinutes = this.offsetFromLongitude(longitude); source = 'longitude'; }
      const nearestMeridian = nearestByCoordinate(this.meridians, longitude, 'longitude');
      const nearestParallel = nearestByCoordinate(this.parallels, location.latitude, 'latitude');
      return {
        id: location.timezoneId || `${source}-${offsetMinutes}`,
        source,
        offsetMinutes,
        offsetHours: offsetMinutes / 60,
        label: offsetLabel(offsetMinutes),
        noDaylightSavingTime: true,
        nearestMeridian,
        nearestParallel,
        settlementOverridesProvince: settlementOffset !== null && provinceOffset !== null && settlementOffset !== provinceOffset,
        provinceOffsetMinutes: provinceOffset,
        settlementOffsetMinutes: settlementOffset
      };
    }

    resolveWorldTime(value = {}, location = {}) {
      const utc = normalizeDate(value.utc || value.worldUtc || value);
      const zone = this.resolveZone(location);
      const local = addMinutes(utc, zone.offsetMinutes);
      const daypart = daypartFor(local.hour);
      return {
        utc,
        local,
        zone,
        daypart,
        utcLabel: `${formatDate(utc)} UTC`,
        localLabel: `${formatDate(local)} ${zone.label}`,
        calendar: {
          monthsPerYear: MONTHS_PER_YEAR,
          daysPerMonth: DAYS_PER_MONTH,
          civilDaysPerCommonYear: CIVIL_DAYS_PER_YEAR,
          leapIntervalYears: LEAP_INTERVAL_YEARS,
          leapYear: isLeapYear(local.year),
          astronomicalDaysPerYear: ASTRONOMICAL_DAYS_PER_YEAR,
          earthEquivalentDaysPerYear: EARTH_DAYS_PER_EQUIVALENT_YEAR
        }
      };
    }

    resolveEncounterContext(options = {}) {
      const location = {
        semanticId: options.semanticId || options.locationId || '',
        provinceId: options.provinceId || '',
        provinceName: options.provinceName || options.province || '',
        settlementId: options.settlementId || '',
        settlementName: options.settlementName || options.settlement || '',
        longitude: options.longitude,
        latitude: options.latitude,
        provinceUtcOffsetMinutes: options.provinceUtcOffsetMinutes,
        provinceUtcOffsetHours: options.provinceUtcOffsetHours,
        provinceOffset: options.provinceOffset,
        settlementUtcOffsetMinutes: options.settlementUtcOffsetMinutes,
        settlementUtcOffsetHours: options.settlementUtcOffsetHours,
        settlementOffset: options.settlementOffset,
        utcOffsetMinutes: options.utcOffsetMinutes,
        utcOffsetHours: options.utcOffsetHours,
        timezoneOffset: options.timezoneOffset,
        timezoneId: options.timezoneId || ''
      };
      const worldTime = this.resolveWorldTime(options.worldTime || options.utc || options, location);
      const destinationOffset = firstOffset(
        parseOffset(options.destinationUtcOffsetMinutes, 'minutes'),
        parseOffset(options.destinationUtcOffsetHours, 'hours'),
        parseOffset(options.destinationOffset, 'auto')
      );
      const destination = destinationOffset === null ? null : {
        offsetMinutes: destinationOffset,
        label: offsetLabel(destinationOffset),
        local: addMinutes(worldTime.utc, destinationOffset),
        shiftMinutes: destinationOffset - worldTime.zone.offsetMinutes,
        shiftHours: (destinationOffset - worldTime.zone.offsetMinutes) / 60
      };
      const placeLabel = [location.settlementName, location.provinceName].filter(Boolean).join(', ') || location.semanticId || 'Unspecified location';
      return {
        location,
        placeLabel,
        ...worldTime,
        destination,
        encounterTags: [...new Set([...(worldTime.daypart.tags || []), worldTime.zone.settlementOverridesProvince ? 'settlement-timezone-exception' : '', destination ? 'timezone-crossing' : ''].filter(Boolean))],
        timeZoneNote: worldTime.zone.settlementOverridesProvince
          ? `${location.settlementName || 'This settlement'} observes ${worldTime.zone.label}, overriding the province default ${offsetLabel(worldTime.zone.provinceOffsetMinutes)}.`
          : `${placeLabel} observes ${worldTime.zone.label} with no daylight saving time.`
      };
    }

    localDaysToEarthDays(days) {
      return number(days) * EARTH_DAYS_PER_EQUIVALENT_YEAR / ASTRONOMICAL_DAYS_PER_YEAR;
    }

    earthDaysToLocalDays(days) {
      return number(days) * ASTRONOMICAL_DAYS_PER_YEAR / EARTH_DAYS_PER_EQUIVALENT_YEAR;
    }
  }

  global.RandomEncounterTime = {
    TimeSystem,
    constants: {
      MINUTES_PER_DAY,
      MONTHS_PER_YEAR,
      DAYS_PER_MONTH,
      CIVIL_DAYS_PER_YEAR,
      LEAP_INTERVAL_YEARS,
      ASTRONOMICAL_DAYS_PER_YEAR,
      EARTH_DAYS_PER_EQUIVALENT_YEAR
    },
    meridians: DEFAULT_MERIDIANS,
    parallels: DEFAULT_PARALLELS,
    dayparts: DAYPARTS,
    isLeapYear,
    daysInYear,
    normalizeDate,
    addMinutes,
    offsetLabel,
    formatDate,
    daypartFor,
    parseOffset
  };
}(window));
