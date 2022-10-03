const { program } = require('commander');
const crypto = require('crypto');
const hexToBinary = require('hex-to-binary');


async function generateSeed() {
    crypto.randomBytes(16, treatRandomNumber);
}

function treatRandomNumber(_err, buffer) {
    const randomNumberBase16 = buffer.toString("hex"); // base16 string type number
    const randomNumberBase2 = hexToBinary(randomNumberBase16); // 128 bits binary string representing our entropy
    const randomNumberHashBase16 = generateSha256(randomNumberBase2); // sha256 in hex of the randomNumberBase2 value
    const randomNumberHashBase2 = hexToBinary(randomNumberHashBase16); // sha256 binary converted
    const randomizedEntropy = randomNumberBase2 + randomNumberHashBase2.slice(0, 4);
    console.log("randomNumberBase16 : ", randomNumberBase16);
    console.log("randomNumberBase2 : ", randomNumberBase2);
    console.log("randomNumberHashBase16 : ", randomNumberHashBase16);
    console.log("random number binary version : ", randomNumberHashBase2);
    console.log("slice : ", randomNumberHashBase2.slice(0, 4));
    console.log("randomizedEntropy : ", randomizedEntropy);
    
}



const text = 'Un obscur message venant du le système S-K, votre majesté. Ses hab la planète Terre';
/*
async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return hash;
}

async function executeSHACode() {
    const digestBuffer = await digestMessage(text);
    const decoded = new TextDecoder().decode(digestBuffer)
    console.log(digestBuffer.byteLength);
}

function hex2bin(hex){
    return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

executeSHACode();

*/

function generateSha256(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

generateSeed();

/*
program
  .description('A simple Bitcoin wallet');
  //.option('-a, --alpha', 'Alpha')
  //.option('-b, --beta <VALUE>', 'Specify a VALUE', 'Foo');
*/


//await console.log(generateRandomNumber(16).toString("hex"));


