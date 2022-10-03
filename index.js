const { program } = require('commander');
const crypto = require('crypto');
const hexToBinary = require('hex-to-binary');
const BIP39 = require('bip39');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// MENU PART
/////////////////////////////////////////////////
/////////////////////////////////////////////////

program
  .description('A sample bitcoin wallet')
  .option('-g, --generate-seed', 'This option will generate a bitcoin wallet seed')
  //.option('-b, --beta <VALUE>', 'Specify a VALUE', 'Foo');


program.parse();
const options = program.opts();
//console.log("options:", options)
if (Object.keys(options).length == 0) console.log("You should put an option");
else {
    if (options.generateSeed) generateSeed();
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
    // const randomizedEntropyBase16 = BigInt(randomizedEntropyBase2, 2).toString(16); // Not useful, show our 132 bits entropy in hex/base16

    const line = "------------------------------------------------------------";
    console.log(line, "\nGenerated random number (base16) :", randomNumberBase16 , "\n"+line);
    console.log("Rnd number hash (SHA256, base16) :", randomNumberHashBase16 , "\n"+line);
    console.log("Rnd number hash (SHA256, base2) :", randomNumberHashBase2 , "\n"+line);
    console.log("1st four bits of the hash (base2) :", randomNumberHashBase2.slice(0, 4) , "\n"+line);
    console.log("128 bits base2 entropy + sha256 hash 4 first bits = 132 bits entropy :", entropyChecksummizedBase2 , "\n"+line);
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
