import { getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getDatabase, push, ref, serverTimestamp } from 'firebase/database';

export interface ProposalSubmission {
  name: string;
  email: string;
  company: string;
  message: string;
  budget: string;
  prepopulatedEstimate: {
    platform: string;
    design: string;
    features: string[];
    timeline: string;
    totalCost: number;
  } | null;
  selectedServiceId?: string;
  sourceUrl: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

type ProposalPayload = Omit<ProposalSubmission, 'createdAt'>;

const firebaseConfig = {
  apiKey: 'AIzaSyBCLpt4t_nXzvZ-WMPdcFqsG_p_aiBG2d4',
  authDomain: 'huzaifa-50b1b.firebaseapp.com',
  databaseURL: 'https://huzaifa-50b1b-default-rtdb.firebaseio.com',
  projectId: 'huzaifa-50b1b',
  storageBucket: 'huzaifa-50b1b.firebasestorage.app',
  messagingSenderId: '402385869414',
  appId: '1:402385869414:web:c3c8faeb5cc89f2251aba7',
  measurementId: 'G-JJJMYQ6951'
};

export const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const database = getDatabase(app);

let analytics: Analytics | undefined;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeUndefined) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, removeUndefined(entryValue)])
    ) as T;
  }

  return value;
}

export async function submitProposal(payload: ProposalPayload) {
  const cleanPayload = removeUndefined(payload);
  const proposalRef = ref(database, 'proposals');
  const newProposalRef = await push(proposalRef, {
    ...cleanPayload,
    createdAt: serverTimestamp()
  });

  return newProposalRef.key ?? '';
}
