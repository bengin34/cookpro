#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) {
    return fallback;
  }
  return args[index + 1] ?? fallback;
};

const count = Number(getArg('--count', '100'));
const outputPath = getArg('--output', path.join('data', `recipes-${count}.json`));

const proteins = [
  { id: 'chicken_breast', title: 'Tavuk', region: 'BOTH' },
  { id: 'chicken_thigh', title: 'Tavuk but', region: 'BOTH' },
  { id: 'turkey', title: 'Hindi', region: 'BOTH' },
  { id: 'beef_minced', title: 'Kiyma', region: 'BOTH' },
  { id: 'beef_steak', title: 'Dana', region: 'BOTH' },
  { id: 'lamb', title: 'Kuzu', region: 'BOTH' },
  { id: 'fish_white', title: 'Beyaz balik', region: 'BOTH' },
  { id: 'salmon', title: 'Somon', region: 'BOTH' },
  { id: 'shrimp', title: 'Karides', region: 'BOTH' },
  { id: 'canned_tuna', title: 'Ton balik', region: 'BOTH' },
  { id: 'tofu', title: 'Tofu', region: 'BOTH' },
  { id: 'chickpeas', title: 'Nohut', region: 'BOTH' },
  { id: 'lentils_red', title: 'Kirmizi mercimek', region: 'BOTH' },
  { id: 'beans_white', title: 'Kuru fasulye', region: 'BOTH' },
  { id: 'sausage_sucuk', title: 'Sucuk', region: 'TR' },
  { id: 'pastirma', title: 'Pastirma', region: 'TR' },
];

const vegetables = [
  { id: 'tomato', title: 'Domates' },
  { id: 'pepper_green', title: 'Yesil biber' },
  { id: 'pepper_red', title: 'Kirmizi biber' },
  { id: 'eggplant', title: 'Patlican' },
  { id: 'zucchini', title: 'Kabak' },
  { id: 'spinach', title: 'Ispanak' },
  { id: 'mushroom', title: 'Mantar' },
  { id: 'carrot', title: 'Havuc' },
  { id: 'potato', title: 'Patates' },
  { id: 'cabbage', title: 'Lahana' },
  { id: 'broccoli', title: 'Brokoli' },
  { id: 'cauliflower', title: 'Karnabahar' },
];

const bases = [
  { id: 'rice', title: 'Pirinc pilav' },
  { id: 'bulgur', title: 'Bulgur' },
  { id: 'pasta', title: 'Makarna' },
  { id: 'potato', title: 'Patates' },
];

const saladProteins = [
  { id: 'chicken_breast', title: 'Tavuk' },
  { id: 'canned_tuna', title: 'Ton balik' },
  { id: 'chickpeas', title: 'Nohut' },
  { id: 'beans_white', title: 'Kuru fasulye' },
  { id: 'tofu', title: 'Tofu' },
];

const saladVeg = [
  { id: 'lettuce', title: 'Marul' },
  { id: 'spinach', title: 'Ispanak' },
  { id: 'tomato', title: 'Domates' },
  { id: 'cucumber', title: 'Salatalik' },
];

const sandwichProteins = [
  { id: 'sausage_sucuk', title: 'Sucuk', region: 'TR' },
  { id: 'pastirma', title: 'Pastirma', region: 'TR' },
  { id: 'chicken_breast', title: 'Tavuk' },
  { id: 'turkey', title: 'Hindi' },
  { id: 'beef_steak', title: 'Dana' },
];

const soupLegumes = [
  { id: 'lentils_red', title: 'Kirmizi mercimek' },
  { id: 'lentils_green', title: 'Yesil mercimek' },
  { id: 'chickpeas', title: 'Nohut' },
  { id: 'beans_white', title: 'Kuru fasulye' },
];

