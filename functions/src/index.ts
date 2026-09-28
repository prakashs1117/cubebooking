import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp()

// Firestore instance — available for future Cloud Functions
// (seat-hold release, TOAD approval notifications, reminder emails)
export const db = getFirestore()
