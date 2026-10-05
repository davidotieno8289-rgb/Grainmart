import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/services/firebase';

interface UseFirestoreDocOptions {
  realtime?: boolean;
}

export function useFirestoreDoc<T extends DocumentData>(
  collectionName: string,
  docId: string | undefined,
  options: UseFirestoreDocOptions = {}
) {
  const { realtime = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, docId);

    if (realtime) {
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      }, (err) => {
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      const fetchDoc = async () => {
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setData({ id: docSnap.id, ...docSnap.data() } as T);
          } else {
            setData(null);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch document');
        } finally {
          setLoading(false);
        }
      };

      fetchDoc();
    }
  }, [collectionName, docId, realtime]);

  const updateDocument = async (updates: Partial<T>) => {
    if (!docId) return { success: false, error: 'No document ID' };

    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  const deleteDocument = async () => {
    if (!docId) return { success: false, error: 'No document ID' };

    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
    }
  };

  return { data, loading, error, updateDocument, deleteDocument };
}

interface UseFirestoreCollectionOptions {
  constraints?: QueryConstraint[];
  realtime?: boolean;
  limitCount?: number;
}

export function useFirestoreCollection<T extends DocumentData>(
  collectionName: string,
  options: UseFirestoreCollectionOptions = {}
) {
  const { constraints = [], realtime = false, limitCount } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const collectionRef = collection(db, collectionName);
      const queryConstraints = [...constraints];
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }
      const q = query(collectionRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const documents: T[] = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T);
      });
      
      setData(documents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collection');
    } finally {
      setLoading(false);
    }
  }, [collectionName, constraints, limitCount]);

  useEffect(() => {
    if (realtime) {
      const collectionRef = collection(db, collectionName);
      const queryConstraints = [...constraints];
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }
      const q = query(collectionRef, ...queryConstraints);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const documents: T[] = [];
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(documents);
        setLoading(false);
      }, (err) => {
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      fetchData();
    }
  }, [realtime, fetchData]);

  const addDocument = async (docData: Omit<T, 'id'>) => {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...docData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { success: true, id: docRef.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add document' };
    }
  };

  return { data, loading, error, addDocument, refresh: fetchData };
}