const quantityById = {
  chicken_breast: { quantity: '300', unit: 'g' },
  chicken_thigh: { quantity: '300', unit: 'g' },
  turkey: { quantity: '300', unit: 'g' },
  beef_minced: { quantity: '300', unit: 'g' },
  beef_steak: { quantity: '300', unit: 'g' },
  lamb: { quantity: '300', unit: 'g' },
  fish_white: { quantity: '300', unit: 'g' },
  salmon: { quantity: '300', unit: 'g' },
  shrimp: { quantity: '250', unit: 'g' },
  canned_tuna: { quantity: '1', unit: 'can' },
  tofu: { quantity: '200', unit: 'g' },
  egg: { quantity: '2', unit: 'pc' },
  sausage_sucuk: { quantity: '150', unit: 'g' },
  pastirma: { quantity: '120', unit: 'g' },
  chickpeas: { quantity: '1', unit: 'cup' },
  lentils_red: { quantity: '1', unit: 'cup' },
  lentils_green: { quantity: '1', unit: 'cup' },
  beans_white: { quantity: '1', unit: 'cup' },
  rice: { quantity: '1', unit: 'cup' },
  bulgur: { quantity: '1', unit: 'cup' },
  pasta: { quantity: '200', unit: 'g' },
  bread: { quantity: '2', unit: 'slice' },
  pita: { quantity: '1', unit: 'pc' },
  potato: { quantity: '2', unit: 'pc' },
  onion: { quantity: '1', unit: 'pc' },
  garlic: { quantity: '2', unit: 'clove' },
  tomato: { quantity: '2', unit: 'pc' },
  tomato_paste: { quantity: '1', unit: 'tbsp' },
  pepper_paste: { quantity: '1', unit: 'tbsp' },
  pepper_green: { quantity: '1', unit: 'pc' },
  pepper_red: { quantity: '1', unit: 'pc' },
  eggplant: { quantity: '1', unit: 'pc' },
  zucchini: { quantity: '1', unit: 'pc' },
  cucumber: { quantity: '1', unit: 'pc' },
  lettuce: { quantity: '2', unit: 'cup' },
  spinach: { quantity: '2', unit: 'cup' },
  carrot: { quantity: '1', unit: 'pc' },
  mushroom: { quantity: '200', unit: 'g' },
  cabbage: { quantity: '2', unit: 'cup' },
  cauliflower: { quantity: '2', unit: 'cup' },
  broccoli: { quantity: '2', unit: 'cup' },
  lemon: { quantity: '0.5', unit: 'pc' },
  olive_oil: { quantity: '1', unit: 'tbsp' },
  salt: { quantity: '1', unit: 'tsp' },
  black_pepper: { quantity: '0.5', unit: 'tsp' },
  paprika: { quantity: '1', unit: 'tsp' },
  cumin: { quantity: '1', unit: 'tsp' },
  red_pepper_flakes: { quantity: '0.5', unit: 'tsp' },
  oregano: { quantity: '1', unit: 'tsp' },
  thyme: { quantity: '1', unit: 'tsp' },
  cheese_kashar: { quantity: '60', unit: 'g' },
  yogurt: { quantity: '3', unit: 'tbsp' },
};

const trOnlyIngredients = new Set(['sausage_sucuk', 'pastirma']);

const ingredient = (id, overrides = {}) => {
  const base = quantityById[id] || { quantity: '1', unit: 'pc' };
  return {
    ingredient_id: id,
    quantity: overrides.quantity ?? base.quantity,
    unit: overrides.unit ?? base.unit,
    optional: overrides.optional ?? false,
  };
};

const regionFromIngredients = (ids) => {
  const hasTrOnly = ids.some((id) => trOnlyIngredients.has(id));
  return hasTrOnly ? 'TR' : 'BOTH';
};

const makeRecipe = ({ title, ingredientIds, instructions, tags, totalTime, servings }) => ({
  title,
  region_relevance: regionFromIngredients(ingredientIds),
  servings,
  total_time_minutes: totalTime,
  ingredients: ingredientIds.map((id) => ingredient(id)),
  instructions,
  tags,
  source: 'internal',
});

