import * as crypto from 'crypto';
import { appConfig } from '../../../configs';
import * as useful from './useful';

export class Encryption {
  private static readonly KEY_LENGTH = 32;
  private static readonly ITERATION_COUNT = 65536;
  private static readonly AES_PADDING = 16;
  private static key: Buffer | null = null;

  /**
   * Generate an ecryption key
   * @param logKey True to log and print the key. USE WITH CARE. Should be FALSE for security.
   *
   * @returns The key buffer
   */
  private static getKey(logKey: boolean = false): Buffer {
    if (Encryption.key !== null) {
      return Encryption.key;
    }
    // const keyBuffer = Buffer.from('12345678123456781234567812345678', 'ascii');
    Encryption.key = crypto.pbkdf2Sync(appConfig.encrypt.secret, appConfig.encrypt.salt, Encryption.ITERATION_COUNT, Encryption.KEY_LENGTH, 'sha256');
    if (logKey) {
      console.log(`Key hex: ${useful.bufferToHex(Encryption.key)}`);
    }
    return Encryption.key;
  }

  /**
   * Encrypt a string using the AES algorithm (PBKDF2WithHmacSHA256).
   *
   * @param strToEncrypt String to encrypt in utf8.
   * @param withRandom   True to use a random array of bytes and generate
   *                     different results each time. The decryption must also use
   *                     the same value in order to get the original text back.
   * @return The encrypted string in base 64 or null if an error occurred.
   */
  static encrypt(strToEncrypt: string, withRandom: boolean, autoPadding: boolean = true, log: boolean = false): string | null {
    try {
      // Set IV to use
      let iv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      if (withRandom) {
        iv = crypto.randomBytes(16);
      }

      // Configure object
      const cipher = crypto.createCipheriv('aes-256-cbc', this.getKey(log), iv);
      cipher.setAutoPadding(autoPadding);

      // Pad input if needed
      let finalStrToEncrypt = Buffer.from(strToEncrypt, 'utf8');
      if (!autoPadding) {
        const extraBuffer = Buffer.alloc(Encryption.AES_PADDING - (strToEncrypt.length % Encryption.AES_PADDING));
        finalStrToEncrypt = Buffer.concat([finalStrToEncrypt, extraBuffer]);
      }

      // Encrypt final input
      let crypted = Buffer.concat([cipher.update(finalStrToEncrypt), cipher.final()]);
      if (withRandom) {
        crypted = Buffer.concat([iv, crypted]);
      }
      const finalEncrypted = crypted.toString('base64');

      if (log) {
        console.log(`Original (${strToEncrypt.length}): '${strToEncrypt}'\nOriginal hex: ${useful.bufferToHex(Buffer.from(strToEncrypt))}\nEncrypted hex: ${useful.bufferToHex(crypted)}\nEncrypted b64: ${finalEncrypted}`);
        // To test encryption length
        // console.log(`Message: ${strToEncrypt.length} Extended: ${finalStrToEncrypt.length} Encrypted: ${crypted.length} Encrypted 64: ${finalEncrypted.length}`);
      }

      return finalEncrypted; //  Example: +fHL53d9==
    } catch (e) {
      console.log(`Error encrypting. ${e}`);
    }
    return null;
  }

  /**
   * Decrypt a string using the AES algorithm (PBKDF2WithHmacSHA256).
   *
   * @param strToEncrypt String to dencrypt in base64.
   * @param withRandom   The value must be the same as when the original text was
   *                     encrypted.
   * @return The original string or null if an error occurred.
   */
  static decrypt(strToDecrypt: string, withRandom: boolean, autoPadding: boolean = true, log: boolean = false): string | null {
    try {
      // Encrypted to buffer
      const ori = Buffer.from(strToDecrypt, 'base64');
      //   console.log(`Hex: '${ori.toString("hex")}'     ${ori.length}`);

      // Extract vector or use a default one
      let iv = Buffer.allocUnsafe(16);
      if (withRandom) {
        ori.copy(iv, 0, 0, 16);
        // console.log(`Decrypt iv: '${iv.toString("hex")}'    ${iv.length}`);
      } else {
        iv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      }

      // Create decipher
      // console.log("Before create decipher")
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.getKey(), iv);
      decipher.setAutoPadding(autoPadding);
      // decipher.setAutoPadding(false)
      // Get decrypted
      let decrypted = Buffer.allocUnsafe(1);
      if (withRandom) {
        const cipherText = Buffer.allocUnsafe(ori.length - 16);
        // Copy the rest of the text
        ori.copy(cipherText, 0, 16, ori.length);
        // console.log(`Cipher text '${cipherText.toString("hex")}'     ${cipherText.length}`);
        // console.log("Before update")
        decrypted = decipher.update(cipherText);
        // decrypted = decipher.update(strToDecrypt, 'base64');
      } else {
        decrypted = decipher.update(strToDecrypt, 'base64');
      }
      //   console.log(`Decrypted text hex '${decrypted.toString("hex")}'`);

      //   console.log("Before final");
      const a = decipher.final();
      //   console.log(`Decrypt final '${a.toString()}'`);
      // console.log("Before concat")
      decrypted = Buffer.concat([decrypted, a]);

      if (!autoPadding) {
        const idx = decrypted.indexOf(0);
        decrypted = decrypted.subarray(0, idx);
      }

      const decString = decrypted.toString('utf8');
      // console.log('Before return')
      if (log) {
        console.log(`Decrypted hex: ${useful.bufferToHex(decrypted)}\nDecrypted utf8 (${decString.length}): '${decString}'`);
      }

      return decString;
    } catch (e) {
      console.log(`Error decrypting. ${e}`);
    }
    return null;
  }

  /**
   * Used to test and compare encryption with other devices or platforms
   */
  static testEncryption() {
    console.log('Testing encryption');
    const original = 'Hello Janox sistema seguro';
    const enc = Encryption.encrypt(original, false, false, true);
    if (enc) {
      const dec = Encryption.decrypt(enc, false, false, true);
      if (dec) {
        const match = original === dec;
        console.log(`Match original and decrypted: ${match}` + (match ? '' : `\n'${original}'\n'${dec}'`));
      }
    } else {
      //
    }
    console.log('End test encryption');
  }
}
