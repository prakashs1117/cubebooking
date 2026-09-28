import { doc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore'
import { db } from '../firebase'

export function useDeleteMember() {
  const deleteMember = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), {
      deletedAt: serverTimestamp(),
    })
  }

  const restoreMember = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), {
      deletedAt: deleteField(),
    })
  }

  return { deleteMember, restoreMember }
}