const stepsSote = (proteinTitle, vegTitle) => [
  'Sogan ve sarmisagi zeytinyaginda cevir.',
  `${proteinTitle} ekle ve renk alana kadar pisir.`,
  `${vegTitle} ekle, salca ve baharatlari karistir.`,
  'Kisacik kaynatip servis et.',
];

const stepsFirin = (proteinTitle, vegTitle) => [
  `${proteinTitle} ve ${vegTitle} malzemelerini tepsiye al.`,
  'Zeytinyagi ve baharatlarla harmanla.',
  'Onceden isinmis firinda pisir.',
  'Sicak servis et.',
];

const stepsGuvec = (proteinTitle, vegTitle) => [
  'Sogan ve sarmisagi zeytinyaginda cevir.',
  `${proteinTitle} ve ${vegTitle} ekle.`,
  'Domates ve baharatlari ekleyip kisik ateste pisir.',
  'Guvec kabinda servis et.',
];

const stepsTava = (proteinTitle, vegTitle) => [
  `${proteinTitle} ve ${vegTitle} malzemelerini tavada cevir.`,
  'Baharatlari ekleyip kisa sure pisir.',
  'Sicak servis et.',
];

const stepsIzgara = (proteinTitle, vegTitle) => [
  `${proteinTitle} ve ${vegTitle} malzemelerini baharatla.`,
  'Izgarada veya grill tavada pisir.',
  'Sicak servis et.',
];

const stepsPilav = (baseTitle, vegTitle) => [
  'Soganlari zeytinyaginda cevir.',
  `${vegTitle} ekleyip kisa sure sotele.`,
  `${baseTitle} ekle ve baharatlari karistir.`,
  'Suyunu ekleyip kisik ateste pisir.',
];

const stepsSalata = (proteinTitle) => [
  `${proteinTitle} hazirla ve sogumaya birak.`,
  'Yesillikleri ve sebzeleri dogra.',
  'Limon ve zeytinyagi ile sosu hazirla.',
  'Tum malzemeleri karistir.',
];

const stepsSandvic = (proteinTitle) => [
  `${proteinTitle} malzemesini hazirla.`,
  'Ekmekleri hafif isit.',
  'Peyniri ve sebzeleri ekle.',
  'Sandvici kapatip servis et.',
];

const stepsCorba = (legumeTitle, vegTitle) => [
  'Sogan ve havucu zeytinyaginda cevir.',
  `${legumeTitle} ve ${vegTitle} ekle.`,
  'Sicak su ve baharatlari ekleyip kaynat.',
  'Kisacik pisirip servis et.',
];

const recipes = [];
const seen = new Set();

const pushRecipe = (recipe) => {
  if (recipes.length >= count) {
    return;
  }
  if (seen.has(recipe.title)) {
    return;
  }
  seen.add(recipe.title);
  recipes.push(recipe);
};

for (const protein of proteins) {
  for (const veg of vegetables) {
    pushRecipe(
      makeRecipe({
        title: `${protein.title} ${veg.title} sote`,
        ingredientIds: [
          protein.id,
          veg.id,
          'onion',
          'garlic',
          'tomato_paste',
          'olive_oil',
          'salt',
          'black_pepper',
          'paprika',
        ],
        instructions: stepsSote(protein.title, veg.title),
        tags: ['dinner', 'quick'],
        totalTime: 25,
        servings: 2,
      })
    );
    pushRecipe(
      makeRecipe({
        title: `${protein.title} ve ${veg.title} firinda`,
        ingredientIds: [
          protein.id,
          veg.id,
          'olive_oil',
          'lemon',
          'salt',
          'black_pepper',
          'thyme',
        ],
        instructions: stepsFirin(protein.title, veg.title),
        tags: ['dinner', 'balanced'],
        totalTime: 35,
        servings: 2,
      })
    );
    pushRecipe(
      makeRecipe({
        title: `${protein.title} ${veg.title} guvec`,
        ingredientIds: [
          protein.id,
          veg.id,
          'onion',
          'garlic',
          'tomato',
          'olive_oil',
          'salt',
          'black_pepper',
          'oregano',
        ],
        instructions: stepsGuvec(protein.title, veg.title),
        tags: ['dinner', 'balanced'],
        totalTime: 40,
        servings: 3,
      })
    );
    pushRecipe(
      makeRecipe({
        title: `${protein.title} ${veg.title} tava`,
        ingredientIds: [
          protein.id,
          veg.id,
          'onion',
          'olive_oil',
          'salt',
          'black_pepper',
          'red_pepper_flakes',
        ],
        instructions: stepsTava(protein.title, veg.title),
        tags: ['dinner', 'quick'],
        totalTime: 20,
        servings: 2,
      })
    );
    pushRecipe(
      makeRecipe({
        title: `${protein.title} ${veg.title} izgara`,
        ingredientIds: [
          protein.id,
          veg.id,
          'olive_oil',
          'salt',
          'black_pepper',
          'thyme',
        ],
        instructions: stepsIzgara(protein.title, veg.title),
        tags: ['dinner', 'quick'],
        totalTime: 20,
        servings: 2,
      })
    );
    if (recipes.length >= count) {
      break;
    }
  }
  if (recipes.length >= count) {
    break;
  }
}

