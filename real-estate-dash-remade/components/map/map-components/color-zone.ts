import {
  seattleHouses,
  stateScores,
  washingtonCityScores,
  washingtonCountyScores,
} from "../data/dummy";

//This should be updated to input a score and output a color, the score should be on the object.

const colorScale: readonly string[] = [
  "hsl(0, 100%, 50%)",
  "hsl(12, 100%, 50%)",
  "hsl(24, 100%, 50%)",
  "hsl(36, 100%, 50%)",
  "hsl(48, 100%, 50%)",
  "hsl(60, 100%, 50%)",
  "hsl(72, 100%, 50%)",
  "hsl(84, 100%, 50%)",
  "hsl(96, 100%, 50%)",
  "hsl(120, 100%, 50%)",
];

export function styleGeoJSON({ name }: { name: string | null }): {
  fill: string;
  strokeWidth: number;
  stroke: string;
  fillOpacity: number;
  r: number;
} {
  let score = 0;
  if (!name) score = 0;
  else if (name in stateScores) {
    score = stateScores[name];
  } else if (name in washingtonCityScores) {
    score = washingtonCityScores[name];
  } else if (name in washingtonCountyScores) {
    score = washingtonCountyScores[name];
  } else if (seattleHouses.some((house) => house.name === name)) {
    const house = seattleHouses.find((house) => house.name === name);
    score = house ? house.rating : 0;
  }

  const baseColor = colorScale[score] ?? colorScale[0];

  return {
    fill: baseColor,
    strokeWidth: 2,
    stroke: baseColor.replace("50%", "40%"),
    fillOpacity: 0.5,
    r: 4,
  };
}
