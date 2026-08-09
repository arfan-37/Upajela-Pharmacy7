export const RACK_LOCATIONS = [
  'North Rack 1',
  'North Rack 2',
  'North Rack 3',
  'North Rack 4',
  'North Rack 5',
  'North Rack 6',
  'North Rack 7',
  'North Rack 8',
  'North Rack 9',
  'North Rack 10',
  'South Rack 1',
  'South Rack 2',
  'South Rack 3',
  'South Rack 4',
  'South Rack 5',
  'South Rack 6',
  'South Rack 7',
  'South Rack 8',
  'South Rack 9',
  'South Rack 10',
  'East Rack 1',
  'East Rack 2',
  'East Rack 3',
  'East Rack 4',
  'East Rack 5',
  'East Rack 6',
  'East Rack 7',
  'East Rack 8',
  'East Rack 9',
  'East Rack 10',
  'West Rack 1',
  'West Rack 2',
  'West Rack 3',
  'West Rack 4',
  'West Rack 5',
  'West Rack 6',
  'West Rack 7',
  'West Rack 8',
  'West Rack 9',
  'West Rack 10',
];

const DIRECTION_MAP = {
  North: { en: 'North', bn: 'north' },
  South: { en: 'South', bn: 'south' },
  East: { en: 'East', bn: 'east' },
  West: { en: 'West', bn: 'west' },
};

export const getLocalizedRackLocations = (t, language = 'en') => {
  const rack = t?.inventory?.rackLocations || {};
  const isBangla = language === 'bn';
  return RACK_LOCATIONS.map(loc => {
    const parts = loc.split(' ');
    const direction = parts[0];
    const rackNum = parts[2];
    const mapped = DIRECTION_MAP[direction];
    if (!mapped) return { value: loc, label: loc };
    const localDir = isBangla ? (rack[mapped.bn] || mapped.en) : mapped.en;
    const localRack = isBangla ? (rack.rack || 'Rack') : 'Rack';
    return {
      value: loc,
      label: `${localDir} ${localRack} ${rackNum}`,
    };
  });
};
