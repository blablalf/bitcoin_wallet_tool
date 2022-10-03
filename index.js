const { program } = require('commander');
const crypto = require('crypto');
const hexToBinary = require('hex-to-binary');
const BIP39 = require('bip39');

const line = "------------------------------------------------------------";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// MENU PART
/////////////////////////////////////////////////
/////////////////////////////////////////////////

program
  .description("A sample bitcoin wallet")
  .option("-g, --generate-seed', 'This option will generate a bitcoin wallet seed")
  .option("-i, --import-seed <VALUE>', 'This option will generate some info about the bitcoin wallet seed, please specify a mnemonic seed")
  .option("-s --seed <VALUE>")
  .option("-p --password <VALUE>")


program.parse();
const options = program.opts();
//console.log("options:", options)
if (Object.keys(options).length == 0) console.log("You should put an option");
else {
    if (options.generateSeed) generateSeed();
    if (options.importSeed) displaySeedInformations(options.importSeed);
    if (options.seed && options.password) generateBip32Seed(options.seed, options.password);
    else if (options.seed) generateBip32Seed(options.seed);
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BIP 39 SEED GENERATION PART
/////////////////////////////////////////////////
/////////////////////////////////////////////////

async function generateSeed() {
    crypto.randomBytes(16, seedFromRandomNumber);
}

function seedFromRandomNumber(_err, buffer) {
    // String version of our random number (which is represneting our 128 bits entropy)
    const randomNumberBase16 = buffer.toString("hex"); // base16
    const randomNumberBase2 = hexToBinary(randomNumberBase16); // base2

    // GENERATING SHA256 HASH OF OUR 128 BITS HEX ENTROPY
    const randomNumberHashBase16 = generateSha256(buffer); // sha256 in hex of the randomNumberBase2 value

    // CONVERTING HASH FROM BASE 16 TO BASE 2
    const randomNumberHashBase2 = hexToBinary(randomNumberHashBase16); // sha256 binary converted

    // ADDING THE FIRST FOUR BITS OF THE HASH TO OUR 128 BITS ENTROPY TO GET A NEW 132 BITS ENTROPY
    const entropyChecksummizedBase2 = randomNumberBase2 + randomNumberHashBase2.slice(0, 4);
    const entropyChecksummizedBase16 = convertBinaryStringToHexString(entropyChecksummizedBase2); // Not useful, show our 132 bits entropy in hex/base16 // BADLY PARSED

    console.log(line, "\nGenerated random number (base16) :", randomNumberBase16 , "\n"+line);
    console.log("Rnd number hash (SHA256, base16) :", randomNumberHashBase16 , "\n"+line);
    console.log("Rnd number hash (SHA256, base2) :", randomNumberHashBase2 , "\n"+line);
    console.log("1st four bits of the hash (base2) :", randomNumberHashBase2.slice(0, 4) , "\n"+line);
    console.log("128 bits base2 entropy + sha256 hash 4 first bits = 132 bits entropy (base2):", entropyChecksummizedBase2 , "\n"+line);
    console.log("132 bits entropy (base16):", entropyChecksummizedBase16 , "\n"+line);
    console.log("\n\nSeed from BIP39 dict :", getStringSeedFromEntropy(entropyChecksummizedBase2));
}

function getStringSeedFromEntropy(bitsSeed) {
    let seed = "";
    for (let index = 0; index < 12; index++) {
        const slice = bitsSeed.slice(index*11, index*11+11);
        //console.log("slice:", slice);
        const sliceBase10 = parseInt(slice, 2);
        //console.log("sliceBase10:", sliceBase10);
        seed += BIP39.wordlists.english[parseInt(bitsSeed.slice(index*11, index*11+11), 2)] + " ";
    }
    return seed.slice(0, seed.length - 1);
}

function generateSha256(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BIP 39 SEED IMPORTATION PART
/////////////////////////////////////////////////
/////////////////////////////////////////////////

function displaySeedInformations(seed) {
    const entropyChecksummedBase2 = getBase2EntropyFromSeed(seed);
    const entropyChecksummedBase16 = convertBinaryStringToHexString(entropyChecksummedBase2);
    const checksumBase2 = entropyChecksummedBase2.slice(entropyChecksummedBase2.length-4, entropyChecksummedBase2.length);
    const initialEntropyBase2 = entropyChecksummedBase2.slice(0, entropyChecksummedBase2.length-4);
    const initialEntropyBase16 = convertBinaryStringToHexString(initialEntropyBase2);
    const entropyBuffer = Buffer.from(initialEntropyBase16, "hex");
    const hashBase16 = crypto.createHash("sha256").update(entropyBuffer).digest("hex");
    const hashBase2 = hexToBinary(hashBase16);

    console.log("128 bits base2 entropy + sha256 hash 4 first bits = 132 bits entropy (base2) :", entropyChecksummedBase2 , "\n"+line);
    console.log("132 bits entropy (base16) :", entropyChecksummedBase16 , "\n"+line);
    console.log("1st four bits of the hash (base2) :", checksumBase2 , "\n"+line);
    console.log("Generated random number (base2) :", initialEntropyBase2 , "\n"+line);
    console.log("Generated random number (base16) :", initialEntropyBase16, "\n"+line);
    console.log("Generated hash from initial entropy (base16) :", hashBase16, "\n"+line);
    console.log("Generated hash from initial entropy (base2) :", hashBase2, "\n"+line);
}

function getBase2EntropyFromSeed(seed) {
    const seedSplitted = seed.split(' ');
    let entropyBase2 = "";

    seedSplitted.forEach(word => {
        let binaryIndex = (BIP39.wordlists.english.indexOf(word)).toString(2);
        while (binaryIndex.length < 11) binaryIndex ="0"+binaryIndex;
        entropyBase2 += (binaryIndex);
    });

    return entropyBase2;
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BIP 32 SEED GENERATION PART
/////////////////////////////////////////////////
/////////////////////////////////////////////////
function generateBip32Seed(mnemonicSeed) {
    const entropyChecksummedBase2 = getBase2EntropyFromSeed(mnemonicSeed);
    const entropyChecksummedBase16 = convertBinaryStringToHexString(entropyChecksummedBase2);
    const entropyBuffer = Buffer.from(entropyChecksummedBase16, "hex");
    const hmac = crypto.createHmac("sha512", entropyBuffer);
    const signed = hmac.update("mnemonic").digest("hex");
    console.log(signed) 
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// UTILITIES PART
/////////////////////////////////////////////////
/////////////////////////////////////////////////
function convertBinaryStringToHexString(binaryStr) {
    let hexStr = "";
    for (let index = 0; index < binaryStr.length/4; index++) hexStr += parseInt(binaryStr.slice(index*4, index*4+4), 2).toString(16);
    return hexStr;
}