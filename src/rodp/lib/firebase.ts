import { db, auth } from '../../firebase';
import firebaseConfig from '../../../firebase-applet-config.json';
import { getApps } from 'firebase/app';

const config = firebaseConfig as any;
const isFirebaseAvailable = Boolean(config && config.apiKey && db);
const app = getApps().length > 0 ? getApps()[0] : null;

export { db, auth, isFirebaseAvailable };
export default app;
