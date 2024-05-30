import crypto from 'crypto'
import { ENCRYPT_SALT , ENCRYPT_SECRET_KEY} from '../configs/server.configs';

export function decrypt(strToDecrypt: string) : string {
    const key = crypto.pbkdf2Sync(ENCRYPT_SECRET_KEY, ENCRYPT_SALT, 65536, 32, 'sha256');
    const iv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(strToDecrypt, 'base64');
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
