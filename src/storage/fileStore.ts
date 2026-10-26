// Uploaded file bytes live in this browser's IndexedDB so they survive a reload.
// localStorage only holds JSON metadata, which can't store files of this size.
const DB_NAME = 'cherit-demo-files'
const STORE = 'files'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('This browser has no IndexedDB storage.'))
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open file storage.'))
  })
}

async function run<T>(mode: IDBTransactionMode, body: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = body(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request.result)
      tx.onerror = () => reject(tx.error ?? request.error ?? new Error('File storage failed.'))
      tx.onabort = () => reject(tx.error ?? new Error('File storage was cancelled.'))
    })
  } finally {
    db.close()
  }
}

export const putFile = (key: string, blob: Blob) => run('readwrite', (s) => s.put(blob, key)).then(() => undefined)
export const getFile = (key: string) => run<Blob | undefined>('readonly', (s) => s.get(key))
export const deleteFiles = async (keys: string[]) => {
  for (const key of keys) await run('readwrite', (s) => s.delete(key))
}
export const clearFiles = () => run('readwrite', (s) => s.clear()).then(() => undefined)
