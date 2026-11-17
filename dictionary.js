/*
 * German -> English grocery dictionary.
 * Each line: german variants (separated by "/") ; English name ; category
 * Category may be empty for adjectives / filler words.
 * Anything not found here is kept exactly as typed (brand names, rare items).
 */
(function () {
  "use strict";

  var LINES = [
    // ---- Produce
    "Apfel/Äpfel;Apples;Produce",
    "Banane/Bananen;Bananas;Produce",
    "Tomate/Tomaten;Tomatoes;Produce",
    "Zwiebel/Zwiebeln;Onions;Produce",
    "Frühlingszwiebel/Frühlingszwiebeln/Lauchzwiebel/Lauchzwiebeln;Spring Onions;Produce",
    "Kartoffel/Kartoffeln;Potatoes;Produce",
    "Süßkartoffel/Süßkartoffeln;Sweet Potatoes;Produce",
    "Karotte/Karotten/Möhre/Möhren/Mohrrübe/Mohrrüben/Rüebli;Carrots;Produce",
    "Salat/Kopfsalat/Blattsalat/Eisbergsalat/Romanasalat;Lettuce;Produce",
    "Feldsalat;Lamb's Lettuce;Produce",
    "Rucola;Arugula;Produce",
    "Spinat;Spinach;Produce",
    "Avocado/Avocados;Avocado;Produce",
    "Orange/Orangen/Apfelsine/Apfelsinen;Oranges;Produce",
    "Gurke/Gurken/Salatgurke/Salatgurken;Cucumber;Produce",
    "Zitrone/Zitronen;Lemons;Produce",
    "Limette/Limetten;Limes;Produce",
    "Mandarine/Mandarinen/Clementine/Clementinen;Mandarins;Produce",
    "Grapefruit/Pampelmuse;Grapefruit;Produce",
    "Birne/Birnen;Pears;Produce",
    "Traube/Trauben/Weintrauben;Grapes;Produce",
    "Erdbeere/Erdbeeren;Strawberries;Produce",
    "Himbeere/Himbeeren;Raspberries;Produce",
    "Blaubeere/Blaubeeren/Heidelbeere/Heidelbeeren;Blueberries;Produce",
    "Kirsche/Kirschen;Cherries;Produce",
    "Pfirsich/Pfirsiche;Peaches;Produce",
    "Nektarine/Nektarinen;Nectarines;Produce",
    "Pflaume/Pflaumen/Zwetschge/Zwetschgen;Plums;Produce",
    "Ananas;Pineapple;Produce",
    "Mango/Mangos;Mango;Produce",
    "Melone/Melonen;Melon;Produce",
    "Wassermelone;Watermelon;Produce",
    "Kiwi/Kiwis;Kiwi;Produce",
    "Paprika/Paprikas;Bell Pepper;Produce",
    "Zucchini;Zucchini;Produce",
    "Aubergine/Auberginen;Eggplant;Produce",
    "Brokkoli/Broccoli;Broccoli;Produce",
    "Blumenkohl;Cauliflower;Produce",
    "Kohl/Weißkohl/Weisskohl;Cabbage;Produce",
    "Rotkohl;Red Cabbage;Produce",
    "Rosenkohl;Brussels Sprouts;Produce",
    "Lauch/Porree;Leek;Produce",
    "Knoblauch;Garlic;Produce",
    "Ingwer;Ginger;Produce",
    "Sellerie;Celery;Produce",
    "Fenchel;Fennel;Produce",
    "Radieschen;Radishes;Produce",
    "Rote Bete/Rote Beete/Rote Rübe;Beetroot;Produce",
    "Kürbis;Pumpkin;Produce",
    "Champignon/Champignons/Pilze/Pilz;Mushrooms;Produce",
    "Erbsen;Peas;Produce",
    "Grüne Bohnen;Green Beans;Produce",
    "Petersilie;Parsley;Produce",
    "Basilikum;Basil;Produce",
    "Schnittlauch;Chives;Produce",
    "Dill;Dill;Produce",
    "Minze;Mint;Produce",
    "Koriander;Cilantro;Produce",
    "Thymian;Thyme;Produce",
    "Rosmarin;Rosemary;Produce",
    "Chili/Chilis;Chili Peppers;Produce",
    "Obst;Fruit;Produce",
    "Gemüse;Vegetables;Produce",

    // ---- Dairy
    "Milch/Frischmilch;Milk;Dairy",
    "Vollmilch;Whole Milk;Dairy",
    "H-Milch;UHT Milk;Dairy",
    "Hafermilch/Haferdrink;Oat Milk;Dairy",
    "Sojamilch/Sojadrink;Soy Milk;Dairy",
    "Mandelmilch/Mandeldrink;Almond Milk;Dairy",
    "Butter;Butter;Dairy",
    "Margarine;Margarine;Dairy",
    "Käse;Cheese;Dairy",
    "Gouda;Gouda;Dairy",
    "Emmentaler;Emmental;Dairy",
    "Mozzarella;Mozzarella;Dairy",
    "Parmesan;Parmesan;Dairy",
    "Feta/Schafskäse/Hirtenkäse;Feta;Dairy",
    "Frischkäse;Cream Cheese;Dairy",
    "Streichkäse;Cheese Spread;Dairy",
    "Hüttenkäse;Cottage Cheese;Dairy",
    "Reibekäse/Streukäse;Shredded Cheese;Dairy",
    "Quark;Quark;Dairy",
    "Joghurt/Jogurt;Yogurt;Dairy",
    "Sahne/Schlagsahne;Cream;Dairy",
    "Schmand/Saure Sahne;Sour Cream;Dairy",
    "Ei/Eier;Eggs;Dairy",
    "Pudding;Pudding;Dairy",
    "Milchreis;Rice Pudding;Dairy",

    // ---- Bakery
    "Brot;Bread;Bakery",
    "Vollkornbrot;Whole Grain Bread;Bakery",
    "Brötchen/Semmel/Semmeln/Schrippe/Schrippen/Weckle;Bread Rolls;Bakery",
    "Laugenbrötchen;Pretzel Rolls;Bakery",
    "Toast/Toastbrot;Toast;Bakery",
    "Croissant/Croissants/Hörnchen;Croissants;Bakery",
    "Bagel/Bagels;Bagels;Bakery",
    "Brezel/Brezeln/Breze;Pretzels;Bakery",
    "Baguette;Baguette;Bakery",
    "Kuchen;Cake;Bakery",
    "Zimtschnecke/Zimtschnecken;Cinnamon Rolls;Bakery",
    "Knäckebrot;Crispbread;Bakery",
    "Tortilla/Tortillas/Wraps;Tortillas;Bakery",

    // ---- Meat & fish
    "Hähnchen/Hühnchen/Huhn/Hühnerfleisch/Poulet;Chicken;Meat",
    "Hähnchenbrust/Hühnerbrust/Hühnchenbrust/Hähnchenbrustfilet;Chicken Breast;Meat",
    "Hähnchenschenkel/Hühnerschenkel;Chicken Thighs;Meat",
    "Pute/Truthahn;Turkey;Meat",
    "Putenbrust;Turkey Breast;Meat",
    "Rindfleisch;Beef;Meat",
    "Rinderhack/Rinderhackfleisch;Ground Beef;Meat",
    "Hackfleisch/Hack/Gehacktes;Ground Meat;Meat",
    "Schweinefleisch;Pork;Meat",
    "Schnitzel;Schnitzel;Meat",
    "Steak/Steaks;Steak;Meat",
    "Wurst;Sausage;Meat",
    "Würstchen;Sausages;Meat",
    "Salami;Salami;Meat",
    "Schinken;Ham;Meat",
    "Speck/Bacon;Bacon;Meat",
    "Aufschnitt;Cold Cuts;Meat",
    "Leberwurst;Liverwurst;Meat",
    "Lamm/Lammfleisch;Lamb;Meat",
    "Fisch;Fish;Meat",
    "Lachs;Salmon;Meat",
    "Thunfisch;Tuna;Meat",
    "Forelle;Trout;Meat",
    "Garnelen/Shrimps;Shrimp;Meat",

    // ---- Pantry (dry goods, sauces, drinks, snacks)
    "Reis;Rice;Pantry",
    "Nudeln/Pasta/Teigwaren;Pasta;Pantry",
    "Spaghetti;Spaghetti;Pantry",
    "Penne;Penne;Pantry",
    "Couscous;Couscous;Pantry",
    "Müsli;Muesli;Pantry",
    "Cornflakes/Frühstücksflocken/Cerealien;Cereal;Pantry",
    "Haferflocken;Oats;Pantry",
    "Kaffee;Coffee;Pantry",
    "Tee;Tea;Pantry",
    "Kakao;Cocoa;Pantry",
    "Zucker;Sugar;Pantry",
    "Puderzucker;Powdered Sugar;Pantry",
    "Vanillezucker;Vanilla Sugar;Pantry",
    "Mehl;Flour;Pantry",
    "Backpulver;Baking Powder;Pantry",
    "Hefe/Trockenhefe;Yeast;Pantry",
    "Salz;Salt;Pantry",
    "Pfeffer;Pepper;Pantry",
    "Zimt;Cinnamon;Pantry",
    "Paprikapulver;Paprika Powder;Pantry",
    "Curry;Curry;Pantry",
    "Gewürz/Gewürze;Spices;Pantry",
    "Öl/Speiseöl/Pflanzenöl;Oil;Pantry",
    "Olivenöl;Olive Oil;Pantry",
    "Sonnenblumenöl;Sunflower Oil;Pantry",
    "Rapsöl;Canola Oil;Pantry",
    "Essig;Vinegar;Pantry",
    "Balsamico/Balsamessig/Aceto Balsamico;Balsamico;Pantry",
    "Senf;Mustard;Pantry",
    "Ketchup;Ketchup;Pantry",
    "Mayonnaise/Mayo;Mayonnaise;Pantry",
    "Sojasauce/Sojasoße;Soy Sauce;Pantry",
    "Pesto;Pesto;Pantry",
    "Honig;Honey;Pantry",
    "Marmelade/Konfitüre;Jam;Pantry",
    "Erdnussbutter;Peanut Butter;Pantry",
    "Schokolade;Chocolate;Pantry",
    "Kekse/Keks/Plätzchen;Cookies;Pantry",
    "Kartoffelchips/Chips;Potato Chips;Pantry",
    "Salzstangen;Pretzel Sticks;Pantry",
    "Popcorn;Popcorn;Pantry",
    "Gummibärchen;Gummy Bears;Pantry",
    "Müsliriegel;Granola Bars;Pantry",
    "Nuss/Nüsse;Nuts;Pantry",
    "Erdnuss/Erdnüsse;Peanuts;Pantry",
    "Mandel/Mandeln;Almonds;Pantry",
    "Walnuss/Walnüsse;Walnuts;Pantry",
    "Rosinen;Raisins;Pantry",
    "Linsen;Lentils;Pantry",
    "Kichererbsen;Chickpeas;Pantry",
    "Bohnen;Beans;Pantry",
    "Mais;Corn;Pantry",
    "Olive/Oliven;Olives;Pantry",
    "Tomatenmark;Tomato Paste;Pantry",
    "Passierte Tomaten;Strained Tomatoes;Pantry",
    "Dosentomaten/Gehackte Tomaten;Canned Tomatoes;Pantry",
    "Tomatensauce/Tomatensoße;Tomato Sauce;Pantry",
    "Brühe/Gemüsebrühe;Vegetable Broth;Pantry",
    "Suppe;Soup;Pantry",
    "Kartoffelpüree;Mashed Potatoes;Pantry",
    "Knödel;Dumplings;Pantry",
    "Wasser;Water;Pantry",
    "Mineralwasser;Mineral Water;Pantry",
    "Sprudel/Sprudelwasser;Sparkling Water;Pantry",
    "Saft;Juice;Pantry",
    "Orangensaft;Orange Juice;Pantry",
    "Apfelsaft;Apple Juice;Pantry",
    "Limonade;Lemonade;Pantry",
    "Cola;Cola;Pantry",
    "Bier;Beer;Pantry",
    "Wein;Wine;Pantry",
    "Rotwein;Red Wine;Pantry",
    "Weißwein/Weisswein;White Wine;Pantry",
    "Sekt;Sparkling Wine;Pantry",

    // ---- Frozen
    "Tiefkühlpizza/TK-Pizza;Frozen Pizza;Frozen",
    "Pizza;Pizza;Frozen",
    "Eis/Speiseeis;Ice Cream;Frozen",
    "Eiswürfel;Ice Cubes;Frozen",
    "Tiefkühlgemüse;Frozen Vegetables;Frozen",
    "Tiefkühlbeeren;Frozen Berries;Frozen",
    "Pommes/Pommes Frites;French Fries;Frozen",
    "Fischstäbchen;Fish Sticks;Frozen",
    "Rahmspinat;Creamed Spinach;Frozen",

    // ---- Household & toiletries
    "Toilettenpapier/Klopapier/WC-Papier;Toilet Paper;Household",
    "Küchenrolle/Küchenrollen/Küchenpapier;Paper Towels;Household",
    "Taschentücher;Tissues;Household",
    "Spülmittel/Geschirrspülmittel;Dish Soap;Household",
    "Spülmaschinentabs/Geschirrspültabs/Spültabs;Dishwasher Tabs;Household",
    "Waschmittel;Laundry Detergent;Household",
    "Weichspüler;Fabric Softener;Household",
    "Müllbeutel/Müllsäcke;Trash Bags;Household",
    "Gefrierbeutel;Freezer Bags;Household",
    "Alufolie;Aluminum Foil;Household",
    "Backpapier;Baking Paper;Household",
    "Frischhaltefolie;Plastic Wrap;Household",
    "Seife;Soap;Household",
    "Shampoo;Shampoo;Household",
    "Duschgel;Shower Gel;Household",
    "Zahnpasta;Toothpaste;Household",
    "Zahnbürste;Toothbrush;Household",
    "Deo/Deodorant;Deodorant;Household",
    "Reiniger/Putzmittel;Cleaner;Household",
    "Schwamm/Schwämme;Sponges;Household",
    "Batterien;Batteries;Household",
    "Glühbirne/Glühbirnen;Light Bulbs;Household",
    "Kerze/Kerzen;Candles;Household",
    "Windeln;Diapers;Household",
    "Feuchttücher;Wet Wipes;Household",
    "Rasierer;Razors;Household",

    // ---- Adjectives and filler words (no category)
    "bio;Organic;",
    "frisch;;",
    "gefroren/tiefgekühlt/tk;Frozen;",
    "reif;Ripe;",
    "groß;Large;",
    "klein;Small;",
    "weiß;White;",
    "rot;Red;",
    "grün;Green;",
    "gelb;Yellow;",
    "schwarz;Black;",
    "süß;Sweet;",
    "mild;Mild;",
    "scharf;Spicy;",
    "natur;Plain;",
    "laktosefrei;Lactose-Free;",
    "glutenfrei;Gluten-Free;",
    "vegan;Vegan;",
    "ungesüßt;Unsweetened;",
    "gemahlen;Ground;",
    "ganz;Whole;",
    "geräuchert;Smoked;",
    "gekocht;Cooked;",
    "roh;Raw;",
    "getrocknet;Dried;",
    "vollkorn;Whole Grain;",
    "mit;with;",
    "ohne;without;",
    "und;and;",
    "oder;or;",
    "für;for;"
  ];

  function normalize(s) {
    return s
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  var de = {};
  var en = {};

  LINES.forEach(function (line) {
    var parts = line.split(";");
    var entry = { en: parts[1], cat: parts[2] || "" };
    parts[0].split("/").forEach(function (variant) {
      de[normalize(variant)] = entry;
    });
    en[normalize(entry.en)] = entry;
  });

  var SUFFIXES = ["en", "er", "es", "em", "e", "n", "s"];

  function lookupWord(word) {
    var n = normalize(word);
    if (!n) return null;
    if (de[n]) return de[n];
    for (var i = 0; i < SUFFIXES.length; i++) {
      var suf = SUFFIXES[i];
      if (n.length - suf.length >= 3 && n.slice(-suf.length) === suf) {
        var stem = n.slice(0, -suf.length);
        if (de[stem]) return de[stem];
      }
    }
    return null;
  }

  function capFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /**
   * translate("Bio Hafermilch") -> { name: "Organic Oat Milk", category: "Dairy", matched: true }
   * Unknown words (brands, rare items) are kept as typed.
   */
  function translate(raw) {
    var cleaned = raw.trim().replace(/\s+/g, " ");

    // whole phrase: German first, then English (so "cucumber" still gets a category)
    var whole = de[normalize(cleaned)] || en[normalize(cleaned)];
    if (whole) return { name: whole.en, category: whole.cat, matched: true };

    var tokens = cleaned.split(" ");
    var out = [];
    var category = "";
    var matched = false;
    var i = 0;

    while (i < tokens.length) {
      var hit = null;
      var span = 1;

      // longest phrase first (e.g. "Rote Bete"), up to 3 words
      for (var len = Math.min(3, tokens.length - i); len >= 1; len--) {
        var chunk = tokens.slice(i, i + len).join(" ").replace(/^[("']+|[)"',.;:!]+$/g, "");
        var found = len === 1 ? lookupWord(chunk) : de[normalize(chunk)];
        if (found) {
          hit = found;
          span = len;
          break;
        }
      }

      if (hit) {
        if (hit.en) out.push(hit.en); // empty = filler word to drop (e.g. "frisch")
        matched = true;
        if (!category && hit.cat) category = hit.cat;
      } else {
        out.push(capFirst(tokens[i]));
      }
      i += span;
    }

    var name = out.join(" ");
    return { name: capFirst(name), category: category, matched: matched };
  }

  window.GroceryDict = { translate: translate, normalize: normalize };
})();
