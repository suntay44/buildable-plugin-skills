import type { Recipe } from "@/types/recipe";

export const sampleRecipes: Recipe[] = [
  {
    id: "r1",
    name: "Miso-butter salmon bowls",
    description: "Weeknight rice bowls with broiled miso-glazed salmon, quick-pickled cucumber, and scallions.",
    category: "dinner",
    ingredients: [
      { name: "salmon fillets", quantity: "4 (5 oz each)" },
      { name: "white miso", quantity: "3 tbsp" },
      { name: "butter", quantity: "2 tbsp, softened" },
      { name: "short-grain rice", quantity: "2 cups" },
      { name: "cucumber", quantity: "1, thinly sliced" },
      { name: "rice vinegar", quantity: "2 tbsp" },
      { name: "scallions", quantity: "3, sliced" }
    ],
    steps: [
      "Cook the rice. While it cooks, toss cucumber with rice vinegar and a pinch of salt; set aside.",
      "Mash miso and butter together; spread over the salmon fillets.",
      "Broil salmon 6-8 minutes until the glaze bubbles and edges char slightly.",
      "Serve over rice with pickled cucumber and scallions."
    ],
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    dietTags: ["pescatarian", "gluten-free"],
    saved: true
  },
  {
    id: "r2",
    name: "Chickpea smash toasts",
    description: "Lemony smashed chickpeas with herbs on toasted sourdough — a 10-minute lunch.",
    category: "lunch",
    ingredients: [
      { name: "chickpeas", quantity: "1 can (15 oz), drained" },
      { name: "lemon", quantity: "1, juiced and zested" },
      { name: "olive oil", quantity: "2 tbsp" },
      { name: "sourdough bread", quantity: "4 slices" },
      { name: "fresh dill", quantity: "2 tbsp, chopped" },
      { name: "red pepper flakes", quantity: "1/2 tsp" }
    ],
    steps: [
      "Toast the sourdough slices.",
      "Smash chickpeas with lemon juice, zest, olive oil, salt, and pepper — leave some texture.",
      "Pile onto toast; finish with dill and red pepper flakes."
    ],
    prepMinutes: 8,
    cookMinutes: 4,
    servings: 2,
    dietTags: ["vegan", "vegetarian"],
    saved: false
  },
  {
    id: "r3",
    name: "Overnight oats, three ways",
    description: "Base overnight oats with berry, peanut-banana, and apple-cinnamon variations.",
    category: "breakfast",
    ingredients: [
      { name: "rolled oats", quantity: "1/2 cup per jar" },
      { name: "milk or oat milk", quantity: "1/2 cup per jar" },
      { name: "chia seeds", quantity: "1 tsp per jar" },
      { name: "maple syrup", quantity: "1 tsp per jar" },
      { name: "mixed berries", quantity: "1/2 cup" },
      { name: "banana", quantity: "1, sliced" },
      { name: "peanut butter", quantity: "1 tbsp" }
    ],
    steps: [
      "Stir oats, milk, chia, and maple syrup in a jar.",
      "Add one topping set: berries, or banana + peanut butter, or grated apple + cinnamon.",
      "Refrigerate overnight; eat within 3 days."
    ],
    prepMinutes: 5,
    cookMinutes: 0,
    servings: 1,
    dietTags: ["vegetarian"],
    saved: true
  },
  {
    id: "r4",
    name: "Sheet-pan gnocchi with burst tomatoes",
    description: "Shelf-stable gnocchi roasted with cherry tomatoes, red onion, and mozzarella — one pan, no boiling.",
    category: "dinner",
    ingredients: [
      { name: "shelf-stable gnocchi", quantity: "1 lb" },
      { name: "cherry tomatoes", quantity: "2 pints" },
      { name: "red onion", quantity: "1, wedged" },
      { name: "olive oil", quantity: "3 tbsp" },
      { name: "fresh mozzarella", quantity: "8 oz, torn" },
      { name: "basil", quantity: "1 handful" }
    ],
    steps: [
      "Heat oven to 425°F (220°C).",
      "Toss gnocchi, tomatoes, and onion with oil, salt, and pepper on a sheet pan.",
      "Roast 20-25 minutes until tomatoes burst and gnocchi crisp.",
      "Scatter mozzarella over the hot pan; rest 2 minutes, then top with basil."
    ],
    prepMinutes: 10,
    cookMinutes: 25,
    servings: 4,
    dietTags: ["vegetarian"],
    saved: false
  },
  {
    id: "r5",
    name: "Dark chocolate olive-oil mousse",
    description: "Four-ingredient mousse that swaps cream for olive oil — intensely chocolatey, dairy-free.",
    category: "dessert",
    ingredients: [
      { name: "dark chocolate (70%)", quantity: "7 oz" },
      { name: "olive oil", quantity: "1/3 cup" },
      { name: "eggs", quantity: "4, separated" },
      { name: "sugar", quantity: "3 tbsp" },
      { name: "flaky salt", quantity: "to finish" }
    ],
    steps: [
      "Melt chocolate; whisk in olive oil and yolks off the heat.",
      "Whip egg whites with sugar to soft peaks.",
      "Fold whites into the chocolate base in three additions.",
      "Chill 2 hours; serve with flaky salt."
    ],
    prepMinutes: 15,
    cookMinutes: 5,
    servings: 6,
    dietTags: ["dairy-free", "gluten-free", "vegetarian"],
    saved: false
  },
  {
    id: "r6",
    name: "Crispy rice salad with herbs",
    description: "Golden-fried rice crumbles over herbs, cabbage, and a lime-chili dressing.",
    category: "lunch",
    ingredients: [
      { name: "day-old cooked rice", quantity: "3 cups" },
      { name: "neutral oil", quantity: "1/4 cup" },
      { name: "napa cabbage", quantity: "3 cups, shredded" },
      { name: "mint and cilantro", quantity: "1 cup, torn" },
      { name: "lime", quantity: "2, juiced" },
      { name: "chili crisp", quantity: "2 tbsp" },
      { name: "roasted peanuts", quantity: "1/3 cup" }
    ],
    steps: [
      "Fry rice in oil until deeply golden and crisp in spots.",
      "Whisk lime juice with chili crisp for the dressing.",
      "Toss cabbage and herbs with dressing; top with crispy rice and peanuts."
    ],
    prepMinutes: 12,
    cookMinutes: 10,
    servings: 3,
    dietTags: ["vegan", "vegetarian", "dairy-free"],
    saved: true
  },
  {
    id: "r7",
    name: "Maple-tahini energy bites",
    description: "No-bake oat bites with tahini, maple, and dark chocolate chunks — freezer-friendly snacks.",
    category: "snack",
    ingredients: [
      { name: "rolled oats", quantity: "1.5 cups" },
      { name: "tahini", quantity: "1/2 cup" },
      { name: "maple syrup", quantity: "1/3 cup" },
      { name: "dark chocolate", quantity: "2 oz, chopped" },
      { name: "sesame seeds", quantity: "2 tbsp" }
    ],
    steps: [
      "Stir everything together until a thick dough forms.",
      "Roll into 14 balls; coat in sesame seeds.",
      "Chill 30 minutes; keep refrigerated up to 2 weeks."
    ],
    prepMinutes: 15,
    cookMinutes: 0,
    servings: 14,
    dietTags: ["vegan", "vegetarian", "dairy-free"],
    saved: false
  },
  {
    id: "r8",
    name: "Skillet shakshuka",
    description: "Eggs poached in a smoky pepper-tomato sauce; weekend brunch in one pan.",
    category: "breakfast",
    ingredients: [
      { name: "eggs", quantity: "6" },
      { name: "crushed tomatoes", quantity: "1 can (28 oz)" },
      { name: "red bell peppers", quantity: "2, sliced" },
      { name: "onion", quantity: "1, sliced" },
      { name: "smoked paprika", quantity: "2 tsp" },
      { name: "cumin", quantity: "1 tsp" },
      { name: "feta", quantity: "3 oz, crumbled" }
    ],
    steps: [
      "Soften onion and peppers in olive oil, 8 minutes.",
      "Add spices, then tomatoes; simmer 10 minutes until thick.",
      "Nestle eggs into wells; cover and cook 6-8 minutes to set whites.",
      "Finish with feta and serve from the skillet."
    ],
    prepMinutes: 10,
    cookMinutes: 25,
    servings: 3,
    dietTags: ["vegetarian", "gluten-free"],
    saved: false
  }
];