for (const base of bases) {
  for (const veg of vegetables) {
    pushRecipe(
      makeRecipe({
        title: `${veg.title}li ${base.title}`,
        ingredientIds: [base.id, veg.id, 'onion', 'olive_oil', 'salt', 'black_pepper'],
        instructions: stepsPilav(base.title, veg.title),
        tags: ['lunch', 'budget'],
        totalTime: 30,
        servings: 2,
      })
    );
    if (recipes.length >= count) {
      break;
    }
  }
  if (recipes.length >= count) {
    break;
  }
}

for (const protein of saladProteins) {
  for (const veg of saladVeg) {
    pushRecipe(
      makeRecipe({
        title: `${protein.title}lu ${veg.title} salata`,
        ingredientIds: [
          protein.id,
          veg.id,
          'lettuce',
          'cucumber',
          'tomato',
          'olive_oil',
          'lemon',
          'salt',
        ],
        instructions: stepsSalata(protein.title),
        tags: ['lunch', 'quick'],
        totalTime: 15,
        servings: 2,
      })
    );
    if (recipes.length >= count) {
      break;
    }
  }
  if (recipes.length >= count) {
    break;
  }
}

for (const protein of sandwichProteins) {
  pushRecipe(
    makeRecipe({
      title: `${protein.title}lu sandvic`,
      ingredientIds: [
        'bread',
        protein.id,
        'cheese_kashar',
        'tomato',
        'lettuce',
        'olive_oil',
        'salt',
      ],
      instructions: stepsSandvic(protein.title),
      tags: ['breakfast', 'quick'],
      totalTime: 10,
      servings: 1,
    })
  );
  if (recipes.length >= count) {
    break;
  }
}

for (const legume of soupLegumes) {
  for (const veg of vegetables) {
    pushRecipe(
      makeRecipe({
        title: `${legume.title} ve ${veg.title} corbasi`,
        ingredientIds: [
          legume.id,
          veg.id,
          'onion',
          'carrot',
          'olive_oil',
          'salt',
          'black_pepper',
          'cumin',
        ],
        instructions: stepsCorba(legume.title, veg.title),
        tags: ['dinner', 'budget'],
        totalTime: 35,
        servings: 3,
      })
    );
    if (recipes.length >= count) {
      break;
    }
  }
  if (recipes.length >= count) {
    break;
  }
}

const padded = (value) => String(value).padStart(3, '0');
const output = recipes.slice(0, count).map((recipe, index) => ({
  id: `r${padded(index + 1)}`,
  ...recipe,
}));

const fullOutputPath = path.isAbsolute(outputPath)
  ? outputPath
  : path.join(process.cwd(), outputPath);

fs.writeFileSync(fullOutputPath, JSON.stringify(output, null, 2));

console.log(`Generated ${output.length} recipes -> ${fullOutputPath}`);
