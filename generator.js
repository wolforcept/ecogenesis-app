const cardSymbols = ["checkmark"]
function run(diff) {

    var w = 5;
    var h = 5;

    if (diff == "hard") {
        w += 1;
        h += 1;
    }

    for (let i = 0; i < 20000; i++) {
        const seed = Number.parseInt(100000 * Math.random());
        seededMinMax(w, h, seed)
        if (checkValidSeed(w, h, seed)) {
            console.log(`generated in ${i} atempts`);
            return generate(w, h, seed, 1, 1);
        }
    }

    return null;
}

function checkValidSeed(w, h, seed) {
    const nrs = {}

    nrs["any"] = 0
    nrs["forest"] = 0
    nrs["water"] = 0
    nrs["mountain"] = 0
    nrs["desert"] = 0
    nrs["animal"] = 0
    total = 0

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const type = randomType(x, y, seed);
            nrs[type]++;
            total++
        }
    }

    if (nrs["forest"] < 5) return false;
    if (nrs["water"] < 5) return false;
    if (nrs["mountain"] > 5) return false;
    if (nrs["desert"] > 5) return false;
    if (nrs["animal"] > 5) return false;

    if (nrs["forest"] == 0) return false;
    if (nrs["water"] == 0) return false;
    if (nrs["mountain"] == 0) return false;
    if (nrs["desert"] == 0) return false;
    if (nrs["animal"] == 0) return false;

    const percents = {}
    percents["any"] = nrs["any"] / total;
    percents["forest"] = nrs["forest"] / total;
    percents["water"] = nrs["water"] / total;
    percents["mountain"] = nrs["mountain"] / total;
    percents["desert"] = nrs["desert"] / total;
    percents["animal"] = nrs["animal"] / total;

    const maxPercent = .28;
    if (percents["forest"] > maxPercent) return false;
    if (percents["water"] > maxPercent) return false;
    if (percents["mountain"] > maxPercent) return false;
    if (percents["desert"] > maxPercent) return false;
    if (percents["animal"] > maxPercent) return false;

    Object.keys(percents).forEach(key => percents[key] = Number.parseInt(percents[key] * 100))

    console.log(`forest: ${nrs["forest"]} (${percents["forest"]}%)`);
    console.log(`water: ${nrs["water"]} (${percents["water"]}%)`);
    console.log(`mountain: ${nrs["mountain"]} (${percents["mountain"]}%)`);
    console.log(`desert: ${nrs["desert"]} (${percents["desert"]}%)`);
    console.log(`animal: ${nrs["animal"]} (${percents["animal"]}%)`);

    return true;
}

function generate(w, h, seed, dx, dy) {

    console.log(`generating game w=${w} h=${h} seed=${seed}`);

    const game = {}

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const type = randomType(x, y, seed);
            game[(x + dx) + "," + (y + dy)] = type;
        }
    }

    return game;
}

var seedMin, seedMax;

function randomType(x, y, seed) {
    var val = seededVal(x, y, seed)

    val -= seedMin
    val /= seedMax - seedMin
    val = Number.parseInt(100 * val)

    // const randTest = (x * 59786 + y * 5786 + seed * 72835) % 1000;
    // if (randTest < 500) return "any"

    if (val < 20) return "water"
    if (val < 40) return "forest"
    if (val < 45) return "animal"
    if (val < 60) return "desert"
    if (val > 65) return "mountain"
    return "any"
}

function seededMinMax(w, h, seed) {
    var min = 99999;
    var max = -99999;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const val = seededVal(x, y, seed);
            if (val < min) min = val
            if (val > max) max = val
        }
    }
    seedMin = min
    seedMax = max
}

function seededVal(x, y, seed) {
    return noise.simplex2(seed * seed * seed + x / 100, seed * seed + y / 100);
}